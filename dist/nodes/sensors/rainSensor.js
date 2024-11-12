"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rainSensor = void 0;
const devices_1 = require("@matter/main/devices");
const behaviors_1 = require("@matter/main/behaviors");
const main_1 = require("@matter/main");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
class rainSensor extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config) {
        super(node, config);
        this.name = this.config.name || "Water Leak Detector";
        this.mapping = {
            rain: { booleanState: "stateValue", multiplier: 1, unit: "" }
        };
        this.attributes.serialNumber = "rd-" + this.attributes.serialNumber;
    }
    setStatus = () => {
        this.node.status({
            fill: `${this.context.rain ? "blue" : "yellow"}`,
            shape: "dot",
            text: `${this.context.rain ? "Raining" : "Dry"}`
        });
    };
    async deploy() {
        this.context = Object.assign({
            rain: false,
            lastHeardFrom: ""
        }, this.Context);
        this.saveContext();
        this.attributes.booleanState = {
            stateValue: this.context.rain ? true : false
        };
        try {
            this.endpoint = await new main_1.Endpoint(devices_1.RainSensorDevice.with(behaviors_1.BridgedDeviceBasicInformationServer), this.attributes);
            this.listen();
            this.regularUpdate();
            this.setStatus();
        }
        catch (e) {
            this.node.error(e);
        }
    }
}
exports.rainSensor = rainSensor;
//# sourceMappingURL=rainSensor.js.map