"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.windowCovering = void 0;
const behaviors_1 = require("@matter/main/behaviors");
const main_1 = require("@matter/main");
const devices_1 = require("@matter/main/devices");
const behaviors_2 = require("@matter/main/behaviors");
const clusters_1 = require("@matter/main/clusters");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
class windowCovering extends BaseEndpoint_1.BaseEndpoint {
    withs = [];
    constructor(node, config, name = "") {
        name = config.name || "Window Covering";
        super(node, config, name);
        this.mapping = {
            lift: { windowCovering: "currentPositionLiftPercentage", multiplier: 1, unit: "%", matter: { valueType: "int" }, context: { valueType: "int" } },
            tilt: { windowCovering: "currentPositionTiltPercentage", multiplier: 1, unit: "%", matter: { valueType: "int" }, context: { valueType: "int" } }
        };
        let withs = [];
        let windowCovering;
        let conformance = {
            [clusters_1.WindowCovering.WindowCoveringType.Rollershade]: "LF",
            [clusters_1.WindowCovering.WindowCoveringType.Rollershade2Motor]: "LF",
            [clusters_1.WindowCovering.WindowCoveringType.RollershadeExterior]: "LF",
            [clusters_1.WindowCovering.WindowCoveringType.RollershadeExterior2Motor]: "LF",
            [clusters_1.WindowCovering.WindowCoveringType.Drapery]: "LF",
            [clusters_1.WindowCovering.WindowCoveringType.Awning]: "LF",
            [clusters_1.WindowCovering.WindowCoveringType.Shutter]: "LF|TL",
            [clusters_1.WindowCovering.WindowCoveringType.TiltBlindTiltOnly]: "TL",
            [clusters_1.WindowCovering.WindowCoveringType.TiltBlindLift]: "LFTL",
            [clusters_1.WindowCovering.WindowCoveringType.ProjectorScreen]: "LF"
        };
        switch (conformance[this.config.windowCoveringType]) {
            case "TL":
                withs.push(clusters_1.WindowCovering.Feature.Tilt);
                withs.push(clusters_1.WindowCovering.Feature.PositionAwareTilt);
                this.setDefault("tilt", 0);
                this.prune("lift");
                windowCovering = {
                    currentPositionTiltPercentage: this.context.tilt,
                    type: this.config.windowCoveringType,
                    endProductType: clusters_1.WindowCovering.EndProductType.TiltOnlyInteriorBlind
                };
                break;
            case "LFTL":
                withs.push(clusters_1.WindowCovering.Feature.Tilt);
                withs.push(clusters_1.WindowCovering.Feature.PositionAwareTilt);
                this.setDefault("tilt", 0);
                withs.push(clusters_1.WindowCovering.Feature.Lift);
                withs.push(clusters_1.WindowCovering.Feature.PositionAwareLift);
                this.setDefault("lift", 0);
                windowCovering = {
                    currentPositionLiftPercentage: this.context.lift,
                    type: this.config.windowCoveringType,
                    currentPositionTiltPercentage: this.context.tilt,
                    endProductType: clusters_1.WindowCovering.EndProductType.InteriorBlind
                };
                break;
            case "LF":
            case "LF|TL":
            default:
                withs.push(clusters_1.WindowCovering.Feature.Lift);
                withs.push(clusters_1.WindowCovering.Feature.PositionAwareLift);
                this.setDefault("lift", 0);
                this.prune("tilt");
                windowCovering = {
                    currentPositionLiftPercentage: this.context.lift,
                    type: this.config.windowCoveringType,
                    endProductType: clusters_1.WindowCovering.EndProductType.RollerShutter
                };
                break;
        }
        this.setSerialNumber("wcv-");
        this.withs = withs;
        this.attributes.windowCovering = windowCovering;
    }
    getVerbose(item, value) {
        if (Number.isNaN(value)) {
            return value;
        }
        switch (item) {
            case "lift":
                if (value == 0)
                    return "Closed";
                if (value == 100)
                    return "Open";
                break;
            default:
                return value;
        }
        return value;
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
    async deploy() {
        try {
            this.endpoint = await new main_1.Endpoint(devices_1.WindowCoveringDevice.with(behaviors_1.BridgedDeviceBasicInformationServer, behaviors_2.WindowCoveringServer.with(...this.withs)), this.attributes);
        }
        catch (e) {
            this.node.error("Error creating endpoint: " + e);
        }
    }
}
exports.windowCovering = windowCovering;
//# sourceMappingURL=windowCovering.js.map