type: module
import "@project-chip/matter-node.js";
import type { Node, NodeAPI } from 'node-red';
import { matterHub } from "../server/server";



/* tslint:disable */
module.exports = (RED: NodeAPI): void => {
    function MatterHub(this: Node, config: any) {


        RED.nodes.createNode(this, config);

    }
    RED.nodes.registerType('matter-hub-status', MatterHub);

    RED.httpAdmin.post(
        "/matter-hub/:id",
        function (req, res) {
            const node = RED.nodes.getNode(req.params.id);
            console.log(req.body);
            if (node == null) {
                res.sendStatus(404);
                return;
            }

            if (!req.body) {
                res.sendStatus(500);
            } else {
                const data = (req.body);
                let responseData = {};
                switch (data.request) {
                    case "getStatus":
                        responseData = matterHub.getStatus();
                        responseData = Object.assign(responseData, { message: "OK" });
                        res.send(responseData);
                        res.end();
                        break;
                    case "reInitialise":
                        matterHub.reInitialise();
                        res.sendStatus(200);
                        break;
                    case "shutdown":
                        matterHub.shutDown();
                        res.sendStatus(200);
                        break;
                    case "removeNode":
                        if (node.id) {
                            matterHub.removeDevice(node.id).
                                then((success) => {
                                    if (success) {
                                        res.send({ success: "ok" });
                                    } else {
                                        res.send({ success: "" });
                                    }
                                }).catch((e) => {
                                    console.log(e);
                                    res.send({ success: "" })
                                });
                        }
                        break;
                    default:
                        res.sendStatus(500);

                }
            }
        }
    );
}