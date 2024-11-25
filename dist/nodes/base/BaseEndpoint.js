"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEndpoint = void 0;
require("@matter/main");
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
    confirmations = {};
    awaitingConfirmation = {};
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
            else {
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
                setTimeout(async () => {
                    await this.syncContext();
                }, 2000);
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
    clearConfirmation(item) {
        if (Object.hasOwn(this.awaitingConfirmation, item)) {
            delete this.awaitingConfirmation[item];
            clearTimeout(this.confirmations[item]);
            return true;
        }
        return false;
    }
    async awaitConfirmation(item, value) {
        this.clearConfirmation(item);
        this.awaitingConfirmation[item] = value;
        this.confirmations[item] = setTimeout((item) => {
            this.clearConfirmation(item);
        }, 1000, item);
        this.saveContext();
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
        if (!Object.hasOwn(this.context, item) || this.context[item] == null || this.context[item] == "") {
            this.context[item] = value;
        }
    }
    refine(value, decimals = 0) {
        if (!Number(value)) {
            return value;
        }
        if (decimals == 0) {
            return Math.round(value);
        }
        const e = Math.pow(10, decimals);
        return Math.round(e * value) / e;
    }
    matterRefine(item, value) {
        let ret;
        console.log("matter refine");
        console.log("item: " + item);
        console.log("value: " + value);
        if (value == 0) {
            ret = 0;
        }
        else if (item == "systemMode") {
            ret = value;
        }
        else {
            if (Object.hasOwn(this.mapping[item], "matter")) {
                if (Object.hasOwn(this.mapping[item].matter, "valueType")) {
                    switch (this.mapping[item].matter.valueType) {
                        case "int":
                            ret = this.refine(value, 0);
                            break;
                        case "float":
                            if (Object.hasOwn(this.mapping[item].matter, "valueDecimals")) {
                                ret = this.refine(value, this.mapping[item].matter.valueDecimals);
                            }
                            else {
                                ret = this.refine(value, 2);
                            }
                            break;
                        default:
                            ret = value;
                    }
                }
            }
        }
        console.log("matter refined");
        console.log("item: " + item);
        console.log("value: " + value);
        return ret;
    }
    contextRefine(item, value) {
        let ret;
        if (Object.hasOwn(this.mapping[item], "context")) {
            if (Object.hasOwn(this.mapping[item].context, "valueType")) {
                switch (this.mapping[item].context.valueType) {
                    case "int":
                        ret = this.refine(value);
                        break;
                    case "float":
                        if (Object.hasOwn(this.mapping[item].context, "valueDecimals")) {
                            ret = this.refine(value, this.mapping[item].context.valueDecimals);
                        }
                        else {
                            ret = this.refine(value, 2);
                        }
                        break;
                    default:
                        ret = value;
                }
            }
        }
        return ret;
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
    async preProcessOutputReport(report) {
        return report;
    }
    listenForChange() {
        if (!this.endpoint) {
            console.error("endpoint is not established.  Waiting 0.5 seconds");
            console.log(this.endpoint);
            setTimeout(this.listenForChange, 500);
            return;
        }
        for (const item in this.mapping) {
            let keys = Object.keys(this.mapping[item]);
            let key = keys[0];
            if (typeof this.mapping[item][key] == "string") {
                let s = `${this.mapping[item][key]}$Changed`;
                try {
                    this.endpoint.events[key][s].on(async (value) => {
                        value = this.preProcessDeviceChanges(value, s);
                        let v = value;
                        if ((this.skip)) {
                            this.skip = false;
                        }
                        else {
                            if (typeof value == "number") {
                                if (typeof this.mapping[item].multiplier == "object") {
                                    v = this.mapping[item].multiplier[1](value);
                                }
                                else {
                                    v = value / this.mapping[item].multiplier;
                                    v = this.contextRefine(item, v);
                                }
                            }
                            else {
                                value = this.contextRefine(item, value);
                            }
                            this.context[item] = v;
                            console.log(`setting context item ${item} to ${value}`);
                            this.context.lastHeardFrom = this.now();
                            if (!this.clearConfirmation(item)) {
                                let report = {
                                    [item]: this.getVerbose(item, this.context[item]),
                                    unit: this.mapping[item].unit,
                                    lastHeardFrom: this.context.lastHeardFrom,
                                    messageSource: "Matter"
                                };
                                if (this.mapping[item].unit == "")
                                    delete report.unit;
                                report = await this.preProcessOutputReport(report);
                                this.node.send({ payload: report });
                                this.listenForChange_postProcess(report);
                            }
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
                try {
                    this.endpoint.events[key][s].on(async (value) => {
                        if (this.clearConfirmation(item))
                            return;
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
                            if (!this.clearConfirmation(item)) {
                                let report = {
                                    [item]: this.getVerbose(item, this.context[item]),
                                    unit: this.mapping[item].unit,
                                    lastHeardFrom: this.context.lastHeardFrom
                                };
                                if (this.mapping[item].unit == "")
                                    delete report.unit;
                                report = await this.preProcessOutputReport(report);
                                this.node.send({ payload: report });
                                this.listenForChange_postProcess(report);
                            }
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
    async processIncomingItem(item, value) {
        let updates = [];
        if (Object.hasOwn(this.mapping, item)) {
            const keys = Object.keys(this.mapping[item]);
            let key = keys[0];
            let v;
            if (this.context[item] != value) {
                v = value;
                if (typeof this.mapping[item][key] == "string") {
                    if (typeof this.mapping[item].multiplier == "object") {
                        if (this.mapping[item].multiplier[0] != 1) {
                            v = this.mapping[item].multiplier[0] * value;
                        }
                        if (Object.hasOwn(this.mapping[item], "min")) {
                            v = Math.max(this.mapping[item].min, value);
                        }
                        if (Object.hasOwn(this.mapping[item], "max")) {
                            v = Math.min(this.mapping[item].max, value);
                        }
                    }
                    else {
                        if (this.mapping[item].multiplier != 1) {
                            v = this.mapping[item].multiplier * value;
                        }
                        if (Object.hasOwn(this.mapping[item], "min")) {
                            v = Math.max(this.mapping[item].min, value);
                        }
                        if (Object.hasOwn(this.mapping[item], "max")) {
                            v = Math.min(this.mapping[item].max, value);
                        }
                    }
                    v = this.matterRefine(item, v);
                    updates.push({
                        [key]: { [this.mapping[item][key]]: v }
                    });
                    this.awaitConfirmation(item, v);
                }
                else if (typeof this.mapping[item][key] == "object") {
                    const ks = Object.keys(this.mapping[item][key]);
                    let k = ks[0];
                    if (typeof this.mapping[item].multiplier == "object") {
                        if (this.mapping[item].multiplier[0] != 1) {
                            v = this.mapping[item].multiplier[0] * value;
                        }
                        if (Object.hasOwn(this.mapping[item], "min")) {
                            v = Math.max(this.mapping[item].min, value);
                        }
                        if (Object.hasOwn(this.mapping[item], "max")) {
                            v = Math.min(this.mapping[item].max, value);
                        }
                    }
                    else {
                        if (this.mapping[item].multiplier != 1) {
                            v = this.mapping[item].multiplier * value;
                        }
                        if (Object.hasOwn(this.mapping[item], "min")) {
                            v = Math.max(this.mapping[item].min, value);
                        }
                        if (Object.hasOwn(this.mapping[item], "max")) {
                            v = Math.min(this.mapping[item].max, value);
                        }
                    }
                    v = this.matterRefine(item, v);
                    updates.push({
                        [key]: {
                            [this.mapping[item][key]]: {
                                [this.mapping[item][key][k]]: v
                            }
                        }
                    });
                    await this.awaitConfirmation(item, v);
                }
            }
            else {
            }
        }
        if (updates.length > 0) {
            console.log("raw updates");
            console.log(updates);
            let u = {};
            for (let i = 0; i < updates.length; i++) {
                u = Object.assign(u, updates[i]);
            }
            try {
                if (this.endpoint.lifecycle.isReady) {
                    console.log("requested update");
                    console.log(JSON.stringify(u));
                    await this.endpoint.set(u);
                }
            }
            catch (e) {
                console.log(e);
                console.log(updates);
                console.trace();
            }
        }
    }
    processIncomingMessages(msg, send, done) {
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
            if (Object.hasOwn(msg, "payload") && typeof msg.payload == "object") {
                msg.payload = Object.assign(msg.payload, { messageSource: "node-red input" });
            }
            this.processIncomingMessages(msg, send, done);
        });
    }
    listen() {
        this.listenForChange();
        this.listenForMessages();
        this.listenForClose();
    }
    listenForClose() {
        this.node.on("close", async () => {
            await server_1.matterHub.timeToClose();
        });
    }
    lcFirst(val) {
        return val.charAt(0).toLowerCase() + val.slice(1);
    }
    matterToContext(value, item) {
        let v = value;
        if (typeof value == "number") {
            if (typeof this.mapping[item].multiplier == "object") {
                v = this.mapping[item].multiplier[1](value);
            }
            else {
                v = value / this.mapping[item].multiplier;
            }
        }
        return this.refine(v, item);
    }
    contextToMatter(value, item) {
        let v = value;
        if (typeof this.mapping[item].multiplier == "object") {
            if (this.mapping[item].multiplier[0] != 1) {
                v = this.mapping[item].multiplier[0] * value;
            }
            if (Object.hasOwn(this.mapping[item], "min")) {
                v = Math.max(this.mapping[item].min, value);
            }
            if (Object.hasOwn(this.mapping[item], "max")) {
                v = Math.min(this.mapping[item].max, value);
            }
        }
        else {
            if (this.mapping[item].multiplier != 1) {
                v = this.mapping[item].multiplier * value;
            }
            if (Object.hasOwn(this.mapping[item], "min")) {
                v = Math.max(this.mapping[item].min, value);
            }
            if (Object.hasOwn(this.mapping[item], "max")) {
                v = Math.min(this.mapping[item].max, value);
            }
        }
        v = this.matterRefine(item, v);
        return v;
    }
    async syncContext() {
        await this.endpoint.construction;
        for (let item in this.mapping) {
            const keys = Object.keys(this.mapping[item]);
            const key = keys[0];
            const value = this.mapping[item][key];
            let c;
            if (typeof value != "object") {
                c = await this.endpoint.state[key][value];
            }
            else {
                const _keys = Object.keys(value);
                const _key = _keys[0];
                const _value = value[_key];
                c = await this.endpoint.state[key][_key][_value];
            }
            this.context[item] = this.matterToContext(c, item);
        }
        this.saveContext();
        this.setStatus();
    }
}
exports.BaseEndpoint = BaseEndpoint;
//# sourceMappingURL=BaseEndpoint.js.map