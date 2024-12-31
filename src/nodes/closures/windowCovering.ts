
import type { Node } from 'node-red';
import { WindowCoveringDevice } from "@matter/main/devices"
import { WindowCoveringServer } from "@matter/main/behaviors"
import { WindowCovering } from "@matter/main/clusters";
import { BaseEndpoint } from "../base/BaseEndpoint";

export class windowCovering extends BaseEndpoint {
    constructor(node: Node, config: any, name: any = "") {
        name = config.name || "Window Covering"
        super(node, config, name);

        this.mapping = {   //must be a 1 : 1 mapping
            lift: { windowCovering: "currentPositionLiftPercentage", multiplier: 1, unit: "%", matter: { valueType: "int" }, context: { valueType: "int" } },
            tilt: { windowCovering: "currentPositionTiltPercentage", multiplier: 1, unit: "%", matter: { valueType: "int" }, context: { valueType: "int" } },
            /*   targetLift: { windowCovering: "targetPositionLiftPercentage", multiplier: 1, unit: "%", matter: { valueType: "int" }, context: { valueType: "int" } },
               targetTilt: { windowCovering: "targetPositionTiltPercentage", multiplier: 1, unit: "%", matter: { valueType: "int" }, context: { valueType: "int" } },
               lift100ths: { windowCovering: "currentPositionLiftPercentage100ths", multiplier: 100, unit: "mils", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } },
               tilt100ths: { windowCovering: "currentPositionTiltPercentage100ths", multiplier: 100, unit: "mils", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } },
           */
        }

        let withs: any[] = [];
        let windowCovering: {
            currentPositionTiltPercentage?: number;
            currentPositionLiftPercentage?: number;
            currentPositionTiltPercent100ths?: number;
            currentPositionLiftPercent100ths?: number;
            targetPositionTiltPercent100ths?: number;
            targetPositionLiftPercent100ths?: number;
            endProductType: number;
            type: number;
        };

        let conformance = {
            [WindowCovering.WindowCoveringType.Rollershade]: "LF",
            [WindowCovering.WindowCoveringType.Rollershade2Motor]: "LF",
            [WindowCovering.WindowCoveringType.RollershadeExterior]: "LF",
            [WindowCovering.WindowCoveringType.RollershadeExterior2Motor]: "LF",
            [WindowCovering.WindowCoveringType.Drapery]: "LF",
            [WindowCovering.WindowCoveringType.Awning]: "LF",
            [WindowCovering.WindowCoveringType.Shutter]: "LF|TL",
            [WindowCovering.WindowCoveringType.TiltBlindTiltOnly]: "TL",
            [WindowCovering.WindowCoveringType.TiltBlindLift]: "LFTL",
            [WindowCovering.WindowCoveringType.ProjectorScreen]: "LF"
        }


        switch (conformance[this.config.windowCoveringType]) {
            case "TL":
                withs.push(WindowCovering.Feature.Tilt);

                this.setDefault("tilt", 0);
                this.prune("lift");

                windowCovering = {
                    currentPositionTiltPercentage: this.contextToMatter("tilt", this.context.tilt),
                    type: this.config.windowCoveringType,
                    endProductType: WindowCovering.EndProductType.TiltOnlyInteriorBlind
                }

                if (this.config.windowCoveringPositionAware) {
                    withs.push(WindowCovering.Feature.PositionAwareTilt);
                    windowCovering = {
                        ...windowCovering,
                        currentPositionTiltPercent100ths: this.contextToMatter("tilt", this.context.tilt) * 100,
                        //   targetPositionTiltPercent100ths: this.contextToMatter("tilt", this.context.tilt) * 100
                    }
                }

                break;
            case "LFTL":
                withs.push(WindowCovering.Feature.Tilt);
                withs.push(WindowCovering.Feature.Lift);
                this.setDefault("tilt", 0);
                this.setDefault("lift", 0);

                windowCovering = {
                    currentPositionLiftPercentage: this.contextToMatter("lift", this.context.lift),
                    type: this.config.windowCoveringType,
                    currentPositionTiltPercentage: this.contextToMatter("tilt", this.context.tilt),
                    endProductType: WindowCovering.EndProductType.InteriorBlind
                }
                if (this.config.windowCoveringPositionAware) {
                    withs.push(WindowCovering.Feature.PositionAwareTilt);
                    withs.push(WindowCovering.Feature.PositionAwareLift);
                    windowCovering = {
                        ...windowCovering,
                        currentPositionLiftPercent100ths: this.contextToMatter("lift", this.context.lift) * 100,
                        //    targetPositionLiftPercent100ths: this.contextToMatter("lift", this.context.lift) * 100,
                        //     targetPositionTiltPercent100ths: this.contextToMatter("tilt", this.context.tilt) * 100,
                        currentPositionTiltPercent100ths: this.contextToMatter("tilt", this.context.tilt) * 100,
                    }
                }
                // windowCovering.type = WindowCovering.WindowCoveringType.TiltBlindLift;
                break;
            case "LF":
            case "LF|TL":
            default:
                withs.push(WindowCovering.Feature.Lift);
                this.setDefault("lift", 0);
                this.prune("tilt");

                //   console.log("pruning tilt");
                windowCovering = {
                    currentPositionLiftPercentage: this.contextToMatter("lift", this.context.lift),
                    type: this.config.windowCoveringType,
                    endProductType: WindowCovering.EndProductType.RollerShutter
                }
                // windowCovering.type = this.config.windowCoveringType
                if (this.config.windowCoveringPositionAware) {
                    withs.push(WindowCovering.Feature.PositionAwareLift);
                    windowCovering = {
                        ...windowCovering,
                        //    targetPositionLiftPercent100ths: this.contextToMatter("lift", this.context.lift) * 100,
                        currentPositionLiftPercent100ths: this.contextToMatter("lift", this.context.lift) * 100
                    }
                }
                break;
        }

        this.setSerialNumber("wcv-");
        this.withs.push(WindowCoveringServer.with(...withs));
        this.attributes = {
            ...this.attributes,
            windowCovering: windowCovering
        }
        this.device = WindowCoveringDevice;
    }

    override async preProcessMatterUpdate(update: any): Promise<any> {
        this.node.debug(`receiving update to pre process prior to sending to matter device: ${JSON.stringify(update, null, 2)}`);
        if (Object.hasOwn(update, "windowCovering")) {
            for (let item of ["Tilt", "Lift"]) {
                this.node.debug(`checking item: ${item}`)
                if (this.config.windowCoveringPositionAware) {
                    if (Object.hasOwn(update.windowCovering, `currentPosition${item}Percentage`)) {
                        update.windowCovering[`currentPosition${item}Percent100ths`] = update.windowCovering[`currentPosition${item}Percentage`] * 100;
                        update.windowCovering[`targetPosition${item}Percent100ths`] = update.windowCovering[`currentPosition${item}Percentage`] * 100;
                    }
                } else {
                    this.node.debug(`Skipping as window covering is not position aware`);
                }
            }
        } else {
            this.node.debug("no base level object here. Skipping");
        }
        this.node.debug(`finished preprocessing matter update. Revised object is: ${JSON.stringify(update, null, 2)}`);
        return update;
    }

    override getVerbose(item: any, value: any) {
        if (Number.isNaN(value)) {
            return value;
        }
        switch (item) {
            case "lift":
                if (value == 0) return "Open";
                if (value == 100) return "Closed";
                break;
            default:
                return value;
        }
        return value;
    }

    override async getStatusText() {
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