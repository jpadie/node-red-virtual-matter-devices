type: module
import { BridgedDeviceBasicInformationServer } from "@matter/main/behaviors"
import { Endpoint } from "@matter/main";
import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";
import { FanDevice } from "@matter/main/devices";
import { FanRequirements } from "@matter/main/devices";
import { FanControl } from "@matter/main/clusters";


export class fan extends BaseEndpoint {
    public features: FanControl.Feature[] = [];
    constructor(node: Node, config: any, _name: any = "") {
        let name = config.name || _name || "Fan"
        super(node, config, name);


        this.mapping = {   //must be a 1 : 1 mapping
            fanMode: {
                fanControl: "fanMode", multiplier: 1, unit: "",
                matter: { valueType: "int" },
                context: { valueType: "int" }
            },

            percentSetting: {
                fanControl: "percentSetting", multiplier: 1, unit: "", matter: { valueType: "int" },
                context: { valueType: "int" }
            },
            percentCurrent: {
                fanControl: "percentCurrent", multiplier: 1, unit: "", matter: { valueType: "int" },
                context: { valueType: "int" }
            },

            airFlow: {
                fanControl: "airflowDirection", multiplier: 1, unit: "",
                matter: { valueType: "int" },
                context: { valueType: "int" }
            },

            speedSetting: {
                fanControl: "speedSetting", multiplier: 1, unit: "",
                matter: { valueType: "int" },
                context: { valueType: "int" }
            },
            speedCurrent: {
                fanControl: "speedCurrent", multiplier: 1, unit: "",
                matter: { valueType: "int" },
                context: { valueType: "int" }
            },

            rockUpDown: {
                fanControl: { rockSetting: "rockUpDown" }, multiplier: 1, unit: '', matter: { valueType: "int" },
                context: { valueType: "int" }
            },
            rockLeftRight: {
                fanControl: { rockSetting: "rockLeftRight" }, multiplier: 1, unit: '', matter: { valueType: "int" },
                context: { valueType: "int" }
            },
            rockRound: {
                fanControl: { rockSetting: "rockRound" }, multiplier: 1, unit: '', matter: { valueType: "int" },
                context: { valueType: "int" }
            },

            sleepWind: {
                fanControl: { windSetting: "sleepWind" }, multiplier: 1, unit: '', matter: { valueType: "int" },
                context: { valueType: "int" }
            },
            naturalWind: {
                fanControl: { windSetting: "naturalWind" }, multiplier: 1, unit: '', matter: { valueType: "int" },
                context: { valueType: "int" }
            }
        }

        this.setSerialNumber("fan-");
        this.attributes.fanControl = {};
        if (this.config.supportsRocking) {
            this.features.push(FanControl.Feature.Rocking);
            this.attributes.fanControl.rockSupport = {};
            this.attributes.fanControl.rockSetting = {};
            if ((this.config.supportsRocking & (1 << 0)) !== 0) {
                this.attributes.fanControl.rockSupport.rockUpDown = true;
                this.setDefault("rockUpDown", 0);
                this.attributes.fanControl.rockSetting.rockUpDown = this.context.rockUpDown;
            } else {
                this.prune("rockUpDown");
            }

            if ((this.config.supportsRocking & (1 << 1)) !== 0) {
                this.attributes.fanControl.rockSupport.rockLeftRight = true;
                this.setDefault("rockLeftRight", 0);
                this.attributes.fanControl.rockSetting.rockLeftRight = this.context.rockLeftRight;
            } else {
                this.prune("rockLeftRight");
            }

            if ((this.config.supportsRocking & (1 << 1)) !== 0) {
                this.attributes.fanControl.rockSupport.rockRound = true;
                this.setDefault("rockRound", 0);
                this.attributes.fanControl.rockSetting.rockUpDown = this.context.rockUpDown;
            } else {
                this.prune("rockRound");
            }

        } else {
            this.prune("rockRound");
            this.prune("rockLeftRight");
            this.prune("rockUpDown");
        }



        if (this.config.supportsWind) {
            this.features.push(FanControl.Feature.Wind);
            this.attributes.fanControl.windSupport = {};
            this.attributes.fanControl.windSetting = {};

            if ((this.config.supportsWind & (1 << 0)) !== 0) {
                this.attributes.fanControl.windSupport.sleepWind = true;
                this.setDefault("sleepWind", 0);
                this.attributes.fanControl.windSetting.sleepWind = this.context.sleepWind;
            } else {
                this.prune("sleepWind")
            }

            if ((this.config.supportsWind & (1 << 1)) !== 0) {
                this.attributes.fanControl.windSupport.naturalWind = true;
                this.setDefault("naturalWind", 0);
                this.attributes.fanControl.windSetting.naturalWind = this.context.naturalWind;
            } else {
                this.prune("naturalWind")
            }
        } else {
            this.prune("naturalWind");
            this.prune("sleepWind");
        }

        if (this.config.supportsAirflow) {
            this.features.push(FanControl.Feature.AirflowDirection);
            this.setDefault("airFlow", FanControl.AirflowDirection.Forward);
            this.attributes.fanControl.airflowDirection = this.context.airFlow;
        } else {
            this.prune("airFlow");
        }

        if (this.config.supportsMultiSpeed) {
            this.features.push(FanControl.Feature.MultiSpeed);
            this.setDefault("speedCurrent", 0);
            this.attributes.fanControl.speedCurrent = this.context.speedCurrent;

            this.setDefault("speedMax", 100);
            this.attributes.fanControl.speedMax = this.context.speedMax;

        } else {
            this.prune("speedCurrent");
            this.prune("speedSetting");
            this.prune("speedMax");
        }

        this.attributes.fanControl.fanModeSequence = FanControl.FanModeSequence.OffLowMedHigh;

        this.setDefault("fanMode", FanControl.FanMode.Off);

        this.attributes.fanControl.fanMode = this.context.fanMode;

        this.setDefault("percentCurrent", 0);
        this.setDefault("percentSetting", 0);

        this.attributes.fanControl.percentCurrent = this.context.percentCurrent;
    }
    /*
        override preProcessDeviceChanges(value: any, item: any) {
    
        }
    */
    override regularUpdate() {
        if (this.config.regularUpdates) {
            setInterval(() => {
                let m = {};

                for (const item in this.context) {
                    m[item] = this.getVerbose(item, this.context[item]);
                }
                this.node.send({ payload: m });
            }, this.config.telemetryInterval * 1000);
        }
    }
    override getVerbose(item, value) {
        switch (item) {
            case "fanMode":
                return (Object.keys(FanControl.FanMode)[Object.values(FanControl.FanMode).indexOf(value)]) || value;
                break;
            case "rockUpDown":
            case "rockLeftRight":
            case "rockRound":
            case "sleepWind":
            case "naturalWind":
                return (value) ? "ON" : "OFF";
                break;
            case "airFlow":
                return (Object.keys(FanControl.AirflowDirection)[Object.values(FanControl.AirflowDirection).indexOf(value)]) || value;
                break;
            default:
                return value;
        }
    }

    override setStatus() {
        let fanSpeed = this.getVerbose("fanMode", this.context.fanMode);
        this.node.status({
            fill: "green",
            shape: "dot",
            text: fanSpeed
        })
    }

    override async deploy() {

        //console.log(this.attributes);
        try {
            this.endpoint = await new Endpoint(
                FanDevice.with(
                    BridgedDeviceBasicInformationServer,
                    FanRequirements.FanControlServer.with(...this.features)
                ),
                this.attributes);

            this.endpoint.set(
                {
                    fanControl: {

                    }
                });

        } catch (e) {
            this.node.error(e);
        }
    }
}