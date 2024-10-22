import "@project-chip/matter-node.js";
import type { Node } from 'node-red';
import { fan } from "./fan";
export declare class airPurifier extends fan {
    constructor(node: Node, config: any);
    getVerbose(item: any, value: any): any;
    setStatus(): void;
    deploy(): Promise<void>;
}
