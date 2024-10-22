"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pump = void 0;
const endpoint_1 = require("@project-chip/matter.js/endpoint");
const bridged_device_basic_information_1 = require("@project-chip/matter.js/behaviors/bridged-device-basic-information");
const PumpDevice_1 = require("@project-chip/matter.js/devices/PumpDevice");
const onOffLight_1 = require("../light/onOffLight");
class pump extends onOffLight_1.onOffLight {
    constructor(node, config, _name = "") {
        let name = config.name || _name || "Pump";
        super(node, config, name);
        this.mapping = {
            ...this.mapping,
        };
        this.attributes.serialNumber = "pump-" + this.attributes.serialNumber;
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
            this.endpoint = await new endpoint_1.Endpoint(PumpDevice_1.PumpDevice.with(bridged_device_basic_information_1.BridgedDeviceBasicInformationServer, PumpDevice_1.PumpRequirements.OnOffServer, PumpDevice_1.PumpRequirements.PumpConfigurationAndControlServer.with("Automatic", "CompensatedPressure", "ConstantFlow", "ConstantPressure", "ConstantSpeed", "ConstantTemperature", "LocalOperation")), this.attributes);
        }
        catch (e) {
            this.node.error(e);
        }
    }
}
exports.pump = pump;
//# sourceMappingURL=pump.js.map