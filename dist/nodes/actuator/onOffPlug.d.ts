import "@project-chip/matter-node.js";
import type { Node } from 'node-red';
import { onOffLight } from "../light/onOffLight";
export declare class onOffPlug extends onOffLight {
    constructor(node: Node, config: any, _name?: any);
    deploy(): Promise<void>;
}
