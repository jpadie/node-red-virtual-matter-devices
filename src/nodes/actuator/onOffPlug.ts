import "@project-chip/matter-node.js";
import { OnOffPlugInUnitDevice } from "@project-chip/matter.js/devices/OnOffPlugInUnitDevice";
import { BridgedDeviceBasicInformationServer } from "@project-chip/matter.js/behaviors/bridged-device-basic-information";
import { Endpoint } from "@project-chip/matter.js/endpoint";
import type { Node } from 'node-red';
import { onOffLight } from "../light/onOffLight"


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