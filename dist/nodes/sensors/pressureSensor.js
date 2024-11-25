"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pressureSensor = void 0;
require("@matter/main");
const devices_1 = require("@matter/main/devices");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
const behaviors_1 = require("@matter/main/behaviors");
const main_1 = require("@matter/main");
class pressureSensor extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config) {
        super(node, config);
        this.name = this.config.name || "Pressure Sensor";
        this.mapping = {
            pressure: { pressureMeasurement: "measuredValue", multiplier: 10, unit: "kPa", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } }
        };
        this.attributes.serialNumber = "ps-" + this.attributes.serialNumber;
    }
    async deploy() {
        this.context = Object.assign({
            pressure: 101.3,
            lastHeardFrom: ""
        }, this.context);
        this.Context.set("attributes", this.context);
        this.attributes = {
            ...this.attributes,
            pressureMeasurement: {
                measuredValue: this.context.pressure * 10
            }
        };
        try {
            this.endpoint = await new main_1.Endpoint(devices_1.PressureSensorDevice.with(behaviors_1.BridgedDeviceBasicInformationServer), this.attributes);
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
exports.pressureSensor = pressureSensor;
;
//# sourceMappingURL=pressureSensor.js.map