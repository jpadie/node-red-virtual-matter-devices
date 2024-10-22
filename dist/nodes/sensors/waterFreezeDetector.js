"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waterFreezeDetectorDevice = void 0;
const endpoint_1 = require("@project-chip/matter.js/endpoint");
const WaterFreezeDetectorDevice_1 = require("@project-chip/matter.js/devices/WaterFreezeDetectorDevice");
const bridged_device_basic_information_1 = require("@project-chip/matter.js/behaviors/bridged-device-basic-information");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
class waterFreezeDetectorDevice extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config) {
        super(node, config);
        this.name = this.config.name || "Water Freeze Sensor";
        this.mapping = {
            frozen: { booleanState: "stateValue", multiplier: 1, unit: "" }
        };
        this.attributes.serialNumber = "wfd-" + this.attributes.serialNumber;
    }
    setStatus() {
        this.node.status({
            fill: "green",
            shape: "dot",
            text: `${this.context.frozen ? "Frozen" : "Liquid"}`
        });
    }
    async deploy() {
        this.context = Object.assign({
            frozen: false,
            lastHeardFrom: ""
        }, this.context);
        this.saveContext();
        this.attributes.booleanState = {
            stateValue: this.context.frozen ? true : false
        };
        try {
            this.endpoint = await new endpoint_1.Endpoint(WaterFreezeDetectorDevice_1.WaterFreezeDetectorDevice.with(bridged_device_basic_information_1.BridgedDeviceBasicInformationServer), this.attributes);
            this.listen();
            this.regularUpdate();
            this.setStatus();
        }
        catch (e) {
            this.node.error(e);
        }
    }
}
exports.waterFreezeDetectorDevice = waterFreezeDetectorDevice;
//# sourceMappingURL=waterFreezeDetector.js.map