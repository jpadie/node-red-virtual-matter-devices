import { Endpoint } from "@project-chip/matter.js/endpoint";
import { TemperatureSensorDevice } from "@project-chip/matter.js/devices/TemperatureSensorDevice";
import type { Node } from 'node-red';
import { BridgedDeviceBasicInformationServer } from "@project-chip/matter.js/behaviors/bridged-device-basic-information";
import { BaseEndpoint } from "../base/BaseEndpoint";


export class temperatureSensor extends BaseEndpoint {

    constructor(node: Node, config: any) {

        super(node, config);
        this.name = this.config.name || "Temperature Sensor"

        this.mapping = {   //must be a 1 : 1 mapping
            temperature: { temperatureMeasurement: "measuredValue", multiplier: 100, unit: "C" }
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