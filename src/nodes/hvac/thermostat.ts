type: module
import "@project-chip/matter-node.js";
import { BridgedDeviceBasicInformationServer } from "@project-chip/matter.js/behaviors/bridged-device-basic-information";
import { Endpoint } from "@project-chip/matter.js/endpoint";
import type { Node } from 'node-red';
import { ThermostatDevice } from "@project-chip/matter.js/devices/ThermostatDevice";
import { ThermostatServer } from "@project-chip/matter.js/behaviors/thermostat";
import { Thermostat } from "@project-chip/matter.js/cluster";
import { RelativeHumidityMeasurementServer } from "@project-chip/matter.js/behaviors/relative-humidity-measurement";
import { BaseEndpoint } from "../base/BaseEndpoint";


export class thermostat extends BaseEndpoint {
    private heating_coolingState: Number = 1;

    constructor(node: Node, config: any, _name: any = "") {
        let name = _name || config.name || "AirCon Unit"
        super(node, config, name);

        this.mapping = {   //must be a 1 : 1 mapping
            localTemperature: { thermostat: "localTemperature", multiplier: 100, unit: "C" },
            systemMode: { thermostat: "systemMode", multiplier: 1, unit: "" },
            occupiedHeatingSetpoint: { thermostat: "occupiedHeatingSetpoint", multiplier: 100, unit: "C" },
            occupiedCoolingSetPpoint: { thermostat: "occupiedCoolingSetpoint", multiplier: 100, unit: "C" },
            unoccupiedHeatingSetpoint: { thermostat: "unoccupiedHeatingSetpoint", multiplier: 100, unit: "C" },
            unoccupiedCoolingSetPpoint: { thermostat: "unoccupiedCoolingSetpoint", multiplier: 100, unit: "C" },
            occupied: { thermostat: "occupancy", multiplier: 1, unit: "" },
            occupiedSetback: { thermostat: "occupiedSetback", multiplier: 10, unit: "C" },
            unoccupiedSetback: { thermostat: "unoccupiedSetback", multiplier: 10, unit: "C" },
            humidity: { relativeHumidityMeasurement: "measuredValue", multiplier: 100, unit: "%" },
            outdoorTemperature: { thermostat: "outdoorTemperature", multiplier: 100, unit: "C" },
        }

        this.setSerialNumber("tstat-");

        let a: any = {};

        this.setDefault("localTemperature", 20);
        a.localTemperature = this.context.localTemperature * 100;

        a.remoteSensing = {
            localTemperature: true,
            outdoorTemperature: this.config.supportsOutdoorTemperature ? true : false,
            occupancy: this.config.supportsOccupancy ? true : false
        };
        a.setpointChangeSource = Thermostat.SetpointChangeSource.External;

        this.setDefault("systemMode", Thermostat.SystemMode.Heat);
        a.systemMode = this.context.systemMode;

        if (this.config.supportsOutDoorTemperature) {
            this.setDefault("outdoorTemperature", 15);
            a.outdoorTemperature = this.context.outdoorTemperature * 100;
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
                a.unoccupiedCoolingSetpoint = this.context.unoccupiedCoolingSetpoint * 100;
            } else {
                this.prune('unoccupiedCoolingSetpoint');
            }
            if (this.config.supportsHeating) {
                this.setDefault("unoccupiedHeatingSetpoint", 19);
                a.unoccupiedHeatingSetpoint = this.context.unoccupiedHeatingSetpoint * 100;
            } else {
                this.prune("unoccupiedHeatingSetpoint");
            }

            this.setDefault("unoccupiedSetback", 3);
            a.unoccupiedSetback = this.context.unoccupiedSetback * 10;
        } else {
            this.prune("occupancy");
            this.prune("unoccupiedCoolingSetpoint");
            this.prune("unoccupiedHeatingSetpoint");
            this.prune("unoccupiedSetback");
        }

        a.occupiedSetbackMin = 0;
        a.occupiedSetbackMax = (Thermostat.SetbackComponent.attributes.occupiedSetbackMax.default || 5) * 10;

        this.setDefault("occupiedSetback", 1);
        a.occupiedSetback = this.context.occupiedSetback * 10;

        if (this.config.supportsHeating) {
            a.absMinHeatSetpointLimit = Thermostat.HeatingComponent.attributes.absMinHeatSetpointLimit.default || 600;
            a.minHeatSetpointLimit = a.absMinHeatSetpointLimit;
            a.absMaxHeatSetpointLimit = Thermostat.HeatingComponent.attributes.absMaxHeatSetpointLimit.default || 3000;
            a.maxHeatSetpointLimit = a.absMaxHeatSetpointLimit;
            this.setDefault("occupiedHeatingSetpoint", 19);
            a.occupiedHeatingSetpoint = this.context.occupiedHeatingSetpoint * 100;
        } else {
            this.prune("occupiedHeatingSetpoint");
        }

