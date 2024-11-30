"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dimmablePlug = void 0;
require("@matter/main");
const devices_1 = require("@matter/main/devices");
const behaviors_1 = require("@matter/main/behaviors");
const main_1 = require("@matter/main");
const dimmableLight_1 = require("../light/dimmableLight");
class dimmablePlug extends dimmableLight_1.dimmableLight {
    constructor(node, config, _name = '') {
        let name = config.name || _name || "Dimmable Plug";
        super(node, config, name);
        this.setSerialNumber("dmplug-");
    }
    async deploy() {
        try {
            this.endpoint = await new main_1.Endpoint(devices_1.DimmablePlugInUnitDevice.with(behaviors_1.BridgedDeviceBasicInformationServer), this.attributes);
        }
        catch (e) {
            this.node.error(e);
        }
    }
}
exports.dimmablePlug = dimmablePlug;
//# sourceMappingURL=dimmablePlug.js.map