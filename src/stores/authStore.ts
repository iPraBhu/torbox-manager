// Authentication store using Zustand with localStorage persistence

import { create } from 'zustand';

const STORAGE_KEY = 'tbmm.apiKey';

interface AuthState {
  apiKey: string | null;
  isAuthenticated: boolean;
  login: (apiKey: string) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  apiKey: null,
  isAuthenticated: false,
  
  login: (apiKey: string) => {
    localStorage.setItem(STORAGE_KEY, apiKey);
    set({ apiKey, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ apiKey: null, isAuthenticated: false });
  },
  
  initialize: () => {
    const storedKey = localStorage.getItem(STORAGE_KEY);
    if (storedKey) {
      set({ apiKey: storedKey, isAuthenticated: true });
    }
  },
}));
