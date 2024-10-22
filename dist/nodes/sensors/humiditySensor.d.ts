import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";
export declare class humiditySensor extends BaseEndpoint {
    constructor(node: Node, config: any);
    deploy(): Promise<void>;
}
