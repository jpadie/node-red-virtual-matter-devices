require("@matter/node");
import { Endpoint } from "@matter/main"
import { BridgedDeviceBasicInformationServer } from "@matter/main/behaviors"
import { WaterFreezeDetectorDevice } from "@matter/main/devices"
import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";


export class waterFreezeDetectorDevice extends BaseEndpoint {

    constructor(node: Node, config: any) {

        super(node, config);
        this.name = this.config.name || "Water Freeze Sensor"

        this.mapping = {   //must be a 1 : 1 mapping
            frozen: { booleanState: "stateValue", multiplier: 1, unit: "" }
        }

        this.attributes.serialNumber = "wfd-" + this.attributes.serialNumber;

    }


    override setStatus() {
        this.node.status({
            fill: "green",
            shape: "dot",
            text: `${this.context.frozen ? "Frozen" : "Liquid"}`
        });
    }

    override async deploy() {
        this.context = Object.assign({
            frozen: false,
            lastHeardFrom: ""
        }, this.context);
        this.saveContext();
        this.attributes.booleanState = {
            stateValue: this.context.frozen ? true : false
        }

        try {
            this.endpoint = await new Endpoint(WaterFreezeDetectorDevice.with(BridgedDeviceBasicInformationServer), this.attributes);
            this.listen();
            this.regularUpdate();
            this.setStatus();
        } catch (e) {
            this.node.error(e);
        }
    }
}