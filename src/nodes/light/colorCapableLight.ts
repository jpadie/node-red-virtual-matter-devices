import "@project-chip/matter-node.js";
//import { ExtendedColorLightDevice } from "@project-chip/matter.js/devices/ExtendedColorLightDevice";
import { BridgedDeviceBasicInformationServer } from "@project-chip/matter.js/behaviors/bridged-device-basic-information";
import { Endpoint } from "@project-chip/matter.js/endpoint";
import type { Node } from 'node-red';
import { dimmableLight } from "./dimmableLight";
import { DimmableLightDevice } from "@project-chip/matter.js/devices/DimmableLightDevice";
import { ColorControlServer } from "@project-chip/matter.js/behaviors/color-control";
import colourList from "./colourList"

export class colorLight extends dimmableLight {

    constructor(node: Node, config: any, _name: any = '') {
        let name = config.name || _name || "Color Light";
        super(node, config, name);

        this.attributes = {
            ...this.attributes,
            colorControl: {
                managedTransitionTimeHandling: true,
                options: {
                    executeIfOff: true,
                },
                colorCapabilities: {
                    hueSaturation: true,
                    xy: true,
                    enhancedHue: true,
                    colorLoop: false,
                    colorTemperature: false
                },
                // colorTemperatureMireds: 0x00FA,
                // coupleColorTempToLevelMinMireds: 0x00FA,
                // startUpColorTemperatureMireds: 0x00FA
            }
        }


        this.mapping = {
            ...this.mapping,
            colorX: { colorControl: "currentX", multiplier: 65536, unit: "" },
            colorY: { colorControl: "currentY", multiplier: 65536, unit: "" },
            hue: { colorControl: "currentHue", multiplier: 254 / 360, unit: "deg" },
            saturation: { colorControl: "currentSaturation", multiplier: 255 / 100, unit: "%" }
        }

        this.attributes.bridgedDeviceBasicInformation.serialNumber = `clLt-${this.node.id}`.substring(0, 32);

        //  this.setDefault("colorX", 0);
        //  this.setDefault("colorY", 0);
        this.setDefault("hue", 0);
        this.setDefault("saturation", 0);
        this.setDefault("colorX", 0);
        this.setDefault("colorY", 0);
        this.setDefault("colorSpace", "xyY");
    }

    override getVerbose(item, value) {
        switch (item) {

            default:
                return super.getVerbose(item, value);
        }
    }

    convertHSVtoXY(h, s, v) {
        import("c0lor")
            .then((C) => {
                let color = C.hsv(h, s / 100, v / 255);
                let colorXY = color.xyY();
                return { x: colorXY.x, y: colorXY.y };
            })
            .catch((e) => {
                console.log(e);
                return { x: 0, y: 0 };
            });
        return { x: 0, y: 0 }
    }

    convertXYtoHSV(x, y) {
        import("c0lor")
            .then((C) => {
                let color = C.xyY(x, y, 1 - x - y);
                let colorHSV = color.hsv();
                return { hue: colorHSV.h, saturation: colorHSV.s }
            })
            .catch((e) => {
                console.log(e);
                return { hue: 0, saturation: 0 }
            })
        return { hue: 0, saturation: 0 }
    }

    convertHSVtoRGB(h, s, v) {
        s /= 100;
        v /= 100;
        let f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
        return { r: f(5) * 255, g: f(3) * 255, b: f(1) * 255 };
    }

    async getColorName(r, g, b) {
        const c2n = await import("color-2-name")
        let colorString = `rgb(${r}, ${g}, ${b})`;
        let c = c2n.closest(colorString, colourList);
        return c;
    }

    override preProcessOutputReport(report: any) {
        if (this.context.colorSpace == "xyY") {
            console.log("color report");
            console.log(report);
            if (Object.hasOwn(report, "hue")) {
                const xy = this.convertHSVtoXY(report.hue, this.context.saturation, this.context.brightness);
                report.colorX = xy.x;
                report.colorY = xy.y;
                delete report.hue;
            } else if (Object.hasOwn(report, "saturation")) {
                const xy = this.convertHSVtoXY(this.context.hue, report.saturation, this.context.brightness);
                report.colorX = xy.x;
                report.colorY = xy.y;
                delete report.saturation;
            }
            return report;
        } else if (this.context.colorSpace = "hsv") {
            console.log("color report");
            console.log(report);
            if (Object.hasOwn(report, "colorX")) {

                const hsv = this.convertXYtoHSV(report.colorX, this.context.colorY);
                report.hue = hsv.hue
                report.saturation = hsv.saturation;
                delete report.colorX;

            } else if (Object.hasOwn(report, "saturation")) {
                const hsv = this.convertXYtoHSV(this.context.colorX, report.colorY);
                report.hue = hsv.hue
                report.saturation = hsv.saturation;
                delete report.colorY;
            }
            return report;
        }
    }

    async getStatusText() {
        if (Object.hasOwn(this.context, "colorName") && this.context.colorName) {
            return this.context.colorName;
        }
        const col = this.convertHSVtoRGB(this.context.hue, this.context.saturation, this.context.brightness)
        let c = await this.getColorName(col.r, col.g, col.b);
        this.context.colorName = c.name;
        this.saveContext();
        return `${this.getVerbose("onOff", this.context.onoff)}; ${this.getVerbose("currentLevel", this.context.brightness)} Color: ${c.name}`;
    }

    override async setStatus() {
        let text = await this.getStatusText();
        this.node.status({
            fill: "green",
            shape: "dot",
            text: text
        })
    }


    override listenForChange_postProcess(report: any = null) {
        super.listenForChange_postProcess(report);
        if (typeof report == "object" && (Object.hasOwn(report, "colorX") || Object.hasOwn(report, "colorY"))) {
            //"color": { "x": 0.123, "y": 0.123 }

            if (Object.hasOwn(report, "colorX")) {
                this.context.colorX = Math.round(report.colorX * 100 / 65536) / 100;
            }
            if (Object.hasOwn(report, "colorY")) {
                this.context.colorY = Math.round(report.colorY * 100 / 65536) / 100;
            }

        }
    };

    override preProcessNodeRedInput(item: any, value: any): { a: any; b: any; } {
        let { a, b } = super.preProcessNodeRedInput(item, value)
        if (a === "color") {
            if (Object.hasOwn(b, "colorX") && Object.hasOwn(b, "colorY")) {
                //ignore H and S
                delete b.hue;
                delete b.saturation;
                if (this.context.colorSpace != "xyY") {
                    this.context.colorSpace = "xyY";
                    this.saveContext();
                }
            }
            else if (Object.hasOwn(b, "hue") && Object.hasOwn(b, "saturation")) {
                delete b.colorX;
                delete b.colorY;
                if (this.context.colorSpace != "hsv") {
                    this.context.colorSpace = "hsv";
                    this.saveContext();
                }
            }
        }
        return { a: a, b: b };
    }

    override async deploy() {
        try {

            this.endpoint = await new Endpoint(
                DimmableLightDevice.with(
                    BridgedDeviceBasicInformationServer,
                    ColorControlServer.with("EnhancedHue", "Xy", "HueSaturation")
                ),
                this.attributes);

            /*this.endpoint = await new Endpoint(
                ExtendedColorLightDevice.with(
                    BridgedDeviceBasicInformationServer
                ), this.attributes);
            */

        } catch (e) {
            this.node.error(e);
            console.trace();
        }
    }
}