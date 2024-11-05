"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.colorLight = void 0;
require("@project-chip/matter-node.js");
const bridged_device_basic_information_1 = require("@project-chip/matter.js/behaviors/bridged-device-basic-information");
const endpoint_1 = require("@project-chip/matter.js/endpoint");
const dimmableLight_1 = require("./dimmableLight");
const DimmableLightDevice_1 = require("@project-chip/matter.js/devices/DimmableLightDevice");
const color_control_1 = require("@project-chip/matter.js/behaviors/color-control");
class colorLight extends dimmableLight_1.dimmableLight {
    constructor(node, config, _name = '') {
        let name = config.name || _name || "Color Light";
        super(node, config, name);
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
                    enhancedHue: true,
                    colorLoop: false,
                    colorTemperature: false
                },
            }
        };
        this.mapping = {
            ...this.mapping,
            hue: { colorControl: "currentHue", multiplier: 1, unit: "" },
            saturation: { colorControl: "currentSaturation", multiplier: 1, unit: "" }
        };
        this.setSerialNumber("clLt-");
        this.setDefault("hue", 0);
        this.setDefault("saturation", 0);
        this.prune("colorX");
        this.prune("colorY");
    }
    getVerbose(item, value) {
        switch (item) {
            default:
                return super.getVerbose(item, value);
        }
    }
    setStatus() {
        let text = `${this.getVerbose("onOff", this.context.onoff)}; ${this.getVerbose("currentLevel", this.context.brightness)} Color: x: ${this.context.colorX} y: ${this.context.colorY}`;
        this.node.status({
            fill: "green",
            shape: "dot",
            text: text
        });
    }
    listenForChange_postProcess(report = null) {
        super.listenForChange_postProcess(report);
        if (typeof report == "object" && (Object.hasOwn(report, "colorX") || Object.hasOwn(report, "colorY"))) {
            if (this.zigbee()) {
                let payload = { color: {} };
                if (Object.hasOwn(report, "colorX")) {
                    payload.color.x = Math.round(100 * report.colorX) / 100;
                    this.context.colorX = Math.round(100 * report.colorX) / 100;
                }
                if (Object.hasOwn(report, "colorY")) {
                    payload.color.y = Math.round(100 * report.colorY) / 100;
                    this.context.colorY = Math.round(100 * report.colorY) / 100;
                }
                payload.messageSource = "Matter";
                this.node.send([null, { payload: payload }]);
            }
            else {
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
        if (a === "color") {
            this.context.hue = b["currentHue"];
            this.context.saturation = b["currentSaturation"];
            this.context.colorX = b["currentX"];
            this.context.colorY = b["currentY"];
            delete b.currentX;
            delete b.currentY;
        }
        return { a: a, b: b };
    }
    async deploy() {
        try {
            this.endpoint = await new endpoint_1.Endpoint(DimmableLightDevice_1.DimmableLightDevice.with(bridged_device_basic_information_1.BridgedDeviceBasicInformationServer, color_control_1.ColorControlServer.with("EnhancedHue", "Xy", "HueSaturation")), this.attributes);
        }
        catch (e) {
            this.node.error(e);
            console.trace();
        }
    }
}
exports.colorLight = colorLight;
//# sourceMappingURL=colorCapableLight.js.map