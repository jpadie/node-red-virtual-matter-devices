import "@project-chip/matter-node.js";
import type { Node } from 'node-red';
import { dimmableLight } from "../light/dimmableLight";
export declare class dimmablePlug extends dimmableLight {
    constructor(node: Node, config: any, _name?: any);
    deploy(): Promise<void>;
}
