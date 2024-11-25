import "@matter/main";
import { OnOffPlugInUnitDevice } from "@matter/main/devices";
import { BridgedDeviceBasicInformationServer } from "@matter/main/behaviors"
import { Endpoint } from "@matter/main";
import type { Node } from 'node-red';
import { onOffLight } from "../light/onOffLight";
import { ElectricalEnergyMeasurementServer, ElectricalPowerMeasurementServer } from "@matter/main/behaviors";
import { ElectricalEnergyMeasurement, ElectricalPowerMeasurement } from "@matter/main/clusters";
import { MeasurementType } from "@matter/main/types";



export class onOffPlug extends onOffLight {
    private withs: any[] = [];
    constructor(node: Node, config: any, _name: any = '') {
        let name = config.name || _name || "On/Off Plug";
        super(node, config, name);
        this.setSerialNumber("plug-");
        this.withs.push(BridgedDeviceBasicInformationServer);
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
            this.withs.push(ElectricalPowerMeasurementServer.with(ElectricalPowerMeasurement.Feature.AlternatingCurrent));
            this.withs.push(ElectricalEnergyMeasurementServer.with(
                ElectricalEnergyMeasurement.Feature.ImportedEnergy,
                ElectricalEnergyMeasurement.Feature.CumulativeEnergy));

            this.mapping = {
                ...this.mapping,
                activePower: { electricalPowerMeasurement: "activePower", multiplier: 1000, unit: "W", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } },
                activeCurrent: { electricalPowerMeasurement: "activeCurrent", multiplier: 1000, unit: "A", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } },
                voltage: { electricalPowerMeasurement: "voltage", multiplier: 1000, unit: "V", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } },
                frequency: { electricalPowerMeasurement: "frequency", multiplier: 1000, unit: "Hz", matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 2 } }
            }
            this.setDefault("activePower", 0);
            this.setDefault("activeCurrent", 0);
            this.setDefault("voltage", 0);
            this.setDefault("frequency", 0);


            this.attributes = {
                ...this.attributes,
                electricalPowerMeasurement: {
                    powerMode: ElectricalPowerMeasurement.PowerMode.Ac,
                    // We simulate that we can measure the following values.
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
                },
                electricalEnergyMeasurement: {
                    accuracy: {
                        measurementType: MeasurementType.ElectricalEnergy, // mWh
                        ...accuracyData,
                    },
                }
            }
        }
    }
    override async deploy() {
        try {
            this.endpoint = await new Endpoint(OnOffPlugInUnitDevice.with(...this.withs), this.attributes);
        } catch (e) {
            this.node.error(e);
        }
    }

}