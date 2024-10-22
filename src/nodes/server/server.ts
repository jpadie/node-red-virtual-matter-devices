require("@project-chip/matter-node.js");
import { VendorId } from "@project-chip/matter.js/datatype";
import { ServerNode } from "@project-chip/matter.js/node";
import { QrCode } from "@project-chip/matter.js/schema";
import { logEndpoint } from "@project-chip/matter.js/device";
import { EndpointServer } from "@project-chip/matter.js/endpoint";
import { AggregatorEndpoint } from "@project-chip/matter.js/endpoints/AggregatorEndpoint";
import { Endpoint } from "@project-chip/matter.js/endpoint";
import { Environment, StorageService } from "@project-chip/matter.js/environment";

class MatterHub {
    static #instance: MatterHub;
    private started: boolean = false;
    private qrcodeURL!: string;
    private commissioned!: boolean;
    private qrcode!: string;
    private manualPairingCode!: string;
    private online: boolean = false;
    private passcode!: number;
    private discriminator!: number;
    private id!: string;
    private aggregator: any;
    private matterServer: any;
    private endpoints: {} = {};
    private deviceStorage: any;

    private constructor() {
        this.init();
    }

    private async loadVars() {
        const environment = Environment.default;
        const storageService = environment.get(StorageService);
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

    private async saveVars() {
        await this.deviceStorage.set({
            passcode: this.passcode,
            discriminator: this.discriminator,
            uniqueid: this.id
        });
    }

    private async init() {
        await this.loadVars();
        await this.deploy();
    }

    private randomNumber(min: number, max: number) {
        return Math.round(Math.random() * (max - min) + min);
    }

    private getID() {
        let bytes: any[] = [];
        for (let i = 0; i < 8; i++) {
            bytes.push(Math.round(0xff * Math.random()).toString(16).padStart(2, '0'));
        }
        return bytes.join("");
    }

    public static get instance(): MatterHub {
        if (!MatterHub.#instance) {
            MatterHub.#instance = new MatterHub();
        }
        return MatterHub.#instance;
    }

    public async deploy() {
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
                deviceType: AggregatorEndpoint.deviceType,
            },
            basicInformation: {
                vendorName: "matter.js",
                vendorId: VendorId(65521),
                nodeLabel: name,
                productName: name,
                productLabel: name,
                productId: 1,
                serialNumber: `Hub-${this.id}`.substring(0, 30),
                uniqueId: this.id.substring(0, 30),
            }
        };

        ServerNode
            .create(serverOpts)
            .then((resolve) => {
                this.matterServer = resolve;
                this.aggregator = new Endpoint(AggregatorEndpoint, { id: "matterHub" });
                this.matterServer.add(this.aggregator)
                    .then(() => {
                        this.started = true;
                        for (const e in this.endpoints) {
                            this.addDevice(this.endpoints[e]);
                        }
                        this.matterServer.bringOnline().then(() => {
                            setTimeout(() => {
                                logEndpoint(EndpointServer.forEndpoint(this.matterServer));
                            }, 3500);
                        }).catch((error) => {
                            console.log("problem bringing matter server online", error);
                        })
                    }).catch((e) => {
                        console.log(e)
                    });


                this.commissioned = this.matterServer.lifecycle.isCommissioned;
                this.online = this.matterServer.lifecycle.isOnline;

                const qrPairingCode = this.matterServer.state.commissioning.pairingCodes.qrPairingCode;
                this.manualPairingCode = this.matterServer.state.commissioning.pairingCodes.manualPairingCode;
                this.qrcode = QrCode.get(qrPairingCode);
                this.qrcodeURL = `https://project-chip.github.io/connectedhomeip/qrcode.html?data=${qrPairingCode}`;
            }).catch((error) => {
                console.error("Issue with matter server deployment", error);
            });

    }
    public addDevice(endpoint: Endpoint) {
        if (!this.started || !this.aggregator) {
            this.endpoints[endpoint.id] = endpoint;
        } else {
            try {
                this.endpoints[endpoint.id] = endpoint;
                this.aggregator.add(endpoint);
            } catch (e) {
                console.log(e);
                console.log(endpoint);
            }
        }
    }

    public getStatus() {
        return {
            online: this.online,
            commissioned: this.commissioned,
            qrcode: this.qrcode,
            qrcodeURL: this.qrcodeURL,
            manualPairingCode: this.manualPairingCode
        }
    }

    public async reInitialise() {
        await this.matterServer.cancel();
        await this.matterServer.factoryReset();
        this.id = this.getID();
        await this.saveVars();
        this.deploy();
    }

    public async killDevice(id: string) {
        if (Object.hasOwn(this.endpoints, id)) {
            await this.endpoints[id].destroy();
            delete (this.endpoints[id]);
        }
    }

    public async removeDevice(id: string) {
        if (Object.hasOwn(this.endpoints, id)) {
            await this.endpoints[id].close();
            delete (this.endpoints[id]);
        }
        if (Object.keys(this.endpoints).length == 0) {
            await this.shutDown();
        }
    }

    public async shutDown() {
        await this.matterServer.cancel();
    }
}

export const matterHub = MatterHub.instance;