import { Endpoint, EndpointServer, Environment, ServerNode, StorageService, VendorId } from "@matter/main";
import { AggregatorEndpoint } from "@matter/main/endpoints" ///aggregator";
import { logEndpoint } from "@matter/main/protocol";
import { QrCode } from "@matter/types";


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
    private shuttingDown: boolean = false;

    private constructor() {
        this.init();
    }

    private async loadVars() {
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
        const environment = Environment.default;
        const storageService = environment.get(StorageService);
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

    private async saveVars() {
        await this.deviceStorage.set({
            passcode: this.passcode,
            discriminator: this.discriminator,
            uniqueid: this.id
        })
    }

    private async init() {
        await this.loadVars();
        await this.deploy();
    }

    private randomNumber(min: number, max: number) {
        return Math.round(Math.random() * (max - min) + min);
    }

    private async getID() {
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
        //console.log(serverOpts);

        try {
            console.log(this.started)
            this.matterServer = await ServerNode.create(serverOpts);

            this.aggregator = new Endpoint(AggregatorEndpoint, { id: "matterHub" });
            await this.matterServer.add(this.aggregator);

            this.started = true;
            for (const e in this.endpoints) {
                this.addDevice(this.endpoints[e]);
            }

            await this.matterServer.start();
            await this.matterServer.construction;
            setTimeout(() => {
                logEndpoint(EndpointServer.forEndpoint(this.matterServer));
            }, 3500);
            this.queryStatus();

        } catch (error) {
            console.log(`[Matter Hub]: Error creating MatterHub. ${error}`);
            console.trace();
        }
    }

    public async addDevice(endpoint: Endpoint) {
        if (this.shuttingDown) {
            this.shuttingDown = false;
            this.deploy();
        }
        if (!this.started || !this.aggregator) {
            this.endpoints[endpoint.id] = endpoint;
        } else {
            try {
                this.endpoints[endpoint.id] = endpoint;
                await this.aggregator.add(endpoint);
            } catch (e) {
                console.log(e);
                console.log(endpoint);
            }
        }
    }
    private async queryStatus() {
        await this.matterServer.construction;
        if (this.matterServer.lifecycle.isOnline) {
            this.commissioned = this.matterServer.lifecycle.isCommissioned;
            this.online = this.matterServer.lifecycle.isOnline;

            const qrPairingCode = this.matterServer.state.commissioning.pairingCodes.qrPairingCode;
            this.manualPairingCode = this.matterServer.state.commissioning.pairingCodes.manualPairingCode;
            this.qrcode = QrCode.get(qrPairingCode);
            this.qrcodeURL = `https://project-chip.github.io/connectedhomeip/qrcode.html?data=${qrPairingCode}`;
        }
    }
    public getStatus() {
        if (!this.started) return {};
        this.queryStatus();
        return {
            online: this.online,
            commissioned: this.commissioned,
            qrcode: this.qrcode,
            qrcodeURL: this.qrcodeURL,
            manualPairingCode: this.manualPairingCode
        }
    }

    public async reInitialise() {
        this.started = false;
        if (this.matterServer.lifecycle.isOnline) {
            await this.matterServer.cancel(); // offline if it was online
        }
        await this.matterServer.erase();
        this.started = true;
        //await this.deploy();
        //await this.matterServer.start();
        //this.started = true;
        //console.log("finished redeploying");
        //restarting advertisement
        //this.matterServer.advertiseNow();
        setTimeout(() => {
            logEndpoint(EndpointServer.forEndpoint(this.matterServer));
        }, 2000);
    }

    public async killDevice(id: string) {
        return;
        console.log("in kill device for " + id);
        console.log("++++++++++++++++++");

        if (Object.hasOwn(this.endpoints, id)) {
            await this.endpoints[id].destroy();
            delete (this.endpoints[id]);
        }
    }

    public async removeDevice(id: string): Promise<Boolean> {
        return true;
        console.log("removing device " + id);
        console.log("+++++++++++++++++++++++++++++++++++");
        let response = false;
        if (Object.hasOwn(this.endpoints, id)) {
            await this.endpoints[id].close();
            delete (this.endpoints[id]);
            response = true;
        } else {
            console.debug("Not removing endpoint as endpoint ID does not exist: " + id);
        }
        if (Object.keys(this.endpoints).length == 0) {

            await this.shutDown();
        }
        return response;


    }

    public async timeToClose() {
        if (!this.shuttingDown) {
            console.log("Matter Hub shutting down");
            this.shuttingDown = true;
            await this.shutDown();
            return 1;
        }
        return 1;
    }
    public async shutDown() {
        this.started = false;
        await this.matterServer.cancel();
    }
}

export const matterHub = MatterHub.instance;