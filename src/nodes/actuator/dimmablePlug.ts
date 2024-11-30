import "@matter/main";
import { DimmablePlugInUnitDevice } from "@matter/main/devices";
import { BridgedDeviceBasicInformationServer } from "@matter/main/behaviors"
import { Endpoint } from "@matter/main";
import type { Node } from 'node-red';
import { dimmableLight } from "../light/dimmableLight"


export class dimmablePlug extends dimmableLight {

    constructor(node: Node, config: any, _name: any = '') {
        let name = config.name || _name || "Dimmable Plug";
        super(node, config, name);
        this.setSerialNumber("dmplug-");
    }
    override async deploy() {
        try {
            this.endpoint = await new Endpoint(DimmablePlugInUnitDevice.with(BridgedDeviceBasicInformationServer), this.attributes);
        } catch (e) {
            this.node.error(e);
        }
    }
}