"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onOffPlug = void 0;
require("@matter/main");
const devices_1 = require("@matter/main/devices");
const onOffLight_1 = require("../light/onOffLight");
const behaviors_1 = require("@matter/main/behaviors");
const clusters_1 = require("@matter/main/clusters");
const types_1 = require("@matter/main/types");
class onOffPlug extends onOffLight_1.onOffLight {
    constructor(node, config, _name = '') {
        let name = config.name || _name || "On/Off Plug";
        super(node, config, name);
        this.setSerialNumber("plug-");
        this.mapping = {
            ...this.mapping,
            power: { electricalPowerMeasurement: "activePower", multiplier: 1000, unit: "W", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } },
            current: { electricalPowerMeasurement: "activeCurrent", multiplier: 1000, unit: "A", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } },
            voltage: { electricalPowerMeasurement: "voltage", multiplier: 1000, unit: "V", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } },
            frequency: { electricalPowerMeasurement: "frequency", multiplier: 1000, unit: "Hz", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } },
            energy: { electricalEnergyMeasurement: { cumulativeEnergyImported: "energy" }, multiplier: 1000, unit: "Wh", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } }
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
            this.withs.push(behaviors_1.ElectricalPowerMeasurementServer.with(clusters_1.ElectricalPowerMeasurement.Feature.AlternatingCurrent));
            this.withs.push(behaviors_1.ElectricalEnergyMeasurementServer.with(clusters_1.ElectricalEnergyMeasurement.Feature.ImportedEnergy, clusters_1.ElectricalEnergyMeasurement.Feature.CumulativeEnergy));
            this.setDefault("power", 0);
            this.setDefault("current", 0);
            this.setDefault("voltage", 230);
            this.setDefault("frequency", 50);
            this.setDefault("energy", 0);
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
                    activeCurrent: 0,
                    voltage: this.context.voltage,
                    activePower: 0,
                    frequency: this.context.frequency,
                },
                electricalEnergyMeasurement: {
                    accuracy: {
                        measurementType: types_1.MeasurementType.ElectricalEnergy,
                        ...accuracyData,
                    },
                    cumulativeEnergyImported: {
                        energy: this.context.energy
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
        this.device = devices_1.OnOffPlugInUnitDevice;
    }
    async getStatusText() {
        let text = await super.getStatusText();
        if (this.config.supportsEnergyMeasurement) {
            text += ` ${this.getVerbose("power", this.context.power)} W`;
        }
        return text;
    }
    async preProcessMatterUpdate(update) {
        await this.endpoint.construction;
        this.node.debug("preprocessing matter update.  received " + JSON.stringify(update, null, 2));
        for (let key in update) {
            if (key == "electricalEnergyMeasurement") {
                this.node.debug("Found the energy key which needs special handling");
                const parsedUpdate = {
                    cumulativeEnergy: {
                        imported: {
                            energy: update.electricalEnergyMeasurement.cumulativeEnergyImported.energy,
                        },
                    },
                };
                this.node.debug(`Setting Measurement via agent: ${JSON.stringify(parsedUpdate, null, 2)}`);
                await this.endpoint.act(agent => agent.get(behaviors_1.ElectricalEnergyMeasurementServer).setMeasurement(parsedUpdate));
                delete update.electricalEnergyMeasurement;
            }
        }
        return update;
    }
}
exports.onOffPlug = onOffPlug;
//# sourceMappingURL=onOffPlug.js.map