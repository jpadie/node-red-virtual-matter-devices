export type DeviceId = string;

export interface OpenCloseState {
  openPercent: number; // 0..100
}

export interface DeviceDescriptor {
  id: DeviceId;
  type: string; // action.devices.types.*
  traits: string[]; // action.devices.traits.*
  name: { name: string };
  willReportState: boolean;
  attributes?: Record<string, unknown>;
  roomHint?: string;
  deviceInfo?: {
    manufacturer?: string;
    model?: string;
    hwVersion?: string;
    swVersion?: string;
  };
}

export interface QueryResult {
  online: boolean;
  openPercent?: number;
}


