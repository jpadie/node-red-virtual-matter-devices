import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";
export declare class contactSensor extends BaseEndpoint {
    constructor(node: Node, config: any);
    setStatus(): void;
    deploy(): Promise<void>;
}
