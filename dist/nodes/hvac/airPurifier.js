"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.airPurifier = void 0;
type: module;
const devices_1 = require("@matter/main/devices");
const fan_1 = require("./fan");
const clusters_1 = require("@matter/main/clusters");
class airPurifier extends fan_1.fan {
    constructor(node, config) {
        let name = config.name || "Air Purifier";
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
            };
            this.setDefault("hepaChanged", 0);
            this.setDefault("hepaCondition", 0);
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
            };
        }
        if (Object.hasOwn(this.attributes, "hepaFilterMonitoring")) {
            this.withs.push(devices_1.AirPurifierRequirements.HepaFilterMonitoringServer);
        }
        if (Object.hasOwn(this.attributes, "ActivateCarbonFilterMonitoring")) {
            this.withs.push(devices_1.AirPurifierRequirements.ActivatedCarbonFilterMonitoringServer);
        }
        this.setSerialNumber("airPur-");
        this.device = devices_1.AirPurifierDevice;
    }
    getVerbose(item, value) {
        switch (item) {
            case "changeIndication":
                return this.getEnumKeyByEnumValue(clusters_1.ResourceMonitoring.ChangeIndication, value);
                break;
            default:
                return super.getVerbose(item, value);
        }
    }
}
exports.airPurifier = airPurifier;
//# sourceMappingURL=airPurifier.js.map