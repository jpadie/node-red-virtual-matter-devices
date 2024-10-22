"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.windowCovering = void 0;
require("@project-chip/matter-node.js");
const bridged_device_basic_information_1 = require("@project-chip/matter.js/behaviors/bridged-device-basic-information");
const endpoint_1 = require("@project-chip/matter.js/endpoint");
const WindowCoveringDevice_1 = require("@project-chip/matter.js/devices/WindowCoveringDevice");
const window_covering_1 = require("@project-chip/matter.js/behaviors/window-covering");
const cluster_1 = require("@project-chip/matter.js/cluster");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
class windowCovering extends BaseEndpoint_1.BaseEndpoint {
    withs = [];
    constructor(node, config, name = "") {
        name = config.name || "Window Covering";
        super(node, config, name);
        this.mapping = {
            lift: { windowCovering: "currentPositionLiftPercentage", multiplier: 1, unit: "%" },
            tilt: { windowCovering: "currentPositionTiltPercentage", multiplier: 1, unit: "%" }
        };
        let withs = [];
        this.attributes.windowCovering = {};
        switch (this.config.windowCoveringType) {
            case cluster_1.WindowCovering.WindowCoveringType.TiltBlindTiltOnly:
                withs.push(cluster_1.WindowCovering.Feature.Tilt);
                withs.push(cluster_1.WindowCovering.Feature.PositionAwareTilt);
                this.setDefault("tilt", 0);
                this.attributes.windowCovering.currentPositionTiltPercentage = this.context.tilt;
                this.prune("lift");
                this.attributes.windowCovering.type = cluster_1.WindowCovering.WindowCoveringType.TiltBlindTiltOnly;
                break;
            case cluster_1.WindowCovering.WindowCoveringType.TiltBlindLift:
                withs.push(cluster_1.WindowCovering.Feature.Tilt);
                withs.push(cluster_1.WindowCovering.Feature.PositionAwareTilt);
                this.setDefault("tilt", 0);
                this.attributes.windowCovering.currentPositionTiltPercentage = this.context.tilt;
                withs.push(cluster_1.WindowCovering.Feature.Lift);
                withs.push(cluster_1.WindowCovering.Feature.PositionAwareLift);
                this.setDefault("lift", 0);
                this.attributes.windowCovering.currentPositionTiltPercentage = this.context.lift;
                this.attributes.windowCovering.type = cluster_1.WindowCovering.WindowCoveringType.TiltBlindLift;
                break;
            default:
                withs.push(cluster_1.WindowCovering.Feature.Lift);
                withs.push(cluster_1.WindowCovering.Feature.PositionAwareLift);
                this.setDefault("lift", 0);
                this.attributes.windowCovering.currentPositionTiltPercentage = this.context.lift;
                this.prune("tilt");
                this.attributes.windowCovering.type = this.config.windowCoveringType;
                break;
        }
        this.attributes.serialNumber = "wcv-" + this.attributes.serialNumber;
        this.withs = withs;
    }
    setStatus() {
        let text = "";
        if (Object.hasOwn(this.context, "lift")) {
            text += `Lift: ${this.context.lift} `;
        }
        if (Object.hasOwn(this.context, "tilt")) {
            text += `Tilt: ${this.context.tilt} `;
        }
        try {
            this.node.status({
                fill: "green",
                shape: "dot",
                text: text
            });
        }
        catch (e) {
            this.node.error(e);
        }
    }
    async deploy() {
        try {
            this.endpoint = await new endpoint_1.Endpoint(WindowCoveringDevice_1.WindowCoveringDevice.with(bridged_device_basic_information_1.BridgedDeviceBasicInformationServer, window_covering_1.WindowCoveringServer.with(...this.withs)), this.attributes);
        }
        catch (e) {
            this.node.error("Error creating endpoint: " + e);
        }
    }
}
exports.windowCovering = windowCovering;
//# sourceMappingURL=windowCovering.js.map