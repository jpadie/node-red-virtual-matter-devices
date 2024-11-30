import { HumiditySensorDevice } from "@matter/main/devices"
import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";
import { BridgedDeviceBasicInformationServer } from "@matter/main/behaviors"
import { Endpoint } from "@matter/main"



export class humiditySensor extends BaseEndpoint {


    constructor(node: Node, config: any) {
        super(node, config);
        this.name = this.config.name || "Humidity Sensor"

        this.mapping = {   //must be a 1 : 1 mapping
            humidity: { relativeHumidityMeasurement: "measuredValue", multiplier: 100, unit: "%", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } }
        }

        this.attributes.serialNumber = "hs-" + this.attributes.serialNumber;
    }

    override async deploy() {

        this.context = Object.assign({
            humidity: 50.0,
            lastHeardFrom: ""
        }, this.context);

        this.saveContext();
        this.attributes.relativeHumidityMeasurement = {
            measuredValue: (this.context.humidity ?? 0) * 100
        }
        try {
            this.endpoint = await new Endpoint(HumiditySensorDevice.with(BridgedDeviceBasicInformationServer), this.attributes);
            this.listen();
            this.regularUpdate();
            this.setStatus();

        } catch (e) {
            this.node.error(e);
        }
    }
}