import "@project-chip/matter-node.js";
import { BridgedDeviceBasicInformationServer } from "@project-chip/matter.js/behaviors/bridged-device-basic-information";
import { Endpoint } from "@project-chip/matter.js/endpoint";
import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";
import { RoomAirConditionerDevice } from "@project-chip/matter.js/devices/RoomAirConditionerDevice";
import { RoomAirConditionerRequirements } from "@project-chip/matter.js/devices/RoomAirConditionerDevice";
import { fan } from "../hvac/fan";
import { thermostat } from "../hvac/thermostat";
import { ThermostatDevice } from "@project-chip/matter.js/devices/ThermostatDevice";


export class roomAirConditioner extends thermostat {

    private fan: fan;

    constructor(node: Node, config: any, _name: any = "") {
        let name = _name || config.name || "AirCon Unit"
        super(node, config, name);

        this.fan = new fan(node, config, "");

        this.mapping = {
            ...this.mapping,
            ...this.fan.mapping
        }


        //this establishes defaults for the fan and then overrides them if the synthetic device
        // has already been used
        this.context = Object.assign(this.fan.context, this.context);

        this.attributes.serialNumber = ("rac-" + this.attributes.serialNumber);

    }

    override setStatus() {
        let text = "State: " + this.getVerbose("mode", this.context.mode);
        try {
            this.node.status({
                fill: "green",
                shape: "dot",
                text: text
            });
        } catch (e) {
            this.node.error(e);
        }
    }

    override getVerbose(item: any, value: any) {
        value = super.getVerbose(item, value);
        value = this.fan.getVerbose(item, value);
        return value;
    }

    override async deploy() {
        await super.deploy();
        await this.endpoint.behaviors.activate(
            RoomAirConditionerRequirements.FanControlServer.with(...this.fan.features),
            this.fan.attributes.fanControl
        )
    }
}
