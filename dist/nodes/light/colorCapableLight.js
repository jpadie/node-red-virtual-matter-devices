"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.colorLight = void 0;
require("@project-chip/matter-node.js");
const ExtendedColorLightDevice_1 = require("@project-chip/matter.js/devices/ExtendedColorLightDevice");
const bridged_device_basic_information_1 = require("@project-chip/matter.js/behaviors/bridged-device-basic-information");
const endpoint_1 = require("@project-chip/matter.js/endpoint");
const dimmableLight_1 = require("./dimmableLight");
class colorLight extends dimmableLight_1.dimmableLight {
    constructor(node, config, _name = '') {
        let name = config.name || _name || "Color Light";
        super(node, config, name);
        this.setDefault("brightness", 0);
        this.attributes = {
            ...this.attributes,
            colorControl: {
                managedTransitionTimeHandling: true,
                options: {
                    executeIfOff: true,
                },
                colorCapabilities: {
                    hueSaturation: true,
                    xy: true,
                    enhancedHue: false,
                    colorLoop: false,
                    colorTemperature: true
                },
                colorTemperatureMireds: 0x00FA,
                coupleColorTempToLevelMinMireds: 0x00FA,
                startUpColorTemperatureMireds: 0x00FA
            }
        };
        this.mapping = {
            ...this.mapping,
            colorX: { colorControl: "currentX", multiplier: 65536, unit: "" },
            colorY: { colorControl: "currentY", multiplier: 65536, unit: "" },
        };
        this.setSerialNumber("clLt-");
        this.setDefault("colorX", 0);
        this.setDefault("colorY", 0);
        this.setDefault("colorHue", 0);
        this.setDefault("colorSaturation", 0);
    }
    getVerbose(item, value) {
        switch (item) {
            default:
                return super.getVerbose(item, value);
        }
    }
    setStatus() {
        let text = `${this.getVerbose("onOff", this.context.onoff)}; ${this.getVerbose("currentLevel", this.context.brightness)}% Color: x: ${this.context.colorX} y: ${this.context.colorY}`;
        this.node.status({
            fill: "green",
            shape: "dot",
            text: text
        });
    }
    listenForChange_postProcess(report = null) {
        super.listenForChange_postProcess(report);
        if (typeof report == "object" && (Object.hasOwn(report, "colorX") || Object.hasOwn(report, "colorY"))) {
            console.log("report");
            console.log(report);
            if (this.config.enableZigbee) {
                console.log("zigbee enabled");
                let payload = { color: {} };
                if (Object.hasOwn(report, "colorX")) {
                    payload.color.x = Math.round(100 * report.colorX) / 100;
                    this.context.colorX = Math.round(100 * report.colorX) / 100;
                }
                if (Object.hasOwn(report, "colorY")) {
                    payload.color.y = Math.round(100 * report.colorY) / 100;
                    this.context.colorY = Math.round(100 * report.colorY) / 100;
                }
                console.log("context");
                console.log(this.context);
                this.node.send([null, { payload: payload }]);
            }
            else {
                console.log("zigbee not enabled");
                if (Object.hasOwn(report, "colorX")) {
                    this.context.colorX = Math.round(report.colorX * 100 / 65536) / 100;
                }
                if (Object.hasOwn(report, "colorY")) {
                    this.context.colorY = Math.round(report.colorY * 100 / 65536) / 100;
                }
            }
        }
    }
    ;
    preProcessNodeRedInput(item, value) {
        let { a, b } = super.preProcessNodeRedInput(item, value);
        if (this.config.enableZigbee) {
            this.node.warn("zigbee enabled");
            switch (a) {
                case "color":
                    if (Object.hasOwn(b, "x") && Object.hasOwn(b, "y")) {
                        a = ["colorX", "colorY"];
                        b = [value.x, value.y];
                    }
                    break;
                default:
            }
        }
        else {
            this.node.warn("zigbee not enabled");
        }
        if (["colorX", "colorY", "color"].includes(item)) {
            if (Array.isArray(b)) {
                for (let i = 0; i < b.length; i++) {
                    b[i] = Math.min(1, b[i]);
                }
            }
            else {
                b = Math.min(1, b);
            }
        }
        return { a: a, b: b };
    }
    async deploy() {
        try {
            this.endpoint = await new endpoint_1.Endpoint(ExtendedColorLightDevice_1.ExtendedColorLightDevice.with(bridged_device_basic_information_1.BridgedDeviceBasicInformationServer), this.attributes);
        }
        catch (e) {
            this.node.error(e);
        }
    }
}
exports.colorLight = colorLight;
//# sourceMappingURL=colorCapableLight.js.map