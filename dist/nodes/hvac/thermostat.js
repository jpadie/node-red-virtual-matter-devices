"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.thermostat = void 0;
type: module;
require("@project-chip/matter-node.js");
const bridged_device_basic_information_1 = require("@project-chip/matter.js/behaviors/bridged-device-basic-information");
const endpoint_1 = require("@project-chip/matter.js/endpoint");
const ThermostatDevice_1 = require("@project-chip/matter.js/devices/ThermostatDevice");
const thermostat_1 = require("@project-chip/matter.js/behaviors/thermostat");
const cluster_1 = require("@project-chip/matter.js/cluster");
const relative_humidity_measurement_1 = require("@project-chip/matter.js/behaviors/relative-humidity-measurement");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
class thermostat extends BaseEndpoint_1.BaseEndpoint {
    heating_coolingState = 1;
    constructor(node, config, _name = "") {
        let name = _name || config.name || "AirCon Unit";
        super(node, config, name);
        this.mapping = {
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
        };
        this.setSerialNumber("tstat-");
        let a = {};
        this.setDefault("localTemperature", 20);
        a.localTemperature = this.context.localTemperature * 100;
        a.remoteSensing = {
            localTemperature: true,
            outdoorTemperature: this.config.supportsOutdoorTemperature ? true : false,
            occupancy: this.config.supportsOccupancy ? true : false
        };
        a.setpointChangeSource = cluster_1.Thermostat.SetpointChangeSource.External;
        this.setDefault("systemMode", cluster_1.Thermostat.SystemMode.Heat);
        a.systemMode = this.context.systemMode;
        if (this.config.supportsOutDoorTemperature) {
            this.setDefault("outdoorTemperature", 15);
            a.outdoorTemperature = this.context.outdoorTemperature * 100;
        }
        else {
            this.prune("outdoorTemperature");
        }
        if (this.config.supportsOccupancy) {
            this.setDefault("occupied", false);
            a.occupied = this.context.occupied;
            a.occupancySensorTypeBitmap = {
                pir: 1,
                ultrasonic: 0,
                physical: 0
            };
            a.unoccupiedSetbackMin = 0;
            a.unoccupiedSetbackMax = (cluster_1.Thermostat.SetbackAndOccupancyComponent.attributes.unoccupiedSetbackMax.default || 20) * 10;
            if (this.config.supportsCooling) {
                this.setDefault("unoccupiedCoolingSetpoint", 25);
                a.unoccupiedCoolingSetpoint = this.context.unoccupiedCoolingSetpoint * 100;
            }
            else {
                this.prune('unoccupiedCoolingSetpoint');
            }
            if (this.config.supportsHeating) {
                this.setDefault("unoccupiedHeatingSetpoint", 19);
                a.unoccupiedHeatingSetpoint = this.context.unoccupiedHeatingSetpoint * 100;
            }
            else {
                this.prune("unoccupiedHeatingSetpoint");
            }
            this.setDefault("unoccupiedSetback", 3);
            a.unoccupiedSetback = this.context.unoccupiedSetback * 10;
        }
        else {
            this.prune("occupancy");
            this.prune("unoccupiedCoolingSetpoint");
            this.prune("unoccupiedHeatingSetpoint");
            this.prune("unoccupiedSetback");
        }
        a.occupiedSetbackMin = 0;
        a.occupiedSetbackMax = (cluster_1.Thermostat.SetbackComponent.attributes.occupiedSetbackMax.default || 5) * 10;
        this.setDefault("occupiedSetback", 1);
        a.occupiedSetback = this.context.occupiedSetback * 10;
        if (this.config.supportsHeating) {
            a.absMinHeatSetpointLimit = cluster_1.Thermostat.HeatingComponent.attributes.absMinHeatSetpointLimit.default || 600;
            a.minHeatSetpointLimit = a.absMinHeatSetpointLimit;
            a.absMaxHeatSetpointLimit = cluster_1.Thermostat.HeatingComponent.attributes.absMaxHeatSetpointLimit.default || 3000;
            a.maxHeatSetpointLimit = a.absMaxHeatSetpointLimit;
            this.setDefault("occupiedHeatingSetpoint", 19);
            a.occupiedHeatingSetpoint = this.context.occupiedHeatingSetpoint * 100;
        }
        else {
            this.prune("occupiedHeatingSetpoint");
        }
        if (this.config.supportsCooling) {
            a.absMinCoolSetpointLimit = cluster_1.Thermostat.CoolingComponent.attributes.absMinCoolSetpointLimit.default || 1600;
            a.minCoolSetpointLimit = a.absMinCoolSetpointLimit;
            a.absMaxCoolSetpointLimit = cluster_1.Thermostat.CoolingComponent.attributes.absMaxCoolSetpointLimit.default || 3000;
            a.maxCoolSetpointLimit = a.absMaxCoolSetpointLimit;
            this.setDefault("occupiedCoolingSetpoint", 23);
            a.occupiedCoolingSetpoint = this.context.occupiedCoolingSetpoint * 100;
        }
        else {
            this.prune('occupiedCoolingSetpoint');
        }
        a.controlledSequenceOfOperation = (this.config.supportsCooling && this.config.supportsHeating)
            ? cluster_1.Thermostat.ControlSequenceOfOperation.CoolingAndHeating
            : this.config.supportsHeating
                ? cluster_1.Thermostat.ControlSequenceOfOperation.HeatingOnly
                : cluster_1.Thermostat.ControlSequenceOfOperation.CoolingOnly;
        if (this.config.supportsHumidity) {
            this.setDefault("humidity", 50);
            a.relativeHumidity = {
                measuredValue: this.context.humidity * 100
            };
        }
        else {
            this.prune("humidity");
        }
        this.attributes.thermostat = a;
    }
    setStatus() {
        let text = (this.deriveOnOff() ? (this.context.systemMode == cluster_1.Thermostat.SystemMode.Cool ? "Cooling" : "Heating") : "Off") + " Temp: " + this.context.localTemperature;
        this.node.warn(`status: ${text}`);
        this.node.status({
            fill: "green",
            shape: "dot",
            text: text
        });
    }
    regularUpdate() {
        super.regularUpdate();
    }
    listenForChange_postProcess() {
        let onOff = this.deriveOnOff();
        this.node.send([null, { payload: { onOff: onOff ? "on" : "off", onOffBoolean: onOff ? true : false } }]);
    }
    deriveOnOff() {
        switch (this.context.systemMode) {
            case cluster_1.Thermostat.SystemMode.Off:
                return false;
                break;
            case cluster_1.Thermostat.SystemMode.Cool:
                if (this.config.supportsOccupancy && !this.context.occupied) {
                    if (this.heating_coolingState) {
                        if (this.context.localTemperature > this.context.unoccupiedCoolingSetpoint) {
                            return true;
                        }
                        else {
                            this.heating_coolingState = 0;
                            return false;
                        }
                    }
                    else {
                        if (this.context.localTemperature > this.context.unoccupiedSetback + this.context.unoccupiedCoolingSetpoint) {
                            this.heating_coolingState = 1;
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                }
                else {
                    if (this.heating_coolingState) {
                        if (this.context.localTemperature > this.context.occupiedCoolingSetpoint) {
                            return true;
                        }
                        else {
                            this.heating_coolingState = 0;
                            return false;
                        }
                    }
                    else {
                        if (this.context.localTemperature > this.context.occupiedSetback + this.context.occupiedCoolingSetpoint) {
                            this.heating_coolingState = 1;
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                }
                break;
            case cluster_1.Thermostat.SystemMode.Heat:
                if (this.config.supportsOccupancy && !this.context.occupied) {
                    if (this.heating_coolingState) {
                        if (this.context.localTemperature > this.context.unoccupiedHeatingSetpoint) {
                            return true;
                        }
                        else {
                            this.heating_coolingState = 0;
                            return false;
                        }
                    }
                    else {
                        if (this.context.localTemperature > this.context.unoccupiedSetback + this.context.unoccupiedHeatingSetpoint) {
                            this.heating_coolingState = 1;
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                }
                else {
                    if (this.heating_coolingState) {
                        if (this.context.ocalTemperature < this.context.occupiedHeatingSetpoint) {
                            return true;
                        }
                        else {
                            this.heating_coolingState = 0;
                            return false;
                        }
                    }
                    else {
                        if (this.context.localTemperature < this.context.occupiedHeatingSetpoint - this.context.occupiedSetback) {
                            this.heating_coolingState = 1;
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                }
                break;
        }
    }
    async deploy() {
        let withs = [];
        let features = [cluster_1.Thermostat.Feature.Setback];
        if (this.config.supportsCooling)
            features.push(cluster_1.Thermostat.Feature.Cooling);
        if (this.config.supportsHeating)
            features.push(cluster_1.Thermostat.Feature.Heating);
        if (this.config.supportsOccupancy)
            features.push(cluster_1.Thermostat.Feature.Occupancy);
        withs.push(thermostat_1.ThermostatServer.with(...features));
        if (this.config.supportsHumidity)
            withs.push(relative_humidity_measurement_1.RelativeHumidityMeasurementServer);
        withs.push(bridged_device_basic_information_1.BridgedDeviceBasicInformationServer);
        this.endpoint = await new endpoint_1.Endpoint(ThermostatDevice_1.ThermostatDevice.with(...withs), this.attributes);
    }
}
exports.thermostat = thermostat;
//# sourceMappingURL=thermostat.js.map