import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";
export declare class occupancySensor extends BaseEndpoint {
    constructor(node: Node, config: any);
    setStatus(): void;
    preProcessDeviceChanges(value: any, item: any): any;
    listenForMessages(): void;
    deploy(): Promise<void>;
}
