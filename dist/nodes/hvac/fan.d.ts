import "@project-chip/matter-node.js";
import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";
import { FanControl } from "@project-chip/matter.js/cluster";
export declare class fan extends BaseEndpoint {
    features: FanControl.Feature[];
    constructor(node: Node, config: any, _name?: any);
    regularUpdate(): void;
    getVerbose(item: any, value: any): any;
    setStatus(): void;
    deploy(): Promise<void>;
}
