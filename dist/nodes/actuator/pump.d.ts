import type { Node } from 'node-red';
import { onOffLight } from "../light/onOffLight";
export declare class pump extends onOffLight {
    constructor(node: Node, config: any, _name?: any);
    setStatus(): void;
    deploy(): Promise<void>;
}
