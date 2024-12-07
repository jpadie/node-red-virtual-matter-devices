import type { Node } from 'node-red';
import { PumpDevice, PumpRequirements } from "@matter/main/devices";
import { dimmableLight } from "../light/dimmableLight";
import { PumpConfigurationAndControl, OnOff } from "@matter/main/clusters";

export class pump extends dimmableLight {

    constructor(node: Node, config: any, _name: any = "") {

        let name = config.name || _name || "Pump"
        super(node, config, name);
        this.mapping = {   //must be a 1 : 1 mapping
            ...this.mapping,
            speed: {
                pumpConfigurationAndControl: "speed",
                min: 0,
                max: 100,
                multiplier: 1,
                unit: "%",
                context: { valueType: "int" },
                matter: { valueType: "int" }
            }
        }
        delete this.mapping.brightness
        this.setSerialNumber("pump-");
        this.setDefault("speed", 0);

        this.attributes = {
            ...this.attributes,
            pumpConfigurationAndControl: {
                maxSpeed: 65534,
                maxPressure: 3276,
                maxFlow: 6553.4,
                effectiveOperationMode: PumpConfigurationAndControl.OperationMode.Normal,
                capacity: 0,
                speed: this.contextToMatter("speed", this.context.speed),
                operationMode: PumpConfigurationAndControl.OperationMode.Normal,
            },

        }
        if (this.config.supportsVariableSpeed) {
            // need to override the currentLevel label
            this.attributes.levelControl.currentLevel = this.contextToMatter("speed", this.context.speed);
            this.withs.push(PumpRequirements.LevelControlServer)
        } else {
            delete this.attributes.levelControl;
        }



        this.withs.push(
            PumpRequirements.PumpConfigurationAndControlServer,
            PumpRequirements.OnOffServer
        );
        /* override this.device */
        this.device = PumpDevice;
    }
}