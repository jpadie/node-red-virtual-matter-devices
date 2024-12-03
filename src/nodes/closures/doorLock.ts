import { BridgedDeviceBasicInformationServer } from "@matter/main/behaviors"
import { Endpoint } from "@matter/main";
import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";
import { DoorLockDevice } from "@matter/main/devices"
    ;
import { DoorLock } from "@matter/main/clusters";


export class doorLock extends BaseEndpoint {

    constructor(node: Node, config: any, _name: any = "") {
        let name = _name || config.name || "Door Lock"
        super(node, config, name);

        this.mapping = {   //must be a 1 : 1 mapping
            lock: { doorLock: "lockState", multiplier: 1, unit: "", matter: { valueType: "int" }, context: { valueType: "int" } },
            mode: { doorLock: "operatingMode", multiplier: 1, unit: "", matter: { valueType: "int" }, context: { valueType: "int" } }
        }

        this.setDefault("lock", DoorLock.LockState.Unlocked);
        this.setDefault("mode", DoorLock.OperatingMode.Normal);

        this.setSerialNumber("dlk-");

        this.attributes.doorLock = {
            supportedOperatingModes: {
                normal: true,
                vacation: true,
                noRemoteLockUnlock: true,
                passage: true,
                privacy: true
            },
            operatingMode: this.context.mode,
            lockType: parseInt(this.config.doorLockType),
            lockState: this.context.lock,
            actuatorEnabled: true,
        }

    }

    override getVerbose(item, value) {
        switch (item) {
            case "mode":
                if (!Number.isNaN(value)) {
                    return this.getEnumKeyByEnumValue(DoorLock.OperatingMode, value);
                    //return Object.keys().find(key => DoorLock.OperatingMode[key] === value)
                } else {
                    return value;
                }
                break;
            case "lock":
                if (!Number.isNaN(value)) {
                    return this.getEnumKeyByEnumValue(DoorLock.LockState, value);
                    //return Object.keys(DoorLock.LockState).find(key => DoorLock.LockState[key] === value)
                } else {
                    return value;
                }
                break;
            default:
                return value;
        }
    }
    override getStatusText() {
        let text = `State: ${this.getVerbose("lock", this.context.lock)} (${this.getVerbose("mode", this.context.mode)} Mode)`;
        return text;
    }

    override async deploy() {
        try {
            this.endpoint = await new Endpoint(DoorLockDevice.with(
                BridgedDeviceBasicInformationServer
            ),
                this.attributes
            );

        } catch (e) {
            this.node.error("Error creating endpoint: " + e);
        }
    }
}