"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flowSensor = void 0;
const endpoint_1 = require("@project-chip/matter.js/endpoint");
const FlowSensorDevice_1 = require("@project-chip/matter.js/devices/FlowSensorDevice");
const bridged_device_basic_information_1 = require("@project-chip/matter.js/behaviors/bridged-device-basic-information");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
class flowSensor extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config) {
        super(node, config);
        this.name = this.config.name || "Flow Sensor";
        this.mapping = {
            flowRate: { flowMeasurement: "measuredValue", multiplier: 10, unit: "m3/h" }
        };
        this.attributes.serialNumber = "fs-" + this.attributes.serialNumber;
    }
    async deploy() {
        this.context = Object.assign({
            flowRate: 1,
            lastHeardFrom: ""
        }, this.context);
        this.saveContext();
        this.attributes.flowMeasurement = {
            measuredValue: this.context.flowRate * 10
        };
        try {
            this.endpoint = new endpoint_1.Endpoint(FlowSensorDevice_1.FlowSensorDevice.with(bridged_device_basic_information_1.BridgedDeviceBasicInformationServer), this.attributes);
            this.listen();
            this.regularUpdate();
            this.setStatus();
        }
        catch (e) {
            this.node.error(e);
        }
    }
}
exports.flowSensor = flowSensor;
//# sourceMappingURL=flowSensor.js.map