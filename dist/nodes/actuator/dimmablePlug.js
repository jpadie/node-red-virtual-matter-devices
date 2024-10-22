"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dimmablePlug = void 0;
require("@project-chip/matter-node.js");
const DimmablePlugInUnitDevice_1 = require("@project-chip/matter.js/devices/DimmablePlugInUnitDevice");
const bridged_device_basic_information_1 = require("@project-chip/matter.js/behaviors/bridged-device-basic-information");
const endpoint_1 = require("@project-chip/matter.js/endpoint");
const dimmableLight_1 = require("../light/dimmableLight");
class dimmablePlug extends dimmableLight_1.dimmableLight {
    constructor(node, config, _name = '') {
        let name = config.name || _name || "Dimmable Plug";
        super(node, config, name);
        this.setSerialNumber("dmplug-");
    }
    async deploy() {
        try {
            this.endpoint = await new endpoint_1.Endpoint(DimmablePlugInUnitDevice_1.DimmablePlugInUnitDevice.with(bridged_device_basic_information_1.BridgedDeviceBasicInformationServer), this.attributes);
        }
        catch (e) {
            this.node.error(e);
        }
    }
}
exports.dimmablePlug = dimmablePlug;
//# sourceMappingURL=dimmablePlug.js.map