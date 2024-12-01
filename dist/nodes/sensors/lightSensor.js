"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lightSensor = void 0;
const devices_1 = require("@matter/main/devices");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
const behaviors_1 = require("@matter/main/behaviors");
const main_1 = require("@matter/main");
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
            brightness: {
                illuminanceMeasurement: "measuredValue",
                multiplier: [this.lx2val.bind(this), this.val2lx.bind(this)],
                unit: "lx"
            }
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
            this.endpoint = await new main_1.Endpoint(devices_1.LightSensorDevice.with(behaviors_1.BridgedDeviceBasicInformationServer), this.attributes);
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