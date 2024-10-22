import { Endpoint } from "@project-chip/matter.js/endpoint";
import { HumiditySensorDevice } from "@project-chip/matter.js/devices/HumiditySensorDevice";
import type { Node } from 'node-red';
import { BridgedDeviceBasicInformationServer } from "@project-chip/matter.js/behaviors/bridged-device-basic-information";
import { BaseEndpoint } from "../base/BaseEndpoint";



export class humiditySensor extends BaseEndpoint {


    constructor(node: Node, config: any) {
        super(node, config);
        this.name = this.config.name || "Humidity Sensor"

        this.mapping = {   //must be a 1 : 1 mapping
            humidity: { relativeHumidityMeasurement: "measuredValue", multiplier: 100, unit: "%" }
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