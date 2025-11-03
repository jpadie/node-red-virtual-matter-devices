type: module
import type { Node } from 'node-red';

export type HvacGlobalMode = 'Heat' | 'Cool' | 'Off';

export class ThermostatCoordinatorConfig {
    private modes: Map<string, HvacGlobalMode> = new Map();
    private members: Map<string, Set<string>> = new Map();
    private node: Node;
    private config: any;

    constructor(node: Node, config: any) {
        this.node = node;
        this.config = config;
        
        // Initialize with default mode if not set
        if (!this.modes.has(this.id)) {
            this.modes.set(this.id, this.config.initialMode || 'Off');
        }
    }

    get id(): string {
        return this.node.id;
    }

    getMode(coordinatorId?: string): HvacGlobalMode {
        const id = coordinatorId || this.id;
        return this.modes.get(id) || 'Off';
    }

    setMode(mode: HvacGlobalMode, coordinatorId?: string): void {
        const id = coordinatorId || this.id;
        this.modes.set(id, mode);
        this.node.debug(`Coordinator ${id} mode set to: ${mode}`);
        
        // Notify all registered thermostats of mode change
        this.notifyThermostats(id, mode);
    }

    registerThermostat(thermostatId: string, coordinatorId?: string): void {
        const id = coordinatorId || this.id;
        if (!this.members.has(id)) {
            this.members.set(id, new Set());
        }
        this.members.get(id)!.add(thermostatId);
        this.node.debug(`Thermostat ${thermostatId} registered with coordinator ${id}`);
    }

    unregisterThermostat(thermostatId: string, coordinatorId?: string): void {
        const id = coordinatorId || this.id;
        const members = this.members.get(id);
        if (members) {
            members.delete(thermostatId);
            this.node.debug(`Thermostat ${thermostatId} unregistered from coordinator ${id}`);
        }
    }

    getRegisteredThermostats(coordinatorId?: string): string[] {
        const id = coordinatorId || this.id;
        const members = this.members.get(id);
        return members ? Array.from(members) : [];
    }

    private notifyThermostats(coordinatorId: string, mode: HvacGlobalMode): void {
        const members = this.members.get(coordinatorId);
        if (members) {
            members.forEach(thermostatId => {
                // Find the thermostat node and notify it of mode change
                const thermostatNode = (globalThis as any).RED?.nodes?.getNode(thermostatId);
                if (thermostatNode && thermostatNode.coordinatedThermostat) {
                    thermostatNode.coordinatedThermostat.onCoordinatorModeChange(mode);
                }
            });
        }
    }

    // Static registry for global access
    private static instance: ThermostatCoordinatorConfig | null = null;
    
    static getInstance(): ThermostatCoordinatorConfig | null {
        return ThermostatCoordinatorConfig.instance;
    }
    
    static setInstance(instance: ThermostatCoordinatorConfig): void {
        ThermostatCoordinatorConfig.instance = instance;
    }
}

// Node-RED registration
(globalThis as any).RED?.nodes?.registerType('matter-thermostat-coordinator-config', ThermostatCoordinatorConfig);