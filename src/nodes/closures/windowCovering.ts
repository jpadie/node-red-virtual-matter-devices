import { BridgedDeviceBasicInformationServer } from "@matter/main/behaviors"
import { Endpoint } from "@matter/main";
import type { Node } from 'node-red';
import { WindowCoveringDevice } from "@matter/main/devices"
    ;
import { WindowCoveringServer } from "@matter/main/behaviors"
    ;
import { WindowCovering } from "@matter/main/clusters";

import { BaseEndpoint } from "../base/BaseEndpoint";

export class windowCovering extends BaseEndpoint {
    private withs: WindowCovering.Feature[] = [];
    constructor(node: Node, config: any, name: any = "") {
        name = config.name || "Window Covering"
        super(node, config, name);
        //console.log(config);


        this.mapping = {   //must be a 1 : 1 mapping
            lift: { windowCovering: "currentPositionLiftPercentage", multiplier: 1, unit: "%", matter: { valueType: "int" }, context: { valueType: "int" } },
            tilt: { windowCovering: "currentPositionTiltPercentage", multiplier: 1, unit: "%", matter: { valueType: "int" }, context: { valueType: "int" } }
        }

        let withs: WindowCovering.Feature[] = [];
        let windowCovering: {
            currentPositionTiltPercentage?: number;
            currentPositionLiftPercentage?: number;
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
                withs.push(WindowCovering.Feature.PositionAwareTilt);
                this.setDefault("tilt", 0);
                this.prune("lift");
                windowCovering = {
                    currentPositionTiltPercentage: this.context.tilt,
                    type: this.config.windowCoveringType,
                    endProductType: WindowCovering.EndProductType.TiltOnlyInteriorBlind
                }
                break;
            case "LFTL":
                withs.push(WindowCovering.Feature.Tilt);
                withs.push(WindowCovering.Feature.PositionAwareTilt);
                this.setDefault("tilt", 0);
                withs.push(WindowCovering.Feature.Lift);
                withs.push(WindowCovering.Feature.PositionAwareLift);
                this.setDefault("lift", 0);

                windowCovering = {
                    currentPositionLiftPercentage: this.context.lift,
                    type: this.config.windowCoveringType,
                    currentPositionTiltPercentage: this.context.tilt,
                    endProductType: WindowCovering.EndProductType.InteriorBlind
                }
                // windowCovering.type = WindowCovering.WindowCoveringType.TiltBlindLift;
                break;
            case "LF":
            case "LF|TL":
            default:
                withs.push(WindowCovering.Feature.Lift);
                withs.push(WindowCovering.Feature.PositionAwareLift);
                this.setDefault("lift", 0);
                this.prune("tilt");
                //   console.log("pruning tilt");
                windowCovering = {
                    currentPositionLiftPercentage: this.context.lift,
                    type: this.config.windowCoveringType,
                    endProductType: WindowCovering.EndProductType.RollerShutter
                }
                // windowCovering.type = this.config.windowCoveringType

                break;
        }

        this.setSerialNumber("wcv-");
        this.withs = withs;
        this.attributes.windowCovering = windowCovering;
        //   console.log(this.attributes);
        //   console.log(this.config);
    }

    override getVerbose(item: any, value: any) {
        if (Number.isNaN(value)) {
            return value;
        }
        switch (item) {
            case "lift":
                if (value == 0) return "Closed";
                if (value == 100) return "Open";
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
    override setStatus() {
        try {
            this.node.status({
                fill: "green",
                shape: "dot",
                text: this.getStatusText()
            });
        } catch (e) {
            this.node.error(e);
        }
    }
    override async deploy() {
        try {
            this.endpoint = await new Endpoint(WindowCoveringDevice.with(
                BridgedDeviceBasicInformationServer,
                WindowCoveringServer.with(...this.withs)
            ), this.attributes);
        } catch (e) {
            this.node.error("Error creating endpoint: " + e);
        }
    }
}