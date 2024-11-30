import { LightSensorDevice } from "@matter/main/devices";
import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";
import { BridgedDeviceBasicInformationServer } from "@matter/main/behaviors"
import { Endpoint } from "@matter/main"

export class lightSensor extends BaseEndpoint {

    lx2val(value: number) {
        return Math.round((10000 * Math.log10(value)) + 1);
    }

    val2lx(value: number) {
        return Math.round(Math.pow(10, (value - 1) / 10000));
    }

    constructor(node: Node, config: any) {

        super(node, config);
        this.name = this.config.name || "Temperature Sensor"

        this.mapping = {   //must be a 1 : 1 mapping
            brightness: {
                illuminanceMeasurement: "measuredValue",
                multiplier: [this.lx2val.bind(this), this.val2lx.bind(this)],
                unit: "lx"
            }
        }

        this.attributes.serialNumber = "lxs-" + this.attributes.serialNumber;
    }

    override async deploy() {
        this.context = Object.assign({
            brightness: 10000,
            lastHeardFrom: ""
        }, this.context);

        this.attributes = Object.assign(this.attributes, {
            illuminanceMeasurement: {
                measuredValue: this.lx2val(this.context.brightness),
                lightSensorType: 0 //photodiode
            }
        });

        try {
            this.endpoint = await new Endpoint(LightSensorDevice.with(BridgedDeviceBasicInformationServer), this.attributes);
            this.listen();
            this.regularUpdate();
            this.setStatus();
        } catch (e) {
            this.node.error(e);
        }
    }
}