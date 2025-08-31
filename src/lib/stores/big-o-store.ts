import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { BigOAnalysis, ComplexityComparison, ScalingBehavior } from '../types'
import { BigOAnalysisService } from '../services/big-o-analysis-service'

interface BigOState {
  // Current analysis
  currentAnalysis: BigOAnalysis | null
  operationCounter: number
  isTracking: boolean
  
  // Comparison data
  algorithmComparisons: ComplexityComparison | null
  
  // Scaling visualization data
  scalingBehavior: ScalingBehavior | null
  
  // Display preferences
  showRealTimeCounter: boolean
  showComplexityBadge: boolean
  showScalingChart: boolean
  showComparisons: boolean
}

interface BigOStore extends BigOState {
  // Actions
  startTracking: (algorithmType: string, inputSize: number) => void
  stopTracking: () => void
  incrementOperations: (count?: number) => void
  resetCounter: () => void
  updateAnalysis: (algorithmType: string, inputSize: number) => void
  
  // Comparison actions
  addAlgorithmForComparison: (name: string, type: string, operationCount: number) => void
  clearComparisons: () => void
  compareAlgorithms: (inputSize: number) => void
  
  // Scaling actions
  generateScalingData: (algorithmType: string, sizes?: number[]) => void
  
  // Display actions
  toggleRealTimeCounter: () => void
  toggleComplexityBadge: () => void
  toggleScalingChart: () => void
  toggleComparisons: () => void
  
  // Getters
  getCurrentComplexity: () => string
  getEfficiencyScore: () => number
  getOperationCount: () => number
}

const initialState: BigOState = {
  currentAnalysis: null,
  operationCounter: 0,
  isTracking: false,
  algorithmComparisons: null,
  scalingBehavior: null,
  showRealTimeCounter: true,
  showComplexityBadge: true,
  showScalingChart: false,
  showComparisons: false
}

export const useBigOStore = create<BigOStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Tracking actions
    startTracking: (algorithmType: string, inputSize: number) => {
      set({
        isTracking: true,
        operationCounter: 0,
        currentAnalysis: BigOAnalysisService.analyzeComplexity(algorithmType, 0, inputSize)
      })
    },

    stopTracking: () => {
      set({ isTracking: false })
    },

    incrementOperations: (count = 1) => {
      const state = get()
      if (!state.isTracking) return

      const newCount = state.operationCounter + count
      set({ operationCounter: newCount })

      // Update analysis with new operation count
      if (state.currentAnalysis) {
        const algorithmType = state.currentAnalysis.complexity.notation === 'O(log n)' ? 'binary-search' : 'linear-search'
        const updatedAnalysis = BigOAnalysisService.analyzeComplexity(
          algorithmType,
          newCount,
          state.currentAnalysis.inputSize
        )
        set({ currentAnalysis: updatedAnalysis })
      }
    },

    resetCounter: () => {
      set({ operationCounter: 0 })
    },

    updateAnalysis: (algorithmType: string, inputSize: number) => {
      const state = get()
      const analysis = BigOAnalysisService.analyzeComplexity(
        algorithmType,
        state.operationCounter,
        inputSize
      )
      set({ currentAnalysis: analysis })
    },

    // Comparison actions
    addAlgorithmForComparison: (name: string, type: string, operationCount: number) => {
      const state = get()
      const currentComparisons = state.algorithmComparisons?.algorithms || []
      
      // Check if algorithm already exists
      const existingIndex = currentComparisons.findIndex(alg => alg.name === name)
      
      if (existingIndex >= 0) {
        // Update existing algorithm
        const updatedAlgorithms = [...currentComparisons]
        const analysis = BigOAnalysisService.analyzeComplexity(type, operationCount, state.currentAnalysis?.inputSize || 100)
        updatedAlgorithms[existingIndex] = {
          name,
          complexity: analysis.complexity,
          operationCount,
          efficiency: analysis.efficiency
        }
        
        if (state.algorithmComparisons) {
          set({
            algorithmComparisons: {
              ...state.algorithmComparisons,
              algorithms: updatedAlgorithms
            }
          })
        }
      } else {
        // Add new algorithm - convert existing algorithms to the correct format
        const existingAlgorithms = currentComparisons.map(alg => ({
          name: alg.name,
          type: alg.complexity.notation === 'O(log n)' ? 'binary-search' : 'linear-search',
          operationCount: alg.operationCount
        }))
        
        const algorithms = [
          ...existingAlgorithms,
          { name, type, operationCount }
        ]
        
        const inputSize = state.currentAnalysis?.inputSize || 100
        const comparison = BigOAnalysisService.compareAlgorithms(algorithms, inputSize)
        set({ algorithmComparisons: comparison })
      }
    },

    clearComparisons: () => {
      set({ algorithmComparisons: null })
    },

    compareAlgorithms: (inputSize: number) => {
      const state = get()
      if (!state.algorithmComparisons) return

      const algorithms = state.algorithmComparisons.algorithms.map(alg => ({
        name: alg.name,
        type: alg.complexity.notation === 'O(log n)' ? 'binary-search' : 'linear-search',
        operationCount: alg.operationCount
      }))

      const comparison = BigOAnalysisService.compareAlgorithms(algorithms, inputSize)
      set({ algorithmComparisons: comparison })
    },

    // Scaling actions
    generateScalingData: (algorithmType: string, sizes?: number[]) => {
      const scalingBehavior = BigOAnalysisService.generateScalingBehavior(algorithmType, sizes)
      set({ scalingBehavior })
    },

    // Display actions
    toggleRealTimeCounter: () => {
      set((state) => ({ showRealTimeCounter: !state.showRealTimeCounter }))
    },

    toggleComplexityBadge: () => {
      set((state) => ({ showComplexityBadge: !state.showComplexityBadge }))
    },

    toggleScalingChart: () => {
      set((state) => ({ showScalingChart: !state.showScalingChart }))
    },

    toggleComparisons: () => {
      set((state) => ({ showComparisons: !state.showComparisons }))
    },

    // Getters
    getCurrentComplexity: () => {
      const state = get()
      return state.currentAnalysis?.complexity.notation || 'Unknown'
    },

    getEfficiencyScore: () => {
      const state = get()
      return state.currentAnalysis?.efficiency || 0
    },

    getOperationCount: () => {
      const state = get()
      return state.operationCounter
    }
  }))
)