import { Endpoint } from "@project-chip/matter.js/endpoint";
import { FlowSensorDevice } from "@project-chip/matter.js/devices/FlowSensorDevice";
import type { Node } from 'node-red';
import { BridgedDeviceBasicInformationServer } from "@project-chip/matter.js/behaviors/bridged-device-basic-information";
import { BaseEndpoint } from "../base/BaseEndpoint";



export class flowSensor extends BaseEndpoint {

    constructor(node: Node, config: any) {
        super(node, config);
        this.name = this.config.name || "Flow Sensor"

        this.mapping = {   //must be a 1 : 1 mapping
            flowRate: { flowMeasurement: "measuredValue", multiplier: 10, unit: "m3/h" }
        }

        this.attributes.serialNumber = "fs-" + this.attributes.serialNumber;
    }

    override async deploy() {
        this.context = Object.assign({
            flowRate: 1,
            lastHeardFrom: ""
        }, this.context);
        this.saveContext();
        this.attributes.flowMeasurement = {
            measuredValue: this.context.flowRate * 10
        }
        try {
            this.endpoint = new Endpoint(FlowSensorDevice.with(BridgedDeviceBasicInformationServer), this.attributes);
            this.listen();
            this.regularUpdate();
            this.setStatus();

        } catch (e) {
            this.node.error(e);
        }
    }
}