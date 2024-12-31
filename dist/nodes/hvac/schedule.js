"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const behaviors_1 = require("@matter/main/behaviors");
const devices_1 = require("@matter/main/devices");
const main_1 = require("@matter/main");
const clusters_1 = require("@matter/main/clusters");
class Schedule {
    constructor() {
        const endpoint = new main_1.Endpoint(devices_1.ThermostatDevice.withBehaviors(behaviors_1.ThermostatServer.withFeatures(clusters_1.Thermostat.Feature.ScheduleConfiguration, clusters_1.Thermostat.Feature.Heating)), {
            id: "something",
            thermostat: {
                numberOfDailyTransitions: 4,
            }
        });
        endpoint.thermostat.
        ;
    }
}
//# sourceMappingURL=schedule.js.map