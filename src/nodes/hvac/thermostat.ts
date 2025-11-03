type: module
import type { Node } from 'node-red';
import { ThermostatDevice } from "@matter/main/devices"
import { ThermostatServer } from "@matter/main/behaviors"
import { Thermostat } from "@matter/main/clusters";
import { RelativeHumidityMeasurementServer } from "@matter/main/behaviors"
import { BaseEndpoint } from "../base/BaseEndpoint";


export class thermostat extends BaseEndpoint {
    private heating_coolingState: Number = 1;

    override setDefault(item: any, value: any): void {
        super.setDefault(item, value);
        let v = this.context[item];
        if (item.includes("Setpoint")) {
            if (item.includes("Heat")) {
                v = Math.max(v, this.context.minHeatSetpointLimit);
                v = Math.min(v, this.context.maxHeatSetpointLimit);
            } else if (item.includes("Cool")) {
                v = Math.max(v, this.context.minCoolSetpointLimit);
                v = Math.min(v, this.context.maxCoolSetpointLimit);
            }
            this.context[item] = v;
        }
    }
    constructor(node: Node, config: any, _name: any = "") {
        let name = _name || config.name || "Thermostat"
        super(node, config, name);

        this.mapping = {   //must be a 1 : 1 mapping
            ...this.mapping,
            localTemperature: { thermostat: "localTemperature", multiplier: 100, unit: "C" },
            systemMode: { thermostat: "systemMode", multiplier: 1, unit: "" },
            occupiedHeatingSetpoint: { thermostat: "occupiedHeatingSetpoint", multiplier: 100, unit: "C" },
            occupiedCoolingSetpoint: { thermostat: "occupiedCoolingSetpoint", multiplier: 100, unit: "C" },
            unoccupiedHeatingSetpoint: { thermostat: "unoccupiedHeatingSetpoint", multiplier: 100, unit: "C" },
            unoccupiedCoolingSetpoint: { thermostat: "unoccupiedCoolingSetpoint", multiplier: 100, unit: "C" },
            occupied: { thermostat: "occupancy", multiplier: 1, unit: "" },
            occupiedSetback: { thermostat: "occupiedSetback", multiplier: 10, unit: "C" },
            unoccupiedSetback: { thermostat: "unoccupiedSetback", multiplier: 10, unit: "C" },
            humidity: { relativeHumidityMeasurement: "measuredValue", multiplier: 100, unit: "%" },
            outdoorTemperature: { thermostat: "outdoorTemperature", multiplier: 100, unit: "C" },
            minHeatSetpointLimit: { thermostat: "minHeatSetpointLimit", multiplier: 100, unit: "C" , min: 18, max: 30},
            maxHeatSetpointLimit: { thermostat: "maxHeatSetpointLimit", multiplier: 100, unit: "C" , min: 18, max: 30},
            minCoolSetpointLimit: { thermostat: "minCoolSetpointLimit", multiplier: 100, unit: "C" , min: 15, max: 30},
            maxCoolSetpointLimit: { thermostat: "maxCoolSetpointLimit", multiplier: 100, unit: "C" , min: 15, max: 30},
            absMinHeatSetpointLimit: { thermostat: "absMinHeatSetpointLimit", multiplier: 100, unit: "C" , min: 18, max: 30},
            absMaxHeatSetpointLimit: { thermostat: "absMaxHeatSetpointLimit", multiplier: 100, unit: "C" , min: 18, max: 30},
            absMinCoolSetpointLimit: { thermostat: "absMinCoolSetpointLimit", multiplier: 100, unit: "C" , min: 15, max: 30},
            absMaxCoolSetpointLimit: { thermostat: "absMaxCoolSetpointLimit", multiplier: 100, unit: "C" , min: 15, max: 30},
        }

        for (const i in this.mapping) {
            switch (i) {
                case "systemMode":
                case "occupied":
                    this.mapping[i] = Object.assign(this.mapping[i], {
                        matter: { valueType: "int" },
                        context: { valueType: "int" }
                    });
                    break;
                default:
                    this.mapping[i] = Object.assign(this.mapping[i], {
                        matter: { valueType: "int" },
                        context: { valueType: "float", valueDecimals: 2 }
                    });
                    break;
            }
        }

        this.setSerialNumber("tstat-");

        let a: any = {};

        this.setDefault("localTemperature", 20);
        console.debug(this.context)
        a.localTemperature = this.context.localTemperature * 100;

        a.remoteSensing = {
            localTemperature: true,
            outdoorTemperature: this.config.supportsOutdoorTemperature ? true : false,
            occupancy: this.config.supportsOccupancy ? true : false
        };
        a.setpointChangeSource = Thermostat.SetpointChangeSource.External;

        if (this.config.supportsHeating) {
            this.setDefault("systemMode", Thermostat.SystemMode.Heat);
        } else {
            this.setDefault("systemMode", Thermostat.SystemMode.Cool);
        }
        a.systemMode = this.context.systemMode;

        if (this.config.supportsOutdoorTemperature) {
            this.setDefault("outdoorTemperature", 15);
            a.outdoorTemperature = this.contextToMatter("outdoorTemperature", this.context.outdoorTemperature );
        } else {
            this.prune("outdoorTemperature");
        }

        if (this.config.supportsOccupancy) {
            //occupancy
            this.setDefault("occupied", false);
            a.occupied = this.context.occupied;
            a.occupancySensorTypeBitmap = {
                pir: 1,
                ultrasonic: 0,
                physical: 0
            }
            a.unoccupiedSetbackMin = 0;
            a.unoccupiedSetbackMax = (Thermostat.SetbackAndOccupancyComponent.attributes.unoccupiedSetbackMax.default || 20) * 10;
            
            if (this.config.supportsCooling) {
                this.setDefault("unoccupiedCoolingSetpoint", 25);
                a.unoccupiedCoolingSetpoint = this.contextToMatter( "unoccupiedCoolingSetpoint", this.context.unoccupiedCoolingSetpoint) ;
            } else {
                this.prune('unoccupiedCoolingSetpoint');
            }

            if (this.config.supportsHeating) {
                this.setDefault("unoccupiedHeatingSetpoint", 19);
                a.unoccupiedHeatingSetpoint =
                    this.contextToMatter("unoccupiedHeatingSetpoint",
                        this.context.unoccupiedHeatingSetpoint); ;
            } else {
                this.prune("unoccupiedHeatingSetpoint");
            }

            this.setDefault("unoccupiedSetback", 3);
            a.unoccupiedSetback = this.contextToMatter("unoccupiedSetback", this.context.unoccupiedSetback);
        } else {
            this.prune("occupied");
            this.prune("unoccupiedCoolingSetpoint");
            this.prune("unoccupiedHeatingSetpoint");
            this.prune("unoccupiedSetback");
        }

        a.occupiedSetbackMin = 0;
        a.occupiedSetbackMax = (Thermostat.SetbackComponent.attributes.occupiedSetbackMax.default || 5) * 10;

        this.setDefault("occupiedSetback", 1);
        a.occupiedSetback = this.contextToMatter("occupiedSetback", this.context.occupiedSetback);

        this.setDefault("maxHeatSetpointLimit",this.matterToContext("maxHeatSetpointLimit", Thermostat.HeatingComponent.attributes.absMaxHeatSetpointLimit.default || 3000));
        this.setDefault("minHeatSetpointLimit", this.matterToContext("minHeatSetpointLimit", Thermostat.HeatingComponent.attributes.absMinHeatSetpointLimit.default || 600));
        
        this.setDefault("absMaxHeatSetpointLimit", this.matterToContext("absMaxHeatSetpointLimit", Thermostat.HeatingComponent.attributes.absMaxHeatSetpointLimit.default || 3000));
        this.setDefault("absMinHeatSetpointLimit", this.matterToContext("absMinHeatSetpointLimit", Thermostat.HeatingComponent.attributes.absMinHeatSetpointLimit.default || 600));
        this.setDefault("occupiedHeatingSetpoint", 19);
        const heatingItems = ['occupiedHeatingSetpoint', 'absMinHeatSetpointLimit', 'minHeatSetpointLimit', 'absMaxHeatSetpointLimit', 'maxHeatSetpointLimit'];
        if (this.config.supportsHeating) {
            heatingItems.forEach((value)=>{
                a[value] = this.contextToMatter(value, this.context[value]);
            })
        } else {
            this.prune("occupiedHeatingSetpoint");
            this.prune("unoccupiedHeatingSetpoint");
        }

        const coolingItems = ['occupiedCoolingSetpoint', 'absMinCoolSetpointLimit', 'minCoolSetpointLimit', 'absMaxCoolSetpointLimit', 'maxCoolSetpointLimit'];
        coolingItems.forEach((value) => {
            const threshold = value.includes("min") ? 10 : 30;
            this.setDefault(value,
                this.matterToContext(
                    value,
                    Thermostat.CoolingComponent.attributes[value].default || threshold)
            );
            if (this.config.supportsCooling) {
                a[value] = this.contextToMatter(value, this.context[value]);
            } else {
                this.prune(value);
            }
        });
        
        if (this.config.supportsHeating) {
            if (this.config.supportsCooling) {
                a.controlSequenceOfOperation = Thermostat.ControlSequenceOfOperation.CoolingAndHeating;
            } else {
                a.controlSequenceOfOperation = Thermostat.ControlSequenceOfOperation.HeatingOnly;
            }
        } else {
            a.controlSequenceOfOperation = Thermostat.ControlSequenceOfOperation.CoolingOnly;
        }

        if (this.config.supportsHumidity) {
            this.setDefault("humidity", 50);
            a.relativeHumidity = {
                measuredValue: this.contextToMatter("humidity", this.context.humidity)
            }
        } else {
            this.prune("humidity");
        }

        this.attributes = {
            ...this.attributes,
            thermostat: a
        }

        let withs: any = [];
        let features: Thermostat.Feature[] = [Thermostat.Feature.Setback];

        if (this.config.supportsCooling) features.push(Thermostat.Feature.Cooling);
        if (this.config.supportsHeating) features.push(Thermostat.Feature.Heating);
        if (this.config.supportsOccupancy) features.push(Thermostat.Feature.Occupancy);

        withs.push(ThermostatServer.with(...features));
        if (this.config.supportsHumidity) withs.push(RelativeHumidityMeasurementServer);
        //withs.push(OnOffBehavior);
        this.withs.push(...withs);
        /*
        console.log("thermostat config");
        console.log(this.config);
        console.log("thermostat mapping");
        console.log(this.mapping);
        console.log("thermostat attributes");
        console.log(this.attributes);
        */
        this.device = ThermostatDevice;
    }

