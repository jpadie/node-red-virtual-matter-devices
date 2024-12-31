import { HumiditySensorDevice } from "@matter/main/devices"
import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";

export class humiditySensor extends BaseEndpoint {
    constructor(node: Node, config: any) {
        super(node, config);
        this.name = this.config.name || "Humidity Sensor"

        this.mapping = {   //must be a 1 : 1 mapping
            humidity: { relativeHumidityMeasurement: "measuredValue", multiplier: 100, unit: "%", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } }
        }

        this.setSerialNumber("hs-");
        this.setDefault("humidity", 50.0);
        this.attributes = {
            ...this.attributes,
            relativeHumidityMeasurement: {
                measuredValue: this.contextToMatter("humidity", this.context.humidity)
            }
        }
        this.device = HumiditySensorDevice;
    }
}