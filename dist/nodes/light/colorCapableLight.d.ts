import "@project-chip/matter-node.js";
import type { Node } from 'node-red';
import { dimmableLight } from "./dimmableLight";
export declare class colorLight extends dimmableLight {
    constructor(node: Node, config: any, _name?: any);
    getVerbose(item: any, value: any): any;
    setStatus(): void;
    deploy(): Promise<void>;
}
