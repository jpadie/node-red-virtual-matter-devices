type: module
import "@matter/main"
import type { Node, NodeAPI } from 'node-red';
import { colorLight } from "./colorCapableLight"
import { dimmableLight } from "./dimmableLight"
import { onOffLight } from "./onOffLight";


module.exports = (RED: NodeAPI): void => {

    function MatterLight(this: Node, config: any) {
        //  let matterServer: any;
        let device: any;

        RED.nodes.createNode(this, config);

        this.status({
            fill: "grey",
            shape: "dot",
            text: "offline"
        });

        /*
        if (config.serverNode) {
            matterServer = RED.nodes.getNode(config.serverNode);
        } else {
            return;
        }
        */
        let module: any;

        switch (config.lightType) {
            case "colorLight": module = colorLight; break;
            case "dimmableLight": module = dimmableLight; break;
            case "onOffLight": module = onOffLight; break;
            default: this.error("Invalid device type provided"); return;
        }



        device = new module(this, config);
        device.getEndpoint();
        /*.then((endpoint) => {
            matterServer.addDevice(endpoint);
        });
        */

    };

    RED.nodes.registerType('matter-light', MatterLight);
}