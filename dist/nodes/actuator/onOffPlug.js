"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onOffPlug = void 0;
require("@matter/main");
const devices_1 = require("@matter/main/devices");
const behaviors_1 = require("@matter/main/behaviors");
const main_1 = require("@matter/main");
const onOffLight_1 = require("../light/onOffLight");
class onOffPlug extends onOffLight_1.onOffLight {
    constructor(node, config, _name = '') {
        let name = config.name || _name || "On/Off Plug";
        super(node, config, name);
        this.setSerialNumber("plug-");
    }
    async deploy() {
        try {
            this.endpoint = await new main_1.Endpoint(devices_1.OnOffPlugInUnitDevice.with(behaviors_1.BridgedDeviceBasicInformationServer), this.attributes);
        }
        catch (e) {
            this.node.error(e);
        }
    }
}
exports.onOffPlug = onOffPlug;
//# sourceMappingURL=onOffPlug.js.map