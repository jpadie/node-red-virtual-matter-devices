import "@project-chip/matter-node.js";
import { BridgedDeviceBasicInformationServer } from "@matter/main/behaviors"
import { Endpoint } from "@matter/main";
import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";
import { EnergyEvse, EnergyEvseCluster } from "@matter/main/clusters";



export class evse extends BaseEndpoint {


    constructor(node: Node, config: any, _name: any = "") {
        let name = _name || config.name || "EVSE"
        super(node, config, name);

        this.mapping = {

        }


        this.attributes.serialNumber = ("evse-" + this.attributes.serialNumber);
    }

    override setStatus() {
        let text = "State: " + this.getVerbose("mode", this.context.mode);
        try {
            this.node.status({
                fill: "green",
                shape: "dot",
                text: text
            });
        } catch (e) {
            this.node.error(e);
        }
    }

    override getVerbose(item: any, value: any) {
        value = super.getVerbose(item, value);
        return value;
    }

    override async deploy() {
    }
}