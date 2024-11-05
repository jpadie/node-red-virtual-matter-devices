import "@project-chip/matter-node.js";
//import { ExtendedColorLightDevice } from "@project-chip/matter.js/devices/ExtendedColorLightDevice";
import { BridgedDeviceBasicInformationServer } from "@project-chip/matter.js/behaviors/bridged-device-basic-information";
import { Endpoint } from "@project-chip/matter.js/endpoint";
import type { Node } from 'node-red';
import { dimmableLight } from "./dimmableLight";
import { DimmableLightDevice } from "@project-chip/matter.js/devices/DimmableLightDevice";
import { ColorControlServer } from "@project-chip/matter.js/behaviors/color-control";

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
            // colorX: { colorControl: "currentX", multiplier: 65536, unit: "" },
            // colorY: { colorControl: "currentY", multiplier: 65536, unit: "" },
            hue: { colorControl: "currentHue", multiplier: 1, unit: "" },
            saturation: { colorControl: "currentSaturation", multiplier: 1, unit: "" }
        }

        this.setSerialNumber("clLt-");

        //  this.setDefault("colorX", 0);
        //  this.setDefault("colorY", 0);
        this.setDefault("hue", 0);
        this.setDefault("saturation", 0);
        this.prune("colorX");
        this.prune("colorY");
    }

    override getVerbose(item, value) {
        switch (item) {

            default:
                return super.getVerbose(item, value);
        }
    }

    override setStatus() {
        let text = `${this.getVerbose("onOff", this.context.onoff)}; ${this.getVerbose("currentLevel", this.context.brightness)} Color: x: ${this.context.colorX} y: ${this.context.colorY}`;
        this.node.status({
            fill: "green",
            shape: "dot",
            text: text
        });
    }

    override listenForChange_postProcess(report: any = null) {
        super.listenForChange_postProcess(report);

        if (typeof report == "object" && (Object.hasOwn(report, "colorX") || Object.hasOwn(report, "colorY"))) {
            //"color": { "x": 0.123, "y": 0.123 }

            if (this.zigbee()) {
                let payload: { color: { x?: number, y?: number }, messageSource?: string } = { color: {} };
                if (Object.hasOwn(report, "colorX")) {
                    payload.color.x = Math.round(100 * report.colorX) / 100;
                    this.context.colorX = Math.round(100 * report.colorX) / 100;
                }
                if (Object.hasOwn(report, "colorY")) {
                    payload.color.y = Math.round(100 * report.colorY) / 100;
                    this.context.colorY = Math.round(100 * report.colorY) / 100;
                }
                payload.messageSource = "Matter";
                this.node.send([null, { payload: payload }]);
            } else {
                if (Object.hasOwn(report, "colorX")) {
                    this.context.colorX = Math.round(report.colorX * 100 / 65536) / 100;
                }
                if (Object.hasOwn(report, "colorY")) {
                    this.context.colorY = Math.round(report.colorY * 100 / 65536) / 100;
                }
            }
        }
    };

    override preProcessNodeRedInput(item: any, value: any): { a: any; b: any; } {
        let { a, b } = super.preProcessNodeRedInput(item, value)
        if (a === "color") {
            this.context.hue = b["currentHue"];
            this.context.saturation = b["currentSaturation"];
            this.context.colorX = b["currentX"];
            this.context.colorY = b["currentY"];
            delete b.currentX;
            delete b.currentY;
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