import "@project-chip/matter-node.js";
import { ExtendedColorLightDevice } from "@project-chip/matter.js/devices/ExtendedColorLightDevice";
import { BridgedDeviceBasicInformationServer } from "@project-chip/matter.js/behaviors/bridged-device-basic-information";
import { Endpoint } from "@project-chip/matter.js/endpoint";
import type { Node } from 'node-red';
import { dimmableLight } from "./dimmableLight";


export class colorLight extends dimmableLight {

    constructor(node: Node, config: any, _name: any = '') {
        let name = config.name || _name || "Color Light";
        super(node, config, name);

        this.setDefault("brightness", 0);

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
                    enhancedHue: false,
                    colorLoop: false,
                    colorTemperature: true
                },
                colorTemperatureMireds: 0x00FA,
                coupleColorTempToLevelMinMireds: 0x00FA,
                startUpColorTemperatureMireds: 0x00FA
            }
        }


        this.mapping = {
            ...this.mapping,
            colorX: { colorControl: "currentX", multiplier: 65536, unit: "" },
            colorY: { colorControl: "currentY", multiplier: 65536, unit: "" },
            //colorHue: { colorControl: "currentHue", multiplier: 1, unit: "" },
            //colorSaturation: { colorControl: "currentSaturation", multiplier: 1, unit: "" }
        }

        this.setSerialNumber("clLt-");

        this.setDefault("colorX", 0);
        this.setDefault("colorY", 0);
        this.setDefault("colorHue", 0);
        this.setDefault("colorSaturation", 0);
    }

    override getVerbose(item, value) {
        switch (item) {

            default:
                return super.getVerbose(item, value);
        }
    }

    override setStatus() {
        let text = `${this.getVerbose("onOff", this.context.onoff)}; ${this.getVerbose("currentLevel", this.context.brightness)}% Color: x: ${this.context.colorX} y: ${this.context.colorY}`;
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

            if (this.config.enableZigbee) {
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
        if (this.config.enableZigbee) {
            this.node.warn("zigbee enabled");
            switch (a) {
                case "color":
                    if (Object.hasOwn(b, "x") && Object.hasOwn(b, "y")) {
                        a = ["colorX", "colorY"];
                        b = [value.x, value.y]
                    }
                    break;
                default:
            }
        } else {
            this.node.warn("zigbee not enabled");
        }
        if (["colorX", "colorY", "color"].includes(item)) {
            if (Array.isArray(b)) {
                for (let i = 0; i < b.length; i++) {
                    b[i] = Math.min(1, b[i]);
                }
            } else {
                b = Math.min(1, b);
            }
        }
        return { a: a, b: b };
    }

    override async deploy() {
        try {
            this.endpoint = await new Endpoint(ExtendedColorLightDevice.with(BridgedDeviceBasicInformationServer), this.attributes);
        } catch (e) {
            this.node.error(e);
        }
    }

}