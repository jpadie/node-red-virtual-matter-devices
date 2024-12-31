"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onOffLight = void 0;
const devices_1 = require("@matter/main/devices");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
const clusters_1 = require("@matter/main/clusters");
class onOffLight extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config, _name = '') {
        let name = config.name || _name || "On/Off Light";
        super(node, config, name);
        this.setDefault("onoff", 0);
        this.mapping = {
            onoff: { onOff: "onOff", multiplier: 1, unit: "", min: 0, max: 1, matter: { valueType: "int" }, context: { valueType: "int" } }
        };
        this.attributes = {
            ...this.attributes,
            onOff: {
                startUpOnOff: clusters_1.OnOff.StartUpOnOff.Off,
                onOff: this.contextToMatter("onoff", this.context.onoff)
            },
        };
        this.setSerialNumber("light-");
        this.device = devices_1.OnOffLightDevice;
    }
    getVerbose(item, value) {
        switch (item) {
            case "onoff":
                return value ? "ON" : "OFF";
                break;
            default:
                return super.getVerbose(item, value);
        }
    }
}
exports.onOffLight = onOffLight;
//# sourceMappingURL=onOffLight.js.map