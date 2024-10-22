"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.humiditySensor = void 0;
const endpoint_1 = require("@project-chip/matter.js/endpoint");
const HumiditySensorDevice_1 = require("@project-chip/matter.js/devices/HumiditySensorDevice");
const bridged_device_basic_information_1 = require("@project-chip/matter.js/behaviors/bridged-device-basic-information");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
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
            this.endpoint = await new endpoint_1.Endpoint(HumiditySensorDevice_1.HumiditySensorDevice.with(bridged_device_basic_information_1.BridgedDeviceBasicInformationServer), this.attributes);
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