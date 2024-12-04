import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint"
import { WaterValveDevice } from "@matter/main/devices";
import { WaterValveRequirements } from "@matter/main/devices";
import { ValveConfigurationAndControl } from "@matter/main/clusters";
import { flowSensor } from "../sensors/flowSensor";


export class waterValve extends BaseEndpoint {

    constructor(node: Node, config: any, _name: any = "") {

        let name = config.name || _name || "Water Valve"
        super(node, config, name);

        this.withs.push(WaterValveRequirements.ValveConfigurationAndControlServer.with(ValveConfigurationAndControl.Feature.TimeSync));
        this.mapping = {   //must be a 1 : 1 mapping
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
        }

        this.setSerialNumber("wv-"); // + this.attributes.serialNumber;
        this.setDefault("openDuration", null);
        this.setDefault("defaultOpenDuration", null);
        this.setDefault("autoCloseTime", null);
        this.setDefault("remainingDuration", null);
        this.setDefault("currentState", ValveConfigurationAndControl.ValveState.Closed)
        this.setDefault("targetState", null)

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
        let fM = new flowSensor(node, this.config);
        if (this.config.supportsFlowMeasurement == 1) {
            this.mapping = Object.assign(this.mapping, fM.mapping);
            this.attributes = Object.assign(this.attributes, { flowMeasurement: fM.attributes.flowMeasurement });
        } else {
            for (let item in fM.mapping) {
                this.prune(item);
            }
        }

        this.device = WaterValveDevice;
    }

    override getStatusText(): string {
        let stateVerbose = this.getVerbose(ValveConfigurationAndControl.ValveState, this.context.curretnState);
        let text = `State: ${stateVerbose}`;
        return text;
    }
}