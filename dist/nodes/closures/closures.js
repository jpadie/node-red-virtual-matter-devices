"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
type: module;
require("@project-chip/matter-node.js");
const windowCovering_1 = require("./windowCovering");
const doorLock_1 = require("./doorLock");
module.exports = (RED) => {
    function MatterClosure(config) {
        let device;
        let module;
        RED.nodes.createNode(this, config);
        switch (config.deviceType) {
            case "doorLock":
                module = doorLock_1.doorLock;
                break;
            case "windowCovering":
                module = windowCovering_1.windowCovering;
                break;
            default:
                this.error("Invalid device type");
                return;
        }
        device = new module(this, config);
        device.getEndpoint();
    }
    ;
    RED.nodes.registerType('matter-closure', MatterClosure);
};
//# sourceMappingURL=closures.js.map