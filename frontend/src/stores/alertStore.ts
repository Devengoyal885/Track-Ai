/**
 * TrackAI — Alert store (Zustand) for real-time alert feed
 */

import { create } from 'zustand';

export interface AlertItem {
  id: number;
  type: string;
  severity: string;
  status: string;
  title: string;
  description: string;
  plate_number?: string;
  camera_id?: number;
  camera_name?: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
}

interface AlertStore {
  alerts: AlertItem[];
  addAlert: (alert: AlertItem) => void;
  setAlerts: (alerts: AlertItem[]) => void;
  dismissAlert: (id: number) => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],
  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 50), // Keep last 50
    })),
  setAlerts: (alerts) => set({ alerts }),
  dismissAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
    })),
}));
