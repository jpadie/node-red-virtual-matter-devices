type: module
import "@project-chip/matter-node.js";
import type { Node, NodeAPI } from 'node-red';
import { windowCovering } from "./windowCovering";
import { doorLock } from "./doorLock";

module.exports = (RED: NodeAPI): void => {

    function MatterClosure(this: Node, config: any) {
        //let matterServer: any;
        let device: any;
        let module: any;
        RED.nodes.createNode(this, config);

        switch (config.deviceType) {
            case "doorLock": module = doorLock; break;
            case "windowCovering": module = windowCovering; break;
            default: this.error("Invalid device type"); return;
        }

        device = new module(this, config);

        device.getEndpoint();
        /*.then((endpoint) => {
            matterServer.addDevice(endpoint);
        });
        */
    };
    RED.nodes.registerType('matter-closure', MatterClosure);
}