"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rainSensor = void 0;
const devices_1 = require("@matter/main/devices");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
class rainSensor extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config) {
        super(node, config);
        this.name = this.config.name || "Water Leak Detector";
        this.mapping = {
            rain: { booleanState: "stateValue", multiplier: 1, unit: "", matter: { valueType: "boolean" }, context: { valueType: "int" } }
        };
        this.setDefault("rain", 0);
        this.setSerialNumber("rd-");
        this.attributes = {
            ...this.attributes,
            booleanState: {
                stateValue: this.contextToMatter("rain", this.context.rain)
            }
        };
        this.device = devices_1.RainSensorDevice;
    }
    getVerbose(item, value) {
        switch (item) {
            case "rain":
                return value ? "Raining" : "Dry";
                break;
            default:
                return super.getVerbose(item, value);
        }
    }
}
exports.rainSensor = rainSensor;
//# sourceMappingURL=rainSensor.js.map