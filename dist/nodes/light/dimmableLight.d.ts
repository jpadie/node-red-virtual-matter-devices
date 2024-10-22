import "@project-chip/matter-node.js";
import type { Node } from 'node-red';
import { onOffLight } from "./onOffLight";
export declare class dimmableLight extends onOffLight {
    constructor(node: Node, config: any, _name?: any);
    getVerbose(item: any, value: any): any;
    setStatus(): void;
    deploy(): Promise<void>;
}
