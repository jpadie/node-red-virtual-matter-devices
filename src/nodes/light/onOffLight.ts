import { OnOffLightDevice } from "@matter/main/devices";
import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";
import { OnOff } from "@matter/main/clusters";



export class onOffLight extends BaseEndpoint {

    constructor(node: Node, config: any, _name: any = '') {
        let name = config.name || _name || "On/Off Light";
        super(node, config, name);

        this.setDefault("onoff", 0)

        this.mapping = {
            onoff: { onOff: "onOff", multiplier: 1, unit: "", min: 0, max: 1, matter: { valueType: "int" }, context: { valueType: "int" } }
        }

        this.attributes = {
            ...this.attributes,
            onOff: {
                startUpOnOff: OnOff.StartUpOnOff.Off,
                onOff: this.contextToMatter("onoff", this.context.onoff)
            },
        };

        this.setSerialNumber("light-");
        this.device = OnOffLightDevice;
    }

    override getVerbose(item, value) {
        switch (item) {
            case "onoff":
                return value ? "ON" : "OFF";
                break;
            default:
                return super.getVerbose(item, value);
        }
    }

}