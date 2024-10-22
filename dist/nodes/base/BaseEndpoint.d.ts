import "@project-chip/matter-node.js";
import { type Node, type NodeContext } from 'node-red';
export declare class BaseEndpoint {
    mapping: Record<string, any>;
    config: Record<string, any>;
    node: Node;
    endpoint: any;
    context: any;
    Context: NodeContext;
    attributes: Record<string, any>;
    name: string;
    state: Boolean;
    private skip;
    constructor(node: Node, config: Record<string, never>, name?: string);
    setSerialNumber(value: string): void;
    prune(item: any): void;
    regularUpdate(): void;
    deploy(): void;
    getEndpoint(): Promise<void>;
    now(): string;
    saveContext(): void;
    setStatus(): void;
    setDefault(item: any, value: any): void;
    getVerbose(item: any, value: any): any;
    preProcessDeviceChanges(value: any, item: any): any;
    listenForChange(): void;
    listenForChange_postProcess(): void;
    preProcessNodeRedInput(item: any, value: any): {
        a: any;
        b: any;
    };
    processIncomingMessages(msg: any, send: any, done: any): void;
    listenForMessages(): void;
    listen(): void;
    listenForClose(): void;
    lcFirst(val: any): any;
}
