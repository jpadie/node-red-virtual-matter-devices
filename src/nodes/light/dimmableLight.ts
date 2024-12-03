import { DimmableLightDevice } from "@matter/main/devices";
import { BridgedDeviceBasicInformationServer } from "@matter/main/behaviors"
import { Endpoint } from "@matter/main";
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
            brightness: {
                levelControl: "currentLevel",
                multiplier: 2.55,
                unit: "%",
                min: 0,
                max: 254,
                matter: { valueType: "int" },
                context: { valueType: "int" }
            }
        }

        this.attributes.bridgedDeviceBasicInformation.serialNumber = `dLt-${this.node.id}`.substring(0, 32);
    }

    override async getStatusText() {
        let text = super.getStatusText();
        this.getVerbose("onOff", this.context.onoff);
        text += ` ${this.getVerbose("brightness", this.context.brightness)}%`
        return text;
    }

    override async setStatus() {
        this.node.status({
            fill: "green",
            shape: "dot",
            text: await this.getStatusText()
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