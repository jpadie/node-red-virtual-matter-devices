"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lightSensor = void 0;
const endpoint_1 = require("@project-chip/matter.js/endpoint");
const LightSensorDevice_1 = require("@project-chip/matter.js/devices/LightSensorDevice");
const bridged_device_basic_information_1 = require("@project-chip/matter.js/behaviors/bridged-device-basic-information");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
class lightSensor extends BaseEndpoint_1.BaseEndpoint {
    lx2val(value) {
        return Math.round((10000 * Math.log10(value)) + 1);
    }
    val2lx(value) {
        return Math.round(Math.pow(10, (value - 1) / 10000));
    }
    constructor(node, config) {
        super(node, config);
        this.name = this.config.name || "Temperature Sensor";
        this.mapping = {
            brightness: { illuminanceMeasurement: "measuredValue", multiplier: [this.lx2val.bind(this), this.val2lx.bind(this)], unit: "lx" }
        };
        this.attributes.serialNumber = "lxs-" + this.attributes.serialNumber;
    }
    async deploy() {
        this.context = Object.assign({
            brightness: 10000,
            lastHeardFrom: ""
        }, this.context);
        this.attributes = Object.assign(this.attributes, {
            illuminanceMeasurement: {
                measuredValue: this.lx2val(this.context.brightness),
                lightSensorType: 0
            }
        });
        try {
            this.endpoint = await new endpoint_1.Endpoint(LightSensorDevice_1.LightSensorDevice.with(bridged_device_basic_information_1.BridgedDeviceBasicInformationServer), this.attributes);
            this.listen();
            this.regularUpdate();
            this.setStatus();
        }
        catch (e) {
            this.node.error(e);
        }
    }
}
exports.lightSensor = lightSensor;
//# sourceMappingURL=lightSensor.js.map