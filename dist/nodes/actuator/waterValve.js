"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waterValve = void 0;
const endpoint_1 = require("@project-chip/matter.js/endpoint");
const bridged_device_basic_information_1 = require("@project-chip/matter.js/behaviors/bridged-device-basic-information");
const BaseEndpoint_1 = require("../base/BaseEndpoint");
const WaterValveDevice_1 = require("@project-chip/matter.js/devices/WaterValveDevice");
const WaterValveDevice_2 = require("@project-chip/matter.js/devices/WaterValveDevice");
const cluster_1 = require("@project-chip/matter.js/cluster");
class waterValve extends BaseEndpoint_1.BaseEndpoint {
    constructor(node, config, _name = "") {
        let name = config.name || _name || "Water Valve";
        super(node, config, name);
        this.mapping = {
            ...this.mapping,
        };
        this.attributes.serialNumber = "wv-" + this.attributes.serialNumber;
        this.attributes.pumpConfigurationAndControl = {};
        this.attributes.pumpConfigutationAndControl = {
            maxSpeed: 65534,
            maxPressure: 3276,
            maxFlow: 6553.4,
            effectiveControlMode: 0,
            effectiveOperationMode: 0,
            capacity: 0
        };
        this.context = Object.assign({
            occupied: false,
            lastHeardFrom: ""
        }, this.context);
        this.attributes = {
            ...this.attributes,
        };
    }
    setStatus() {
        let text = '';
        this.node.status({
            fill: "green",
            shape: "dot",
            text: text
        });
    }
    async deploy() {
        try {
            this.endpoint = await new endpoint_1.Endpoint(WaterValveDevice_1.WaterValveDevice.with(bridged_device_basic_information_1.BridgedDeviceBasicInformationServer, WaterValveDevice_2.WaterValveRequirements.ValveConfigurationAndControlServer.with(cluster_1.ValveConfigurationAndControl.Feature.TimeSync, cluster_1.ValveConfigurationAndControl.Feature.Level)), {
                valveConfigurationAndControl: {
                    openDuration: ,
                    defaultOpenDuration,
                    autoCloseTime: 
                }
            }), ;
            ;
        }
        catch (e) {
            this.node.error(e);
        }
    }
}
exports.waterValve = waterValve;
//# sourceMappingURL=waterValve.js.map