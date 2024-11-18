/*
import { Endpoint } from "@matter/main";
import type { Node } from 'node-red';
import { BridgedDeviceBasicInformationServer } from "@matter/main/behaviors";
import { PumpDevice, PumpRequirements } from "@matter/main/devices";
import { onOffLight } from "../light/onOffLight";


export class pump extends onOffLight {

    constructor(node: Node, config: any, _name: any = "") {

        let name = config.name || _name || "Pump"
        super(node, config, name);
        this.mapping = {   //must be a 1 : 1 mapping
            ...this.mapping,

        }
        this.attributes.serialNumber = "pump-" + this.attributes.serialNumber;

        this.attributes = {
            ...this.attributes,
            pumpConfigutationAndControl: {
                maxSpeed: 65534,
                maxPressure: 3276,
                maxFlow: 6553.4,
                effectiveControlMode: 0,
                effectiveOperationMode: 0,
                capacity: 0
            }
        }

        this.context = Object.assign({
            occupied: false,
            lastHeardFrom: ""
        }, this.context);

        this.attributes = {
            ...this.attributes,

        }
    }

    override setStatus() {
        let text = '';
        this.node.status({
            fill: "green",
            shape: "dot",
            text: text
        });
    }

    override async deploy() {
        try {
            this.endpoint = await new Endpoint(
                PumpDevice.with(
                    BridgedDeviceBasicInformationServer,
                    PumpRequirements.OnOffServer,
                    PumpRequirements.PumpConfigurationAndControlServer.with("Automatic", "CompensatedPressure", "ConstantFlow", "ConstantPressure", "ConstantSpeed", "ConstantTemperature", "LocalOperation"),
                ), this.attributes);
        } catch (e) {
            this.node.error(e);
        }
    }
}
    */