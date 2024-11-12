"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matterHub = void 0;
require("@matter/node");
const main_1 = require("@matter/main");
const endpoints_1 = require("@matter/main/endpoints");
const protocol_1 = require("@matter/main/protocol");
const types_1 = require("@matter/types");
class MatterHub {
    static #instance;
    started = false;
    qrcodeURL;
    commissioned;
    qrcode;
    manualPairingCode;
    online = false;
    passcode;
    discriminator;
    id;
    aggregator;
    matterServer;
    endpoints = {};
    deviceStorage;
    shuttingDown = false;
    constructor() {
        this.init();
        console.log("++++++++++++++++");
        console.log("restarting matterHub");
        console.log("++++++++++++++++");
    }
    async loadVars() {
        const FORBIDDEN_PASSCODES = [
            0,
            11111111,
            22222222,
            33333333,
            44444444,
            55555555,
            66666666,
            77777777,
            88888888,
            99999999,
            12345678,
            87654321
        ];
        const environment = main_1.Environment.default;
        const storageService = environment.get(main_1.StorageService);
        this.deviceStorage = (await storageService.open("matterHub")).createContext("data");
        let passcode;
        do {
            passcode = this.randomNumber(0, 0x3FFFFFF);
        } while (FORBIDDEN_PASSCODES.includes(passcode));
        this.passcode = environment.vars.number("passcode") ?? (await this.deviceStorage.get("passcode", passcode));
        this.discriminator = environment.vars.number("discriminator") ?? (await this.deviceStorage.get("discriminator", this.randomNumber(0, 0xFFF)));
        this.id = environment.vars.string("uniqueid") ?? (await this.deviceStorage.get("uniqueid", this.getID()));
        await this.saveVars();
    }
    async saveVars() {
        await this.deviceStorage.set({
            passcode: this.passcode,
            discriminator: this.discriminator,
            uniqueid: this.id
        });
    }
    async init() {
        await this.loadVars();
        await this.deploy();
    }
    randomNumber(min, max) {
        return Math.round(Math.random() * (max - min) + min);
    }
    async getID() {
        let bytes = [];
        for (let i = 0; i < 8; i++) {
            bytes.push(Math.round(0xff * Math.random()).toString(16).padStart(2, '0'));
        }
        return bytes.join("");
    }
    static get instance() {
        if (!MatterHub.#instance) {
            MatterHub.#instance = new MatterHub();
        }
        return MatterHub.#instance;
    }
    async deploy() {
        const name = "Matter Hub";
        let serverOpts = {
            id: this.id,
            network: {
                port: 5540,
            },
            commissioning: {
                passcode: this.passcode,
                discriminator: this.discriminator
            },
            productDescription: {
                name: name,
                deviceType: endpoints_1.AggregatorEndpoint.deviceType,
            },
            basicInformation: {
                vendorName: "matter.js",
                vendorId: (0, main_1.VendorId)(65521),
                nodeLabel: name,
                productName: name,
                productLabel: name,
                productId: 1,
                serialNumber: `Hub-${this.id}`.substring(0, 30),
                uniqueId: this.id.substring(0, 30),
            }
        };
        try {
            this.matterServer = await main_1.ServerNode.create(serverOpts);
            this.aggregator = new main_1.Endpoint(endpoints_1.AggregatorEndpoint, { id: "matterHub" });
            await this.matterServer.add(this.aggregator);
            this.started = true;
            for (const e in this.endpoints) {
                this.addDevice(this.endpoints[e]);
            }
            await this.matterServer.start();
            await this.matterServer.construction;
            setTimeout(() => {
                (0, protocol_1.logEndpoint)(main_1.EndpointServer.forEndpoint(this.matterServer));
            }, 3500);
            this.queryStatus();
        }
        catch (error) {
            console.log(`[Matter Hub]: Error creating MatterHub. ${error}`);
            console.trace();
        }
    }
    addDevice(endpoint) {
        if (this.shuttingDown) {
            this.shuttingDown = false;
            this.deploy();
        }
        if (!this.started || !this.aggregator) {
            this.endpoints[endpoint.id] = endpoint;
        }
        else {
            try {
                this.endpoints[endpoint.id] = endpoint;
                this.aggregator.add(endpoint);
            }
            catch (e) {
                console.log(e);
                console.log(endpoint);
            }
        }
    }
    async queryStatus() {
        await this.matterServer.construction;
        if (this.matterServer.lifecycle.isOnline) {
            this.commissioned = this.matterServer.lifecycle.isCommissioned;
            this.online = this.matterServer.lifecycle.isOnline;
            const qrPairingCode = this.matterServer.state.commissioning.pairingCodes.qrPairingCode;
            this.manualPairingCode = this.matterServer.state.commissioning.pairingCodes.manualPairingCode;
            this.qrcode = types_1.QrCode.get(qrPairingCode);
            this.qrcodeURL = `https://project-chip.github.io/connectedhomeip/qrcode.html?data=${qrPairingCode}`;
        }
    }
    getStatus() {
        if (!this.started)
            return {};
        this.queryStatus();
        return {
            online: this.online,
            commissioned: this.commissioned,
            qrcode: this.qrcode,
            qrcodeURL: this.qrcodeURL,
            manualPairingCode: this.manualPairingCode
        };
    }
    async reInitialise() {
        this.started = false;
        if (this.matterServer.lifecycle.isOnline) {
            await this.matterServer.cancel();
        }
        await this.matterServer.erase();
        console.log("about to redeploy");
        await this.matterServer.start();
        this.started = true;
        console.log("finished redeploying");
        setTimeout(() => {
            (0, protocol_1.logEndpoint)(main_1.EndpointServer.forEndpoint(this.matterServer));
        }, 3500);
    }
    async killDevice(id) {
        return;
        console.log("in kill device for " + id);
        console.log("++++++++++++++++++");
        if (Object.hasOwn(this.endpoints, id)) {
            await this.endpoints[id].destroy();
            delete (this.endpoints[id]);
        }
    }
    async removeDevice(id) {
        return true;
        console.log("removing device " + id);
        console.log("+++++++++++++++++++++++++++++++++++");
        let response = false;
        if (Object.hasOwn(this.endpoints, id)) {
            await this.endpoints[id].close();
            delete (this.endpoints[id]);
            response = true;
        }
        else {
            console.debug("Not removing endpoint as endpoint ID does not exist: " + id);
        }
        if (Object.keys(this.endpoints).length == 0) {
            await this.shutDown();
        }
        return response;
    }
    timeToClose() {
        if (!this.shuttingDown) {
            this.shuttingDown = true;
            this.shutDown();
        }
    }
    async shutDown() {
        this.started = false;
        await this.matterServer.cancel();
    }
}
exports.matterHub = MatterHub.instance;
//# sourceMappingURL=server.js.map