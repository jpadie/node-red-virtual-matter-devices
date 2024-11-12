"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dimmableLight = void 0;
require("@project-chip/matter-node.js");
const devices_1 = require("@matter/main/devices");
const behaviors_1 = require("@matter/main/behaviors");
const main_1 = require("@matter/main");
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
                    coupleColorTempToLevel: false
                },
                onLevel: null,
                onOffTransitionTime: 150,
            },
        };
        this.mapping = {
            ...this.mapping,
            brightness: { levelControl: "currentLevel", multiplier: 255 / 100, unit: "%" }
        };
        this.attributes.bridgedDeviceBasicInformation.serialNumber = `clLt-${this.node.id}`.substring(0, 32);
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
        if (this.zigbee()) {
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
            this.endpoint = await new main_1.Endpoint(devices_1.DimmableLightDevice.with(behaviors_1.BridgedDeviceBasicInformationServer), this.attributes);
        }
        catch (e) {
            this.node.error(e);
        }
    }
}
exports.dimmableLight = dimmableLight;
//# sourceMappingURL=dimmableLight.js.map