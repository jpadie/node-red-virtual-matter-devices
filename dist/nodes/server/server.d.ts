import { Endpoint } from "@project-chip/matter.js/endpoint";
declare class MatterHub {
    #private;
    private started;
    private qrcodeURL;
    private commissioned;
    private qrcode;
    private manualPairingCode;
    private online;
    private passcode;
    private discriminator;
    private id;
    private aggregator;
    private matterServer;
    private endpoints;
    private deviceStorage;
    private constructor();
    private loadVars;
    private saveVars;
    private init;
    private randomNumber;
    private getID;
    static get instance(): MatterHub;
    deploy(): Promise<void>;
    addDevice(endpoint: Endpoint): void;
    getStatus(): {
        online: boolean;
        commissioned: boolean;
        qrcode: string;
        qrcodeURL: string;
        manualPairingCode: string;
    };
    reInitialise(): Promise<void>;
    killDevice(id: string): Promise<void>;
    removeDevice(id: string): Promise<void>;
    shutDown(): Promise<void>;
}
export declare const matterHub: MatterHub;
export {};
