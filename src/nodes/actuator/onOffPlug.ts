import "@matter/main";
import { OnOffPlugInUnitDevice } from "@matter/main/devices";
import type { Node } from 'node-red';
import { onOffLight } from "../light/onOffLight";
import { ElectricalEnergyMeasurementServer, ElectricalPowerMeasurementServer } from "@matter/main/behaviors";
import { ElectricalEnergyMeasurement, ElectricalPowerMeasurement } from "@matter/main/clusters";
import { MeasurementType } from "@matter/main/types";

export class onOffPlug extends onOffLight {

    constructor(node: Node, config: any, _name: any = '') {
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
        }
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
            }
            this.withs.push(ElectricalPowerMeasurementServer.with(
                ElectricalPowerMeasurement.Feature.AlternatingCurrent)
            );
            this.withs.push(ElectricalEnergyMeasurementServer.with(
                ElectricalEnergyMeasurement.Feature.ImportedEnergy,
                ElectricalEnergyMeasurement.Feature.CumulativeEnergy)
            );

            this.setDefault("power", 0);
            this.setDefault("current", 0);
            this.setDefault("voltage", 230);
            this.setDefault("frequency", 50);
            this.setDefault("energy", 0);


            this.attributes = {
                ...this.attributes,
                electricalPowerMeasurement: {
                    powerMode: ElectricalPowerMeasurement.PowerMode.Ac,
                    accuracy: [
                        {
                            measurementType: MeasurementType.ActivePower, // mW
                            ...accuracyData,
                        },
                        {
                            measurementType: MeasurementType.ActiveCurrent, // mA
                            ...accuracyData,
                        },
                        {
                            measurementType: MeasurementType.Voltage, // mV
                            ...accuracyData,
                        },
                        {
                            measurementType: MeasurementType.Frequency, // mHz
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
                        measurementType: MeasurementType.ElectricalEnergy, // mWh
                        ...accuracyData,
                    },
                    cumulativeEnergyImported: {
                        energy: this.context.energy
                    },
                }
            }
        } else {
            this.prune("energy");
            this.prune("voltage");
            this.prune("current");
            this.prune("power");
            this.prune("frequency");
        }

        this.device = OnOffPlugInUnitDevice;
    }
    /*  
    energy updates need to be handled differently to trigger periodic measurements 
    see https://github.com/project-chip/matter.js/blob/main/packages/examples/src/device-measuring-socket/MeasuredSocketDevice.ts
    */

    override async getStatusText() {
        let text = await super.getStatusText();
        if (this.config.supportsEnergyMeasurement) {
            text += ` ${this.getVerbose("power", this.context.power)} W`
        }
        return text;
    }

    override async preProcessMatterUpdate(update: any): Promise<any> {
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
                }
                this.node.debug(`Setting Measurement via agent: ${JSON.stringify(parsedUpdate, null, 2)}`);

                await this.endpoint.act(agent =>
                    agent.get(ElectricalEnergyMeasurementServer).setMeasurement(parsedUpdate),
                );
                delete update.electricalEnergyMeasurement;
            }
        }
        return update;
    }


}