"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.humiditySensor = void 0;
const devices_1 = require("@matter/main/devices");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
class humiditySensor extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config) {
        super(node, config);
        this.name = this.config.name || "Humidity Sensor";
        this.mapping = {
            humidity: { relativeHumidityMeasurement: "measuredValue", multiplier: 100, unit: "%", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } }
        };
        this.setSerialNumber("hs-");
        this.setDefault("humidity", 50.0);
        this.attributes = {
            ...this.attributes,
            relativeHumidityMeasurement: {
                measuredValue: this.contextToMatter("humidity", this.context.humidity)
            }
        };
        this.device = devices_1.HumiditySensorDevice;
    }
}
exports.humiditySensor = humiditySensor;
//# sourceMappingURL=humiditySensor.js.map