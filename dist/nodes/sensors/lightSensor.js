"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lightSensor = void 0;
const devices_1 = require("@matter/main/devices");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
class lightSensor extends BaseEndpoint_1.BaseEndpoint {
    lx2val(value) {
        return Math.round((10000 * Math.log10(value)) + 1);
    }
    val2lx(value) {
        return Math.round(Math.pow(10, (value - 1) / 10000));
    }
    constructor(node, config, _name = "") {
        let name = _name || "Temperature Sensor";
        super(node, config, name);
        this.mapping = {
            illuminance: {
                illuminanceMeasurement: "measuredValue",
                multiplier: [this.lx2val.bind(this), this.val2lx.bind(this)],
                unit: "lx",
                matter: { valueType: "int" },
                context: { valueType: "int" }
            }
        };
        this.setSerialNumber("lxs-");
        this.setDefault("illuminance", 10000);
        this.attributes = Object.assign(this.attributes, {
            illuminanceMeasurement: {
                measuredValue: this.contextToMatter("illuminance", this.context.illuminance),
                lightSensorType: 0
            }
        });
        this.device = devices_1.LightSensorDevice;
    }
}
exports.lightSensor = lightSensor;
//# sourceMappingURL=lightSensor.js.map