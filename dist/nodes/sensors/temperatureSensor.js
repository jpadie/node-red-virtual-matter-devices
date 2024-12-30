"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.temperatureSensor = void 0;
const BaseEndpoint_1 = require("../base/BaseEndpoint");
const devices_1 = require("@matter/main/devices");
class temperatureSensor extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config, _name = "") {
        let name = _name || "Temperature Sensor";
        super(node, config, name);
        this.mapping = {
            localTemperature: { temperatureMeasurement: "measuredValue", multiplier: 100, unit: "C", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } }
        };
        this.setSerialNumber("ts-");
        this.setDefault("localTemperature", 20);
        this.device = devices_1.TemperatureSensorDevice;
        this.attributes = {
            ...this.attributes,
            temperatureMeasurement: {
                measuredValue: this.contextToMatter("localTemperature", this.context.temperature)
            }
        };
    }
}
exports.temperatureSensor = temperatureSensor;
//# sourceMappingURL=temperatureSensor.js.map