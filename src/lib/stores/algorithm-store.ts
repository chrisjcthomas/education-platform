import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { AlgorithmState, AlgorithmStep } from '../types'
import { useBigOStore } from './big-o-store'

interface AlgorithmStore extends AlgorithmState {
  // Actions
  setAlgorithmType: (type: string) => void
  setData: (data: number[]) => void
  setTarget: (target?: number) => void
  addStep: (step: AlgorithmStep) => void
  nextStep: () => void
  previousStep: () => void
  setCurrentStep: (step: number) => void
  play: () => void
  pause: () => void
  reset: () => void
  setSpeed: (speed: number) => void
  updatePointers: (pointers: { left?: number; right?: number; mid?: number }) => void
  
  // Computed getters
  getCurrentStepData: () => AlgorithmStep | null
  getProgress: () => number
  isAtEnd: () => boolean
  isAtStart: () => boolean
}

const initialState: AlgorithmState = {
  type: '',
  data: [],
  currentStep: 0,
  totalSteps: 0,
  executionHistory: [],
  isRunning: false,
  isPaused: false,
  speed: 1,
  target: undefined,
  pointers: {}
}

export const useAlgorithmStore = create<AlgorithmStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Actions
    setAlgorithmType: (type: string) => {
      set({ type })
      
      // Update Big-O tracking with new algorithm type
      const state = get()
      if (state.data.length > 0) {
        const bigOStore = useBigOStore.getState()
        bigOStore.startTracking(type, state.data.length)
      }
    },

    setData: (data: number[]) => {
      set({ 
        data: [...data],
        currentStep: 0,
        totalSteps: 0,
        executionHistory: [],
        pointers: {}
      })
      
      // Initialize Big-O tracking
      const state = get()
      if (state.type) {
        const bigOStore = useBigOStore.getState()
        bigOStore.startTracking(state.type, data.length)
      }
    },

    setTarget: (target?: number) => {
      set({ target })
    },

    addStep: (step: AlgorithmStep) => {
      set((state) => ({
        executionHistory: [...state.executionHistory, step],
        totalSteps: state.executionHistory.length + 1
      }))
      
      // Track operation for Big-O analysis
      const bigOStore = useBigOStore.getState()
      if (bigOStore.isTracking) {
        bigOStore.incrementOperations(step.operationCount || 1)
      }
    },

    nextStep: () => {
      const state = get()
      if (state.currentStep < state.totalSteps - 1) {
        set({ currentStep: state.currentStep + 1 })
      }
    },

    previousStep: () => {
      const state = get()
      if (state.currentStep > 0) {
        set({ currentStep: state.currentStep - 1 })
      }
    },

    setCurrentStep: (step: number) => {
      const state = get()
      const clampedStep = Math.max(0, Math.min(step, state.totalSteps - 1))
      set({ currentStep: clampedStep })
    },

    play: () => {
      set({ isRunning: true, isPaused: false })
    },

    pause: () => {
      set({ isRunning: false, isPaused: true })
    },

    reset: () => {
      set({
        currentStep: 0,
        isRunning: false,
        isPaused: false,
        executionHistory: [],
        totalSteps: 0,
        pointers: {}
      })
    },

    setSpeed: (speed: number) => {
      const clampedSpeed = Math.max(0.1, Math.min(speed, 5))
      set({ speed: clampedSpeed })
    },

    updatePointers: (pointers: { left?: number; right?: number; mid?: number }) => {
      set((state) => ({
        pointers: { ...state.pointers, ...pointers }
      }))
    },

    // Computed getters
    getCurrentStepData: () => {
      const state = get()
      return state.executionHistory[state.currentStep] || null
    },

    getProgress: () => {
      const state = get()
      return state.totalSteps > 0 ? (state.currentStep + 1) / state.totalSteps : 0
    },

    isAtEnd: () => {
      const state = get()
      return state.currentStep >= state.totalSteps - 1
    },

    isAtStart: () => {
      const state = get()
      return state.currentStep === 0
    }
  }))
)