"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dimmableLight = void 0;
require("@project-chip/matter-node.js");
const DimmableLightDevice_1 = require("@project-chip/matter.js/devices/DimmableLightDevice");
const bridged_device_basic_information_1 = require("@project-chip/matter.js/behaviors/bridged-device-basic-information");
const endpoint_1 = require("@project-chip/matter.js/endpoint");
const onOffLight_1 = require("./onOffLight");
class dimmableLight extends onOffLight_1.onOffLight {
    constructor(node, config, _name = '') {
        let name = config.name || _name || "Dimmable Light";
        super(node, config, name);
        this.setDefault("brightness", 0);
        this.attributes = {
            ...this.attributes,
            levelControl: {
                options: {
                    executeIfOff: true,
                    coupleColorTempToLevel: true
                },
                onLevel: null,
                onOffTransitionTime: 150,
            },
        };
        this.mapping = {
            ...this.mapping,
            brightness: { levelControl: "currentLevel", multiplier: 1, unit: "" }
        };
        this.setSerialNumber("dmLt-");
    }
    getVerbose(item, value) {
        switch (item) {
            case "currentLevel":
            case "brightness":
            case "level":
                return Math.round(value);
                break;
            default:
                return super.getVerbose(item, value);
        }
    }
    listenForChange_postProcess(report = null) {
        super.listenForChange_postProcess(report);
    }
    ;
    preProcessNodeRedInput(item, value) {
        let { a, b } = super.preProcessNodeRedInput(item, value);
        if (this.config.enableZigbee) {
            switch (a) {
                case "brightness":
                    a = "brightness";
                    b = Math.round(value * 100 / 255);
                    break;
                default:
            }
        }
        return { a: a, b: b };
    }
    setStatus() {
        this.node.status({
            fill: "green",
            shape: "dot",
            text: `${this.getVerbose("onOff", this.context.onoff)}; ${this.getVerbose("brightness", this.context.brightness)}%`
        });
    }
    async deploy() {
        try {
            this.endpoint = await new endpoint_1.Endpoint(DimmableLightDevice_1.DimmableLightDevice.with(bridged_device_basic_information_1.BridgedDeviceBasicInformationServer), this.attributes);
        }
        catch (e) {
            this.node.error(e);
        }
    }
}
exports.dimmableLight = dimmableLight;
//# sourceMappingURL=dimmableLight.js.map