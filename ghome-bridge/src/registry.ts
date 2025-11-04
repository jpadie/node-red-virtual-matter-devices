import { DeviceDescriptor, DeviceId, OpenCloseState, QueryResult } from "./types";

class Registry {
  private devices: Map<DeviceId, DeviceDescriptor> = new Map();
  private state: Map<DeviceId, OpenCloseState> = new Map();

  bootstrapDemoDevices() {
    const gate: DeviceDescriptor = {
      id: "virtual_gate_1",
      type: "action.devices.types.GATE",
      traits: ["action.devices.traits.OpenClose"],
      name: { name: "Virtual Gate" },
      willReportState: true,
      attributes: {
        // No discreteOnlyOpenClose attribute → supports percentage
      },
      deviceInfo: { manufacturer: "jpadie", model: "vh-gate" }
    };
    const garage: DeviceDescriptor = {
      id: "virtual_garage_1",
      type: "action.devices.types.GARAGEDOOR",
      traits: ["action.devices.traits.OpenClose"],
      name: { name: "Virtual Garage" },
      willReportState: true,
      attributes: {},
      deviceInfo: { manufacturer: "jpadie", model: "vh-garage" }
    };
    this.addDevice(gate, { openPercent: 0 });
    this.addDevice(garage, { openPercent: 0 });
  }

  addDevice(desc: DeviceDescriptor, initial: OpenCloseState) {
    this.devices.set(desc.id, desc);
    this.state.set(desc.id, initial);
  }

  listDevices(): DeviceDescriptor[] {
    return Array.from(this.devices.values());
  }

  getState(id: DeviceId): QueryResult | undefined {
    const s = this.state.get(id);
    if (!s) return undefined;
    return { online: true, openPercent: s.openPercent };
  }

  setOpenPercent(id: DeviceId, openPercent: number) {
    if (!this.state.has(id)) return;
    const clamped = Math.max(0, Math.min(100, Math.round(openPercent)));
    this.state.set(id, { openPercent: clamped });
  }
}

export const registry = new Registry();


