"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
type: module;
require("@matter/main");
const colorCapableLight_1 = require("./colorCapableLight");
const dimmableLight_1 = require("./dimmableLight");
const onOffLight_1 = require("./onOffLight");
module.exports = (RED) => {
    function MatterLight(config) {
        let device;
        RED.nodes.createNode(this, config);
        this.status({
            fill: "grey",
            shape: "dot",
            text: "offline"
        });
        let module;
        switch (config.lightType) {
            case "colorLight":
                module = colorCapableLight_1.colorLight;
                break;
            case "dimmableLight":
                module = dimmableLight_1.dimmableLight;
                break;
            case "onOffLight":
                module = onOffLight_1.onOffLight;
                break;
            default:
                this.error("Invalid device type provided");
                return;
        }
        device = new module(this, config);
        device.getEndpoint();
    }
    ;
    RED.nodes.registerType('matter-light', MatterLight);
};
//# sourceMappingURL=light.js.map