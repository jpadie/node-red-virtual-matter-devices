require("@matter/node");
import { WaterFreezeDetectorDevice } from "@matter/main/devices"
import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";


export class waterFreezeDetectorDevice extends BaseEndpoint {

    constructor(node: Node, config: any) {

        super(node, config);
        this.name = this.config.name || "Water Freeze Sensor"

        this.mapping = {   //must be a 1 : 1 mapping
            frozen: { booleanState: "stateValue", multiplier: 1, unit: "", matter: { valueType: "boolean" }, context: { valueType: "int" } }
        }

        this.setSerialNumber("wfd-");
        this.setDefault("frozen", 0);
        this.attributes = {
            ...this.attributes,
            booleanState: {
                stateValue: this.contextToMatter("froze", this.context.frozen)
            }
        }
        this.device = WaterFreezeDetectorDevice;
    }

    override getVerbose(item: any, value: any) {
        switch (item) {
            case "frozen":
                return value ? "Frozen" : "Liquid";
                break;
            default:
                return super.getVerbose(item, value);
        }
    }
}