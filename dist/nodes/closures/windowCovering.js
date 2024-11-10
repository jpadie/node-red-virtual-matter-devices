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
        let windowCovering;
        let conformance = {
            [cluster_1.WindowCovering.WindowCoveringType.Rollershade]: "LF",
            [cluster_1.WindowCovering.WindowCoveringType.Rollershade2Motor]: "LF",
            [cluster_1.WindowCovering.WindowCoveringType.RollershadeExterior]: "LF",
            [cluster_1.WindowCovering.WindowCoveringType.RollershadeExterior2Motor]: "LF",
            [cluster_1.WindowCovering.WindowCoveringType.Drapery]: "LF",
            [cluster_1.WindowCovering.WindowCoveringType.Awning]: "LF",
            [cluster_1.WindowCovering.WindowCoveringType.Shutter]: "LF|TL",
            [cluster_1.WindowCovering.WindowCoveringType.TiltBlindTiltOnly]: "TL",
            [cluster_1.WindowCovering.WindowCoveringType.TiltBlindLift]: "LFTL",
            [cluster_1.WindowCovering.WindowCoveringType.ProjectorScreen]: "LF"
        };
        switch (conformance[this.config.windowCoveringType]) {
            case "TL":
                withs.push(cluster_1.WindowCovering.Feature.Tilt);
                withs.push(cluster_1.WindowCovering.Feature.PositionAwareTilt);
                this.setDefault("tilt", 0);
                this.prune("lift");
                windowCovering = {
                    currentPositionTiltPercentage: this.context.tilt,
                    type: this.config.windowCoveringType,
                    endProductType: cluster_1.WindowCovering.EndProductType.TiltOnlyInteriorBlind
                };
                break;
            case "LFTL":
                withs.push(cluster_1.WindowCovering.Feature.Tilt);
                withs.push(cluster_1.WindowCovering.Feature.PositionAwareTilt);
                this.setDefault("tilt", 0);
                withs.push(cluster_1.WindowCovering.Feature.Lift);
                withs.push(cluster_1.WindowCovering.Feature.PositionAwareLift);
                this.setDefault("lift", 0);
                windowCovering = {
                    currentPositionLiftPercentage: this.context.lift,
                    type: this.config.windowCoveringType,
                    currentPositionTiltPercentage: this.context.tilt,
                    endProductType: cluster_1.WindowCovering.EndProductType.InteriorBlind
                };
                break;
            case "LF":
            case "LF|TL":
            default:
                withs.push(cluster_1.WindowCovering.Feature.Lift);
                withs.push(cluster_1.WindowCovering.Feature.PositionAwareLift);
                this.setDefault("lift", 0);
                this.prune("tilt");
                windowCovering = {
                    currentPositionLiftPercentage: this.context.lift,
                    type: this.config.windowCoveringType,
                    endProductType: cluster_1.WindowCovering.EndProductType.RollerShutter
                };
                break;
        }
        this.setSerialNumber("wcv-");
        this.withs = withs;
        this.attributes.windowCovering = windowCovering;
    }
    getStatusText() {
        let text = "";
        if (Object.hasOwn(this.context, "lift")) {
            text += `Lift: ${this.context.lift} `;
        }
        if (Object.hasOwn(this.context, "tilt")) {
            text += `Tilt: ${this.context.tilt} `;
        }
        return text;
    }
    setStatus() {
        try {
            this.node.status({
                fill: "green",
                shape: "dot",
                text: this.getStatusText()
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