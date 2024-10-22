"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onOffPlug = void 0;
require("@project-chip/matter-node.js");
const OnOffPlugInUnitDevice_1 = require("@project-chip/matter.js/devices/OnOffPlugInUnitDevice");
const bridged_device_basic_information_1 = require("@project-chip/matter.js/behaviors/bridged-device-basic-information");
const endpoint_1 = require("@project-chip/matter.js/endpoint");
const onOffLight_1 = require("../light/onOffLight");
class onOffPlug extends onOffLight_1.onOffLight {
    constructor(node, config, _name = '') {
        let name = config.name || _name || "On/Off Plug";
        super(node, config, name);
        this.setSerialNumber("plug-");
    }
    async deploy() {
        try {
            this.endpoint = await new endpoint_1.Endpoint(OnOffPlugInUnitDevice_1.OnOffPlugInUnitDevice.with(bridged_device_basic_information_1.BridgedDeviceBasicInformationServer), this.attributes);
        }
        catch (e) {
            this.node.error(e);
        }
    }
}
exports.onOffPlug = onOffPlug;
//# sourceMappingURL=onOffPlug.js.map