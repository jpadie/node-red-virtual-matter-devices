import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";
export declare class temperatureSensor extends BaseEndpoint {
    constructor(node: Node, config: any);
    deploy(): Promise<void>;
}
