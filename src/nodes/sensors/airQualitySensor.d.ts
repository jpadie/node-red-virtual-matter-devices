import type { Node } from 'node-red';
import { BaseEndpoint } from "../base/BaseEndpoint";
export declare class airQualitySensor extends BaseEndpoint {
    constructor(node: Node, config: any);
    getVerbose(item: any, value: any): string | undefined;
    regularUpdate(): void;
    setStatus(): void;
    deploy(): Promise<void>;
}
