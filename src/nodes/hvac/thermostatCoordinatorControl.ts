type: module
import type { Node } from 'node-red';
import type { ThermostatCoordinatorConfig, HvacGlobalMode } from './thermostatCoordinatorConfig';

export class ThermostatCoordinatorControl {
    private coordinatorConfig: ThermostatCoordinatorConfig | null = null;
    private node: Node;
    private config: any;

    constructor(node: Node, config: any) {
        this.node = node;
        this.config = config;
        
        // Get reference to the coordinator config node
        if (config.coordinatorId) {
            this.coordinatorConfig = (globalThis as any).RED?.nodes?.getNode(config.coordinatorId) as ThermostatCoordinatorConfig;
        }

        this.node.on('input', (msg, send, done) => {
            this.handleInput(msg, send, done);
        });

        this.node.on('close', () => {
            // Cleanup if needed
        });
    }

    private handleInput(msg: any, send: any, done: any): void {
        if (!this.coordinatorConfig) {
            this.node.error('No coordinator config node configured');
            done?.();
            return;
        }

        const payload = msg.payload;
        const desiredMode = payload?.mode ?? payload;

        if (desiredMode && ['Heat', 'Cool', 'Off'].includes(desiredMode)) {
            this.coordinatorConfig.setMode(desiredMode as HvacGlobalMode);
            this.node.status({
                fill: "green",
                shape: "dot", 
                text: `Mode: ${desiredMode}`
            });
        }

        // Send current status
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

// Node-RED registration
(globalThis as any).RED?.nodes?.registerType('matter-thermostat-coordinator-control', ThermostatCoordinatorControl);