"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doorLock = void 0;
const behaviors_1 = require("@matter/main/behaviors");
const main_1 = require("@matter/main");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
const devices_1 = require("@matter/main/devices");
const clusters_1 = require("@matter/main/clusters");
class doorLock extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config, _name = "") {
        let name = _name || config.name || "Door Lock";
        super(node, config, name);
        this.mapping = {
            lock: { doorLock: "lockState", multiplier: 1, unit: "", matter: { valueType: "int" }, context: { valueType: "int" } },
            mode: { doorLock: "operatingMode", multiplier: 1, unit: "", matter: { valueType: "int" }, context: { valueType: "int" } }
        };
        this.setDefault("lock", clusters_1.DoorLock.LockState.Unlocked);
        this.setDefault("mode", clusters_1.DoorLock.OperatingMode.Normal);
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
                    return Object.keys(clusters_1.DoorLock.OperatingMode).find(key => clusters_1.DoorLock.OperatingMode[key] === value);
                }
                else {
                    return value;
                }
                break;
            case "state":
                if (!Number.isNaN(this.context.mode)) {
                    return Object.keys(clusters_1.DoorLock.LockState).find(key => clusters_1.DoorLock.LockState[key] === value);
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
            this.endpoint = await new main_1.Endpoint(devices_1.DoorLockDevice.with(behaviors_1.BridgedDeviceBasicInformationServer), this.attributes);
        }
        catch (e) {
            this.node.error("Error creating endpoint: " + e);
        }
    }
}
exports.doorLock = doorLock;
//# sourceMappingURL=doorLock.js.map