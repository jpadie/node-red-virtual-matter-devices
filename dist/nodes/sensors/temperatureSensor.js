"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.temperatureSensor = void 0;
const endpoint_1 = require("@project-chip/matter.js/endpoint");
const TemperatureSensorDevice_1 = require("@project-chip/matter.js/devices/TemperatureSensorDevice");
const bridged_device_basic_information_1 = require("@project-chip/matter.js/behaviors/bridged-device-basic-information");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
class temperatureSensor extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config) {
        super(node, config);
        this.name = this.config.name || "Temperature Sensor";
        this.mapping = {
            temperature: { temperatureMeasurement: "measuredValue", multiplier: 100, unit: "C" }
        };
        this.attributes.serialNumber = "ts-" + this.attributes.serialNumber;
    }
    async deploy() {
        this.context = Object.assign({
            temperature: 20.0,
            lastHeardFrom: ""
        }, this.context);
        this.attributes.temperatureMeasurement = {
            measuredValue: this.context.temperature * 100
        };
        this.saveContext();
        try {
            this.endpoint = await new endpoint_1.Endpoint(TemperatureSensorDevice_1.TemperatureSensorDevice.with(bridged_device_basic_information_1.BridgedDeviceBasicInformationServer), this.attributes);
            this.listen();
            this.regularUpdate();
            this.setStatus();
        }
        catch (e) {
            this.node.error(e);
        }
    }
    ;
}
exports.temperatureSensor = temperatureSensor;
//# sourceMappingURL=temperatureSensor.js.map