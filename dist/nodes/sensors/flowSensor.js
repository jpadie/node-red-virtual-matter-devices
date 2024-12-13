"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flowSensor = void 0;
const devices_1 = require("@matter/main/devices");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
class flowSensor extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config, _name = "") {
        let name = config.name || _name || "Flow Sensor";
        super(node, config, name);
        this.mapping = {
            flowRate: { flowMeasurement: "measuredValue", multiplier: 10, unit: "m3/h", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 1 } }
        };
        this.attributes.serialNumber = "fs-" + this.attributes.serialNumber;
        this.setDefault("flowRate", 0);
        this.attributes.flowMeasurement = {
            measuredValue: this.contextToMatter("flowRate", this.context.flowRate)
        };
        this.device = devices_1.FlowSensorDevice;
    }
}
exports.flowSensor = flowSensor;
//# sourceMappingURL=flowSensor.js.map