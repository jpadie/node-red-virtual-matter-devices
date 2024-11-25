"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onOffLight = void 0;
const devices_1 = require("@matter/main/devices");
const behaviors_1 = require("@matter/main/behaviors");
const main_1 = require("@matter/main");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
const clusters_1 = require("@matter/main/clusters");
class onOffLight extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config, _name = '') {
        let name = config.name || _name || "On/Off Light";
        super(node, config, name);
        this.setDefault("onoff", 0);
        this.attributes = {
            ...this.attributes,
            onOff: {
                startUpOnOff: this.context.onoff ? clusters_1.OnOff.StartUpOnOff.On : clusters_1.OnOff.StartUpOnOff.Off,
            },
        };
        this.mapping = {
            onoff: { onOff: "onOff", multiplier: 1, unit: "", min: 0, max: 1, matter: { valueType: "int" }, context: { valueType: "int" } }
        };
        this.setSerialNumber("light-");
    }
    getVerbose(item, value) {
        switch (item) {
            case "onOff":
                return value ? "ON" : "OFF";
                break;
            default:
                return super.getVerbose(item, value);
        }
    }
    setStatus() {
        this.node.status({
            fill: "green",
            shape: "dot",
            text: this.getVerbose("onOff", this.context.onoff)
        });
    }
    async deploy() {
        try {
            this.endpoint = await new main_1.Endpoint(devices_1.OnOffLightDevice.with(behaviors_1.BridgedDeviceBasicInformationServer), this.attributes);
        }
        catch (e) {
            this.node.error(e);
        }
    }
}
exports.onOffLight = onOffLight;
//# sourceMappingURL=onOffLight.js.map