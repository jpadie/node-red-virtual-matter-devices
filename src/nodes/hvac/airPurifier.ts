type: module
import type { Node } from 'node-red';
import { AirPurifierDevice, AirPurifierRequirements } from "@matter/main/devices";
import { fan } from "./fan";
import { ResourceMonitoring } from "@matter/main/clusters";

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
                hepaChanged: {
                    hepaFilterMonitoring: "changeIndication", multiplier: 1, unit: "", matter: { valueType: "int" },
                    context: { valueType: "int" }
                },
                hepaCondition: {
                    hepaFilterMonitoring: "condition", multiplier: 1, unit: "", matter: { valueType: "int" },
                    context: { valueType: "int" }
                },
                hepaDegradationDirection: {
                    hepaFilterMonitoring: "degradationDirection", multiplier: 1, unit: "", matter: { valueType: "int" },
                    context: { valueType: "int" }
                }
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
        //this.withs.push(FanRequirements.FanControlServer.with(...this.features));
        if (Object.hasOwn(this.attributes, "hepaFilterMonitoring")) {
            this.withs.push(AirPurifierRequirements.HepaFilterMonitoringServer);
        }
        if (Object.hasOwn(this.attributes, "ActivateCarbonFilterMonitoring")) {
            this.withs.push(AirPurifierRequirements.ActivatedCarbonFilterMonitoringServer);
        }
        this.setSerialNumber("airPur-");
        this.device = AirPurifierDevice;
    }

    override getVerbose(item, value) {
        switch (item) {
            case "changeIndication":
                return this.getEnumKeyByEnumValue(ResourceMonitoring.ChangeIndication, value);
                break;
            default:
                return super.getVerbose(item, value);
        }
    }

}