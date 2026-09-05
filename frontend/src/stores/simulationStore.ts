/**
 * TrackAI — Simulation & Live Telemetry Store (Zustand)
 * Supports live WebSocket events with seamless client-side standalone fallback for Netlify.
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

// Initial Fleet for Instant Client Simulation
const INITIAL_FLEET: SimulatedVehicleData[] = [
  { id: 1, plate_number: 'DL 01 AB 1234', vehicle_type: 'car', color: 'White', is_blacklisted: false, route_key: 'rajpath_corridor', route_name: 'Kartavya Path Corridor', latitude: 28.6145, longitude: 77.2090, speed_kmh: 52.4, heading: 90, progress: 0.2 },
  { id: 2, plate_number: 'HR 26 DQ 5541', vehicle_type: 'car', color: 'Black', is_blacklisted: true, blacklist_reason: 'Stolen vehicle reported', route_key: 'cp_to_ito', route_name: 'CP to ITO', latitude: 28.6315, longitude: 77.2167, speed_kmh: 88.2, heading: 110, progress: 0.1 },
  { id: 3, plate_number: 'DL 04 EF 9876', vehicle_type: 'truck', color: 'Red', is_blacklisted: true, blacklist_reason: 'Wanted in hit-and-run case', route_key: 'ring_road_north', route_name: 'Ring Road North', latitude: 28.6420, longitude: 77.2320, speed_kmh: 46.0, heading: 340, progress: 0.4 },
  { id: 4, plate_number: 'UP 16 Z 8820', vehicle_type: 'motorcycle', color: 'Blue', is_blacklisted: false, route_key: 'janpath_south', route_name: 'Janpath South Corridor', latitude: 28.6250, longitude: 77.2180, speed_kmh: 62.0, heading: 180, progress: 0.3 },
  { id: 5, plate_number: 'DL 1R TA 4321', vehicle_type: 'auto', color: 'Green/Yellow', is_blacklisted: false, route_key: 'aiims_to_saket', route_name: 'AIIMS to Saket', latitude: 28.5672, longitude: 77.2100, speed_kmh: 38.5, heading: 200, progress: 0.15 },
  { id: 6, plate_number: 'DL 08 CA 0007', vehicle_type: 'car', color: 'Black', is_blacklisted: false, route_key: 'ito_to_akshardham', route_name: 'ITO to Akshardham', latitude: 28.6280, longitude: 77.2450, speed_kmh: 68.0, heading: 120, progress: 0.5 },
  { id: 7, plate_number: 'DL 03 XY 9012', vehicle_type: 'car', color: 'Silver', is_blacklisted: false, route_key: 'civil_lines_to_cp', route_name: 'Civil Lines to CP', latitude: 28.6692, longitude: 77.2260, speed_kmh: 55.0, heading: 190, progress: 0.35 },
  { id: 8, plate_number: 'HR 51 B 4400', vehicle_type: 'bus', color: 'Red', is_blacklisted: false, route_key: 'outer_ring_west', route_name: 'Outer Ring Road West', latitude: 28.6200, longitude: 77.1500, speed_kmh: 45.0, heading: 140, progress: 0.6 },
];

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
  stepClientSimulation: () => void;
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  isRunning: true,
  speedMultiplier: 1.0,
  activeVehicles: INITIAL_FLEET,
  liveDetections: [
    { id: 1, vehicle_id: 1, camera_id: 5, camera_name: 'CAM-RP-01', camera_location: 'Kartavya Path', plate_number: 'DL 01 AB 1234', timestamp: new Date().toISOString(), latitude: 28.6145, longitude: 77.2090, speed_kmh: 52.4, confidence: 0.985, vehicle_type: 'car' },
    { id: 2, vehicle_id: 2, camera_id: 1, camera_name: 'CAM-CP-01', camera_location: 'Connaught Place', plate_number: 'HR 26 DQ 5541', timestamp: new Date().toISOString(), latitude: 28.6315, longitude: 77.2167, speed_kmh: 88.2, confidence: 0.972, vehicle_type: 'car', is_blacklisted: true },
  ],
  stats: {
    vehicles_tracked_today: 48,
    active_cameras: 15,
    average_speed: 54.2,
    open_alerts: 4,
    total_detections_today: 184,
  },
  selectedVehiclePlate: null,
  selectedCameraId: null,
  audioAlertsEnabled: true,

  setSimulationTick: (data) =>
    set((state) => ({
      isRunning: data.is_running !== undefined ? data.is_running : state.isRunning,
      speedMultiplier: data.speed_multiplier !== undefined ? data.speed_multiplier : state.speedMultiplier,
      activeVehicles: data.vehicles && data.vehicles.length > 0 ? data.vehicles : state.activeVehicles,
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

  stepClientSimulation: () =>
    set((state) => {
      if (!state.isRunning) return state;

      const updatedVehicles = state.activeVehicles.map((v) => {
        let newProg = v.progress + 0.008 * state.speedMultiplier;
        if (newProg >= 1.0) newProg = 0.0;

        // Micro movement in Delhi coordinates
        const dLat = Math.sin(newProg * Math.PI * 2) * 0.0006;
        const dLng = Math.cos(newProg * Math.PI * 2) * 0.0006;

        return {
          ...v,
          progress: newProg,
          latitude: Number((v.latitude + dLat).toFixed(6)),
          longitude: Number((v.longitude + dLng).toFixed(6)),
          heading: (v.heading + 2) % 360,
        };
      });

      return { activeVehicles: updatedVehicles };
    }),

  startSimulation: async () => {
    set({ isRunning: true });
    try {
      await apiFetch('/simulation/start', { method: 'POST' });
    } catch {
      // Local fallback active
    }
  },

  pauseSimulation: async () => {
    set({ isRunning: false });
    try {
      await apiFetch('/simulation/pause', { method: 'POST' });
    } catch {
      // Local fallback active
    }
  },

  setSpeedMultiplier: async (speed: number) => {
    set({ speedMultiplier: speed });
    try {
      await apiFetch('/simulation/speed', {
        method: 'POST',
        body: JSON.stringify({ speed_multiplier: speed }),
      });
    } catch {
      // Local fallback active
    }
  },

  spawnSuspectVehicle: async () => {
    const newPlate = `DL 0${Math.floor(Math.random() * 9 + 1)} ZZ ${Math.floor(Math.random() * 9000 + 1000)}`;
    const newSuspect: SimulatedVehicleData = {
      id: Date.now(),
      plate_number: newPlate,
      vehicle_type: 'car',
      color: 'Black',
      is_blacklisted: true,
      blacklist_reason: 'Emergency Alert: Stolen Vehicle / Hit-and-run Suspect',
      route_key: 'cp_to_ito',
      route_name: 'CP to ITO Corridor',
      latitude: 28.6315,
      longitude: 77.2167,
      speed_kmh: 92.4,
      heading: 100,
      progress: 0.1,
    };

    set((state) => ({
      activeVehicles: [newSuspect, ...state.activeVehicles],
    }));

    try {
      await apiFetch('/simulation/spawn', {
        method: 'POST',
        body: JSON.stringify({
          plate_number: newPlate,
          is_blacklisted: true,
          blacklist_reason: 'Emergency Alert: Stolen Vehicle / Hit-and-run Suspect',
        }),
      });
    } catch {
      // Handled locally
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
    } catch {
      // Handled locally
    }
  },

  resetSimulation: async () => {
    set({ activeVehicles: INITIAL_FLEET });
    try {
      await apiFetch('/simulation/reset', { method: 'POST' });
    } catch {
      // Handled locally
    }
  },
}));
