import { Endpoint } from "@project-chip/matter.js/endpoint";
import type { Node } from 'node-red';
import { BridgedDeviceBasicInformationServer } from "@project-chip/matter.js/behaviors/bridged-device-basic-information";
import { BaseEndpoint } from "../base/BaseEndpoint";
import { WaterLeakDetectorDevice } from "@project-chip/matter.js/devices/WaterLeakDetectorDevice";


export class waterLeakDetector extends BaseEndpoint {

    constructor(node: Node, config: any) {

        super(node, config);
        this.name = this.config.name || "Water Leak Detector"

        this.mapping = {   //must be a 1 : 1 mapping
            leaking: { booleanState: "stateValue", multiplier: 1, unit: "" }
        }

        this.attributes.serialNumber = "wld-" + this.attributes.serialNumber;

    }


    override setStatus() {
        this.node.status({
            fill: "green",
            shape: "dot",
            text: `${this.context.leaking ? "Leaking" : "Not Leaking"}`
        });
    }

    override async deploy() {
        this.context = Object.assign({
            frozen: false,
            lastHeardFrom: ""
        }, this.context);
        this.saveContext();
        this.attributes.booleanState = {
            stateValue: this.context.leaking ? true : false
        }

        try {
            this.endpoint = await new Endpoint(WaterLeakDetectorDevice.with(BridgedDeviceBasicInformationServer), this.attributes);
            this.listen();
            this.regularUpdate();
            this.setStatus();
        } catch (e) {
            this.node.error(e);
        }
    }
}