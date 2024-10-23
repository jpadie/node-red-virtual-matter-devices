import { Endpoint } from "@project-chip/matter.js/endpoint";
import type { Node } from 'node-red';
import { BridgedDeviceBasicInformationServer } from "@project-chip/matter.js/behaviors/bridged-device-basic-information";
import { BaseEndpoint } from "../base/BaseEndpoint"
import { WaterValveDevice } from "@project-chip/matter.js/devices/WaterValveDevice";
import { WaterValveRequirements } from "@project-chip/matter.js/devices/WaterValveDevice";
import { ValveConfigurationAndControl } from "@project-chip/matter.js/cluster";


export class waterValve extends BaseEndpoint {

    constructor(node: Node, config: any, _name: any = "") {

        let name = config.name || _name || "Water Valve"
        super(node, config, name);
        this.mapping = {   //must be a 1 : 1 mapping
            ...this.mapping,

        }
        this.attributes.serialNumber = "wv-" + this.attributes.serialNumber;
        this.attributes.pumpConfigurationAndControl = {};
        this.attributes.pumpConfigutationAndControl = {
            maxSpeed: 65534,
            maxPressure: 3276,
            maxFlow: 6553.4,
            effectiveControlMode: 0,
            effectiveOperationMode: 0,
            capacity: 0
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
                WaterValveDevice.with(
                    BridgedDeviceBasicInformationServer,
                    WaterValveRequirements.ValveConfigurationAndControlServer.with(
                        ValveConfigurationAndControl.Feature.TimeSync,
                        ValveConfigurationAndControl.Feature.Level)
                ),
                {
                    valveConfigurationAndControl: {
                        openDuration: ,
                        defaultOpenDuration,
                        autoCloseTime: 
                        
                        
                    }
                }
            ),);
        } catch (e) {
            this.node.error(e);
        }
    }
}