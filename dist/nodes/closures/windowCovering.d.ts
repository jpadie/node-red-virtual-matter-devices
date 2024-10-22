import "@project-chip/matter-node.js";
import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";
export declare class windowCovering extends BaseEndpoint {
    private withs;
    constructor(node: Node, config: any, name?: any);
    setStatus(): void;
    deploy(): Promise<void>;
}
