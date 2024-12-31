import { DimmableLightDevice } from "@matter/main/devices";
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
                currentLevel: this.contextToMatter("brightness", this.context.brightness)
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

        this.setSerialNumber(`dLt-`);
        this.device = DimmableLightDevice
    }

    override async getStatusText() {
        let text = await super.getStatusText();
        text += ` ${await this.getVerbose("brightness", this.context.brightness)}%`
        this.node.debug(`dimmable light status text: ${text}`)
        return text;
    }

}