"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onOffLight = void 0;
require("@project-chip/matter-node.js");
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
            onoff: { onOff: "onOff", multiplier: 1, unit: "" }
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
    listenForChange_postProcess(report = null) {
        if (!this.zigbee())
            return;
        if (typeof report == "object" && Object.hasOwn(report, "onoff")) {
            this.node.send([null, { payload: { state: report.onoff ? "ON" : "OFF", messageSource: "Matter" } }]);
        }
    }
    ;
    preProcessNodeRedInput(item, value) {
        let a;
        let b;
        if (this.zigbee()) {
            switch (item) {
                case "state":
                    a = "onoff";
                    b = value == "ON" ? 1 : 0;
                    break;
                default:
                    a = item;
                    b = value;
            }
            return { a: a, b: b };
        }
        return { a: item, b: value };
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