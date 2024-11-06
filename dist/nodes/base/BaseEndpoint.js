"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEndpoint = void 0;
require("@project-chip/matter-node.js");
const server_1 = require("../server/server");
class BaseEndpoint {
    mapping = {};
    config = {};
    node;
    endpoint;
    context;
    Context;
    attributes = {};
    name = "";
    state = false;
    skip = false;
    constructor(node, config, name = "") {
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
            id: this.node.id,
            bridgedDeviceBasicInformation: {
                vendorName: "matter.js virtual device",
                nodeLabel: this.name,
                productName: this.name,
                productLabel: this.name,
                productId: this.node.id,
                serialNumber: `${node.id}`.substring(0, 32),
                reachable: true,
                uniqueId: this.node.id
            }
        };
        this.node.status({
            fill: "grey",
            shape: "dot",
            text: "offline"
        });
    }
    getEnumKeyByEnumValue(myEnum, enumValue) {
        let keys = Object.keys(myEnum).filter(x => myEnum[x] == enumValue);
        return keys.length > 0 ? keys[0] : null;
    }
    setSerialNumber(value) {
        this.attributes.bridgedDeviceBasicInformation.serialNumber = (value + this.attributes.bridgedDeviceBasicInformation.serialNumber).substring(0, 30);
    }
    prune(item) {
        if (Object.hasOwn(this.mapping, item)) {
            if (!delete this.mapping[item]) {
                console.log("Error deleting mapping item: " + item);
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
    zigbee() {
        return false;
    }
    deploy() {
        return;
    }
    async getEndpoint() {
        if (server_1.matterHub) {
            try {
                await this.deploy();
                this.regularUpdate();
                this.listen();
                this.setStatus();
                this.setDefault("lastHeardFrom", "");
                this.saveContext();
                server_1.matterHub.addDevice(this.endpoint);
            }
            catch (e) {
                console.error(e);
                console.trace();
            }
        }
        else {
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
        });
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
    preProcessDeviceChanges(value, item) {
        if (item)
            return value;
        return value;
    }
    preProcessOutputReport(report) {
        return report;
    }
    listenForChange() {
        if (!this.endpoint) {
            console.error("endpoint is not established");
            console.log(this.endpoint);
            return;
        }
        for (const item in this.mapping) {
            let keys = Object.keys(this.mapping[item]);
            let key = keys[0];
            if (typeof this.mapping[item][key] == "string") {
                let s = `${this.mapping[item][key]}$Changed`;
                console.log(`listening at ${key}.${s}`);
                try {
                    this.endpoint.events[key][s].on((value) => {
                        value = this.preProcessDeviceChanges(value, s);
                        if ((this.skip)) {
                            this.skip = false;
                        }
                        else {
                            if (typeof value == "number") {
                                if (typeof this.mapping[item].multiplier == "object") {
                                    this.context[item] = this.mapping[item].multiplier[1](value);
                                }
                                else {
                                    this.context[item] = value / this.mapping[item].multiplier;
                                }
                            }
                            else {
                                this.context[item] = value;
                            }
                            this.context.lastHeardFrom = this.now();
                            let report = {
                                [item]: this.getVerbose(item, this.context[item]),
                                unit: this.mapping[item].unit,
                                lastHeardFrom: this.context.lastHeardFrom,
                                messageSource: "Matter"
                            };
                            if (this.mapping[item].unit == "")
                                delete report.unit;
                            this.node.send({ payload: report });
                            this.listenForChange_postProcess(report);
                            this.saveContext();
                            this.setStatus();
                        }
                    });
                }
                catch (e) {
                    console.error("error in setting up listener");
                    console.error(e);
                    console.trace();
                }
            }
            else if (typeof this.mapping[item][key] == "object") {
                let ks = Object.keys(this.mapping[item][key]);
                let k = ks[0];
                let s = `${k}$Changed`;
                console.log(`listening at ${key}.${s}`);
                try {
                    this.endpoint.events[key][s].on((value) => {
                        value = this.preProcessDeviceChanges(value, s);
                        if (this.skip) {
                            this.skip = false;
                        }
                        else {
                            if (typeof value == "number") {
                                if (typeof this.mapping[item].multiplier == "object") {
                                    this.context[item] = this.mapping[item].multiplier[1](value);
                                }
                                else {
                                    this.context[item] = value / this.mapping[item].multiplier;
                                }
                            }
                            else {
                                this.context[item] = value;
                            }
                            this.context.lastHeardFrom = this.now();
                            let report = {
                                [item]: this.getVerbose(item, this.context[item]),
                                unit: this.mapping[item].unit,
                                lastHeardFrom: this.context.lastHeardFrom
                            };
                            if (this.mapping[item].unit == "")
                                delete report.unit;
                            report = this.preProcessOutputReport(report);
                            this.node.send({ payload: report });
                            this.listenForChange_postProcess(report);
                            this.saveContext();
                            this.setStatus();
                        }
                    });
                }
                catch (e) {
                    console.error("error in setting up listener");
                    console.error(e);
                    console.trace();
                }
            }
        }
    }
    listenForChange_postProcess(report = {}) {
        if (report)
            return;
        return;
    }
    preProcessNodeRedInput(item, value) {
        return { a: item, b: value };
    }
    processIncomingItem(item, value) {
        let updates = [];
        if (Object.hasOwn(this.mapping, item)) {
            const keys = Object.keys(this.mapping[item]);
            let key = keys[0];
            if (typeof this.mapping[item][key] == "string") {
                if (typeof this.mapping[item].multiplier == "object") {
                    if (this.mapping[item].multiplier[0] != 1) {
                        value = Math.round(this.mapping[item].multiplier[0] * value);
                    }
                    updates.push({
                        [key]: { [this.mapping[item][key]]: value }
                    });
                }
                else {
                    if (this.mapping[item].multiplier != 1) {
                        value = Math.round(this.mapping[item].multiplier * value);
                    }
                    updates.push({
                        [key]: { [this.mapping[item][key]]: value }
                    });
                }
            }
            else if (typeof this.mapping[item][key] == "object") {
                const ks = Object.keys(this.mapping[item][key]);
                let k = ks[0];
                if (typeof this.mapping[item].multiplier == "object") {
                    if (this.mapping[item].multiplier[0] != 1) {
                        value = Math.round(this.mapping[item].multiplier[0] * value);
                    }
                    updates.push({
                        [key]: {
                            [this.mapping[item][key]]: {
                                [this.mapping[item][key][k]]: value
                            }
                        }
                    });
                }
                else {
                    if (this.mapping[item].multiplier != 1) {
                        value = Math.round(this.mapping[item].multiplier * value);
                    }
                    updates.push({
                        [key]: {
                            [this.mapping[item][key]]: {
                                [this.mapping[item][key][k]]: value
                            }
                        }
                    });
                }
            }
        }
        if (updates.length > 0) {
            let u = {};
            for (let i = 0; i < updates.length; i++) {
                u = Object.assign(u, updates[i]);
            }
            try {
                this.endpoint.set(u);
            }
            catch (e) {
                console.log(e);
                console.log(updates);
                console.trace();
            }
        }
    }
    processIncomingMessages(msg, send, done) {
        if (Object.hasOwn(msg.payload, "payload_raw")) {
            msg.payload.messageSource = "Z2M";
        }
        if (!Object.hasOwn(msg.payload, "messageSource")) {
            msg.payload.messageSource = "Manual Input";
        }
        if (this.config.passThroughMessage) {
            send(msg);
        }
        try {
            if (typeof msg.payload == "object") {
                for (let item in msg.payload) {
                    let { a, b } = this.preProcessNodeRedInput(item, msg.payload[item]);
                    if (Array.isArray(a)) {
                        for (let i = 0; i < a.length; i++) {
                            this.processIncomingItem(a[i], b[i]);
                        }
                    }
                    else {
                        this.processIncomingItem(a, b);
                    }
                }
            }
        }
        catch (e) {
            if (e instanceof Error) {
                this.node.error(e);
                done(e);
                console.log(e.stack);
            }
            else {
                this.node.error(e);
                done();
            }
        }
    }
    listenForMessages() {
        this.node.on("input", (msg, send, done) => {
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
            server_1.matterHub.removeDevice(this.node.id);
        });
    }
    lcFirst(val) {
        return val.charAt(0).toLowerCase() + val.slice(1);
    }
}
exports.BaseEndpoint = BaseEndpoint;
//# sourceMappingURL=BaseEndpoint.js.map