import "@project-chip/matter-node.js";
import { OnOffLightDevice } from "@project-chip/matter.js/devices/OnOffLightDevice";
import { BridgedDeviceBasicInformationServer } from "@project-chip/matter.js/behaviors/bridged-device-basic-information";
import { Endpoint } from "@project-chip/matter.js/endpoint";
import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";
import { OnOff } from "@project-chip/matter.js/cluster";


export class onOffLight extends BaseEndpoint {

    constructor(node: Node, config: any, _name: any = '') {
        let name = config.name || _name || "On/Off Light";
        super(node, config, name);

        this.setDefault("onoff", 0);
        this.attributes = {
            ...this.attributes,
            onOff: {
                startUpOnOff: this.context.onoff ? OnOff.StartUpOnOff.On : OnOff.StartUpOnOff.Off,

            },
        };

        this.mapping = {
            onoff: { onOff: "onOff", multiplier: 1, unit: "" }
        }

        this.setSerialNumber("light-");
    }

    override getVerbose(item, value) {
        switch (item) {
            case "onOff":
                return value ? "ON" : "OFF";
                break;
            default:
                return super.getVerbose(item, value);
        }
    }

    override setStatus() {
        this.node.status({
            fill: "green",
            shape: "dot",
            text: this.getVerbose("onOff", this.context.onoff)
        });
    }

    override async deploy() {
        try {
            this.endpoint = await new Endpoint(OnOffLightDevice.with(BridgedDeviceBasicInformationServer), this.attributes);
        } catch (e) {
            this.node.error(e);
        }
    }

}