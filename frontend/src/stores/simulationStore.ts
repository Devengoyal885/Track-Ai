/**
 * TrackAI — Simulation & Live Telemetry Store (Zustand)
 */

import { create } from 'zustand';
import { apiFetch } from '../lib/api';

export interface SimulatedVehicleData {
  id: number;
  plate_number: string;
  vehicle_type: string;
  color: string;
  is_blacklisted: boolean;
  blacklist_reason?: string | null;
  route_key: string;
  route_name: string;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  heading: number;
  progress: number;
}

export interface TelemetryDetection {
  id: number;
  vehicle_id: number;
  camera_id: number;
  camera_name: string;
  camera_location: string;
  plate_number: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  confidence: number;
  vehicle_type: string;
  color?: string;
  is_blacklisted?: boolean;
}

export interface SystemStats {
  vehicles_tracked_today: number;
  active_cameras: number;
  average_speed: number;
  open_alerts: number;
  total_detections_today: number;
}

interface SimulationStore {
  isRunning: boolean;
  speedMultiplier: number;
  activeVehicles: SimulatedVehicleData[];
  liveDetections: TelemetryDetection[];
  stats: SystemStats;
  selectedVehiclePlate: string | null;
  selectedCameraId: number | null;
  audioAlertsEnabled: boolean;

  setSimulationTick: (data: {
    is_running?: boolean;
    speed_multiplier?: number;
    vehicles: SimulatedVehicleData[];
  }) => void;
  addTelemetryDetection: (detection: TelemetryDetection) => void;
  setStats: (stats: SystemStats) => void;
  setSelectedVehiclePlate: (plate: string | null) => void;
  setSelectedCameraId: (id: number | null) => void;
  toggleAudioAlerts: () => void;

  startSimulation: () => Promise<void>;
  pauseSimulation: () => Promise<void>;
  setSpeedMultiplier: (speed: number) => Promise<void>;
  spawnSuspectVehicle: () => Promise<void>;
  triggerEmergencyAlert: (title?: string) => Promise<void>;
  resetSimulation: () => Promise<void>;
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  isRunning: true,
  speedMultiplier: 1.0,
  activeVehicles: [],
  liveDetections: [],
  stats: {
    vehicles_tracked_today: 48,
    active_cameras: 15,
    average_speed: 52.4,
    open_alerts: 5,
    total_detections_today: 184,
  },
  selectedVehiclePlate: null,
  selectedCameraId: null,
  audioAlertsEnabled: true,

  setSimulationTick: (data) =>
    set((state) => ({
      isRunning: data.is_running !== undefined ? data.is_running : state.isRunning,
      speedMultiplier: data.speed_multiplier !== undefined ? data.speed_multiplier : state.speedMultiplier,
      activeVehicles: data.vehicles,
    })),

  addTelemetryDetection: (detection) =>
    set((state) => ({
      liveDetections: [detection, ...state.liveDetections].slice(0, 60),
      stats: {
        ...state.stats,
        total_detections_today: state.stats.total_detections_today + 1,
      },
    })),

  setStats: (stats) => set({ stats }),
  setSelectedVehiclePlate: (plate) => set({ selectedVehiclePlate: plate }),
  setSelectedCameraId: (id) => set({ selectedCameraId: id }),
  toggleAudioAlerts: () => set((s) => ({ audioAlertsEnabled: !s.audioAlertsEnabled })),

  startSimulation: async () => {
    set({ isRunning: true });
    try {
      await apiFetch('/simulation/start', { method: 'POST' });
    } catch (e) {
      console.warn('Simulation start error:', e);
    }
  },

  pauseSimulation: async () => {
    set({ isRunning: false });
    try {
      await apiFetch('/simulation/pause', { method: 'POST' });
    } catch (e) {
      console.warn('Simulation pause error:', e);
    }
  },

  setSpeedMultiplier: async (speed: number) => {
    set({ speedMultiplier: speed });
    try {
      await apiFetch('/simulation/speed', {
        method: 'POST',
        body: JSON.stringify({ speed_multiplier: speed }),
      });
    } catch (e) {
      console.warn('Simulation speed error:', e);
    }
  },

  spawnSuspectVehicle: async () => {
    try {
      await apiFetch('/simulation/spawn', {
        method: 'POST',
        body: JSON.stringify({
          is_blacklisted: true,
          blacklist_reason: 'Emergency Alert: Stolen Vehicle / Hit-and-run Suspect',
        }),
      });
    } catch (e) {
      console.warn('Spawn error:', e);
    }
  },

  triggerEmergencyAlert: async (title?: string) => {
    try {
      await apiFetch('/simulation/trigger-alert', {
        method: 'POST',
        body: JSON.stringify({
          type: 'blacklist_hit',
          severity: 'critical',
          title: title || 'Critical Security Alert: Suspect Vehicle Intercept Required',
          description: 'Automated ANPR trigger detected high-priority wanted vehicle in Central Delhi.',
        }),
      });
    } catch (e) {
      console.warn('Trigger alert error:', e);
    }
  },

  resetSimulation: async () => {
    try {
      await apiFetch('/simulation/reset', { method: 'POST' });
    } catch (e) {
      console.warn('Reset error:', e);
    }
  },
}));
