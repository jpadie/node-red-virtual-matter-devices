import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";
import { TemperatureSensorDevice } from "@matter/main/devices"



export class temperatureSensor extends BaseEndpoint {

    constructor(node: Node, config: any, _name: string = "") {
        let name = _name || "Temperature Sensor";
        super(node, config, name);

        this.mapping = {   //must be a 1 : 1 mapping
            localTemperature: { temperatureMeasurement: "measuredValue", multiplier: 100, unit: "C", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } }
        }

        this.setSerialNumber("ts-");
        this.setDefault("localTemperature", 20);
        this.device = TemperatureSensorDevice;
        this.attributes = {
            ...this.attributes,
            temperatureMeasurement: {
                measuredValue: this.contextToMatter("localTemperature", this.context.temperature)
            }
        }
    }
}