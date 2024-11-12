import { OccupancySensorDevice } from "@matter/main/devices"
import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint"
import { BridgedDeviceBasicInformationServer } from "@matter/main/behaviors"
import { Endpoint } from "@matter/main"

export class occupancySensor extends BaseEndpoint {

    constructor(node: Node, config: any) {
        super(node, config);
        this.name = this.config.name || "Contact Sensor"

        this.mapping = {   //must be a 1 : 1 mapping
            occupied: {
                occupancySensing: {
                    occupancy: "occupied"
                },
                multiplier: 1,
                unit: ""
            }
        }
        this.attributes.serialNumber = "occ-" + this.attributes.serialNumber;
    }

    override setStatus() {
        this.node.status({
            fill: "green",
            shape: "dot",
            text: `${this.context.occupied ? "Occupied" : "Empty"}`
        });
    }
    override preProcessDeviceChanges(value: any, item) {
        if (item == "occupancy$Changed") {
            return value.occupied;
        }
        return value;

    }
    override listenForMessages() {
        this.node.on("input", (msg: any, send, done) => {
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
                }
                this.endpoint.set(payload);
                done();
            } catch (e) {
                if (e instanceof Error) {
                    done(e);
                }
                this.node.error(e);
                done();
            }
        });
    }

    override async deploy() {
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
        }
        this.saveContext();
        try {
            this.endpoint = new Endpoint(OccupancySensorDevice.with(BridgedDeviceBasicInformationServer), this.attributes);
            this.listen();
            this.regularUpdate();
            this.setStatus();

        } catch (e) {
            this.node.error(e);
        }
    }
}