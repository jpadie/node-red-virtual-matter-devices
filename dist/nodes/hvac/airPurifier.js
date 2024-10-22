"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.airPurifier = void 0;
type: module;
require("@project-chip/matter-node.js");
const bridged_device_basic_information_1 = require("@project-chip/matter.js/behaviors/bridged-device-basic-information");
const endpoint_1 = require("@project-chip/matter.js/endpoint");
const AirPurifierDevice_1 = require("@project-chip/matter.js/devices/AirPurifierDevice");
const fan_1 = require("./fan");
const cluster_1 = require("@project-chip/matter.js/cluster");
const FanDevice_1 = require("@project-chip/matter.js/devices/FanDevice");
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
                hepaChanged: { hepaFilterMonitoring: "changeIndication", multiplier: 1, unit: "" },
                hepaCondition: { hepaFilterMonitoring: "condition", multiplier: 1, unit: "" },
                hepaDegradationDirection: { hepaFilterMonitoring: "degradationDirection", multiplier: 1, unit: "" }
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
        this.setSerialNumber("airPur-");
    }
    getVerbose(item, value) {
        switch (item) {
            case "changeIndication":
                return Object.keys(cluster_1.ResourceMonitoring.ChangeIndication)[value];
                break;
            default:
                return super.getVerbose(item, value);
        }
    }
    setStatus() {
        this.node.status({
            fill: "green",
            shape: "dot",
            text: ''
        });
    }
    async deploy() {
        let withs = [];
        if (Object.hasOwn(this.attributes, "hepaFilterMonitoring")) {
            withs.push(AirPurifierDevice_1.AirPurifierRequirements.HepaFilterMonitoringServer);
        }
        if (Object.hasOwn(this.attributes, "ActivateCarbonFilterMonitoring")) {
            withs.push(AirPurifierDevice_1.AirPurifierRequirements.ActivatedCarbonFilterMonitoringServer);
        }
        try {
            this.endpoint = await new endpoint_1.Endpoint(AirPurifierDevice_1.AirPurifierDevice.with(bridged_device_basic_information_1.BridgedDeviceBasicInformationServer, FanDevice_1.FanRequirements.FanControlServer.with(...this.features), ...withs), this.attributes);
        }
        catch (e) {
            this.node.error(e);
        }
    }
}
exports.airPurifier = airPurifier;
//# sourceMappingURL=airPurifier.js.map