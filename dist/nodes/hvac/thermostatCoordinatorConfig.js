"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThermostatCoordinatorConfig = void 0;
type: module;
class ThermostatCoordinatorConfig {
    modes = new Map();
    members = new Map();
    node;
    config;
    constructor(node, config) {
        this.node = node;
        this.config = config;
        if (!this.modes.has(this.id)) {
            this.modes.set(this.id, this.config.initialMode || 'Off');
        }
    }
    get id() {
        return this.node.id;
    }
    getMode(coordinatorId) {
        const id = coordinatorId || this.id;
        return this.modes.get(id) || 'Off';
    }
    setMode(mode, coordinatorId) {
        const id = coordinatorId || this.id;
        this.modes.set(id, mode);
        this.node.debug(`Coordinator ${id} mode set to: ${mode}`);
        this.notifyThermostats(id, mode);
    }
    registerThermostat(thermostatId, coordinatorId) {
        const id = coordinatorId || this.id;
        if (!this.members.has(id)) {
            this.members.set(id, new Set());
        }
        this.members.get(id).add(thermostatId);
        this.node.debug(`Thermostat ${thermostatId} registered with coordinator ${id}`);
    }
    unregisterThermostat(thermostatId, coordinatorId) {
        const id = coordinatorId || this.id;
        const members = this.members.get(id);
        if (members) {
            members.delete(thermostatId);
            this.node.debug(`Thermostat ${thermostatId} unregistered from coordinator ${id}`);
        }
    }
    getRegisteredThermostats(coordinatorId) {
        const id = coordinatorId || this.id;
        const members = this.members.get(id);
        return members ? Array.from(members) : [];
    }
    notifyThermostats(coordinatorId, mode) {
        const members = this.members.get(coordinatorId);
        if (members) {
            members.forEach(thermostatId => {
                const thermostatNode = globalThis.RED?.nodes?.getNode(thermostatId);
                if (thermostatNode && thermostatNode.coordinatedThermostat) {
                    thermostatNode.coordinatedThermostat.onCoordinatorModeChange(mode);
                }
            });
        }
    }
    static instance = null;
    static getInstance() {
        return ThermostatCoordinatorConfig.instance;
    }
    static setInstance(instance) {
        ThermostatCoordinatorConfig.instance = instance;
    }
}
exports.ThermostatCoordinatorConfig = ThermostatCoordinatorConfig;
globalThis.RED?.nodes?.registerType('matter-thermostat-coordinator-config', ThermostatCoordinatorConfig);
//# sourceMappingURL=thermostatCoordinatorConfig.js.map