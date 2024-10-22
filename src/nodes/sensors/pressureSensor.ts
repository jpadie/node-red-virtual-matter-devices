import { Endpoint } from "@project-chip/matter.js/endpoint";
import type { Node } from 'node-red';
import { BridgedDeviceBasicInformationServer } from "@project-chip/matter.js/behaviors/bridged-device-basic-information";
import { PressureSensorDevice } from "@project-chip/matter.js/devices/PressureSensorDevice";
import { BaseEndpoint } from "../base/BaseEndpoint";

export class pressureSensor extends BaseEndpoint {
    constructor(node: Node, config: any) {
        super(node, config);
        this.name = this.config.name || "Pressure Sensor"

        this.mapping = {   //must be a 1 : 1 mapping
            pressure: { pressureMeasurement: "measuredValue", multiplier: 10, unit: "kPa" }
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