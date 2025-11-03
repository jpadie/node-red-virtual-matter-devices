"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThermostatCoordinatorControl = void 0;
type: module;
class ThermostatCoordinatorControl {
    coordinatorConfig = null;
    node;
    config;
    constructor(node, config) {
        this.node = node;
        this.config = config;
        if (config.coordinatorId) {
            this.coordinatorConfig = globalThis.RED?.nodes?.getNode(config.coordinatorId);
        }
        this.node.on('input', (msg, send, done) => {
            this.handleInput(msg, send, done);
        });
        this.node.on('close', () => {
        });
    }
    handleInput(msg, send, done) {
        if (!this.coordinatorConfig) {
            this.node.error('No coordinator config node configured');
            done?.();
            return;
        }
        const payload = msg.payload;
        const desiredMode = payload?.mode ?? payload;
        if (desiredMode && ['Heat', 'Cool', 'Off'].includes(desiredMode)) {
            this.coordinatorConfig.setMode(desiredMode);
            this.node.status({
                fill: "green",
                shape: "dot",
                text: `Mode: ${desiredMode}`
            });
        }
        const currentMode = this.coordinatorConfig.getMode();
        const registeredThermostats = this.coordinatorConfig.getRegisteredThermostats();
        send({
            payload: {
                deviceName: this.node.name || 'Thermostat Coordinator Control',
                deviceType: 'hvac',
                messageSource: 'node-red input',
                coordinatorId: this.config.coordinatorId,
                mode: currentMode,
                registeredThermostats: registeredThermostats.length
            }
        });
        done?.();
    }
}
exports.ThermostatCoordinatorControl = ThermostatCoordinatorControl;
globalThis.RED?.nodes?.registerType('matter-thermostat-coordinator-control', ThermostatCoordinatorControl);
//# sourceMappingURL=thermostatCoordinatorControl.js.map