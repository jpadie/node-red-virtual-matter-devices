import "@project-chip/matter-node.js";
import { type Node, type NodeContext } from 'node-red';
import { matterHub } from "../server/server";

export class BaseEndpoint {
    public mapping: Record<string, any> = {};
    public config: Record<string, any> = {};
    public node: Node;
    public endpoint: any;
    public context: any;
    public Context: NodeContext;
    public attributes: Record<string, any> = {};
    public name: string = "";
    public state: Boolean = false;
    private skip: Boolean = false;

    constructor(node: Node, config: Record<string, never>, name = "") {
        this.node = node;
        this.config = config;
        for (const item in this.config) {
            if (!isNaN(+this.config[item])) {
                this.config[item] = +this.config[item];
            }
        }
        if (!Object.hasOwn(this.config, "telemetryInterval") || this.config.telemetryInterval < 60) {
            this.config.telemetryInterval = 60;
        }
        this.Context = node.context();
        this.context = this.Context.get("attributes") || {};
        this.name = name;
        this.attributes = {
            id: node.id,
            bridgedDeviceBasicInformation: {
                nodeLabel: this.name,
                productName: this.name,
                productLabel: this.name,
                serialNumber: `${node.id}`.substring(0, 32),
                reachable: true,
            }
        }
        this.node.status({
            fill: "grey",
            shape: "dot",
            text: "offline"
        });

        console.log(this.config);
    }

    getEnumKeyByEnumValue(myEnum, enumValue) {
        let keys = Object.keys(myEnum).filter(x => myEnum[x] == enumValue);
        return keys.length > 0 ? keys[0] : null;
    }

    setSerialNumber(value: string) {
        this.attributes.bridgedDeviceBasicInformation.serialNumber = (value + this.attributes.bridgedDeviceBasicInformation.serialNumber).substring(0, 30);
    }
    prune(item) {
        if (Object.hasOwn(this.mapping, item)) {
            if (!delete this.mapping[item]) {
                console.log("Error deleting mapping item: " + item)
            }
        }
        if (Object.hasOwn(this.context, item)) {
            delete this.context[item];
        }
    }

    regularUpdate() {
        if (this.config.regularUpdates) {
            setInterval(() => {
                let update = {};
                for (const item in this.context) {
                    let value = this.getVerbose(item, this.context[item]);
                    if (value != this.context[item]) {
                        update[`${item}_in_words`] = value;
                    }
                }
                this.node.send({
                    payload: { ...this.context, ...update },
                    topic: "regular update"
                });
            }, this.config.telemetryInterval * 1000);
        }
    }

    deploy() {
        return;
    }

    async getEndpoint() {
        if (matterHub) {
            await this.deploy();
            this.regularUpdate();
            this.listen();
            this.setStatus();
            //setTimeout(() => { this.setStatus() }, 1000);
            this.setDefault("lastHeardFrom", "");
            this.saveContext();
            matterHub.addDevice(this.endpoint);
        } else {
            this.node.status({
                fill: "grey",
                shape: "dot",
                text: "No Matter Hub Configured"
            });
        }
    }

    now() {
        let n = Date.now();
        let d = new Date(n);
        return d.toUTCString();
    }

    saveContext() {
        this.Context.set('attributes', this.context);
    }

