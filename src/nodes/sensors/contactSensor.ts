import { ContactSensorDevice } from "@matter/main/devices"
import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";

export class contactSensor extends BaseEndpoint {

    constructor(node: Node, config: any, _name: string = "") {
        let name = _name || "Contact Sensor"
        super(node, config, name);
        this.mapping = {   //must be a 1 : 1 mapping
            contact: { booleanState: "stateValue", multiplier: 1, unit: "", matter: { valueType: "boolean" }, context: { valueType: "int" } }
        }
        this.setDefault("contact", 0);
        this.setSerialNumber("cs-");
        this.attributes = Object.assign(
            this.attributes, {
            booleanState: {
                stateValue: this.contextToMatter("contact", this.context.contact)
            }
        });
        this.device = ContactSensorDevice;
    }

    override getVerbose(item: any, value: any) {
        switch (item) {
            case "contact":
                return value ? "Closed" : "Open";
                break;
            default:
                return super.getVerbose(item, value);
        }
    }
}