"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dimmableLight = void 0;
const devices_1 = require("@matter/main/devices");
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
                currentLevel: this.contextToMatter("brightness", this.context.brightness)
            },
        };
        this.mapping = {
            ...this.mapping,
            brightness: {
                levelControl: "currentLevel",
                multiplier: 2.55,
                unit: "%",
                min: 0,
                max: 254,
                matter: { valueType: "int" },
                context: { valueType: "int" }
            }
        };
        this.setSerialNumber(`dLt-`);
        this.device = devices_1.DimmableLightDevice;
    }
    async getStatusText() {
        let text = await super.getStatusText();
        text += ` ${await this.getVerbose("brightness", this.context.brightness)}%`;
        this.node.debug(`dimmable light status text: ${text}`);
        return text;
    }
}
exports.dimmableLight = dimmableLight;
//# sourceMappingURL=dimmableLight.js.map