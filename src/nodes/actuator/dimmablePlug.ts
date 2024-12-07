import "@matter/main";
import { DimmablePlugInUnitDevice } from "@matter/main/devices";
import type { Node } from 'node-red';
import { dimmableLight } from "../light/dimmableLight"


export class dimmablePlug extends dimmableLight {

    constructor(node: Node, config: any, _name: any = '') {
        let name = config.name || _name || "Dimmable Plug";
        super(node, config, name);
        this.setDefault("dimmerLevel", 0);
        this.mapping = {
            ...this.mapping,
            dimmerLevel: {
                levelControl: "currentLevel",
                multiplier: 2.55,
                unit: "%",
                min: 0,
                max: 254,
                matter: { valueType: "int" },
                context: { valueType: "int" }
            }
        }
        this.prune("brightness");
        this.attributes.levelControl.currentLevel = this.contextToMatter("dimmerLevel", this.context.dimmerLevel)
        this.setSerialNumber("dmplug-");
        this.device = DimmablePlugInUnitDevice;
    }
}