import "@matter/main";
import { type Node, type NodeContext } from 'node-red';
import { PowerSourceServer } from "@matter/main/behaviors"
import { PowerSource } from "@matter/main/clusters"
import { PowerSourceEndpoint } from "@matter/main/endpoints";
import { OnOffPlugInUnitDevice } from "@matter/main/devices";
import { Endpoint } from "@matter/main";
import { BaseEndpoint } from "@jpadie/node-red-virtual-matter-devices/src/nodes/base/BaseEndpoint";

export class powerControl extends BaseEndpoint {
    
    constructor(node, config: any, name: any = "") {
        
        super(node,config, name)
        this.config = config;
        let features: PowerSource.Feature[] = [];

        if (Object.hasOwn(this.config, "batteryPowered")) {
            features.push(PowerSource.Feature.Battery);
            this.withs.push(PowerSourceServer.with(...features));
        }
        this.mapping = {
            batteryChargeLevel: {},
            batteryReplacementNeeded: {},
            batteryVoltage: { PowerSourceServer: "batVoltage", multiplier: 1000 },
            batteryPercentageRemaining: {}
        }
        const e = new Endpoint(
            OnOffPlugInUnitDevice.with(PowerSourceServer.withFeatures("Battery")),
            {
                powerSource: {
                    batChargeLevel: 0,
                    batReplacementNeeded: false,
                    batVoltage: 0,
                    

                }
            });
    }
}