"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.humiditySensor = void 0;
const devices_1 = require("@matter/main/devices");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
const behaviors_1 = require("@matter/main/behaviors");
const main_1 = require("@matter/main");
class humiditySensor extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config) {
        super(node, config);
        this.name = this.config.name || "Humidity Sensor";
        this.mapping = {
            humidity: { relativeHumidityMeasurement: "measuredValue", multiplier: 100, unit: "%" }
        };
        this.attributes.serialNumber = "hs-" + this.attributes.serialNumber;
    }
    async deploy() {
        this.context = Object.assign({
            humidity: 50.0,
            lastHeardFrom: ""
        }, this.context);
        this.saveContext();
        this.attributes.relativeHumidityMeasurement = {
            measuredValue: (this.context.humidity ?? 0) * 100
        };
        try {
            this.endpoint = await new main_1.Endpoint(devices_1.HumiditySensorDevice.with(behaviors_1.BridgedDeviceBasicInformationServer), this.attributes);
            this.listen();
            this.regularUpdate();
            this.setStatus();
        }
        catch (e) {
            this.node.error(e);
        }
    }
}
exports.humiditySensor = humiditySensor;
//# sourceMappingURL=humiditySensor.js.map