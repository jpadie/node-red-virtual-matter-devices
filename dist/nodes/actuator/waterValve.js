"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waterValve = void 0;
const BaseEndpoint_1 = require("../base/BaseEndpoint");
const devices_1 = require("@matter/main/devices");
const devices_2 = require("@matter/main/devices");
const clusters_1 = require("@matter/main/clusters");
const flowSensor_1 = require("../sensors/flowSensor");
class waterValve extends BaseEndpoint_1.BaseEndpoint {
    timer;
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
            remainingDuration: {
                valveConfigurationAndControl: "remainingDuration",
                multiplier: 1,
                min: 0,
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
                currentState: this.contextToMatter("valveState", this.context.valveState),
                targetState: this.contextToMatter("targetState", this.context.targetState),
                openDuration: this.contextToMatter("openDuration", this.context.openDuration),
                defaultOpenDuration: this.contextToMatter("defaultOpenDuration", this.context.defaultOpenDuration),
                autoCloseTime: this.contextToMatter("autoCloseTime", this.context.autoCloseTime),
                remainingDuration: this.contextToMatter("remainingDuration", this.context.remainingDuration),
            }
        };
        let fM = new flowSensor_1.flowSensor(node, this.config);
        if (this.config.supportsFlowMeasurement == 1) {
            this.mapping = Object.assign(this.mapping, fM.mapping);
            this.setDefault("flowRate", 0);
            this.attributes = Object.assign(this.attributes, { flowMeasurement: this.contextToMatter("flowRate", this.context.flowRate) });
        }
        else {
            for (let item in fM.mapping) {
                this.prune(item);
            }
        }
        this.device = devices_1.WaterValveDevice;
    }
    async getStatusText() {
        let stateVerbose = this.getEnumKeyByEnumValue(clusters_1.ValveConfigurationAndControl.ValveState, this.context.valveState);
        let text;
        if (this.timer) {
            let timeRemaining = this.endpoint.state.valveConfigurationAndControl.remainingDuration;
            text = `State: ${stateVerbose} Closing in ${timeRemaining} secs`;
        }
        else {
            text = `State: ${stateVerbose}`;
        }
        return text;
    }
    async preProcessMatterUpdate(update) {
        for (let [key, value] of Object.entries(update)) {
            switch (key) {
                case "currentState":
                    update.targetState == value;
                    if (value == clusters_1.ValveConfigurationAndControl.ValveState.Closed) {
                        clearTimeout(this.timer);
                    }
                    break;
                case "openDuration":
                    if (typeof value == "number") {
                        this.timer = setTimeout(() => {
                            const m = { payload: { valveState: 0 } };
                            this.node.receive(m);
                        }, value * 1000);
                    }
                    break;
            }
        }
        return update;
    }
}
exports.waterValve = waterValve;
//# sourceMappingURL=waterValve.js.map