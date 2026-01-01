// Settings store using Zustand with localStorage persistence

import { create } from 'zustand';
import { DEFAULT_SETTINGS, type Settings } from '@/types';

const STORAGE_KEY = 'tbmm.settings';

interface SettingsState extends Settings {
  updateSettings: (settings: Partial<Settings>) => void;
  initialize: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  ...DEFAULT_SETTINGS,
  
  updateSettings: (newSettings: Partial<Settings>) => {
    set((state) => {
      const updated = { ...state, ...newSettings };
      const { updateSettings, initialize, ...settingsOnly } = updated as any;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsOnly));
      return updated;
    });
  },
  
  initialize: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Settings;
        set(parsed);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },
}));
