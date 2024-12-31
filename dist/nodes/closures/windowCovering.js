"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.windowCovering = void 0;
const devices_1 = require("@matter/main/devices");
const behaviors_1 = require("@matter/main/behaviors");
const clusters_1 = require("@matter/main/clusters");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
class windowCovering extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config, name = "") {
        name = config.name || "Window Covering";
        super(node, config, name);
        this.mapping = {
            lift: { windowCovering: "currentPositionLiftPercentage", multiplier: 1, unit: "%", matter: { valueType: "int" }, context: { valueType: "int" } },
            tilt: { windowCovering: "currentPositionTiltPercentage", multiplier: 1, unit: "%", matter: { valueType: "int" }, context: { valueType: "int" } },
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
                this.setDefault("tilt", 0);
                this.prune("lift");
                windowCovering = {
                    currentPositionTiltPercentage: this.contextToMatter("tilt", this.context.tilt),
                    type: this.config.windowCoveringType,
                    endProductType: clusters_1.WindowCovering.EndProductType.TiltOnlyInteriorBlind
                };
                if (this.config.windowCoveringPositionAware) {
                    withs.push(clusters_1.WindowCovering.Feature.PositionAwareTilt);
                    windowCovering = {
                        ...windowCovering,
                        currentPositionTiltPercent100ths: this.contextToMatter("tilt", this.context.tilt) * 100,
                    };
                }
                break;
            case "LFTL":
                withs.push(clusters_1.WindowCovering.Feature.Tilt);
                withs.push(clusters_1.WindowCovering.Feature.Lift);
                this.setDefault("tilt", 0);
                this.setDefault("lift", 0);
                windowCovering = {
                    currentPositionLiftPercentage: this.contextToMatter("lift", this.context.lift),
                    type: this.config.windowCoveringType,
                    currentPositionTiltPercentage: this.contextToMatter("tilt", this.context.tilt),
                    endProductType: clusters_1.WindowCovering.EndProductType.InteriorBlind
                };
                if (this.config.windowCoveringPositionAware) {
                    withs.push(clusters_1.WindowCovering.Feature.PositionAwareTilt);
                    withs.push(clusters_1.WindowCovering.Feature.PositionAwareLift);
                    windowCovering = {
                        ...windowCovering,
                        currentPositionLiftPercent100ths: this.contextToMatter("lift", this.context.lift) * 100,
                        currentPositionTiltPercent100ths: this.contextToMatter("tilt", this.context.tilt) * 100,
                    };
                }
                break;
            case "LF":
            case "LF|TL":
            default:
                withs.push(clusters_1.WindowCovering.Feature.Lift);
                this.setDefault("lift", 0);
                this.prune("tilt");
                windowCovering = {
                    currentPositionLiftPercentage: this.contextToMatter("lift", this.context.lift),
                    type: this.config.windowCoveringType,
                    endProductType: clusters_1.WindowCovering.EndProductType.RollerShutter
                };
                if (this.config.windowCoveringPositionAware) {
                    withs.push(clusters_1.WindowCovering.Feature.PositionAwareLift);
                    windowCovering = {
                        ...windowCovering,
                        currentPositionLiftPercent100ths: this.contextToMatter("lift", this.context.lift) * 100
                    };
                }
                break;
        }
        this.setSerialNumber("wcv-");
        this.withs.push(behaviors_1.WindowCoveringServer.with(...withs));
        this.attributes = {
            ...this.attributes,
            windowCovering: windowCovering
        };
        this.device = devices_1.WindowCoveringDevice;
    }
    async preProcessMatterUpdate(update) {
        this.node.debug(`receiving update to pre process prior to sending to matter device: ${JSON.stringify(update, null, 2)}`);
        if (Object.hasOwn(update, "windowCovering")) {
            for (let item of ["Tilt", "Lift"]) {
                this.node.debug(`checking item: ${item}`);
                if (this.config.windowCoveringPositionAware) {
                    if (Object.hasOwn(update.windowCovering, `currentPosition${item}Percentage`)) {
                        update.windowCovering[`currentPosition${item}Percent100ths`] = update.windowCovering[`currentPosition${item}Percentage`] * 100;
                        update.windowCovering[`targetPosition${item}Percent100ths`] = update.windowCovering[`currentPosition${item}Percentage`] * 100;
                    }
                }
                else {
                    this.node.debug(`Skipping as window covering is not position aware`);
                }
            }
        }
        else {
            this.node.debug("no base level object here. Skipping");
        }
        this.node.debug(`finished preprocessing matter update. Revised object is: ${JSON.stringify(update, null, 2)}`);
        return update;
    }
    getVerbose(item, value) {
        if (Number.isNaN(value)) {
            return value;
        }
        switch (item) {
            case "lift":
                if (value == 0)
                    return "Open";
                if (value == 100)
                    return "Closed";
                break;
            default:
                return value;
        }
        return value;
    }
    async getStatusText() {
        let text = "";
        if (Object.hasOwn(this.context, "lift")) {
            text += `Lift: ${this.context.lift} `;
        }
        if (Object.hasOwn(this.context, "tilt")) {
            text += `Tilt: ${this.context.tilt} `;
        }
        return text;
    }
}
exports.windowCovering = windowCovering;
//# sourceMappingURL=windowCovering.js.map