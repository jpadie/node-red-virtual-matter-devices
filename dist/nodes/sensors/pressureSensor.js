"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pressureSensor = void 0;
require("@matter/main");
const devices_1 = require("@matter/main/devices");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
class pressureSensor extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config) {
        super(node, config);
        this.name = this.config.name || "Pressure Sensor";
        this.mapping = {
            pressure: { pressureMeasurement: "measuredValue", multiplier: 10, unit: "kPa", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } }
        };
        this.setSerialNumber("ps-");
        this.setDefault("pressure", 101.3);
        this.attributes = {
            ...this.attributes,
            pressureMeasurement: {
                measuredValue: this.contextToMatter("pressure", this.context.pressure)
            }
        };
        this.device = devices_1.PressureSensorDevice;
    }
}
exports.pressureSensor = pressureSensor;
;
//# sourceMappingURL=pressureSensor.js.map