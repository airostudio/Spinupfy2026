/**
 * User State Management with Zustand
 *
 * This store manages user authentication state and profile data
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
  websitesCreated: number;
  aiGenerationsUsed: number;
  aiGenerationsLimit: number;
  createdAt: string;
}

interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: UserProfile | null) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: true,

        setUser: (user) => {
          set({
            user,
            isAuthenticated: !!user,
            isLoading: false,
          });
        },

        updateUser: (updates) => {
          set((state) => ({
            user: state.user ? { ...state.user, ...updates } : null,
          }));
        },

        clearUser: () => {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        },

        setLoading: (loading) => {
          set({ isLoading: loading });
        },
      }),
      {
        name: 'user-storage',
        partialize: (state) => ({ user: state.user }),
      }
    ),
    { name: 'UserStore' }
  )
);
