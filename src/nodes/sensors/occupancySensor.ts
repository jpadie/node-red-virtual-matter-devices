import { OccupancySensorDevice } from "@matter/main/devices"
import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint"

export class occupancySensor extends BaseEndpoint {

    constructor(node: Node, config: any, _name: string = "") {
        let name = _name || "Contact Sensor"
        super(node, config, name);

        this.mapping = {   //must be a 1 : 1 mapping
            occupied: {
                occupancySensing: {
                    occupancy: "occupied"
                },
                multiplier: 1,
                unit: "",
                matter: { valueType: "boolean" },
                context: { valueType: "int" }
            }
        }
        this.setSerialNumber("occ-");
        this.setDefault("occupied", 0);
        this.attributes = {
            ...this.attributes,
            occupancySensing: {
                occupancy: {
                    occupied: this.contextToMatter("occupied", this.context.occupied)
                },
                occupancySensorTypeBitmap: {
                    pir: true,
                    ultrasonic: true,
                    physicalContact: false
                },
                occupancySensorType: 2
            }
        }
        this.device = OccupancySensorDevice;
    }

    override getVerbose(item: any, value: any = "") {
        if (value = "") {
            if (Object.hasOwn(this.context, item)) {
                value = this.context[item]
            }
        }
        switch (item) {
            case "occupied":
                return value ? "Occupied" : "Empty"
                break;
            default:
                return super.getVerbose(item, value);
        }
    }
    /*

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
*/

}