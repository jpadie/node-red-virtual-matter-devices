import type { NodeDef } from 'node-red';
export interface AbstractNodeConfig extends NodeDef {
    serverNode: string;
    sensorType: string;
    telemetryInterval: number;
    regularUpdates: number;
    passThroughMessage: number;
    supportsTemperature?: number;
    supportsHumidity?: number;
    supportsCO?: number;
    supportsCO2?: number;
    supportsNO2?: number;
    supportsOzone?: number;
    supportsTVOC?: number;
    supportsPM1?: number;
    supportsPM25?: number;
    supportsPM10?: number;
    supportsRadon?: number;
    supportsFormaldehyde?: number;
    reportAirQualityString?: number;
}