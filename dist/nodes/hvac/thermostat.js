"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.thermostat = void 0;
type: module;
const behaviors_1 = require("@matter/main/behaviors");
const main_1 = require("@matter/main");
const devices_1 = require("@matter/main/devices");
const behaviors_2 = require("@matter/main/behaviors");
const clusters_1 = require("@matter/main/clusters");
const behaviors_3 = require("@matter/main/behaviors");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
class thermostat extends BaseEndpoint_1.BaseEndpoint {
    heating_coolingState = 1;
    withs = [];
    constructor(node, config, _name = "") {
        let name = _name || config.name || "Thermostat";
        super(node, config, name);
        this.mapping = {
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
        };
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
        let a = {};
        this.setDefault("localTemperature", 20);
        a.localTemperature = this.context.localTemperature * 100;
        a.remoteSensing = {
            localTemperature: true,
            outdoorTemperature: this.config.supportsOutdoorTemperature ? true : false,
            occupancy: this.config.supportsOccupancy ? true : false
        };
        a.setpointChangeSource = clusters_1.Thermostat.SetpointChangeSource.External;
        if (this.config.supportsHeating) {
            this.setDefault("systemMode", clusters_1.Thermostat.SystemMode.Heat);
        }
        else {
            this.setDefault("systemMode", clusters_1.Thermostat.SystemMode.Cool);
        }
        a.systemMode = this.context.systemMode;
        if (this.config.supportsOutdoorTemperature) {
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
            a.unoccupiedSetbackMax = (clusters_1.Thermostat.SetbackAndOccupancyComponent.attributes.unoccupiedSetbackMax.default || 20) * 10;
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
            this.prune("occupied");
            this.prune("unoccupiedCoolingSetpoint");
            this.prune("unoccupiedHeatingSetpoint");
            this.prune("unoccupiedSetback");
        }
        a.occupiedSetbackMin = 0;
        a.occupiedSetbackMax = (clusters_1.Thermostat.SetbackComponent.attributes.occupiedSetbackMax.default || 5) * 10;
        this.setDefault("occupiedSetback", 1);
        a.occupiedSetback = this.context.occupiedSetback * 10;
        if (this.config.supportsHeating) {
            a.absMinHeatSetpointLimit = clusters_1.Thermostat.HeatingComponent.attributes.absMinHeatSetpointLimit.default || 600;
            a.minHeatSetpointLimit = a.absMinHeatSetpointLimit;
            a.absMaxHeatSetpointLimit = clusters_1.Thermostat.HeatingComponent.attributes.absMaxHeatSetpointLimit.default || 3000;
            a.maxHeatSetpointLimit = a.absMaxHeatSetpointLimit;
            this.setDefault("occupiedHeatingSetpoint", 19);
            a.occupiedHeatingSetpoint = this.context.occupiedHeatingSetpoint * 100;
        }
        else {
            this.prune("occupiedHeatingSetpoint");
            this.prune("unoccupiedHeatingSetpoint");
        }
        if (this.config.supportsCooling) {
            a.absMinCoolSetpointLimit = clusters_1.Thermostat.CoolingComponent.attributes.absMinCoolSetpointLimit.default || 1600;
            a.minCoolSetpointLimit = a.absMinCoolSetpointLimit;
            a.absMaxCoolSetpointLimit = clusters_1.Thermostat.CoolingComponent.attributes.absMaxCoolSetpointLimit.default || 3000;
            a.maxCoolSetpointLimit = a.absMaxCoolSetpointLimit;
            this.setDefault("occupiedCoolingSetpoint", 23);
            a.occupiedCoolingSetpoint = this.context.occupiedCoolingSetpoint * 100;
        }
        else {
            this.prune('occupiedCoolingSetpoint');
            this.prune('unoccupiedCoolingSetpoint');
        }
        if (this.config.supportsHeating) {
            if (this.config.supportsCooling) {
                a.controlSequenceOfOperation = clusters_1.Thermostat.ControlSequenceOfOperation.CoolingAndHeating;
            }
            else {
                a.controlSequenceOfOperation = clusters_1.Thermostat.ControlSequenceOfOperation.HeatingOnly;
            }
        }
        else {
            a.controlSequenceOfOperation = clusters_1.Thermostat.ControlSequenceOfOperation.CoolingOnly;
        }
        if (this.config.supportsHumidity) {
            this.setDefault("humidity", 50);
            a.relativeHumidity = {
                measuredValue: this.context.humidity * 100
            };
        }
        else {
            this.prune("humidity");
        }
        this.attributes = {
            ...this.attributes,
            thermostat: a
        };
        let withs = [];
        let features = [clusters_1.Thermostat.Feature.Setback];
        if (this.config.supportsCooling)
            features.push(clusters_1.Thermostat.Feature.Cooling);
        if (this.config.supportsHeating)
            features.push(clusters_1.Thermostat.Feature.Heating);
        if (this.config.supportsOccupancy)
            features.push(clusters_1.Thermostat.Feature.Occupancy);
        withs.push(behaviors_2.ThermostatServer.with(...features));
        if (this.config.supportsHumidity)
            withs.push(behaviors_3.RelativeHumidityMeasurementServer);
        withs.push(behaviors_1.BridgedDeviceBasicInformationServer);
        this.withs = withs;
    }
    getVerbose(item, value) {
        switch (item) {
            case "systemMode":
                return this.getEnumKeyByEnumValue(clusters_1.Thermostat.SystemMode, value);
                break;
            default:
                return value;
        }
    }
    setStatus() {
        let text = (this.deriveOnOff() ? (this.context.systemMode == clusters_1.Thermostat.SystemMode.Cool ? "Cooling" : "Heating") : "Off") + " Temp: " + this.context.localTemperature;
        this.node.status({
            fill: "green",
            shape: "dot",
            text: text
        });
    }
    matterRefine(item, value) {
        if (['systemMode'].includes(item)) {
            return value;
        }
        return super.matterRefine(item, value);
    }
    preProcessDeviceChanges(value, item) {
        console.log("matter input");
        console.log("item: " + value);
        console.log("value: " + item);
        return value;
    }
    regularUpdate() {
        if (this.config.regularUpdates) {
            setInterval(() => {
                let update = {};
                for (const item in this.context) {
                    let value = this.getVerbose(item, this.context[item]);
                    if (value != this.context[item]) {
                        update[`${item}_in_words`] = value;
                    }
                }
                let onOff = this.deriveOnOff();
                this.node.send([{
                        payload: { ...this.context, ...update },
                        topic: "regular update"
                    }, {
                        payload: {
                            onOffBoolean: onOff,
                            onOff: onOff ? "on" : "off"
                        }
                    }]);
            }, this.config.telemetryInterval * 1000);
        }
    }
    listenForChange_postProcess() {
        let onOff = this.deriveOnOff();
        this.node.send([null, { payload: { onOff: onOff ? "on" : "off", onOffBoolean: onOff ? true : false } }]);
    }
    deriveOnOff() {
        let ret = false;
        switch (this.context.systemMode) {
            case clusters_1.Thermostat.SystemMode.Off:
                ret = false;
                break;
            case clusters_1.Thermostat.SystemMode.Cool:
                if (this.config.supportsOccupancy && !this.context.occupied) {
                    if (this.heating_coolingState) {
                        if (this.context.localTemperature > this.context.unoccupiedCoolingSetpoint) {
                            ret = true;
                        }
                        else {
                            this.heating_coolingState = 0;
                            ret = false;
                        }
                    }
                    else {
                        if (this.context.localTemperature > this.context.unoccupiedSetback + this.context.unoccupiedCoolingSetpoint) {
                            this.heating_coolingState = 1;
                            ret = true;
                        }
                        else {
                            ret = false;
                        }
                    }
                }
                else {
                    if (this.heating_coolingState) {
                        if (this.context.localTemperature > this.context.occupiedCoolingSetpoint) {
                            ret = true;
                        }
                        else {
                            this.heating_coolingState = 0;
                            ret = false;
                        }
                    }
                    else {
                        if (this.context.localTemperature > this.context.occupiedSetback + this.context.occupiedCoolingSetpoint) {
                            this.heating_coolingState = 1;
                            ret = true;
                        }
                        else {
                            ret = false;
                        }
                    }
                }
                break;
            case clusters_1.Thermostat.SystemMode.Heat:
                if (this.config.supportsOccupancy && !this.context.occupied) {
                    if (this.heating_coolingState) {
                        if (this.context.localTemperature > this.context.unoccupiedHeatingSetpoint) {
                            ret = true;
                        }
                        else {
                            this.heating_coolingState = 0;
                            ret = false;
                        }
                    }
                    else {
                        if (this.context.localTemperature > this.context.unoccupiedSetback + this.context.unoccupiedHeatingSetpoint) {
                            this.heating_coolingState = 1;
                            ret = true;
                        }
                        else {
                            ret = false;
                        }
                    }
                }
                else {
                    if (this.heating_coolingState) {
                        if (this.context.localTemperature < this.context.occupiedHeatingSetpoint) {
                            ret = true;
                        }
                        else {
                            this.heating_coolingState = 0;
                            ret = false;
                        }
                    }
                    else {
                        if (this.context.localTemperature < this.context.occupiedHeatingSetpoint - this.context.occupiedSetback) {
                            this.heating_coolingState = 1;
                            ret = true;
                        }
                        else {
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
    async deploy() {
        this.endpoint = new main_1.Endpoint(devices_1.ThermostatDevice.with(...this.withs), this.attributes);
        console.log("context");
        console.log(this.context);
        console.log("attributes");
        console.log(this.attributes);
        console.log("mapping");
        console.log(this.mapping);
        console.log("config");
        console.log(this.config);
    }
}
exports.thermostat = thermostat;
//# sourceMappingURL=thermostat.js.map