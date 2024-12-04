import { LightSensorDevice } from "@matter/main/devices";
import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";

export class lightSensor extends BaseEndpoint {

    lx2val(value: number) {
        return Math.round((10000 * Math.log10(value)) + 1);
    }

    val2lx(value: number) {
        return Math.round(Math.pow(10, (value - 1) / 10000));
    }

    constructor(node: Node, config: any, _name: string = "") {
        let name = _name || "Temperature Sensor"
        super(node, config, name);

        this.mapping = {
            illuminance: {
                illuminanceMeasurement: "measuredValue",
                multiplier: [this.lx2val.bind(this), this.val2lx.bind(this)],
                unit: "lx",
                matter: { valueType: "int" },
                context: { valueType: "int" }
            }
        }

        this.setSerialNumber("lxs-");
        this.setDefault("illuminance", 10000);

        this.attributes = Object.assign(this.attributes, {
            illuminanceMeasurement: {
                measuredValue: this.contextToMatter("illuminance", this.context.illuminance),
                lightSensorType: 0 //photodiode
            }
        });
        this.device = LightSensorDevice;
    }
}