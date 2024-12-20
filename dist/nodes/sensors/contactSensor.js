"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactSensor = void 0;
const endpoint_1 = require("@project-chip/matter.js/endpoint");
const ContactSensorDevice_1 = require("@project-chip/matter.js/devices/ContactSensorDevice");
const bridged_device_basic_information_1 = require("@project-chip/matter.js/behaviors/bridged-device-basic-information");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
class contactSensor extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config) {
        super(node, config);
        this.name = this.config.name || "Contact Sensor";
        this.mapping = {
            contact: { booleanState: "stateValue", multiplier: 1, unit: "" }
        };
        this.attributes.serialNumber = "cs-" + this.attributes.serialNumber;
    }
    setStatus() {
        this.node.status({
            fill: "green",
            shape: "dot",
            text: `${this.context.contact ? "Closed" : "Open"}`
        });
    }
    async deploy() {
        this.context = Object.assign({
            contact: false,
            lastHeardFrom: ""
        }, this.context);
        this.attributes.booleanState = {
            stateValue: this.context.contact ? true : false
        };
        try {
            this.endpoint = await new endpoint_1.Endpoint(ContactSensorDevice_1.ContactSensorDevice.with(bridged_device_basic_information_1.BridgedDeviceBasicInformationServer), this.attributes);
            this.listen();
            this.regularUpdate();
            this.setStatus();
            console.log(this.endpoint);
        }
        catch (e) {
            this.node.error(e);
        }
    }
}
exports.contactSensor = contactSensor;
//# sourceMappingURL=contactSensor.js.map