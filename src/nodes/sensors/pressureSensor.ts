require("@matter/main");
import type { Node } from 'node-red';
import { PressureSensorDevice } from "@matter/main/devices"
import { BaseEndpoint } from "../base/BaseEndpoint";
import { BridgedDeviceBasicInformationServer } from "@matter/main/behaviors"
import { Endpoint } from "@matter/main"

export class pressureSensor extends BaseEndpoint {
    constructor(node: Node, config: any) {
        super(node, config);
        this.name = this.config.name || "Pressure Sensor"

        this.mapping = {   //must be a 1 : 1 mapping
            pressure: { pressureMeasurement: "measuredValue", multiplier: 10, unit: "kPa", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } }
        }

        this.attributes.serialNumber = "ps-" + this.attributes.serialNumber;

    }

    override async deploy() {
        this.context = Object.assign({
            pressure: 101.3,
            lastHeardFrom: ""
        }, this.context);
        this.Context.set("attributes", this.context);
        this.attributes = {
            ...this.attributes,
            pressureMeasurement: {
                measuredValue: this.context.pressure * 10
            }
        }
        try {
            this.endpoint = await new Endpoint(PressureSensorDevice.with(BridgedDeviceBasicInformationServer), this.attributes);
            this.listen();
            this.regularUpdate();
            this.setStatus();

        } catch (e) {
            this.node.error(e);
        }
    };

};