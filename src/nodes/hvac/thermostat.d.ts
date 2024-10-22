import "@project-chip/matter-node.js";
import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";
export declare class thermostat extends BaseEndpoint {
    private heating_coolingState;
    constructor(node: Node, config: any, _name?: any);
    setStatus(): void;
    regularUpdate(): void;
    listenForChange_postProcess(): void;
    deriveOnOff(): boolean | undefined;
    deploy(): Promise<void>;
}
