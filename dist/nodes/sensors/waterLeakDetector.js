"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waterLeakDetector = void 0;
const endpoint_1 = require("@project-chip/matter.js/endpoint");
const bridged_device_basic_information_1 = require("@project-chip/matter.js/behaviors/bridged-device-basic-information");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
const WaterLeakDetectorDevice_1 = require("@project-chip/matter.js/devices/WaterLeakDetectorDevice");
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
            this.endpoint = await new endpoint_1.Endpoint(WaterLeakDetectorDevice_1.WaterLeakDetectorDevice.with(bridged_device_basic_information_1.BridgedDeviceBasicInformationServer), this.attributes);
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