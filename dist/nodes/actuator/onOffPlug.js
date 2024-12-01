"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onOffPlug = void 0;
require("@matter/main");
const devices_1 = require("@matter/main/devices");
const behaviors_1 = require("@matter/main/behaviors");
const main_1 = require("@matter/main");
const onOffLight_1 = require("../light/onOffLight");
const behaviors_2 = require("@matter/main/behaviors");
const clusters_1 = require("@matter/main/clusters");
const types_1 = require("@matter/main/types");
class onOffPlug extends onOffLight_1.onOffLight {
    withs = [];
    constructor(node, config, _name = '') {
        let name = config.name || _name || "On/Off Plug";
        super(node, config, name);
        this.setSerialNumber("plug-");
        this.withs.push(behaviors_1.BridgedDeviceBasicInformationServer);
        this.mapping = {
            ...this.mapping,
            power: { electricalPowerMeasurement: "activePower", multiplier: 1000, unit: "W", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } },
            current: { electricalPowerMeasurement: "activeCurrent", multiplier: 1000, unit: "A", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } },
            voltage: { electricalPowerMeasurement: "voltage", multiplier: 1000, unit: "V", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } },
            frequency: { electricalPowerMeasurement: "frequency", multiplier: 1000, unit: "Hz", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } },
            energy: { ElectricalEnergyMeasurement: "cumulativeEnergyImported", multiplier: 1000, unit: "Wh", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } }
        };
        if (Object.hasOwn(this.config, "supportsEnergyMeasurement") && this.config.supportsEnergyMeasurement) {
            let accuracyData = {
                measured: true,
                minMeasuredValue: Number.MIN_SAFE_INTEGER,
                maxMeasuredValue: Number.MAX_SAFE_INTEGER,
                accuracyRanges: [
                    {
                        rangeMin: Number.MIN_SAFE_INTEGER,
                        rangeMax: Number.MAX_SAFE_INTEGER,
                        fixedMax: 1,
                    },
                ],
            };
            this.withs.push(behaviors_2.ElectricalPowerMeasurementServer.with(clusters_1.ElectricalPowerMeasurement.Feature.AlternatingCurrent));
            this.withs.push(behaviors_2.ElectricalEnergyMeasurementServer.with(clusters_1.ElectricalEnergyMeasurement.Feature.ImportedEnergy, clusters_1.ElectricalEnergyMeasurement.Feature.CumulativeEnergy));
            this.setDefault("activePower", 0);
            this.setDefault("activeCurrent", 0);
            this.setDefault("voltage", 0);
            this.setDefault("frequency", 0);
            this.setDefault("importedEnergy", 0);
            this.attributes = {
                ...this.attributes,
                electricalPowerMeasurement: {
                    powerMode: clusters_1.ElectricalPowerMeasurement.PowerMode.Ac,
                    accuracy: [
                        {
                            measurementType: types_1.MeasurementType.ActivePower,
                            ...accuracyData,
                        },
                        {
                            measurementType: types_1.MeasurementType.ActiveCurrent,
                            ...accuracyData,
                        },
                        {
                            measurementType: types_1.MeasurementType.Voltage,
                            ...accuracyData,
                        },
                        {
                            measurementType: types_1.MeasurementType.Frequency,
                            ...accuracyData,
                        },
                    ],
                    numberOfMeasurementTypes: 4,
                },
                electricalEnergyMeasurement: {
                    accuracy: {
                        measurementType: types_1.MeasurementType.ElectricalEnergy,
                        ...accuracyData,
                    },
                }
            };
        }
        else {
            this.prune("energy");
            this.prune("voltage");
            this.prune("current");
            this.prune("power");
            this.prune("frequency");
        }
    }
    async preProcessMatterUpdate(update) {
        await this.endpoint.construction;
        for (let key in update) {
            if (key == "energy") {
                await this.endpoint.act(agent => agent.get(behaviors_2.ElectricalEnergyMeasurementServer).setMeasurement({
                    cumulativeEnergy: {
                        imported: {
                            energy: update.energy,
                        },
                    },
                }));
                delete update.energy;
            }
        }
        return update;
    }
    async deploy() {
        try {
            this.endpoint = new main_1.Endpoint(devices_1.OnOffPlugInUnitDevice.with(...this.withs), this.attributes);
        }
        catch (e) {
            this.node.error(e);
        }
    }
}
exports.onOffPlug = onOffPlug;
//# sourceMappingURL=onOffPlug.js.map