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
    private withs: any = [];

    constructor(node: Node, config: any, _name: any = "") {
        let name = _name || config.name || "Thermostat"
        super(node, config, name);

        this.mapping = {   //must be a 1 : 1 mapping
            localTemperature: { thermostat: "localTemperature", multiplier: 100, unit: "C" },
            systemMode: { thermostat: "systemMode", multiplier: 1, unit: "" },
            occupiedHeatingSetpoint: { thermostat: "occupiedHeatingSetpoint", multiplier: 100, unit: "C" },
            occupiedCoolingSetPpoint: { thermostat: "occupiedCoolingSetpoint", multiplier: 100, unit: "C" },
            unoccupiedHeatingSetpoint: { thermostat: "unoccupiedHeatingSetpoint", multiplier: 100, unit: "C" },
            unoccupiedCoolingSetpoint: { thermostat: "unoccupiedCoolingSetpoint", multiplier: 100, unit: "C" },
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

        if (this.config.supportsHeating) {
            this.setDefault("systemMode", Thermostat.SystemMode.Heat);
        } else {
            this.setDefault("systemMode", Thermostat.SystemMode.Cool);
        }
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
            this.prune("occupied");
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
            this.prune("unoccupiedHeatingSetpoint");
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
            this.prune('unoccupiedCoolingSetpoint');
        }

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
                measuredValue: this.context.humidity * 100
            }
        } else {
            this.prune("humidity");
        }

        this.attributes.thermostat = a;

        let withs: any = [];
        let features: Thermostat.Feature[] = [Thermostat.Feature.Setback];

        if (this.config.supportsCooling) features.push(Thermostat.Feature.Cooling);
        if (this.config.supportsHeating) features.push(Thermostat.Feature.Heating);
        if (this.config.supportsOccupancy) features.push(Thermostat.Feature.Occupancy);

        withs.push(ThermostatServer.with(...features));
        if (this.config.supportsHumidity) withs.push(RelativeHumidityMeasurementServer);
        withs.push(BridgedDeviceBasicInformationServer);
        this.withs = withs;
        console.log("thermostat attributes");
        console.log(this.attributes);
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
    override setStatus() {
        let text = (this.deriveOnOff() ? (this.context.systemMode == Thermostat.SystemMode.Cool ? "Cooling" : "Heating") : "Off") + " Temp: " + this.context.localTemperature;
        this.node.status({
            fill: "green",
            shape: "dot",
            text: text
        })
    }

    override preProcessNodeRedInput(item: any, value: any): { a: any; b: any; } {
        let { a, b } = super.preProcessNodeRedInput(item, value)
        if (this.config.enableZigbee) {
            this.node.warn("zigbee enabled");
            switch (a) {
                case "color":
                    if (Object.hasOwn(b, "x") && Object.hasOwn(b, "y")) {
                        a = ["colorX", "colorY"];
                        b = [value.x, value.y]
                    }
                    break;
                default:
            }
        } else {
            this.node.warn("zigbee not enabled");
        }
        if (["colorX", "colorY", "color"].includes(item)) {
            if (Array.isArray(b)) {
                for (let i = 0; i < b.length; i++) {
                    b[i] = Math.min(1, b[i]);
                }
            } else {
                b = Math.min(1, b);
            }
        }
        return { a: a, b: b };
    }

    override regularUpdate() {
        if (this.config.regularUpdates) {
            setInterval(() => {
                let update = {};
                for (const item in this.context) {
                    let value = this.getVerbose(item, this.context[item]);
                    if (value != this.context[item]) {
                        update[`${item}_in_words`] = value;
                    }
                }
                this.node.send([{
                    payload: { ...this.context, ...update },
                    topic: "regular update"
                }, {
                    payload: {
                        onOff: this.deriveOnOff()
                    }
                }]);
            }, this.config.telemetryInterval * 1000);
        }
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
        this.endpoint = new Endpoint(ThermostatDevice.with(...this.withs), this.attributes);

    }
}