import "@project-chip/matter-node.js";
import { DimmableLightDevice } from "@project-chip/matter.js/devices/DimmableLightDevice";
import { BridgedDeviceBasicInformationServer } from "@project-chip/matter.js/behaviors/bridged-device-basic-information";
import { Endpoint } from "@project-chip/matter.js/endpoint";
import type { Node } from 'node-red';
import { onOffLight } from "./onOffLight";


export class dimmableLight extends onOffLight {

    constructor(node: Node, config: any, _name: any = '') {
        let name = config.name || _name || "Dimmable Light";
        super(node, config, name);

        this.setDefault("brightness", 0);

        this.attributes = {
            ...this.attributes,
            levelControl: {
                options: {
                    executeIfOff: true,
                    coupleColorTempToLevel: true
                },
                onLevel: null,
                onOffTransitionTime: 150,
            },
        };

        this.mapping = {
            ...this.mapping,
            brightness: { levelControl: "currentLevel", multiplier: 255 / 100, unit: "%" }
        }

        this.setSerialNumber("dmLt-");
    }

    override getVerbose(item, value) {
        switch (item) {
            case "currentLevel":
            case "brightness":
            case "level":
                return Math.round(value);
                break;

            default:
                return super.getVerbose(item, value);
        }
    }

    override setStatus() {
        this.node.status({
            fill: "green",
            shape: "dot",
            text: `${this.getVerbose("onOff", this.context.onoff)}; ${this.getVerbose("brightness", this.context.brightness)}%`
        });
    }

    override async deploy() {
        try {
            this.endpoint = await new Endpoint(DimmableLightDevice.with(BridgedDeviceBasicInformationServer), this.attributes);
        } catch (e) {
            this.node.error(e);
        }
    }

}