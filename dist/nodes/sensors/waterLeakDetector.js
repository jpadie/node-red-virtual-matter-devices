"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waterLeakDetector = void 0;
require("@matter/node");
const devices_1 = require("@matter/main/devices");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
class waterLeakDetector extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config, _name = "") {
        let name = _name || "Water Leak Detector";
        super(node, config, name);
        this.mapping = {
            leaking: { booleanState: "stateValue", multiplier: 1, unit: "", matter: { valueType: "boolean" }, context: { valueType: "int" } }
        };
        this.setSerialNumber("wld-");
        this.setDefault("leaking", 0);
        this.attributes = {
            ...this.attributes,
            booleanState: {
                stateValue: this.contextToMatter("leaking", this.context.leaking)
            }
        };
        this.device = devices_1.WaterLeakDetectorDevice;
    }
    getVerbose(item, value) {
        switch (item) {
            case "leaking":
                return value ? "Leaking" : "Not Leaking";
                break;
            default:
                return super.getVerbose(item, value);
        }
    }
}
exports.waterLeakDetector = waterLeakDetector;
//# sourceMappingURL=waterLeakDetector.js.map