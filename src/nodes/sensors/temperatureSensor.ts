import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";
import { Endpoint } from "@matter/main"
import { TemperatureSensorDevice } from "@matter/main/devices"
import { BridgedDeviceBasicInformationServer } from "@matter/main/behaviors"



export class temperatureSensor extends BaseEndpoint {

    constructor(node: Node, config: any) {

        super(node, config);
        this.name = this.config.name || "Temperature Sensor"

        this.mapping = {   //must be a 1 : 1 mapping
            temperature: { temperatureMeasurement: "measuredValue", multiplier: 100, unit: "C", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } }
        }

        this.attributes.serialNumber = "ts-" + this.attributes.serialNumber;
    }

    override async deploy() {
        this.context = Object.assign({
            temperature: 20.0,
            lastHeardFrom: ""
        }, this.context);

        this.attributes.temperatureMeasurement = {
            measuredValue: this.context.temperature * 100
        }
        this.saveContext();

        try {
            this.endpoint = await new Endpoint(TemperatureSensorDevice.with(BridgedDeviceBasicInformationServer), this.attributes);
            this.listen();
            this.regularUpdate();
            this.setStatus();
        } catch (e) {
            this.node.error(e);
        }
    };
}