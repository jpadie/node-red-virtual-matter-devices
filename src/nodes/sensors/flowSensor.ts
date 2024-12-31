import { FlowSensorDevice } from "@matter/main/devices"
import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";



export class flowSensor extends BaseEndpoint {
    constructor(node: Node, config: any, _name: any = "") {
        let name = config.name || _name || "Flow Sensor"
        super(node, config, name);

        this.mapping = {   //must be a 1 : 1 mapping
            flowRate: { flowMeasurement: "measuredValue", multiplier: 10, unit: "m3/h", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 1 } }
        }
        this.attributes.serialNumber = "fs-" + this.attributes.serialNumber;
        this.setDefault("flowRate", 0);
        this.attributes.flowMeasurement = {
            measuredValue: this.contextToMatter("flowRate", this.context.flowRate)
        }
        this.device = FlowSensorDevice;
    }
}