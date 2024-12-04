"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waterFreezeDetectorDevice = void 0;
require("@matter/node");
const devices_1 = require("@matter/main/devices");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
class waterFreezeDetectorDevice extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config) {
        super(node, config);
        this.name = this.config.name || "Water Freeze Sensor";
        this.mapping = {
            frozen: { booleanState: "stateValue", multiplier: 1, unit: "", matter: { valueType: "boolean" }, context: { valueType: "int" } }
        };
        this.setSerialNumber("wfd-");
        this.setDefault("frozen", 0);
        this.attributes = {
            ...this.attributes,
            booleanState: {
                stateValue: this.contextToMatter("froze", this.context.frozen)
            }
        };
        this.device = devices_1.WaterFreezeDetectorDevice;
    }
    getVerbose(item, value) {
        switch (item) {
            case "frozen":
                return value ? "Frozen" : "Liquid";
                break;
            default:
                return super.getVerbose(item, value);
        }
    }
}
exports.waterFreezeDetectorDevice = waterFreezeDetectorDevice;
//# sourceMappingURL=waterFreezeDetector.js.map