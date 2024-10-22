import "@project-chip/matter-node.js";
import { BridgedDeviceBasicInformationServer } from "@project-chip/matter.js/behaviors/bridged-device-basic-information";
import { Endpoint } from "@project-chip/matter.js/endpoint";
import type { Node } from 'node-red';
import { WindowCoveringDevice } from "@project-chip/matter.js/devices/WindowCoveringDevice";
import { WindowCoveringServer } from "@project-chip/matter.js/behaviors/window-covering";
import { WindowCovering } from "@project-chip/matter.js/cluster";
import { BaseEndpoint } from "../base/BaseEndpoint";

export class windowCovering extends BaseEndpoint {
    private withs: WindowCovering.Feature[] = [];
    constructor(node: Node, config: any, name: any = "") {
        name = config.name || "Window Covering"
        super(node, config, name);
        //console.log(config);


        this.mapping = {   //must be a 1 : 1 mapping
            lift: { windowCovering: "currentPositionLiftPercentage", multiplier: 1, unit: "%" },
            tilt: { windowCovering: "currentPositionTiltPercentage", multiplier: 1, unit: "%" }
        }

        let withs: WindowCovering.Feature[] = [];
        this.attributes.windowCovering = {};
        switch (this.config.windowCoveringType) {
            case WindowCovering.WindowCoveringType.TiltBlindTiltOnly:
                withs.push(WindowCovering.Feature.Tilt);
                withs.push(WindowCovering.Feature.PositionAwareTilt);
                this.setDefault("tilt", 0);
                this.attributes.windowCovering.currentPositionTiltPercentage = this.context.tilt;
                this.prune("lift");
                this.attributes.windowCovering.type = WindowCovering.WindowCoveringType.TiltBlindTiltOnly;
                break;
            case WindowCovering.WindowCoveringType.TiltBlindLift:
                withs.push(WindowCovering.Feature.Tilt);
                withs.push(WindowCovering.Feature.PositionAwareTilt);
                this.setDefault("tilt", 0);
                this.attributes.windowCovering.currentPositionTiltPercentage = this.context.tilt;
                withs.push(WindowCovering.Feature.Lift);
                withs.push(WindowCovering.Feature.PositionAwareLift);
                this.setDefault("lift", 0);
                this.attributes.windowCovering.currentPositionTiltPercentage = this.context.lift;
                this.attributes.windowCovering.type = WindowCovering.WindowCoveringType.TiltBlindLift;
                break;
            default:
                withs.push(WindowCovering.Feature.Lift);
                withs.push(WindowCovering.Feature.PositionAwareLift);
                this.setDefault("lift", 0);
                this.attributes.windowCovering.currentPositionTiltPercentage = this.context.lift;
                this.prune("tilt");
                this.attributes.windowCovering.type = this.config.windowCoveringType

                break;
        }

        this.attributes.serialNumber = "wcv-" + this.attributes.serialNumber;
        this.withs = withs;
    }

    override setStatus() {
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