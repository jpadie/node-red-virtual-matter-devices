"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.airPurifier = void 0;
type: module;
const behaviors_1 = require("@matter/main/behaviors");
const main_1 = require("@matter/main");
const devices_1 = require("@matter/main/devices");
const fan_1 = require("./fan");
const clusters_1 = require("@matter/main/clusters");
const devices_2 = require("@matter/main/devices");
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
                return Object.keys(clusters_1.ResourceMonitoring.ChangeIndication)[value];
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
            withs.push(devices_1.AirPurifierRequirements.HepaFilterMonitoringServer);
        }
        if (Object.hasOwn(this.attributes, "ActivateCarbonFilterMonitoring")) {
            withs.push(devices_1.AirPurifierRequirements.ActivatedCarbonFilterMonitoringServer);
        }
        try {
            this.endpoint = await new main_1.Endpoint(devices_1.AirPurifierDevice.with(behaviors_1.BridgedDeviceBasicInformationServer, devices_2.FanRequirements.FanControlServer.with(...this.features), ...withs), this.attributes);
        }
        catch (e) {
            this.node.error(e);
        }
    }
}
exports.airPurifier = airPurifier;
//# sourceMappingURL=airPurifier.js.map