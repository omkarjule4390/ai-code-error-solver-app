import { create } from 'zustand'
import type { Profile } from '@/types'

interface AuthState {
  user: Profile | null
  isAuthenticated: boolean
  isInitializing: boolean
  setUser: (user: Profile | null) => void
  clearAuth: () => void
  setInitializing: (v: boolean) => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearAuth: () => set({ user: null, isAuthenticated: false }),
  setInitializing: (v) => set({ isInitializing: v }),
}))
