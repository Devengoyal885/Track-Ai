/**
 * TrackAI — Vehicle store (Zustand) for real-time vehicle tracking
 */

import { create } from 'zustand';

export interface LiveVehicle {
  id: number;
  plate_number: string;
  vehicle_type: string;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  camera_id: number;
  confidence: number;
  timestamp: string;
  // For smooth animation, track previous position
  prev_latitude?: number;
  prev_longitude?: number;
}

interface VehicleStore {
  vehicles: Map<number, LiveVehicle>;
  updateVehicle: (vehicle: LiveVehicle) => void;
  getVehicleList: () => LiveVehicle[];
}

export const useVehicleStore = create<VehicleStore>((set, get) => ({
  vehicles: new Map(),
  updateVehicle: (vehicle) =>
    set((state) => {
      const newMap = new Map(state.vehicles);
      const existing = newMap.get(vehicle.id);
      if (existing) {
        vehicle.prev_latitude = existing.latitude;
        vehicle.prev_longitude = existing.longitude;
      }
      newMap.set(vehicle.id, vehicle);
      return { vehicles: newMap };
    }),
  getVehicleList: () => Array.from(get().vehicles.values()),
}));
