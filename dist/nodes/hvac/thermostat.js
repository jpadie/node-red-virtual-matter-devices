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
    withs = [];
    constructor(node, config, _name = "") {
        let name = _name || config.name || "Thermostat";
        super(node, config, name);
        this.mapping = {
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
        if (this.config.supportsHeating) {
            this.setDefault("systemMode", cluster_1.Thermostat.SystemMode.Heat);
        }
        else {
            this.setDefault("systemMode", cluster_1.Thermostat.SystemMode.Cool);
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
            this.prune("occupied");
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
            this.prune("unoccupiedHeatingSetpoint");
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
            this.prune('unoccupiedCoolingSetpoint');
        }
        if (this.config.supportsHeating) {
            if (this.config.supportsCooling) {
                a.controlSequenceOfOperation = cluster_1.Thermostat.ControlSequenceOfOperation.CoolingAndHeating;
            }
            else {
                a.controlSequenceOfOperation = cluster_1.Thermostat.ControlSequenceOfOperation.HeatingOnly;
            }
        }
        else {
            a.controlSequenceOfOperation = cluster_1.Thermostat.ControlSequenceOfOperation.CoolingOnly;
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
        this.attributes.thermostat = a;
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
        this.withs = withs;
        console.log("thermostat config");
        console.log(this.config);
        console.log("thermostat attributes");
        console.log(this.attributes);
    }
    getVerbose(item, value) {
        switch (item) {
            case "systemMode":
                return this.getEnumKeyByEnumValue(cluster_1.Thermostat.SystemMode, value);
                break;
            default:
                return value;
        }
    }
    setStatus() {
        let text = (this.deriveOnOff() ? (this.context.systemMode == cluster_1.Thermostat.SystemMode.Cool ? "Cooling" : "Heating") : "Off") + " Temp: " + this.context.localTemperature;
        this.node.status({
            fill: "green",
            shape: "dot",
            text: text
        });
    }
    preProcessNodeRedInput(item, value) {
        let { a, b } = super.preProcessNodeRedInput(item, value);
        if (this.config.enableZigbee) {
            this.node.warn("zigbee enabled");
            switch (a) {
                case "color":
                    if (Object.hasOwn(b, "x") && Object.hasOwn(b, "y")) {
                        a = ["colorX", "colorY"];
                        b = [value.x, value.y];
                    }
                    break;
                default:
            }
        }
        else {
            this.node.warn("zigbee not enabled");
        }
        if (["colorX", "colorY", "color"].includes(item)) {
            if (Array.isArray(b)) {
                for (let i = 0; i < b.length; i++) {
                    b[i] = Math.min(1, b[i]);
                }
            }
            else {
                b = Math.min(1, b);
            }
        }
        return { a: a, b: b };
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
        this.endpoint = new endpoint_1.Endpoint(ThermostatDevice_1.ThermostatDevice.with(...this.withs), this.attributes);
    }
}
exports.thermostat = thermostat;
//# sourceMappingURL=thermostat.js.map