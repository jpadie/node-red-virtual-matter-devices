"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pressureSensor = void 0;
const endpoint_1 = require("@project-chip/matter.js/endpoint");
const bridged_device_basic_information_1 = require("@project-chip/matter.js/behaviors/bridged-device-basic-information");
const PressureSensorDevice_1 = require("@project-chip/matter.js/devices/PressureSensorDevice");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
class pressureSensor extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config) {
        super(node, config);
        this.name = this.config.name || "Pressure Sensor";
        this.mapping = {
            pressure: { pressureMeasurement: "measuredValue", multiplier: 10, unit: "kPa" }
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
            this.endpoint = await new endpoint_1.Endpoint(PressureSensorDevice_1.PressureSensorDevice.with(bridged_device_basic_information_1.BridgedDeviceBasicInformationServer), this.attributes);
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