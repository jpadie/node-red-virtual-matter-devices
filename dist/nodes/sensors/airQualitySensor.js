"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.airQualitySensor = void 0;
const devices_1 = require("@matter/main/devices");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
const devices_2 = require("@matter/main/devices");
const clusters_1 = require("@matter/main/clusters");
class airQualitySensor extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config, _name = "") {
        let name = _name || "Air Quality Sensor";
        super(node, config, name);
        this.mapping = {
            airQuality: { airQuality: "airQuality", multiplier: 1, unit: "" },
            temperature: { temperatureMeasurement: "measuredValue", multiplier: 100, unit: "C", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } },
            humidity: { relativeHumidityMeasurement: "measuredValue", multiplier: 100, unit: "%", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } },
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
        for (let item in this.mapping) {
            if (["airQuality", "humidity"].includes(item))
                continue;
            this.mapping[item] = Object.assign(this.mapping[item], {
                matter: {
                    valueType: "float",
                    valueDecimals: 4
                },
                context: {
                    valueType: "float",
                    valueDecimals: 4
                }
            });
        }
        this.setSerialNumber("aqs-");
        this.setDefault("airQuality", clusters_1.AirQuality.AirQualityEnum.Fair);
        let attributes = {
            airQuality: {
                airQuality: this.context.airQuality
            }
        };
        let withs = [
            devices_2.AirQualitySensorRequirements.AirQualityServer.with("ExtremelyPoor", "Fair", "Moderate", "VeryPoor")
        ];
        if (this.config.supportsTemperature) {
            withs.push(devices_2.AirQualitySensorRequirements.TemperatureMeasurementServer);
            this.setDefault("temperature", 20);
            attributes.temperatureMeasurement = {
                measuredValue: this.contextToMatter("temperature", this.context.temperature)
            };
        }
        else {
            this.prune("temperature");
        }
        if (this.config.supportsHumidity) {
            withs.push(devices_2.AirQualitySensorRequirements.RelativeHumidityMeasurementServer);
            this.setDefault("humidity", 50.0);
            attributes.relativeHumidityMeasurement = {
                measuredValue: this.contextToMatter("humidity", this.context.humidity)
            };
        }
        else {
            this.prune("humidity");
        }
        if (this.config.supportsCO) {
            withs.push(devices_2.AirQualitySensorRequirements.CarbonMonoxideConcentrationMeasurementServer.with("NumericMeasurement"));
            this.setDefault("COLevel", 0.5);
            attributes.carbonMonoxideConcentrationMeasurement = {
                measuredValue: this.contextToMatter("COLevel", this.context.COLevel),
                measurementUnit: clusters_1.ConcentrationMeasurement.MeasurementUnit.Ppm,
                measurementMedium: clusters_1.ConcentrationMeasurement.MeasurementMedium.Air
            };
        }
        else {
            this.prune("COLevel");
        }
        if (this.config.supportsCO2) {
            withs.push(devices_2.AirQualitySensorRequirements.CarbonDioxideConcentrationMeasurementServer.with("NumericMeasurement"));
            this.setDefault("CO2Level", 500);
            attributes.carbonDioxideConcentrationMeasurement = {
                measuredValue: this.contextToMatter("CO2Level", this.context.CO2Level),
                measurementUnit: clusters_1.ConcentrationMeasurement.MeasurementUnit.Ppm,
                measurementMedium: clusters_1.ConcentrationMeasurement.MeasurementMedium.Air
            };
        }
        else {
            this.prune("CO2Level");
        }
        if (this.config.supportsNO2) {
            withs.push(devices_2.AirQualitySensorRequirements.NitrogenDioxideConcentrationMeasurementServer.with("NumericMeasurement"));
            this.setDefault("NO2Level", 0.8);
            attributes.nitrogenDioxideConcentrationMeasurement = {
                measuredValue: this.contextToMatter("NO2Level", this.context.NO2Level),
                measurementUnit: clusters_1.ConcentrationMeasurement.MeasurementUnit.Ppm,
                measurementMedium: clusters_1.ConcentrationMeasurement.MeasurementMedium.Air
            };
        }
        else {
            this.prune("NO2Level");
        }
        if (this.config.supportsOzone) {
            withs.push(devices_2.AirQualitySensorRequirements.OzoneConcentrationMeasurementServer.with("NumericMeasurement"));
            this.setDefault("ozoneLevel", 0.003);
            attributes.ozoneConcentrationMeasurement = {
                measuredValue: this.contextToMatter("ozoneLevel", this.context.ozoneLevel),
                measurementUnit: clusters_1.ConcentrationMeasurement.MeasurementUnit.Ppm,
                measurementMedium: clusters_1.ConcentrationMeasurement.MeasurementMedium.Air
            };
        }
        else {
            this.prune("ozoneLevel");
        }
        if (this.config.supportsTVOC) {
            withs.push(devices_2.AirQualitySensorRequirements.TotalVolatileOrganicCompoundsConcentrationMeasurementServer.with("NumericMeasurement"));
            this.setDefault("TVOCLevel", 0.25);
            attributes.totalVolatileOrganicCompoundsConcentrationMeasurement = {
                measuredValue: this.contextToMatter("TVOCLevel", this.context.TVOCLevel),
                measurementUnit: clusters_1.ConcentrationMeasurement.MeasurementUnit.Ppm,
                measurementMedium: clusters_1.ConcentrationMeasurement.MeasurementMedium.Air
            };
        }
        else {
            this.prune("TVOCLevel");
        }
        if (this.config.supportsPM1) {
            withs.push(devices_2.AirQualitySensorRequirements.Pm1ConcentrationMeasurementServer.with("NumericMeasurement"));
            this.setDefault("PM1Level", 0.9);
            attributes.pm1ConcentrationMeasurement = {
                measuredValue: this.contextToMatter("PM1Level", this.context.PM1Level),
                measurementUnit: clusters_1.ConcentrationMeasurement.MeasurementUnit.Ugm3,
                measurementMedium: clusters_1.ConcentrationMeasurement.MeasurementMedium.Air
            };
        }
        else {
            this.prune("PM1Level");
        }
        if (this.config.supportsPM25) {
            withs.push(devices_2.AirQualitySensorRequirements.Pm25ConcentrationMeasurementServer.with("NumericMeasurement"));
            this.setDefault("PM25Level", 2.0);
            attributes.pm25ConcentrationMeasurement = {
                measuredValue: this.contextToMatter("PM25Level", this.context.PM25Level),
                measurementUnit: clusters_1.ConcentrationMeasurement.MeasurementUnit.Ugm3,
                measurementMedium: clusters_1.ConcentrationMeasurement.MeasurementMedium.Air
            };
        }
        else {
            this.prune("PM25Level");
        }
        if (this.config.supportsPM10) {
            withs.push(devices_2.AirQualitySensorRequirements.Pm10ConcentrationMeasurementServer.with("NumericMeasurement"));
            this.setDefault("PM10Level", 10.0);
            attributes.pm10ConcentrationMeasurement = {
                measuredValue: this.contextToMatter("PM10Level", this.context.PM10Level),
                measurementUnit: clusters_1.ConcentrationMeasurement.MeasurementUnit.Ugm3,
                measurementMedium: clusters_1.ConcentrationMeasurement.MeasurementMedium.Air
            };
        }
        else {
            this.prune("PM10Level");
        }
        if (this.config.supportsFormaldehyde) {
            withs.push(devices_2.AirQualitySensorRequirements.FormaldehydeConcentrationMeasurementServer.with("NumericMeasurement"));
            this.setDefault("formadehydeLevel", 42.0);
            attributes.formaldehydeConcentrationMeasurement = {
                measuredValue: this.contextToMatter("formaldehydeLevel", this.context.formaldehydeLevel),
                measurementUnit: clusters_1.ConcentrationMeasurement.MeasurementUnit.Ugm3,
                measurementMedium: clusters_1.ConcentrationMeasurement.MeasurementMedium.Air
            };
        }
        else {
            this.prune("formaldehydeLevel");
        }
        if (this.config.supportsRadon) {
            withs.push(devices_2.AirQualitySensorRequirements.RadonConcentrationMeasurementServer.with("NumericMeasurement"));
            this.setDefault("radonLevel", 100);
            attributes.radonConcentrationMeasurement = {
                measuredValue: this.contextToMatter("radonLevel", this.context.radonLevel),
                measurementUnit: clusters_1.ConcentrationMeasurement.MeasurementUnit.Bqm3,
                measurementMedium: clusters_1.ConcentrationMeasurement.MeasurementMedium.Air
            };
        }
        else {
            this.prune("radonLevel");
        }
        this.attributes = Object.assign(this.attributes, attributes);
        this.withs.push(...withs);
        this.device = devices_1.AirQualitySensorDevice;
    }
    getVerbose(item, value) {
        switch (item) {
            case "airQuality":
                return this.getEnumKeyByEnumValue(clusters_1.AirQuality.AirQualityEnum, value);
                break;
            default:
                return super.getVerbose(item, value);
        }
    }
    async getStatusText() {
        return `AQI: ${this.getVerbose("airQuality", this.context.airQuality)}`;
    }
}
exports.airQualitySensor = airQualitySensor;
//# sourceMappingURL=airQualitySensor.js.map