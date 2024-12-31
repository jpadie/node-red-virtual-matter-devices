import "@project-chip/matter-node.js";
import { BridgedDeviceBasicInformationServer } from "@matter/main/behaviors"
import { Endpoint } from "@matter/main";
import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";
import { CookSurfaceDevice } from "@matter/main/devices"
    ;
import { CookSurfaceRequirements } from "@matter/main/devices"
    ;

/*
export class cookSurface extends BaseEndpoint {


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
        CookSurfaceRequirements.TemperatureMeasurementServer.
        const e = new Endpoint(CookSurfaceDevice.with(
            BridgedDeviceBasicInformationServer,
            CookSurfaceRequirements.OnOffServer,
            CookSurfaceRequirements.TemperatureControlServer,
            CookSurfaceRequirements.TemperatureMeasurementServer),
            {
                onOff: {
                    onOff: this.context.onOff
                },
                temperatureControl: {
                    temperatureSetPoint: 0,

                },
                temperatureMeasurement: {
                    measuredValue: this.context.temperature * 100,
                    minMeasuredValue: 0,
                    maxMeasuredValue: 300 * 100
                }
            }
        )


    }
});


await this.endpoint.behaviors.activate(
    RoomAirConditionerRequirements.FanControlServer.with(...this.fan.features),
    this.fan.attributes.fanControl
)
    }
}
*/