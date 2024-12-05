import "@matter/main";
import { DimmablePlugInUnitDevice } from "@matter/main/devices";
import type { Node } from 'node-red';
import { dimmableLight } from "../light/dimmableLight"


export class dimmablePlug extends dimmableLight {

    constructor(node: Node, config: any, _name: any = '') {
        let name = config.name || _name || "Dimmable Plug";
        super(node, config, name);
        this.setSerialNumber("dmplug-");
        this.device = DimmablePlugInUnitDevice;
    }
}