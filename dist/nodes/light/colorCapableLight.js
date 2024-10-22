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
            colorX: { colorControl: "currentX", multiplier: 1, unit: "" },
            colorY: { colorControl: "currentY", multiplier: 1, unit: "" },
            colorHue: { colorControl: "currentHue", multiplier: 1, unit: "" },
            colorSaturation: { colorControl: "currentSaturation", multiplier: 1, unit: "" }
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