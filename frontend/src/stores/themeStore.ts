/**
 * TrackAI — Theme store (Zustand)
 */

import { create } from 'zustand';

interface ThemeStore {
  isDark: boolean;
  toggle: () => void;
  setDark: (dark: boolean) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  isDark: true,
  toggle: () =>
    set((state) => {
      const newDark = !state.isDark;
      document.documentElement.classList.toggle('light', !newDark);
      return { isDark: newDark };
    }),
  setDark: (dark: boolean) => {
    document.documentElement.classList.toggle('light', !dark);
    set({ isDark: dark });
  },
}));
