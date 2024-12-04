require("@matter/node");
import { WaterLeakDetectorDevice } from "@matter/main/devices"
import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";

export class waterLeakDetector extends BaseEndpoint {

    constructor(node: Node, config: any, _name: string = "") {
        let name = _name || "Water Leak Detector";
        super(node, config, name);
        this.mapping = {   //must be a 1 : 1 mapping
            leaking: { booleanState: "stateValue", multiplier: 1, unit: "", matter: { valueType: "boolean" }, context: { valueType: "int" } }
        }
        this.setSerialNumber("wld-");
        this.setDefault("leaking", 0);
        this.attributes = {
            ...this.attributes,
            booleanState: {
                stateValue: this.contextToMatter("leaking", this.context.leaking)
            }
        }
        this.device = WaterLeakDetectorDevice;
    }

    override getVerbose(item: any, value: any) {
        switch (item) {
            case "leaking":
                return value ? "Leaking" : "Not Leaking";
                break;
            default:
                return super.getVerbose(item, value);
        }
    }
}