    setStatus() {
        let keys = Object.keys(this.context);
        this.node.status({
            fill: "green",
            shape: "dot",
            text: this.context[keys[0]] + (this.context.unit || "")
        })
    }
    setDefault(item, value) {
        if (!Object.hasOwn(this.context, item) || this.context[item] == null) {
            this.context[item] = value;
        }
    }
    getVerbose(item, value) {
        switch (item) {
            default: return value;
        }
    }
    preProcessDeviceChanges(value: any, item: any) {
        if (item) return value;
        return value;
    }
    listenForChange() {
        try {
            for (const item in this.mapping) {
                let keys = Object.keys(this.mapping[item]);
                let key = keys[0];

                if (typeof this.mapping[item][key] == "string") {
                    let s: string = `${this.mapping[item][key]}$Changed`;
                    //   console.log(`listening at ${key}.${s}`);
                    this.endpoint.events[key][s].on((value) => {
                        this.node.warn({ key: key, item: s, value: value });
                        value = this.preProcessDeviceChanges(value, s)
                        if ((this.skip)) {
                            this.skip = false;
                        } else {
                            if (typeof value == "number") {
                                if (typeof this.mapping[item].multiplier == "object") {
                                    this.context[item] = this.mapping[item].multiplier[1](value);
                                } else {
                                    this.context[item] = value / this.mapping[item].multiplier;
                                }
                            } else {
                                this.context[item] = value;
                            }

                            this.context.lastHeardFrom = this.now();
                            let report = {
                                [item]: this.getVerbose(item, this.context[item]),
                                unit: this.mapping[item].unit,
                                lastHeardFrom: this.context.lastHeardFrom
                            }
                            if (this.mapping[item].unit == "") delete report.unit;
                            this.node.send({ payload: report });
                            this.Context.set("attributes", this.context);
                            this.setStatus();
                            this.listenForChange_postProcess();
                        }
                    });

                } else if (typeof this.mapping[item][key] == "object") {
                    //go one level deeper
                    let ks = Object.keys(this.mapping[item][key]);
                    let k = ks[0];

                    let s: string = `${k}$Changed`;
                    this.endpoint.events[key][s].on((value) => {
                        value = this.preProcessDeviceChanges(value, s)
                        if (this.skip) {
                            this.skip = false;
                        } else {
                            if (typeof value == "number") {
                                if (typeof this.mapping[item].multiplier == "object") {
                                    this.context[item] = this.mapping[item].multiplier[1](value);
                                } else {
                                    this.context[item] = value / this.mapping[item].multiplier;
                                }
                            } else {
                                this.context[item] = value;
                            }

                            this.context.lastHeardFrom = this.now();
                            let report = {
                                [item]: this.getVerbose(item, this.context[item]),
                                unit: this.mapping[item].unit,
                                lastHeardFrom: this.context.lastHeardFrom
                            }
                            if (this.mapping[item].unit == "") delete report.unit;
                            this.node.send({ payload: report });
                            this.Context.set("attributes", this.context);
                            this.setStatus();
                            this.listenForChange_postProcess();
                        }
                    });
                }
            }
        } catch (e) {
            this.node.error("error in listener " + e);
        }

    }
    listenForChange_postProcess() { }
    preProcessNodeRedInput(item, value) {
        return { a: item, b: value };
    }
    processIncomingMessages(msg, send, done) {
        //console.log("incoming message");
        //console.log(msg);
        try {
            if (this.config.passThroughMessage) {
                this.node.warn("message received");
                send(msg);
            }
            if (typeof msg.payload == "object") {
                let updates: any[] = [];
                for (const item in msg.payload) {
                    //      console.log("checking " + item);
                    //      console.log(this.mapping);
                    if (Object.hasOwn(this.mapping, item)) {
                        const keys = Object.keys(this.mapping[item]);
                        let { a, b } = this.preProcessNodeRedInput(keys[0], msg.payload[item]);
                        if (!a) break;
                        let key = a;
                        msg.payload[item] = b;
                        if (typeof this.mapping[item][key] == "string") {
                            if (typeof this.mapping[item].multiplier == "object") {
                                updates.push({
                                    [key]: { [this.mapping[item][key]]: this.mapping[item].multiplier[0](msg.payload[item]) }
                                });
                            } else {
                                updates.push({
                                    [key]: { [this.mapping[item][key]]: msg.payload[item] * this.mapping[item].multiplier }
                                });
                            }
                        } else if (typeof this.mapping[item][key] == "object") {
                            const ks = Object.keys(this.mapping[item][key]);
                            let k = ks[0];
                            if (typeof this.mapping[item].multiplier == "object") {
                                updates.push({
                                    [key]: {
                                        [this.mapping[item][key]]: {
                                            [this.mapping[item][key][k]]: this.mapping[item].multiplier[0](msg.payload[item])
                                        }
                                    }
                                });
                            } else {
                                updates.push({
                                    [key]: {
                                        [this.mapping[item][key]]: {
                                            [this.mapping[item][key][k]]: msg.payload[item] * this.mapping[item].multiplier
                                        }
                                    }
                                });
                            }

                        }
                    }
                }
                // console.log("updates look like")
                // console.log(updates);
                for (const update of updates) this.endpoint.set(update);
            }
        } catch (e) {
            if (e instanceof Error) {
                this.node.error(e);
                done(e)
                console.log(e.stack);
            } else {
                this.node.error(e);
                done();
            }
        }
    }
    listenForMessages() {
        this.node.on("input", (msg, send, done) => {
            //console.log("incoming message in listen for messages");
            //console.log(msg);
            this.processIncomingMessages(msg, send, done);
        });
    }
    listen() {
        this.listenForChange();
        this.listenForMessages();
        this.listenForClose();
    }
    listenForClose() {
        this.node.on("close", () => {
            matterHub.removeDevice(this.node.id);
        });
    }
    lcFirst(val) {
        return val.charAt(0).toLowerCase() + val.slice(1);
    }
}