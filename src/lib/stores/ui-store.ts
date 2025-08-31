import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { UIState, LearningMode, Theme, LayoutConfig, UserPreferences, LayoutMode } from '../types'

interface UIStore extends UIState {
  // Actions
  setLearningMode: (mode: LearningMode) => void
  setTheme: (theme: Theme) => void
  updateLayout: (layout: Partial<LayoutConfig>) => void
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  toggleSidebar: () => void
  setActivePane: (pane: 'left' | 'right') => void
  setSplitRatio: (ratio: number) => void
  setLayoutMode: (mode: LayoutMode) => void
  
  // Computed getters
  isMobileLayout: () => boolean
  shouldReduceMotion: () => boolean
  getEffectiveAnimationSpeed: () => number
}

const initialUIState: UIState = {
  learningMode: 'beginner',
  theme: 'light',
  layout: {
    mode: 'horizontal',
    splitRatio: 0.5,
    activePane: 'left',
    isResizing: false
  },
  preferences: {
    animationSpeed: 1,
    soundEnabled: false,
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium'
  }
}

export const useUIStore = create<UIStore>()(
  persist(
    subscribeWithSelector((set, get) => ({
      ...initialUIState,

      // Actions
      setLearningMode: (mode: LearningMode) => {
        set({ learningMode: mode })
      },

      setTheme: (theme: Theme) => {
        set({ theme })
        // Update document class for theme switching
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark')
        }
      },

      updateLayout: (layoutUpdate: Partial<LayoutConfig>) => {
        set((state) => ({
          layout: { ...state.layout, ...layoutUpdate }
        }))
      },

      updatePreferences: (preferencesUpdate: Partial<UserPreferences>) => {
        set((state) => ({
          preferences: { ...state.preferences, ...preferencesUpdate }
        }))
      },

      toggleSidebar: () => {
        set((state) => ({
          layout: {
            ...state.layout,
            activePane: state.layout.activePane === 'left' ? 'right' : 'left'
          }
        }))
      },

      setActivePane: (pane: 'left' | 'right') => {
        set((state) => ({
          layout: { ...state.layout, activePane: pane }
        }))
      },

      setSplitRatio: (ratio: number) => {
        const clampedRatio = Math.max(0.2, Math.min(ratio, 0.8))
        set((state) => ({
          layout: { ...state.layout, splitRatio: clampedRatio }
        }))
      },

      setLayoutMode: (mode: LayoutMode) => {
        set((state) => ({
          layout: { ...state.layout, mode }
        }))
      },

      // Computed getters
      isMobileLayout: () => {
        const state = get()
        return state.layout.mode === 'vertical' || state.layout.mode === 'tabbed'
      },

      shouldReduceMotion: () => {
        const state = get()
        return state.preferences.reducedMotion || 
               (typeof window !== 'undefined' && 
                window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      },

      getEffectiveAnimationSpeed: () => {
        const state = get()
        return state.shouldReduceMotion() ? 0.5 : state.preferences.animationSpeed
      }
    })),
    {
      name: 'ui-preferences',
      partialize: (state) => ({
        learningMode: state.learningMode,
        theme: state.theme,
        preferences: state.preferences,
        layout: {
          mode: state.layout.mode,
          splitRatio: state.layout.splitRatio
        }
      })
    }
  )
)