"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rainSensor = void 0;
const endpoint_1 = require("@project-chip/matter.js/endpoint");
const RainSensorDevice_1 = require("@project-chip/matter.js/devices/RainSensorDevice");
const bridged_device_basic_information_1 = require("@project-chip/matter.js/behaviors/bridged-device-basic-information");
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
            this.endpoint = await new endpoint_1.Endpoint(RainSensorDevice_1.RainSensorDevice.with(bridged_device_basic_information_1.BridgedDeviceBasicInformationServer), this.attributes);
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