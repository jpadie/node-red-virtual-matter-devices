type: module
import "@project-chip/matter-node.js";
import type { Node, NodeAPI } from 'node-red';
/* tslint:disable */

import { contactSensor } from "./contactSensor";
import { flowSensor } from "./flowSensor";
import { humiditySensor } from "./humiditySensor";
import { occupancySensor } from "./occupancySensor";
import { pressureSensor } from "./pressureSensor";
import { rainSensor } from "./rainSensor";
import { temperatureSensor } from "./temperatureSensor";
import { waterFreezeDetectorDevice } from "./waterFreezeDetector";
import { waterLeakDetector } from "./waterLeakDetector";
import { airQualitySensor } from "./airQualitySensor";
import { lightSensor } from "./lightSensor";


module.exports = (RED: NodeAPI): void => {
    function MatterSensors(this: Node, config: any) {
        let device: any;

        RED.nodes.createNode(this, config);

        /*if (config.serverNode) {
            matterServer = RED.nodes.getNode(config.serverNode);
        } else {
            return;
        }
        */
        let module: any;
        switch (config.sensorType) {
            case "contactSensor": module = contactSensor; break;
            case "flowSensor": module = flowSensor; break;
            case "humiditySensor": module = humiditySensor; break;
            case "occupancySensor": module = occupancySensor; break;
            case "pressureSensor": module = pressureSensor; break;
            case "rainSensor": module = rainSensor; break;
            case "temperatureSensor": module = temperatureSensor; break;
            case "waterFreezeDetector": module = waterFreezeDetectorDevice; break;
            case "waterLeakDetector": module = waterLeakDetector; break;
            case "airQualitySensor": module = airQualitySensor; break;
            case "lightSensor": module = lightSensor; break;
            default:
                this.error("Invalid sensor type provided");
                return;
        }

        device = new module(this, config);

        device.getEndpoint();
        /*.then((endpoint) => {
            matterServer.addDevice(endpoint);
        });
        */
    };

    RED.nodes.registerType('matter-sensors', MatterSensors);
}