    override getVerbose(item: any, value: any) {
        switch (item) {
            case "systemMode":
                return this.getEnumKeyByEnumValue(Thermostat.SystemMode, value);
                break;
            default:
                return value;
        }
    }
    override async getStatusText() {
        return (this.deriveOnOff() ? (this.context.systemMode == Thermostat.SystemMode.Cool ? "Cooling" : "Heating") : "Off") + " Temp: " + this.context.localTemperature;
    }

    override matterRefine(item: any, value: any) {
        if (['systemMode'].includes(item)) {
            return value;
        }
        return super.matterRefine(item, value);
    }

    override preProcessDeviceChanges(value: any, item: any) {
        console.log("matter input");
        console.log("item: " + value);
        console.log("value: " + item);
        return value;
    }
    override regularUpdate() {
        if (this.config.regularUpdates) {
            setInterval(() => {
                this.sendUpdate();
                
            }, this.config.telemetryInterval * 1000);
        }
    }

    sendUpdate() {
        let update = {};
                for (const item in this.context) {
                    let value = this.getVerbose(item, this.context[item]);
                    if (value != this.context[item]) {
                        update[`${item}_in_words`] = value;
                    }
                }
                let onOff = this.deriveOnOff();
               // update['name'] = this.name;
                this.node.send([{
                    payload: {
                        ...this.context,
                        ...update,
                        ...{
                            onOffBoolean: onOff,
                            onOff: onOff ? "on" : "off",
                            name: this.name
                        }
                    },
                    topic: "regular update"
                }, {
                    payload: {
                        name: this.name,
                        onOffBoolean: onOff,
                        onOff: onOff ? "on" : "off"
                    }
                    }]);
        
    }

