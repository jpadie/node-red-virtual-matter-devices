"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactSensor = void 0;
const devices_1 = require("@matter/main/devices");
const behaviors_1 = require("@matter/main/behaviors");
const main_1 = require("@matter/main");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
class contactSensor extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config) {
        super(node, config);
        this.name = this.config.name || "Contact Sensor";
        this.mapping = {
            contact: { booleanState: "stateValue", multiplier: 1, unit: "", matter: { valueType: "int" }, context: { valueType: "int" } }
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
            this.endpoint = await new main_1.Endpoint(devices_1.ContactSensorDevice.with(behaviors_1.BridgedDeviceBasicInformationServer), this.attributes);
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