        if (this.config.supportsCooling) {
            a.absMinCoolSetpointLimit = Thermostat.CoolingComponent.attributes.absMinCoolSetpointLimit.default || 1600;
            a.minCoolSetpointLimit = a.absMinCoolSetpointLimit;
            a.absMaxCoolSetpointLimit = Thermostat.CoolingComponent.attributes.absMaxCoolSetpointLimit.default || 3000;
            a.maxCoolSetpointLimit = a.absMaxCoolSetpointLimit;
            this.setDefault("occupiedCoolingSetpoint", 23);
            a.occupiedCoolingSetpoint = this.context.occupiedCoolingSetpoint * 100;
        } else {
            this.prune('occupiedCoolingSetpoint');
        }

        a.controlledSequenceOfOperation = (this.config.supportsCooling && this.config.supportsHeating)
            ? Thermostat.ControlSequenceOfOperation.CoolingAndHeating
            : this.config.supportsHeating
                ? Thermostat.ControlSequenceOfOperation.HeatingOnly
                : Thermostat.ControlSequenceOfOperation.CoolingOnly;

        if (this.config.supportsHumidity) {
            this.setDefault("humidity", 50);
            a.relativeHumidity = {
                measuredValue: this.context.humidity * 100
            }
        } else {
            this.prune("humidity");
        }

        this.attributes.thermostat = a;
    }

    override setStatus() {
        let text = (this.deriveOnOff() ? (this.context.systemMode == Thermostat.SystemMode.Cool ? "Cooling" : "Heating") : "Off") + " Temp: " + this.context.localTemperature;
        this.node.warn(`status: ${text}`);
        this.node.status({
            fill: "green",
            shape: "dot",
            text: text
        })
    }
    override regularUpdate() {
        super.regularUpdate();
    }
    override listenForChange_postProcess() {
        let onOff = this.deriveOnOff();
        this.node.send([null, { payload: { onOff: onOff ? "on" : "off", onOffBoolean: onOff ? true : false } }]);
    }

    deriveOnOff() {
        switch (this.context.systemMode) {
            case Thermostat.SystemMode.Off:
                return false;
                break;
            case Thermostat.SystemMode.Cool:
                //cooling
                if (this.config.supportsOccupancy && !this.context.occupied) {
                    //supports occupancy & unoccupied
                    if (this.heating_coolingState) {
                        if (this.context.localTemperature > this.context.unoccupiedCoolingSetpoint) {
                            return true;
                        } else {
                            this.heating_coolingState = 0;
                            return false;
                        }
                    } else {
                        if (this.context.localTemperature > this.context.unoccupiedSetback + this.context.unoccupiedCoolingSetpoint) {
                            this.heating_coolingState = 1;
                            return true;
                        } else {
                            return false;
                        }
                    }
                } else {
                    //occupied
                    if (this.heating_coolingState) {
                        if (this.context.localTemperature > this.context.occupiedCoolingSetpoint) {
                            return true;
                        } else {
                            this.heating_coolingState = 0;
                            return false;
                        }
                    } else {
                        if (this.context.localTemperature > this.context.occupiedSetback + this.context.occupiedCoolingSetpoint) {
                            this.heating_coolingState = 1;
                            return true;
                        } else {
                            return false;
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
                            return true;
                        } else {
                            this.heating_coolingState = 0;
                            return false;
                        }
                    } else {
                        if (this.context.localTemperature > this.context.unoccupiedSetback + this.context.unoccupiedHeatingSetpoint) {
                            this.heating_coolingState = 1;
                            return true;
                        } else {
                            return false;
                        }
                    }
                } else {

                    //occupied or occupancy unsupported
                    if (this.heating_coolingState) {
                        if (this.context.ocalTemperature < this.context.occupiedHeatingSetpoint) {
                            return true;
                        } else {
                            this.heating_coolingState = 0;
                            return false;
                        }
                    } else {
                        if (this.context.localTemperature < this.context.occupiedHeatingSetpoint - this.context.occupiedSetback) {
                            this.heating_coolingState = 1;
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
                break;
        }
    }
    override async deploy() {
        let withs: any = [];
        let features: Thermostat.Feature[] = [Thermostat.Feature.Setback];

        if (this.config.supportsCooling) features.push(Thermostat.Feature.Cooling);
        if (this.config.supportsHeating) features.push(Thermostat.Feature.Heating);
        if (this.config.supportsOccupancy) features.push(Thermostat.Feature.Occupancy);

        withs.push(ThermostatServer.with(...features));
        if (this.config.supportsHumidity) withs.push(RelativeHumidityMeasurementServer);
        withs.push(BridgedDeviceBasicInformationServer);
        this.endpoint = await new Endpoint(ThermostatDevice.with(...withs), this.attributes);
    }
}