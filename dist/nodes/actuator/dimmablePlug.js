"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dimmablePlug = void 0;
require("@matter/main");
const devices_1 = require("@matter/main/devices");
const dimmableLight_1 = require("../light/dimmableLight");
class dimmablePlug extends dimmableLight_1.dimmableLight {
    constructor(node, config, _name = '') {
        let name = config.name || _name || "Dimmable Plug";
        super(node, config, name);
        this.setDefault("dimmerLevel", 0);
        this.mapping = {
            ...this.mapping,
            dimmerLevel: {
                levelControl: "currentLevel",
                multiplier: 2.55,
                unit: "%",
                min: 0,
                max: 254,
                matter: { valueType: "int" },
                context: { valueType: "int" }
            }
        };
        this.prune("brightness");
        this.attributes.levelControl.currentLevel = this.contextToMatter("dimmerLevel", this.context.dimmerLevel);
        this.setSerialNumber("dmplug-");
        this.device = devices_1.DimmablePlugInUnitDevice;
    }
}
exports.dimmablePlug = dimmablePlug;
//# sourceMappingURL=dimmablePlug.js.map