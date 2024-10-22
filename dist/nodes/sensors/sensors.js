"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
type: module;
require("@project-chip/matter-node.js");
const contactSensor_1 = require("./contactSensor");
const flowSensor_1 = require("./flowSensor");
const humiditySensor_1 = require("./humiditySensor");
const occupancySensor_1 = require("./occupancySensor");
const pressureSensor_1 = require("./pressureSensor");
const rainSensor_1 = require("./rainSensor");
const temperatureSensor_1 = require("./temperatureSensor");
const waterFreezeDetector_1 = require("./waterFreezeDetector");
const waterLeakDetector_1 = require("./waterLeakDetector");
const airQualitySensor_1 = require("./airQualitySensor");
const lightSensor_1 = require("./lightSensor");
module.exports = (RED) => {
    function MatterSensors(config) {
        let device;
        RED.nodes.createNode(this, config);
        let module;
        switch (config.sensorType) {
            case "contactSensor":
                module = contactSensor_1.contactSensor;
                break;
            case "flowSensor":
                module = flowSensor_1.flowSensor;
                break;
            case "humiditySensor":
                module = humiditySensor_1.humiditySensor;
                break;
            case "occupancySensor":
                module = occupancySensor_1.occupancySensor;
                break;
            case "pressureSensor":
                module = pressureSensor_1.pressureSensor;
                break;
            case "rainSensor":
                module = rainSensor_1.rainSensor;
                break;
            case "temperatureSensor":
                module = temperatureSensor_1.temperatureSensor;
                break;
            case "waterFreezeDetector":
                module = waterFreezeDetector_1.waterFreezeDetectorDevice;
                break;
            case "waterLeakDetector":
                module = waterLeakDetector_1.waterLeakDetector;
                break;
            case "airQualitySensor":
                module = airQualitySensor_1.airQualitySensor;
                break;
            case "lightSensor":
                module = lightSensor_1.lightSensor;
                break;
            default:
                this.error("Invalid sensor type provided");
                return;
        }
        device = new module(this, config);
        device.getEndpoint();
    }
    ;
    RED.nodes.registerType('matter-sensors', MatterSensors);
};
//# sourceMappingURL=sensors.js.map