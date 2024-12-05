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
        this.attributes.bridgedDeviceBasicInformation.serialNumber = `dLt-${this.node.id}`.substring(0, 32);
        this.device = devices_1.DimmableLightDevice;
    }
    async getStatusText() {
        let text = await super.getStatusText();
        this.getVerbose("onOff", this.context.onoff);
        text += ` ${this.getVerbose("brightness", this.context.brightness)}%`;
        return text;
    }
}
exports.dimmableLight = dimmableLight;
//# sourceMappingURL=dimmableLight.js.map