"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flowSensor = void 0;
const devices_1 = require("@matter/main/devices");
const behaviors_1 = require("@matter/main/behaviors");
const main_1 = require("@matter/main");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
class flowSensor extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config) {
        super(node, config);
        this.name = this.config.name || "Flow Sensor";
        this.mapping = {
            flowRate: { flowMeasurement: "measuredValue", multiplier: 10, unit: "m3/h", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 1 } }
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
            this.endpoint = new main_1.Endpoint(devices_1.FlowSensorDevice.with(behaviors_1.BridgedDeviceBasicInformationServer), this.attributes);
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