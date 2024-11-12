import "@matter/main";
import { OnOffPlugInUnitDevice } from "@matter/main/devices";
import { BridgedDeviceBasicInformationServer } from "@matter/main/behaviors"
import { Endpoint } from "@matter/main";
import type { Node } from 'node-red';
import { onOffLight } from "../light/onOffLight";


export class onOffPlug extends onOffLight {

    constructor(node: Node, config: any, _name: any = '') {
        let name = config.name || _name || "On/Off Plug";
        super(node, config, name);
        this.setSerialNumber("plug-");
    }
    override async deploy() {
        try {
            this.endpoint = await new Endpoint(OnOffPlugInUnitDevice.with(BridgedDeviceBasicInformationServer), this.attributes);
        } catch (e) {
            this.node.error(e);
        }
    }

}