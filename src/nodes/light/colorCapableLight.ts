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
            colorX: { colorControl: "currentX", multiplier: 1, unit: "" },
            colorY: { colorControl: "currentY", multiplier: 1, unit: "" },
            colorHue: { colorControl: "currentHue", multiplier: 1, unit: "" },
            colorSaturation: { colorControl: "currentSaturation", multiplier: 1, unit: "" }
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

    override async deploy() {
        try {
            this.endpoint = await new Endpoint(ExtendedColorLightDevice.with(BridgedDeviceBasicInformationServer), this.attributes);
        } catch (e) {
            this.node.error(e);
        }
    }

}