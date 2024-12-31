"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.occupancySensor = void 0;
const devices_1 = require("@matter/main/devices");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
class occupancySensor extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config, _name = "") {
        let name = _name || "Contact Sensor";
        super(node, config, name);
        this.mapping = {
            occupied: {
                occupancySensing: {
                    occupancy: "occupied"
                },
                multiplier: 1,
                unit: "",
                matter: { valueType: "boolean" },
                context: { valueType: "int" }
            }
        };
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
        };
        this.device = devices_1.OccupancySensorDevice;
    }
    getVerbose(item, value = "") {
        if (value = "") {
            if (Object.hasOwn(this.context, item)) {
                value = this.context[item];
            }
        }
        switch (item) {
            case "occupied":
                return value ? "Occupied" : "Empty";
                break;
            default:
                return super.getVerbose(item, value);
        }
    }
}
exports.occupancySensor = occupancySensor;
//# sourceMappingURL=occupancySensor.js.map