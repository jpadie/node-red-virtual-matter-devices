"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waterValve = void 0;
const BaseEndpoint_1 = require("../base/BaseEndpoint");
const devices_1 = require("@matter/main/devices");
const devices_2 = require("@matter/main/devices");
const clusters_1 = require("@matter/main/clusters");
const flowSensor_1 = require("../sensors/flowSensor");
class waterValve extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config, _name = "") {
        let name = config.name || _name || "Water Valve";
        super(node, config, name);
        this.withs.push(devices_2.WaterValveRequirements.ValveConfigurationAndControlServer.with(clusters_1.ValveConfigurationAndControl.Feature.TimeSync));
        this.mapping = {
            ...this.mapping,
            valveState: {
                valveConfigurationAndControl: "currentState",
                multiplier: 1,
                permittedValues: [0, 1, 2],
                context: { valueType: "int" },
                matter: { valueType: "int" }
            },
            openDuration: {
                valveConfigurationAndControl: "openDuration",
                multiplier: 1,
                min: 0,
                context: { valueType: "int" },
                matter: { valueType: "int" }
            },
            defaultOpenDuration: {
                valveConfigurationAndControl: "defaultOpenDuration",
                multiplier: 1,
                min: 0,
                context: { valueType: "int" },
                matter: { valueType: "int" }
            },
            autoCloseTime: {
                valveConfigurationAndControl: "autoCloseTime",
                multiplier: 1,
                min: 0,
                context: { valueType: "int" },
                matter: { valueType: "int" }
            },
            remainingDuration: {
                valveConfigurationAndControl: "remainingDuration",
                multiplier: 1,
                min: 0,
                context: { valueType: "int" },
                matter: { valueType: "int" }
            },
            targetState: {
                valveConfigurationAndControl: "targetState",
                multiplier: 1,
                permittedValues: [0, 1, 2],
                context: { valueType: "int" },
                matter: { valueType: "int" }
            },
        };
        this.setSerialNumber("wv-");
        this.setDefault("openDuration", null);
        this.setDefault("defaultOpenDuration", null);
        this.setDefault("autoCloseTime", null);
        this.setDefault("remainingDuration", null);
        this.setDefault("currentState", clusters_1.ValveConfigurationAndControl.ValveState.Closed);
        this.setDefault("targetState", null);
        this.attributes = {
            ...this.attributes,
            valveConfigurationAndControl: {
                openDuration: this.contextToMatter("openDuration", this.context.openDuration),
                defaultOpenDuration: this.contextToMatter("defaultOpenDuration", this.context.defaultOpenDuration),
                autoCloseTime: this.contextToMatter("autoCloseTime", this.context.autoCloseTime),
                remainingDuration: this.contextToMatter("remainingDuration", this.context.remainingDuration),
                currentState: this.contextToMatter("valveState", this.context.valveState),
                targetState: this.contextToMatter("targetState", this.context.targetState)
            }
        };
        let fM = new flowSensor_1.flowSensor(node, this.config);
        if (this.config.supportsFlowMeasurement == 1) {
            this.mapping = Object.assign(this.mapping, fM.mapping);
            this.attributes = Object.assign(this.attributes, { flowMeasurement: fM.attributes.flowMeasurement });
        }
        else {
            for (let item in fM.mapping) {
                this.prune(item);
            }
        }
        this.device = devices_1.WaterValveDevice;
    }
    getStatusText() {
        let stateVerbose = this.getVerbose(clusters_1.ValveConfigurationAndControl.ValveState, this.context.curretnState);
        let text = `State: ${stateVerbose}`;
        return text;
    }
}
exports.waterValve = waterValve;
//# sourceMappingURL=waterValve.js.map