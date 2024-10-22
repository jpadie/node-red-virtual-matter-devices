import { Endpoint } from "@project-chip/matter.js/endpoint";
import { ContactSensorDevice } from "@project-chip/matter.js/devices/ContactSensorDevice";
import type { Node } from 'node-red';
import { BridgedDeviceBasicInformationServer } from "@project-chip/matter.js/behaviors/bridged-device-basic-information";
import { BaseEndpoint } from "../base/BaseEndpoint";


export class contactSensor extends BaseEndpoint {

    constructor(node: Node, config: any) {
        super(node, config);
        this.name = this.config.name || "Contact Sensor"

        this.mapping = {   //must be a 1 : 1 mapping
            contact: { booleanState: "stateValue", multiplier: 1, unit: "" }
        }

        this.attributes.serialNumber = "cs-" + this.attributes.serialNumber;
    }

    override setStatus() {
        this.node.status({
            fill: "green",
            shape: "dot",
            text: `${this.context.contact ? "Closed" : "Open"}`
        });
    }

    override async deploy() {
        this.context = Object.assign(
            {
                contact: false,
                lastHeardFrom: ""
            }, this.context);

        this.attributes.booleanState = {
            stateValue: this.context.contact ? true : false
        }
        try {
            this.endpoint = await new Endpoint(ContactSensorDevice.with(BridgedDeviceBasicInformationServer), this.attributes);
            this.listen();
            this.regularUpdate();
            this.setStatus();
            console.log(this.endpoint);
        } catch (e) {
            this.node.error(e);
        }
    }
}