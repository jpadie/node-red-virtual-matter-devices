"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pump = void 0;
const devices_1 = require("@matter/main/devices");
const dimmableLight_1 = require("../light/dimmableLight");
const clusters_1 = require("@matter/main/clusters");
class pump extends dimmableLight_1.dimmableLight {
    constructor(node, config, _name = "") {
        let name = config.name || _name || "Pump";
        super(node, config, name);
        this.mapping = {
            ...this.mapping,
            speed: {
                pumpConfigurationAndControl: "speed",
                min: 0,
                max: 100,
                multiplier: 1,
                unit: "%",
                context: { valueType: "int" },
                matter: { valueType: "int" }
            }
        };
        delete this.mapping.brightness;
        this.setSerialNumber("pump-");
        this.setDefault("speed", 0);
        this.attributes = {
            ...this.attributes,
            pumpConfigurationAndControl: {
                maxSpeed: 65534,
                maxPressure: 3276,
                maxFlow: 6553.4,
                effectiveOperationMode: clusters_1.PumpConfigurationAndControl.OperationMode.Normal,
                capacity: 0,
                speed: this.contextToMatter("speed", this.context.speed),
                operationMode: clusters_1.PumpConfigurationAndControl.OperationMode.Normal,
            },
        };
        if (this.config.supportsVariableSpeed) {
            this.attributes.levelControl.currentLevel = this.contextToMatter("speed", this.context.speed);
            this.withs.push(devices_1.PumpRequirements.LevelControlServer);
        }
        else {
            delete this.attributes.levelControl;
        }
        this.withs.push(devices_1.PumpRequirements.PumpConfigurationAndControlServer, devices_1.PumpRequirements.OnOffServer);
        this.device = devices_1.PumpDevice;
    }
}
exports.pump = pump;
//# sourceMappingURL=pump.js.map