    override listenForChange_postProcess() {
        this.sendUpdate();
        //let onOff = this.deriveOnOff();
        //this.node.send([null, { payload: { name: this.name, onOff: onOff ? "on" : "off", onOffBoolean: onOff ? true : false } }]);
    }

    deriveOnOff() {
        let ret = false;
        switch (this.context.systemMode) {
            case Thermostat.SystemMode.Off:
                ret = false;
                break;
            case Thermostat.SystemMode.Cool:
                //cooling
                if (this.config.supportsOccupancy && !this.context.occupied) {
                    //supports occupancy & unoccupied
                    if (this.heating_coolingState) {
                        if (this.context.localTemperature > this.context.unoccupiedCoolingSetpoint) {
                            ret = true;
                        } else {
                            this.heating_coolingState = 0;
                            ret = false;
                        }
                    } else {
                        if (this.context.localTemperature > this.context.unoccupiedSetback + this.context.unoccupiedCoolingSetpoint) {
                            this.heating_coolingState = 1;
                            ret = true;
                        } else {
                            ret = false;
                        }
                    }
                } else {
                    //occupied
                    if (this.heating_coolingState) {
                        if (this.context.localTemperature > this.context.occupiedCoolingSetpoint) {
                            ret = true;
                        } else {
                            this.heating_coolingState = 0;
                            ret = false;
                        }
                    } else {
                        if (this.context.localTemperature > this.context.occupiedSetback + this.context.occupiedCoolingSetpoint) {
                            this.heating_coolingState = 1;
                            ret = true;
                        } else {
                            ret = false;
                        }
                    }
                }
                break;
            case Thermostat.SystemMode.Heat:
                //heating
                if (this.config.supportsOccupancy && !this.context.occupied) {
                    //unoccupied
                    if (this.heating_coolingState) {
                        if (this.context.localTemperature > this.context.unoccupiedHeatingSetpoint) {
                            ret = true;
                        } else {
                            this.heating_coolingState = 0;
                            ret = false;
                        }
                    } else {
                        if (this.context.localTemperature > this.context.unoccupiedSetback + this.context.unoccupiedHeatingSetpoint) {
                            this.heating_coolingState = 1;
                            ret = true;
                        } else {
                            ret = false;
                        }
                    }
                } else {

                    //occupied or occupancy unsupported
                    if (this.heating_coolingState) {
                        if (this.context.localTemperature < this.context.occupiedHeatingSetpoint) {
                            ret = true;
                        } else {
                            this.heating_coolingState = 0;
                            ret = false;
                        }
                    } else {
                        if (this.context.localTemperature < this.context.occupiedHeatingSetpoint - this.context.occupiedSetback) {
                            this.heating_coolingState = 1;
                            ret = true;
                        } else {
                            ret = false;
                        }
                    }
                }
                break;
        }
        this.context.heating_coolingState = this.heating_coolingState;
        this.saveContext();
        return ret;
    }
}