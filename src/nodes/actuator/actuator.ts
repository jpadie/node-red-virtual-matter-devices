type: module
import "@matter/main";
import type { Node, NodeAPI } from 'node-red';
import { onOffPlug } from "./onOffPlug";
import { dimmablePlug } from "./dimmablePlug";

/* tslint:disable */

module.exports = (RED: NodeAPI): void => {
    function MatterActuator(this: Node, config: any) {
        // let matterServer: any;
        let device: any;

        RED.nodes.createNode(this, config);


        let module: any;
        switch (config.deviceType) {

            case "onOffPlug": module = onOffPlug; break;

            case "dimmablePlug": module = dimmablePlug; break;
            /*
                        case "waterValve": module = waterValve; break;
            
                        case "pump": module = pump; break;
            */

            default:
                this.error("Invalid device type provided");
                return;
        }

        device = new module(this, config);

        device.getEndpoint();

    };

    RED.nodes.registerType('matter-actuator', MatterActuator);
}