type: module
import "@project-chip/matter-node.js";
import type { Node, NodeAPI } from 'node-red';
import { thermostat } from "./thermostat";
import { fan } from "./fan";
import { airPurifier } from "./airPurifier";



/* tslint:disable */

module.exports = (RED: NodeAPI): void => {
    function MatterHVAC(this: Node, config: any) {

        let device: any;

        RED.nodes.createNode(this, config);


        let module: any;
        switch (config.deviceType) {

            case "thermostat": module = thermostat; break;

            case "fan": module = fan; break;

            case "airPurifier": module = airPurifier; break;

            default:
                this.error("Invalid device type provided");
                return;
        }

        device = new module(this, config);

        device.getEndpoint();
        /*.then((endpoint) => {
            matterServer.addDevice(endpoint);
        });
        */
    };

    RED.nodes.registerType('matter-hvac', MatterHVAC);
}