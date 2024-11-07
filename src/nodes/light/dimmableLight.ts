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
                    coupleColorTempToLevel: false
                },
                onLevel: null,
                onOffTransitionTime: 150,
            },
        };

        this.mapping = {
            ...this.mapping,
            brightness: { levelControl: "currentLevel", multiplier: 255 / 100, unit: "%" }
        }

        this.attributes.bridgedDeviceBasicInformation.serialNumber = `clLt-${this.node.id}`.substring(0, 32);
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
    override listenForChange_postProcess(report: any = null) {
        super.listenForChange_postProcess(report);
        //no need to do anything for zigbee
    };

    override preProcessNodeRedInput(item: any, value: any): { a: any; b: any; } {
        let { a, b } = super.preProcessNodeRedInput(item, value)
        if (this.zigbee()) {
            switch (a) {
                case "brightness":
                    a = "brightness";
                    b = Math.round(value * 100 / 255);  //Math.ceil(b * 100 / 255)
                    break;
                default:

            }
        }
        return { a: a, b: b };
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