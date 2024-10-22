type: module
import "@project-chip/matter-node.js";
import { BridgedDeviceBasicInformationServer } from "@project-chip/matter.js/behaviors/bridged-device-basic-information";
import { Endpoint } from "@project-chip/matter.js/endpoint";
import type { Node } from 'node-red';
import { AirPurifierDevice, AirPurifierRequirements } from "@project-chip/matter.js/devices/AirPurifierDevice";
import { fan } from "./fan";
import { ResourceMonitoring } from "@project-chip/matter.js/cluster";
import { FanRequirements } from "@project-chip/matter.js/devices/FanDevice";



export class airPurifier extends fan {

    constructor(node: Node, config: any) {
        let name = config.name || "Air Purifier"
        super(node, config, name);

        if (this.config.supportsHepaFilter) {
            this.attributes.hepaFilterMonitoring = {
                changeIndication: this.context.activatedCarbonChanged
            };
            this.mapping = {
                ...this.mapping,
                hepaChanged: { hepaFilterMonitoring: "changeIndication", multiplier: 1, unit: "" },
                hepaCondition: { hepaFilterMonitoring: "condition", multiplier: 1, unit: "" },
                hepaDegradationDirection: { hepaFilterMonitoring: "degradationDirection", multiplier: 1, unit: "" }
            }
            this.setDefault("hepaChanged", 0);
            this.setDefault("hepaCondition", 0)
        }

        if (this.config.supportsActivatedCarbonFilter) {
            this.attributes.activatedCarbonFilterMonitoring = {
                changeIndication: this.context.activatedCarbonChanged
            };
            this.mapping = {
                ...this.mapping,
                activatedCarbonChanged: { activatedCarbonFilterMonitoring: "changeIndication", multiplier: 1, unit: "" },
                activatedCarbonCondition: { activatedCarbonFilterMonitoring: "condition", multiplier: 1, unit: "" },
                activatedCarbonDegradationDirection: { activatedCarbonFilterMonitoring: "degradationDirection", multiplier: 1, unit: "" }
            }
        }

        this.setSerialNumber("airPur-");
    }

    override getVerbose(item, value) {
        switch (item) {
            case "changeIndication":
                return Object.keys(ResourceMonitoring.ChangeIndication)[value];
                break;
            default:
                return super.getVerbose(item, value);
        }
    }

    override setStatus() {
        this.node.status({
            fill: "green",
            shape: "dot",
            text: ''
        });
    }

    override async deploy() {
        let withs: any[] = [];

        if (Object.hasOwn(this.attributes, "hepaFilterMonitoring")) {
            withs.push(AirPurifierRequirements.HepaFilterMonitoringServer);
        }
        if (Object.hasOwn(this.attributes, "ActivateCarbonFilterMonitoring")) {
            withs.push(AirPurifierRequirements.ActivatedCarbonFilterMonitoringServer);
        }

        try {
            this.endpoint = await new Endpoint(
                AirPurifierDevice.with(
                    BridgedDeviceBasicInformationServer,
                    FanRequirements.FanControlServer.with(...this.features),
                    ...withs
                ), this.attributes);
        } catch (e) {
            this.node.error(e);
        }



    }
}