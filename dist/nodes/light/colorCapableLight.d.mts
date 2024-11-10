import "@project-chip/matter-node.js";
import type { Node } from 'node-red';
import { dimmableLight } from "node-red-contrib-matter.js/src/nodes/light/dimmableLight.js";
export declare class colorLight extends dimmableLight {
    constructor(node: Node, config: any, _name?: any);
    getVerbose(item: any, value: any): any;
    convertHSVtoXY(hue: any, saturation: any, brightness: any): {
        x: number;
        y: number;
    };
    convertXYtoRGB(vX: any, vY: any): {
        r: number;
        g: number;
        b: number;
    };
    convertRGBtoXY(red: any, green: any, blue: any): {
        x: number;
        y: number;
    };
    convertHSVtoRGB(h: any, s: any, v: any): {
        r: number;
        g: number;
        b: number;
    };
    getColorName(r: any, g: any, b: any): string;
    convertXYtoHSV(x: any, y: any): {
        h: number;
        s: any;
        v: any;
    };
    preProcessOutputReport(report: any): any;
    getStatusText(): Promise<string>;
    setStatus(): Promise<void>;
    listenForChange_postProcess(report?: any): void;
    preProcessNodeRedInput(item: any, value: any): {
        a: any;
        b: any;
    };
    deploy(): Promise<void>;
}
