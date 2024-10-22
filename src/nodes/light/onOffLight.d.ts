import "@project-chip/matter-node.js";
import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";
export declare class onOffLight extends BaseEndpoint {
    constructor(node: Node, config: any, _name?: any);
    getVerbose(item: any, value: any): any;
    setStatus(): void;
    deploy(): Promise<void>;
}
