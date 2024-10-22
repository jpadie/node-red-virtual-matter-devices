"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.airQualitySensor = void 0;
const endpoint_1 = require("@project-chip/matter.js/endpoint");
const bridged_device_basic_information_1 = require("@project-chip/matter.js/behaviors/bridged-device-basic-information");
const AirQualitySensorDevice_1 = require("@project-chip/matter.js/devices/AirQualitySensorDevice");
const AirQualitySensorDevice_2 = require("@project-chip/matter.js/devices/AirQualitySensorDevice");
const cluster_1 = require("@project-chip/matter.js/cluster");
const cluster_2 = require("@project-chip/matter.js/cluster");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
class airQualitySensor extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config) {
        super(node, config);
        this.name = this.config.name || "Air Quality Sensor";
        this.mapping = {
            airQuality: { airQuality: "airQuality", multiplier: 1, unit: "" },
            temperature: { temperatureMeasurement: "measuredValue", multiplier: 100, unit: "C" },
            humidity: { relativeHumidityMeasurement: "measuredValue", multiplier: 100, unit: "%" },
            COLevel: { carbonMonoxideConcentrationMeasurement: "measuredValue", multiplier: 1, unit: "PPM" },
            CO2Level: { carbonDioxideConcentrationMeasurement: "measuredValue", multiplier: 1, unit: "PPM" },
            NO2Level: { nitrogenDioxideConcentrationMeasurement: "measuredValue", multiplier: 1, unit: "PPM" },
            ozoneLevel: { ozoneConcentrationMeasurement: "measuredValue", multiplier: 1, unit: "PPM" },
            TVOCLevel: { totalVolatileOrganicCompoundsConcentrationMeasurement: "measuredValue", multiplier: 1, unit: "PPM" },
            formaldehydeLevel: { formaldehydeConcentrationMeasurement: "measuredValue", multiplier: 1, unit: "μg/m3" },
            PM1Level: { pm1ConcentrationMeasurement: "measuredValue", multiplier: 1, unit: "μg/m3" },
            PM25Level: { pm25ConcentrationMeasurement: "measuredValue", multiplier: 1, unit: "μg/m3" },
            PM10Level: { pm10ConcentrationMeasurement: "measuredValue", multiplier: 1, unit: "μg/m3" },
            radonLevel: { radonConcentrationMeasurement: "measuredValue", multiplier: 1, unit: "Bq/m3" }
        };
        this.attributes.serialNumber = "aqs-" + this.attributes.serialNumber;
    }
    getVerbose(item, value) {
        if (Object.hasOwn(this.context, item) && this.context[item]) {
            return Object.keys(cluster_1.AirQuality.AirQualityEnum).find(item => cluster_1.AirQuality.AirQualityEnum[item] === value);
        }
    }
    regularUpdate() {
        if (this.config.regularUpdates) {
            setInterval(() => {
                let c = { ...this.context };
                if (this.config.reportInWords) {
                    c.airQuality = this.getVerbose("airQuality", c.airQuality);
                }
                this.node.send({
                    payload: {
                        ...c
                    }
                });
            }, (this.config.telemetryInterval ?? 0) * 1000);
        }
    }
    setStatus() {
        this.node.status({
            fill: "green",
            shape: "dot",
            text: `AQI: ${this.getVerbose("airQuality", this.context.airQuality)}`
        });
    }
    async deploy() {
        this.context = Object.assign({
            airQuality: cluster_1.AirQuality.AirQualityEnum.Fair,
            lastHeardFrom: ""
        }, this.context);
        let attributes = {
            airQuality: {
                airQuality: this.context.airQuality
            }
        };
        let withs = [
            bridged_device_basic_information_1.BridgedDeviceBasicInformationServer,
            AirQualitySensorDevice_2.AirQualitySensorRequirements.AirQualityServer.with("ExtremelyPoor", "Fair", "Moderate", "VeryPoor")
        ];
        if (this.config.supportsTemperature) {
            withs.push(AirQualitySensorDevice_2.AirQualitySensorRequirements.TemperatureMeasurementServer);
            if (!Object.hasOwn(this.context, "temperature")) {
                this.context.temperature = 20.0;
            }
            attributes.temperatureMeasurement = {
                measuredValue: this.context.temperature * 100
            };
        }
        else {
            this.prune("temperature");
        }
        if (this.config.supportsHumidity) {
            withs.push(AirQualitySensorDevice_2.AirQualitySensorRequirements.RelativeHumidityMeasurementServer);
            if (!Object.hasOwn(this.context, "humidity")) {
                this.context.humidity = 50.0;
            }
            attributes.relativeHumidityMeasurement = {
                measuredValue: this.context.humidity * 100
            };
        }
        else {
            this.prune("humidity");
        }
        if (this.config.supportsCO) {
            withs.push(AirQualitySensorDevice_2.AirQualitySensorRequirements.CarbonMonoxideConcentrationMeasurementServer.with("NumericMeasurement"));
            if (!Object.hasOwn(this.context, "COLevel")) {
                this.context.COLevel = 0.5;
            }
            attributes.carbonMonoxideConcentrationMeasurement = {
                measuredValue: this.context.COLevel,
                measurementUnit: cluster_2.ConcentrationMeasurement.MeasurementUnit.Ppm,
                measurementMedium: cluster_2.ConcentrationMeasurement.MeasurementMedium.Air
            };
        }
        else {
            this.prune("COLevel");
        }
        if (this.config.supportsCO2) {
            withs.push(AirQualitySensorDevice_2.AirQualitySensorRequirements.CarbonDioxideConcentrationMeasurementServer.with("NumericMeasurement"));
            if (!Object.hasOwn(this.context, "CO2Level")) {
                this.context.CO2Level = 500;
            }
            attributes.carbonDioxideConcentrationMeasurement = {
                measuredValue: this.context.CO2Level,
                measurementUnit: cluster_2.ConcentrationMeasurement.MeasurementUnit.Ppm,
                measurementMedium: cluster_2.ConcentrationMeasurement.MeasurementMedium.Air
            };
        }
        else {
            this.prune("CO2Level");
        }
        if (this.config.supportsNO2) {
            withs.push(AirQualitySensorDevice_2.AirQualitySensorRequirements.NitrogenDioxideConcentrationMeasurementServer.with("NumericMeasurement"));
            if (!Object.hasOwn(this.context, "NO2Level")) {
                this.context.NO2Level = 0.8;
            }
            attributes.nitrogenDioxideConcentrationMeasurement = {
                measuredValue: this.context.NO2Level,
                measurementUnit: cluster_2.ConcentrationMeasurement.MeasurementUnit.Ppm,
                measurementMedium: cluster_2.ConcentrationMeasurement.MeasurementMedium.Air
            };
        }
        else {
            this.prune("NO2Level");
        }
        if (this.config.supportsOzone) {
            withs.push(AirQualitySensorDevice_2.AirQualitySensorRequirements.OzoneConcentrationMeasurementServer.with("NumericMeasurement"));
            if (!Object.hasOwn(this.context, "ozoneLevel")) {
                this.context.ozoneLevel = 0.003;
            }
            attributes.ozoneConcentrationMeasurement = {
                measuredValue: this.context.ozoneLevel,
                measurementUnit: cluster_2.ConcentrationMeasurement.MeasurementUnit.Ppm,
                measurementMedium: cluster_2.ConcentrationMeasurement.MeasurementMedium.Air
            };
        }
        else {
            this.prune("ozoneLevel");
        }
        if (this.config.supportsTVOC) {
            withs.push(AirQualitySensorDevice_2.AirQualitySensorRequirements.TotalVolatileOrganicCompoundsConcentrationMeasurementServer.with("NumericMeasurement"));
            if (!Object.hasOwn(this.context, "TVOCLevel")) {
                this.context.TVOCLevel = 0.25;
            }
            attributes.totalVolatileOrganicCompoundsConcentrationMeasurement = {
                measuredValue: this.context.TVOCLevel,
                measurementUnit: cluster_2.ConcentrationMeasurement.MeasurementUnit.Ppm,
                measurementMedium: cluster_2.ConcentrationMeasurement.MeasurementMedium.Air
            };
        }
        else {
            this.prune("TVOCLevel");
        }
        if (this.config.supportsPM1) {
            withs.push(AirQualitySensorDevice_2.AirQualitySensorRequirements.Pm1ConcentrationMeasurementServer.with("NumericMeasurement"));
            if (!Object.hasOwn(this.context, "PM1Level")) {
                this.context.PM1Level = 0.9;
            }
            attributes.pm1ConcentrationMeasurement = {
                measuredValue: this.context.PM1Level,
                measurementUnit: cluster_2.ConcentrationMeasurement.MeasurementUnit.Ugm3,
                measurementMedium: cluster_2.ConcentrationMeasurement.MeasurementMedium.Air
            };
        }
        else {
            this.prune("PM1Level");
        }
        if (this.config.supportsPM25) {
            withs.push(AirQualitySensorDevice_2.AirQualitySensorRequirements.Pm25ConcentrationMeasurementServer.with("NumericMeasurement"));
            if (!Object.hasOwn(this.context, "PM25Level")) {
                this.context.PM25Level = 2.0;
            }
            attributes.pm25ConcentrationMeasurement = {
                measuredValue: this.context.PM25Level,
                measurementUnit: cluster_2.ConcentrationMeasurement.MeasurementUnit.Ugm3,
                measurementMedium: cluster_2.ConcentrationMeasurement.MeasurementMedium.Air
            };
        }
        else {
            this.prune("PM25Level");
        }
        if (this.config.supportsPM10) {
            withs.push(AirQualitySensorDevice_2.AirQualitySensorRequirements.Pm10ConcentrationMeasurementServer.with("NumericMeasurement"));
            if (!Object.hasOwn(this.context, "PM10Level")) {
                this.context.PM10Level = 10.0;
            }
            attributes.pm10ConcentrationMeasurement = {
                measuredValue: this.context.PM10Level,
                measurementUnit: cluster_2.ConcentrationMeasurement.MeasurementUnit.Ugm3,
                measurementMedium: cluster_2.ConcentrationMeasurement.MeasurementMedium.Air
            };
        }
        else {
            this.prune("PM10Level");
        }
        if (this.config.supportsFormaldehyde) {
            withs.push(AirQualitySensorDevice_2.AirQualitySensorRequirements.FormaldehydeConcentrationMeasurementServer.with("NumericMeasurement"));
            if (!Object.hasOwn(this.context, "formaldehydeLevel")) {
                this.context.formaldehydeLevel = 42.0;
            }
            attributes.formaldehydeConcentrationMeasurement = {
                measuredValue: this.context.formaldehydeLevel,
                measurementUnit: cluster_2.ConcentrationMeasurement.MeasurementUnit.Ugm3,
                measurementMedium: cluster_2.ConcentrationMeasurement.MeasurementMedium.Air
            };
        }
        else {
            this.prune("formaldehydeLevel");
        }
        if (this.config.supportsRadon) {
            withs.push(AirQualitySensorDevice_2.AirQualitySensorRequirements.RadonConcentrationMeasurementServer.with("NumericMeasurement"));
            if (!Object.hasOwn(this.context, "radonLevel")) {
                this.context.radonLevel = 100.0;
            }
            attributes.radonConcentrationMeasurement = {
                measuredValue: this.context.radonLevel,
                measurementUnit: cluster_2.ConcentrationMeasurement.MeasurementUnit.Bqm3,
                measurementMedium: cluster_2.ConcentrationMeasurement.MeasurementMedium.Air
            };
        }
        else {
            this.prune("radonLevel");
        }
        this.attributes = {
            ...this.attributes,
            ...attributes
        };
        this.saveContext();
        try {
            this.endpoint = await new endpoint_1.Endpoint(AirQualitySensorDevice_1.AirQualitySensorDevice.with(...withs), this.attributes);
            this.listen();
            this.regularUpdate();
            this.setStatus();
        }
        catch (e) {
            this.node.error(e);
        }
    }
}
exports.airQualitySensor = airQualitySensor;
//# sourceMappingURL=airQualitySensor.js.map