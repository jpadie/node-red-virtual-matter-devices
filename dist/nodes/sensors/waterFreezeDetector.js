"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waterFreezeDetectorDevice = void 0;
require("@matter/node");
const main_1 = require("@matter/main");
const behaviors_1 = require("@matter/main/behaviors");
const devices_1 = require("@matter/main/devices");
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
            this.endpoint = await new main_1.Endpoint(devices_1.WaterFreezeDetectorDevice.with(behaviors_1.BridgedDeviceBasicInformationServer), this.attributes);
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