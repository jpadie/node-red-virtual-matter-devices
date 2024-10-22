"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
type: module;
require("@project-chip/matter-node.js");
const thermostat_1 = require("./thermostat");
const fan_1 = require("./fan");
const airPurifier_1 = require("./airPurifier");
module.exports = (RED) => {
    function MatterHVAC(config) {
        let device;
        RED.nodes.createNode(this, config);
        let module;
        switch (config.deviceType) {
            case "thermostat":
                module = thermostat_1.thermostat;
                break;
            case "fan":
                module = fan_1.fan;
                break;
            case "airPurifier":
                module = airPurifier_1.airPurifier;
                break;
            default:
                this.error("Invalid device type provided");
                return;
        }
        device = new module(this, config);
        device.getEndpoint();
    }
    ;
    RED.nodes.registerType('matter-hvac', MatterHVAC);
};
//# sourceMappingURL=hvac.js.map