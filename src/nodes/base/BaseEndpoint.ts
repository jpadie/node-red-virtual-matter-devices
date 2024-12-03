import "@matter/main";
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
    public skip: Boolean = false;
    public confirmations: any = {}
    public awaitingConfirmation: any = {};

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
        }
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

    setSerialNumber(value: string) {
        this.attributes.bridgedDeviceBasicInformation.serialNumber = (value + this.attributes.bridgedDeviceBasicInformation.serialNumber).substring(0, 30);
    }

    prune(item) {
        if (Object.hasOwn(this.mapping, item)) {
            if (!delete this.mapping[item]) {
                this.node.error("Error deleting mapping item: " + item)
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
    async deploy() {
        return;
    }
    cleanUp() {
        this.node.debug("cleaning up old context entries")
        let mappings = Object.keys(this.mapping);
        this.node.debug(`Permitted keys: ${JSON.stringify(mappings, null, 2)}`);
        for (let item in this.context) {
            this.node.debug(`testing context item: ${item}`);
            if (item == "lastHeardFrom")
                continue;
            if (item.includes("_in_words"))
                continue;
            if (!mappings.includes(item)) {
                this.node.debug(`Found prohibited item: ${item}`);
                this.prune(item);
                this.prune(`${item}_in_words`);
            }
        }
        this.saveContext();
    }
    async getEndpoint() {
        if (matterHub) {
            try {
                this.cleanUp();
                await this.deploy();
                this.regularUpdate();
                this.listen();
                this.setStatus();
                //setTimeout(() => { this.setStatus() }, 1000);
                this.setDefault("lastHeardFrom", "");
                this.saveContext();

                matterHub.addDevice(this.endpoint);
                setTimeout(async () => {
                    await this.syncContext()
                }, 2000);
                for (const item of ["config", "attributes", "context"]) {
                    this.node.debug("item");
                    this.node.debug(JSON.stringify(this[item], null, 2));
                }
            } catch (e) {
                this.node.error(e);
                console.trace();
            }
        } else {
            this.node.status({
                fill: "grey",
                shape: "dot",
                text: "No Matter Hub Configured"
            });
        }
    }

    clearConfirmation(item: string): Boolean {
        if (Object.hasOwn(this.awaitingConfirmation, item)) {
            delete this.awaitingConfirmation[item]
            clearTimeout(this.confirmations[item])
            return true;
        }
        return false;
    }

    async awaitConfirmation(item: string, value: string) {
        this.clearConfirmation(item);
        this.awaitingConfirmation[item] = value;
        this.confirmations[item] = setTimeout((item: string) => {
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

    getStatusText() {
        let keys = Object.keys(this.context);
        return this.context[keys[0]] + (this.context.unit || "")
    }
    setStatus() {
        this.node.status({
            fill: "green",
            shape: "dot",
            text: this.getStatusText()
        })
    }
    setDefault(item, value) {
        if (!Object.hasOwn(this.context, item) || this.context[item] == null || this.context[item] == "") {
            this.context[item] = value;
        }
    }
    refine(value, decimals = 0) {
        if (Object.is(value, undefined) || Object.is(value, null)) {
            value = 0;
        }
        if (Number.isNaN(value)) {
            return value;
        } else {
            if (decimals == 0) {
                return Math.round(value);
            } else {
                const e = Math.pow(10, decimals);
                return Math.round(e * value) / e;
            }
        }
    }
    matterRefine(item, value) {
        this.node.debug("refining values for matter");
        this.node.debug("item: " + item);
        this.node.debug("value: " + value);
        let ret = value;
        if (value != 0) {
            if (Object.hasOwn(this.mapping[item], "matter")) {
                if (Object.hasOwn(this.mapping[item].matter, "valueType")) {
                    switch (this.mapping[item].matter.valueType) {
                        case "int":
                            ret = this.refine(ret, 0);
                            break;
                        case "float":
                            if (Object.hasOwn(this.mapping[item].matter, "valueDecimals")) {
                                ret = this.refine(ret, this.mapping[item].matter.valueDecimals);
                            } else {
                                ret = this.refine(ret, 2);
                            }
                            break;
                        default:
                    }
                }
            }

        }
        this.node.debug("refined values for matter");
        this.node.debug("item: " + item);
        this.node.debug("value: " + ret);
        return ret;
    }
    contextRefine(item, value) {
        let ret = value;
        this.node.debug(`Refining value for context: item ${item} and value ${value}`)
        if (Object.hasOwn(this.mapping, item)) {
            if (Object.hasOwn(this.mapping[item], "context")) {
                if (Object.hasOwn(this.mapping[item].context, "valueType")) {
                    switch (this.mapping[item].context.valueType) {
                        case "int":
                            ret = this.refine(value);
                            break;
                        case "float":
                            if (Object.hasOwn(this.mapping[item].context, "valueDecimals")) {
                                ret = this.refine(value, this.mapping[item].context.valueDecimals);
                            } else {
                                ret = this.refine(value, 2);
                            }
                            break;
                        default:
                            ret = value;
                    }
                }
            }
        }
        this.node.debug(`Refined value for context: item ${item} and value ${ret}`)
        return ret;
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
    async preProcessOutputReport(report) {
        return report;
    }
    /**
     * This method listens for changes established by the matter subsystem.
     * Typically it will only ever receive one change at a time.
     * 
     * @returns 
     */
    async listenForChange() {
        await this.endpoint.construction;
        /*
        if (!this.endpoint) {
            this.node.debug("endpoint is not established.  Waiting 0.5 seconds");
            this.node.debug(this.endpoint);
            setTimeout(this.listenForChange, 500);
            return;
        }
        */

        for (const item in this.mapping) {
            let keys = Object.keys(this.mapping[item]);
            let key = keys[0];

            if (typeof this.mapping[item][key] == "string") {
                let s: string = `${this.mapping[item][key]}$Changed`;
                this.node.debug(`listening at ${key}.${s}`);
                try {
                    this.endpoint.events[key][s].on(async (value) => {
                        this.node.debug(`Message received from Matter key: ${key}, item: ${s}, value: ${value}`);
                        let v = this.preProcessDeviceChanges(value, s)
                        if ((this.skip)) {
                            this.skip = false;
                        } else {
                            v = this.matterToContext(item, v);
                            this.context[item] = v;
                            this.node.debug(`setting context item ${item} to ${value}`);

                            this.context.lastHeardFrom = this.now();
                            if (!this.clearConfirmation(item)) {
                                let report = {
                                    [item]: this.getVerbose(item, this.context[item]),
                                    unit: this.mapping[item].unit,
                                    lastHeardFrom: this.context.lastHeardFrom,
                                    messageSource: "Matter"
                                }
                                if (this.mapping[item].unit == "") {
                                    delete report.unit;
                                }
                                //reports.push(report);
                                report = await this.preProcessOutputReport(report)
                                this.node.send({ payload: report });
                                this.listenForChange_postProcess(report);
                            }
                            this.saveContext();
                            this.setStatus();
                        }
                    });
                } catch (e) {
                    this.node.error("error in setting up listener");
                    this.node.error(e);
                    console.trace();
                }

            } else if (typeof this.mapping[item][key] == "object") {
                //go one level deeper
                let ks = Object.keys(this.mapping[item][key]);
                let k = ks[0];

                let s: string = `${k}$Changed`;
                this.node.debug(`listening at ${key}.${s}`);
                try {
                    this.endpoint.events[key][s].on(async (value) => {
                        if (this.clearConfirmation(item)) return;
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
                            if (!this.clearConfirmation(item)) {
                                let report = {
                                    [item]: this.getVerbose(item, this.context[item]),
                                    unit: this.mapping[item].unit,
                                    lastHeardFrom: this.context.lastHeardFrom
                                }

                                if (this.mapping[item].unit == "") delete report.unit;

                                report = await this.preProcessOutputReport(report)
                                this.node.send({ payload: report });

                                this.listenForChange_postProcess(report);
                            }
                            this.saveContext();
                            this.setStatus();
                        }
                    });
                } catch (e) {
                    this.node.error("error in setting up listener");
                    this.node.error(e);
                    console.trace();
                }
            }
        }
    }
    listenForChange_postProcess(report: object = {}) {
        if (report) return;
        return
    }
    preProcessNodeRedInput(item, value) {
        return { a: item, b: value };
    }

    async processIncomingItem(item, value) {
        this.node.debug(`after pre processing item is now ${item} value is now ${value}`);
        let updates: any[] = [];
        if (Object.hasOwn(this.mapping, item)) {
            let v;
            if (this.context[item] != value) {
                v = this.contextToMatter(item, value);
                const keys = Object.keys(this.mapping[item]);
                let key = keys[0]; //check first item of the object
                if (typeof this.mapping[item][key] == "string") {
                    updates.push({
                        [key]: { [this.mapping[item][key]]: v }
                    });
                } else if (typeof this.mapping[item][key] == "object") {
                    const ks = Object.keys(this.mapping[item][key]);
                    let k = ks[0];
                    updates.push({
                        [key]: {
                            [this.mapping[item][key]]: {
                                [this.mapping[item][key][k]]: v
                            }
                        }
                    });
                }
                this.awaitConfirmation(item, v);
                await this.awaitConfirmation(item, v);
            }
        }
        // for (const update of updates) {
        if (updates.length > 0) {
            this.node.debug("raw updates");
            this.node.debug(JSON.stringify(updates, null, 2));

            let u = {};
            for (let i = 0; i < updates.length; i++) {
                u = Object.assign(u, updates[i]);
            }
            u = await this.preProcessMatterUpdate(u);
            if (Object.keys(u).length > 0) {
                try {
                    await this.endpoint.construction;
                    this.node.debug("requested update");
                    this.node.debug(JSON.stringify(u, null, 2));
                    await this.endpoint.set(u);
                } catch (e) {
                    this.node.error(e);
                    this.node.error(JSON.stringify(updates, null, 2));
                    console.trace();
                }
            }
        }
    }

    async preProcessMatterUpdate(update) {
        return update;
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
                    } else {
                        this.processIncomingItem(a, b);
                    }
                }
            }
        } catch (e) {
            if (e instanceof Error) {
                this.node.error(e);
                this.node.error(JSON.stringify(e.stack, null, 2));
                if (done) {
                    done(e)
                }
            } else {
                this.node.error(e);
                if (done) {
                    done(e)
                }
            }
        }
    }

    /**
     * this method listens for messages received by node-red on the input to the node
     */
    listenForMessages() {
        this.node.on("input", (msg: any, send, done) => {
            this.node.debug("incoming message in listen for messages");
            this.node.debug(JSON.stringify(msg, null, 2));
            if (Object.hasOwn(msg, "payload") && typeof msg.payload == "object") {
                msg.payload = Object.assign(msg.payload, { messageSource: "node-red input" });
            } else {
                Object.assign(msg, { payload: { messageSource: "node-red input" } });
            }
            this.processIncomingMessages(msg, send, done);
        });
    }
    listen() {
        this.listenForChange();     //from Matter Commands
        this.listenForMessages();   //from node-red inputs
        this.listenForClose();
    }

    listenForClose() {
        this.node.on("close", async () => {
            await matterHub.timeToClose();
        });
    }

    lcFirst(val) {
        return val.charAt(0).toLowerCase() + val.slice(1);
    }

    matterToContext(item, value) {
        this.node.debug(`Converting Matter value ${value} for item ${item} to Context value`);
        let v = value;
        if (typeof value == "number" && Object.hasOwn(this.mapping[item], "multiplier")) {
            if (typeof this.mapping[item].multiplier == "object") {
                v = this.mapping[item].multiplier[1](value);
            } else {
                v = value / this.mapping[item].multiplier;
            }
        }
        this.node.debug(`Converted Matter value to unrefined context value. Value: ${v} for item ${item} `);
        return this.contextRefine(item, v)
    }

    contextToMatter(item, value) {
        this.node.debug(`Converting a Context value to a Matter value. Item: ${item} Value: ${value}`)
        let v = value;
        if (typeof value == "number" && Object.hasOwn(this.mapping[item], "multiplier")) {
            if (typeof this.mapping[item].multiplier == "object") {
                v = this.mapping[item].multiplier[0](value);
            } else {
                v = this.mapping[item].multiplier * value;
            }
            if (Object.hasOwn(this.mapping[item], "min")) {
                v = Math.max(this.mapping[item].min, value);
            }
            if (Object.hasOwn(this.mapping[item], "max")) {
                v = Math.min(this.mapping[item].max, value);
            }
            v = this.matterRefine(item, v);
        }
        return v;
    }
    async syncContext() {
        this.node.debug("Syncing Context");
        await this.endpoint.construction;
        let state;
        try {
            state = this.endpoint.state;
        } catch (e) {
            this.node.error(`Problem retrieving endpoint state`);
            this.node.error(e);
            console.trace();
            return;
        }
        this.node.debug(`Endpoint state: ${JSON.stringify(state, null, 2)}`);
        for (let item in this.mapping) {
            const keys = Object.keys(this.mapping[item]);
            const key = keys[0];
            const subkey = this.mapping[item][key];
            let c;
            if (typeof subkey != "object") {
                if (Object.hasOwn(state, key)) {
                    if (Object.hasOwn(state[key], subkey)) {
                        c = state[key][subkey];
                        this.node.debug(`retrieved state of ${key} ${subkey} (item: ${item}) as ${c}`)
                    }
                }
            } else {
                const _keys = Object.keys(subkey);
                const _key = _keys[0];
                const _value = subkey[_key];
                if (Object.hasOwn(state, key)) {
                    if (Object.hasOwn(state[key], _key)) {
                        if (Object.hasOwn(state[key][_key], _value)) {
                            c = state[key][_key][_value];
                            this.node.debug(`retrieved state of ${key} ${_key} ${_value} (item: ${item}) as ${c}`)
                        }
                    }
                }
            }
            if (c == undefined) {
                c = 0;
            }
            this.context[item] = this.matterToContext(item, c);
        }
        this.saveContext();
        this.setStatus();
    }
}