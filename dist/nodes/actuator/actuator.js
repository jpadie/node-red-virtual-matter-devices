"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
type: module;
require("@matter/main");
const onOffPlug_1 = require("./onOffPlug");
const dimmablePlug_1 = require("./dimmablePlug");
const waterValve_1 = require("./waterValve");
module.exports = (RED) => {
    function MatterActuator(config) {
        let device;
        RED.nodes.createNode(this, config);
        let module;
        switch (config.deviceType) {
            case "onOffPlug":
                module = onOffPlug_1.onOffPlug;
                break;
            case "dimmablePlug":
                module = dimmablePlug_1.dimmablePlug;
                break;
            case "waterValve":
                module = waterValve_1.waterValve;
                break;
            default:
                this.error("Invalid device type provided");
                return;
        }
        device = new module(this, config);
        device.getEndpoint();
    }
    ;
    RED.nodes.registerType('matter-actuator', MatterActuator);
};
//# sourceMappingURL=actuator.js.map