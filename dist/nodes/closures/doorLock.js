"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doorLock = void 0;
require("@project-chip/matter-node.js");
const bridged_device_basic_information_1 = require("@project-chip/matter.js/behaviors/bridged-device-basic-information");
const endpoint_1 = require("@project-chip/matter.js/endpoint");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
const DoorLockDevice_1 = require("@project-chip/matter.js/devices/DoorLockDevice");
const cluster_1 = require("@project-chip/matter.js/cluster");
class doorLock extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config, _name = "") {
        let name = _name || config.name || "Door Lock";
        super(node, config, name);
        this.mapping = {
            lock: { doorLock: "lockState", multiplier: 1, unit: "" },
            mode: { doorLock: "operatingMode", multiplier: 1, unit: "" }
        };
        this.setDefault("lock", cluster_1.DoorLock.LockState.Unlocked);
        this.setDefault("mode", cluster_1.DoorLock.OperatingMode.Normal);
        this.attributes.serialNumber = "dlk-" + this.attributes.serialNumber;
        this.attributes.doorLock = {
            supportedOperatingModes: {
                normal: true,
                vacation: true,
                noRemoteLockUnlock: true,
                passage: false,
                privacy: true
            },
            operatingMode: this.context.mode,
            lockType: parseInt(this.config.doorLockType),
            lockState: this.context.lock,
            actuatorEnabled: true,
        };
    }
    getVerbose(item, value) {
        switch (item) {
            case "mode":
                if (!Number.isNaN(value)) {
                    return Object.keys(cluster_1.DoorLock.OperatingMode).find(key => cluster_1.DoorLock.OperatingMode[key] === value);
                }
                else {
                    return value;
                }
                break;
            case "state":
                if (!Number.isNaN(this.context.mode)) {
                    return Object.keys(cluster_1.DoorLock.LockState).find(key => cluster_1.DoorLock.LockState[key] === value);
                }
                else {
                    return value;
                }
                break;
            default:
                return value;
        }
    }
    setStatus() {
        let text = "State: " + this.getVerbose("mode", this.context.mode);
        try {
            this.node.status({
                fill: "green",
                shape: "dot",
                text: text
            });
        }
        catch (e) {
            this.node.error(e);
        }
    }
    async deploy() {
        try {
            this.endpoint = await new endpoint_1.Endpoint(DoorLockDevice_1.DoorLockDevice.with(bridged_device_basic_information_1.BridgedDeviceBasicInformationServer), this.attributes);
        }
        catch (e) {
            this.node.error("Error creating endpoint: " + e);
        }
    }
}
exports.doorLock = doorLock;
//# sourceMappingURL=doorLock.js.map