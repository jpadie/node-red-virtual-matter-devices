import { RainSensorDevice } from "@matter/main/devices"
import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";

export class rainSensor extends BaseEndpoint {
    constructor(node: Node, config: any) {

        super(node, config);
        this.name = this.config.name || "Water Leak Detector"

        this.mapping = {   //must be a 1 : 1 mapping
            rain: { booleanState: "stateValue", multiplier: 1, unit: "", matter: { valueType: "boolean" }, context: { valueType: "int" } }
        }
        this.setDefault("rain", 0);
        this.setSerialNumber("rd-");
        this.attributes = {
            ...this.attributes,
            booleanState: {
                stateValue: this.contextToMatter("rain", this.context.rain)
            }
        }
        this.device = RainSensorDevice;

    }

    override getVerbose(item: any, value: any) {
        switch (item) {
            case "rain":
                return value ? "Raining" : "Dry";
                break;
            default:
                return super.getVerbose(item, value);
        }
    }
}