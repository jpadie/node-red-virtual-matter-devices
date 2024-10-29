"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matterHub = void 0;
require("@project-chip/matter-node.js");
const datatype_1 = require("@project-chip/matter.js/datatype");
const node_1 = require("@project-chip/matter.js/node");
const schema_1 = require("@project-chip/matter.js/schema");
const device_1 = require("@project-chip/matter.js/device");
const endpoint_1 = require("@project-chip/matter.js/endpoint");
const AggregatorEndpoint_1 = require("@project-chip/matter.js/endpoints/AggregatorEndpoint");
const endpoint_2 = require("@project-chip/matter.js/endpoint");
const environment_1 = require("@project-chip/matter.js/environment");
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
    constructor() {
        this.init();
    }
    async loadVars() {
        const environment = environment_1.Environment.default;
        const storageService = environment.get(environment_1.StorageService);
        this.deviceStorage = (await storageService.open("matterHub")).createContext("data");
        this.passcode = environment.vars.number("passcode") ?? (await this.deviceStorage.get("passcode", this.randomNumber(0, 0x3FFFFFF)));
        this.discriminator = environment.vars.number("discriminator") ?? (await this.deviceStorage.get("discriminator", this.randomNumber(0, 0xFFF)));
        this.id = environment.vars.string("uniqueid") ?? (await this.deviceStorage.get("uniqueid", this.getID()));
        await this.deviceStorage.set({
            passcode: this.passcode,
            discriminator: this.discriminator,
            uniqueid: this.id
        });
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
    getID() {
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
                deviceType: AggregatorEndpoint_1.AggregatorEndpoint.deviceType,
            },
            basicInformation: {
                vendorName: "matter.js",
                vendorId: (0, datatype_1.VendorId)(65521),
                nodeLabel: name,
                productName: name,
                productLabel: name,
                productId: 1,
                serialNumber: `Hub-${this.id}`.substring(0, 30),
                uniqueId: this.id.substring(0, 30),
            }
        };
        node_1.ServerNode
            .create(serverOpts)
            .then((resolve) => {
            this.matterServer = resolve;
            this.aggregator = new endpoint_2.Endpoint(AggregatorEndpoint_1.AggregatorEndpoint, { id: "matterHub" });
            this.matterServer.add(this.aggregator)
                .then(() => {
                this.started = true;
                for (const e in this.endpoints) {
                    this.addDevice(this.endpoints[e]);
                }
                this.matterServer.bringOnline().then(() => {
                    setTimeout(() => {
                        (0, device_1.logEndpoint)(endpoint_1.EndpointServer.forEndpoint(this.matterServer));
                    }, 3500);
                }).catch((error) => {
                    console.log("problem bringing matter server online", error);
                });
            }).catch((e) => {
                console.log(e);
            });
            this.commissioned = this.matterServer.lifecycle.isCommissioned;
            this.online = this.matterServer.lifecycle.isOnline;
            const qrPairingCode = this.matterServer.state.commissioning.pairingCodes.qrPairingCode;
            this.manualPairingCode = this.matterServer.state.commissioning.pairingCodes.manualPairingCode;
            this.qrcode = schema_1.QrCode.get(qrPairingCode);
            this.qrcodeURL = `https://project-chip.github.io/connectedhomeip/qrcode.html?data=${qrPairingCode}`;
        }).catch((error) => {
            console.error("Issue with matter server deployment", error);
        });
    }
    addDevice(endpoint) {
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
    getStatus() {
        return {
            online: this.online,
            commissioned: this.commissioned,
            qrcode: this.qrcode,
            qrcodeURL: this.qrcodeURL,
            manualPairingCode: this.manualPairingCode
        };
    }
    async reInitialise() {
        await this.matterServer.cancel();
        await this.matterServer.factoryReset();
        this.id = this.getID();
        await this.saveVars();
        this.deploy();
    }
    async killDevice(id) {
        if (Object.hasOwn(this.endpoints, id)) {
            await this.endpoints[id].destroy();
            delete (this.endpoints[id]);
        }
    }
    async removeDevice(id) {
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
    async shutDown() {
        await this.matterServer.cancel();
    }
}
exports.matterHub = MatterHub.instance;
//# sourceMappingURL=server.js.map