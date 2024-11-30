"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.temperatureSensor = void 0;
const BaseEndpoint_1 = require("../base/BaseEndpoint");
const main_1 = require("@matter/main");
const devices_1 = require("@matter/main/devices");
const behaviors_1 = require("@matter/main/behaviors");
class temperatureSensor extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config) {
        super(node, config);
        this.name = this.config.name || "Temperature Sensor";
        this.mapping = {
            temperature: { temperatureMeasurement: "measuredValue", multiplier: 100, unit: "C", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } }
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
            this.endpoint = await new main_1.Endpoint(devices_1.TemperatureSensorDevice.with(behaviors_1.BridgedDeviceBasicInformationServer), this.attributes);
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