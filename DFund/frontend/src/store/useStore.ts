import { create } from 'zustand';
import { userSession } from '@/lib/stacks';

interface AppState {
  userData: any | null;
  setUserData: (userData: any | null) => void;
  isSignedIn: boolean;
  setIsSignedIn: (isSignedIn: boolean) => void;
  checkSession: () => void;
}

export const useStore = create<AppState>((set) => ({
  userData: null,
  setUserData: (userData) => set({ userData }),
  isSignedIn: false,
  setIsSignedIn: (isSignedIn) => set({ isSignedIn }),
  checkSession: () => {
    if (userSession.isUserSignedIn()) {
      set({ userData: userSession.loadUserData(), isSignedIn: true });
    }
  },
}));
