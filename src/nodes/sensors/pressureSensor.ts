require("@matter/main");
import type { Node } from 'node-red';
import { PressureSensorDevice } from "@matter/main/devices"
import { BaseEndpoint } from "../base/BaseEndpoint";


export class pressureSensor extends BaseEndpoint {
    constructor(node: Node, config: any) {
        super(node, config);
        this.name = this.config.name || "Pressure Sensor"

        this.mapping = {   //must be a 1 : 1 mapping
            pressure: { pressureMeasurement: "measuredValue", multiplier: 10, unit: "kPa", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } }
        }

        this.setSerialNumber("ps-")
        this.setDefault("pressure", 101.3);
        this.attributes = {
            ...this.attributes,
            pressureMeasurement: {
                measuredValue: this.contextToMatter("pressure", this.context.pressure)
            }
        }
        this.device = PressureSensorDevice;
    }
};