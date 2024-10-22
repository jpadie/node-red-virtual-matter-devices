import { Endpoint } from "@project-chip/matter.js/endpoint";
import { RainSensorDevice } from "@project-chip/matter.js/devices/RainSensorDevice";
import type { Node } from 'node-red';
import { BridgedDeviceBasicInformationServer } from "@project-chip/matter.js/behaviors/bridged-device-basic-information";
import { BaseEndpoint } from "../base/BaseEndpoint";

export class rainSensor extends BaseEndpoint {
    constructor(node: Node, config: any) {

        super(node, config);
        this.name = this.config.name || "Water Leak Detector"

        this.mapping = {   //must be a 1 : 1 mapping
            rain: { booleanState: "stateValue", multiplier: 1, unit: "" }
        }

        this.attributes.serialNumber = "rd-" + this.attributes.serialNumber;
    }

    override setStatus = () => {
        this.node.status({
            fill: `${this.context.rain ? "blue" : "yellow"}`,
            shape: "dot",
            text: `${this.context.rain ? "Raining" : "Dry"}`
        });
    }

    override async deploy() {
        this.context = Object.assign(
            {
                rain: false,
                lastHeardFrom: ""
            }, this.Context);
        this.saveContext();
        this.attributes.booleanState = {
            stateValue: this.context.rain ? true : false
        }

        try {
            this.endpoint = await new Endpoint(RainSensorDevice.with(BridgedDeviceBasicInformationServer), this.attributes);
            this.listen();
            this.regularUpdate();
            this.setStatus();
        } catch (e) {
            this.node.error(e);
        }
    }
}