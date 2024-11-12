"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waterLeakDetector = void 0;
require("@matter/node");
const main_1 = require("@matter/main");
const behaviors_1 = require("@matter/main/behaviors");
const devices_1 = require("@matter/main/devices");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
class waterLeakDetector extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config) {
        super(node, config);
        this.name = this.config.name || "Water Leak Detector";
        this.mapping = {
            leaking: { booleanState: "stateValue", multiplier: 1, unit: "" }
        };
        this.attributes.serialNumber = "wld-" + this.attributes.serialNumber;
    }
    setStatus() {
        this.node.status({
            fill: "green",
            shape: "dot",
            text: `${this.context.leaking ? "Leaking" : "Not Leaking"}`
        });
    }
    async deploy() {
        this.context = Object.assign({
            frozen: false,
            lastHeardFrom: ""
        }, this.context);
        this.saveContext();
        this.attributes.booleanState = {
            stateValue: this.context.leaking ? true : false
        };
        try {
            this.endpoint = await new main_1.Endpoint(devices_1.WaterLeakDetectorDevice.with(behaviors_1.BridgedDeviceBasicInformationServer), this.attributes);
            this.listen();
            this.regularUpdate();
            this.setStatus();
        }
        catch (e) {
            this.node.error(e);
        }
    }
}
exports.waterLeakDetector = waterLeakDetector;
//# sourceMappingURL=waterLeakDetector.js.map