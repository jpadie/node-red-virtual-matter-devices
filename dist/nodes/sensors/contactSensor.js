"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactSensor = void 0;
const devices_1 = require("@matter/main/devices");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
class contactSensor extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config, _name = "") {
        let name = _name || "Contact Sensor";
        super(node, config, name);
        this.mapping = {
            contact: { booleanState: "stateValue", multiplier: 1, unit: "", matter: { valueType: "boolean" }, context: { valueType: "int" } }
        };
        this.setDefault("contact", 0);
        this.setSerialNumber("cs-");
        this.attributes = Object.assign(this.attributes, {
            booleanState: {
                stateValue: this.contextToMatter("contact", this.context.contact)
            }
        });
        this.device = devices_1.ContactSensorDevice;
    }
    getVerbose(item, value) {
        switch (item) {
            case "contact":
                return value ? "Closed" : "Open";
                break;
            default:
                return super.getVerbose(item, value);
        }
    }
}
exports.contactSensor = contactSensor;
//# sourceMappingURL=contactSensor.js.map