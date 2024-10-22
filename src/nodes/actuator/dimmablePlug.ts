import "@project-chip/matter-node.js";
import { DimmablePlugInUnitDevice } from "@project-chip/matter.js/devices/DimmablePlugInUnitDevice";
import { BridgedDeviceBasicInformationServer } from "@project-chip/matter.js/behaviors/bridged-device-basic-information";
import { Endpoint } from "@project-chip/matter.js/endpoint";
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