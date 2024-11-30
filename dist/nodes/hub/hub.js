"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
type: module;
require("@matter/main");
const server_1 = require("../server/server");
module.exports = (RED) => {
    function MatterHub(config) {
        RED.nodes.createNode(this, config);
        setInterval(() => {
            let status = server_1.matterHub.getStatus();
            this.status({
                fill: "green",
                shape: "dot",
                text: status.commissioned ? "Commissioned" : "Not commissioned"
            });
        }, 3000);
    }
    RED.nodes.registerType('matter-hub-status', MatterHub);
    RED.httpAdmin.post("/matter-hub/:id", function (req, res) {
        const node = RED.nodes.getNode(req.params.id);
        if (node == null) {
            res.sendStatus(404);
            return;
        }
        if (!req.body) {
            res.sendStatus(500);
        }
        else {
            const data = (req.body);
            let responseData = {};
            switch (data.request) {
                case "getStatus":
                    responseData = server_1.matterHub.getStatus();
                    responseData = Object.assign(responseData, { message: "OK" });
                    res.send(responseData);
                    res.end();
                    break;
                case "reInitialise":
                    server_1.matterHub.reInitialise();
                    res.sendStatus(200);
                    break;
                case "shutdown":
                    server_1.matterHub.shutDown();
                    res.sendStatus(200);
                    break;
                case "removeNode":
                    if (node.id) {
                        server_1.matterHub.removeDevice(node.id).
                            then((success) => {
                            if (success) {
                                res.send({ success: "ok" });
                            }
                            else {
                                res.send({ success: "" });
                            }
                        }).catch((e) => {
                            console.log(e);
                            res.send({ success: "" });
                        });
                    }
                    break;
                default:
                    res.sendStatus(500);
            }
        }
    });
};
//# sourceMappingURL=hub.js.map