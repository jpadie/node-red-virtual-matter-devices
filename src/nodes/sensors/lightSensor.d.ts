import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";
export declare class lightSensor extends BaseEndpoint {
    lx2val(value: number): number;
    val2lx(value: number): number;
    constructor(node: Node, config: any);
    deploy(): Promise<void>;
}
