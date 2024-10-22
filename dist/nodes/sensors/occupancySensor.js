"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.occupancySensor = void 0;
const endpoint_1 = require("@project-chip/matter.js/endpoint");
const OccupancySensorDevice_1 = require("@project-chip/matter.js/devices/OccupancySensorDevice");
const bridged_device_basic_information_1 = require("@project-chip/matter.js/behaviors/bridged-device-basic-information");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
class occupancySensor extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config) {
        super(node, config);
        this.name = this.config.name || "Contact Sensor";
        this.mapping = {
            occupied: {
                occupancySensing: {
                    occupancy: "occupied"
                },
                multiplier: 1,
                unit: ""
            }
        };
        this.attributes.serialNumber = "occ-" + this.attributes.serialNumber;
    }
    setStatus() {
        this.node.status({
            fill: "green",
            shape: "dot",
            text: `${this.context.occupied ? "Occupied" : "Empty"}`
        });
    }
    preProcessDeviceChanges(value, item) {
        if (item == "occupancy$Changed") {
            return value.occupied;
        }
        return value;
    }
    listenForMessages() {
        this.node.on("input", (msg, send, done) => {
            if (this.config.passThroughMessage) {
                send(msg);
            }
            try {
                let payload = {
                    occupancySensing: {
                        occupancy: {
                            occupied: msg.payload.occupied ? 1 : 0
                        }
                    }
                };
                this.endpoint.set(payload);
                done();
            }
            catch (e) {
                if (e instanceof Error) {
                    done(e);
                }
                this.node.error(e);
                done();
            }
        });
    }
    async deploy() {
        this.context = Object.assign({
            occupied: false,
            lastHeardFrom: ""
        }, this.context);
        this.attributes = {
            ...this.attributes,
            occupancySensing: {
                occupancy: {
                    occupied: this.context.occupied ? true : false
                },
                occupancySensorTypeBitmap: {
                    pir: true,
                    ultrasonic: true,
                    physicalContact: false
                },
                occupancySensorType: 2
            }
        };
        this.saveContext();
        try {
            this.endpoint = new endpoint_1.Endpoint(OccupancySensorDevice_1.OccupancySensorDevice.with(bridged_device_basic_information_1.BridgedDeviceBasicInformationServer), this.attributes);
            this.listen();
            this.regularUpdate();
            this.setStatus();
        }
        catch (e) {
            this.node.error(e);
        }
    }
}
exports.occupancySensor = occupancySensor;
//# sourceMappingURL=occupancySensor.js.map