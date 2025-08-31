// Core algorithm types
export interface AlgorithmStep {
  type: 'compare' | 'swap' | 'highlight' | 'eliminate' | 'found' | 'init'
  indices: number[]
  metadata: Record<string, unknown>
  description: string
  operationCount?: number
}

export interface AlgorithmState {
  type: string
  data: number[]
  currentStep: number
  totalSteps: number
  executionHistory: AlgorithmStep[]
  isRunning: boolean
  isPaused: boolean
  speed: number
  target?: number
  pointers?: {
    left?: number
    right?: number
    mid?: number
  }
}

// UI and layout types
export type LearningMode = 'beginner' | 'curious' | 'details'
export type Theme = 'light' | 'dark'
export type LayoutMode = 'horizontal' | 'vertical' | 'tabbed'

export interface UIState {
  learningMode: LearningMode
  theme: Theme
  layout: LayoutConfig
  preferences: UserPreferences
}

export interface LayoutConfig {
  mode: LayoutMode
  splitRatio: number
  activePane: 'left' | 'right'
  isResizing: boolean
}

export interface UserPreferences {
  animationSpeed: number
  soundEnabled: boolean
  reducedMotion: boolean
  highContrast: boolean
  fontSize: 'small' | 'medium' | 'large'
}

// Performance monitoring types
export interface PerformanceState {
  fps: number
  frameDrops: number
  memoryUsage: number
  renderTime: number
  isLowPerformance: boolean
}

export interface PerformanceMetrics {
  totalOperations: number
  timeComplexity: string
  spaceComplexity: string
  actualRuntime: number
  comparisonCount: number
}

// Big-O Analysis types
export interface BigOAnalysis {
  complexity: ComplexityClass
  operationCount: number
  inputSize: number
  efficiency: number
  description: string
  plainLanguageExplanation: string
}

export interface ComplexityClass {
  notation: string // e.g., "O(log n)", "O(n)", "O(n²)"
  name: string // e.g., "Logarithmic", "Linear", "Quadratic"
  category: 'excellent' | 'good' | 'fair' | 'poor' | 'terrible'
  color: string
}

export interface ComplexityComparison {
  algorithms: {
    name: string
    complexity: ComplexityClass
    operationCount: number
    efficiency: number
  }[]
  inputSize: number
  winner: string
  explanation: string
}

export interface ScalingBehavior {
  inputSizes: number[]
  operationCounts: number[]
  complexityClass: ComplexityClass
  projectedCounts: number[]
  scalingFactor: number
}

// Code execution types
export type CodeLanguage = 'javascript' | 'python'

export interface CodeExecutionState {
  language: CodeLanguage
  code: string
  isExecuting: boolean
  error?: EducationalError
  output?: unknown
}

export interface EducationalError {
  message: string
  suggestion: string
  codeExample?: string
  relatedConcept?: string
  line?: number
  column?: number
}

// Component prop types
export interface DualPaneLayoutProps {
  leftPane: React.ReactNode
  rightPane: React.ReactNode
  splitRatio: number
  onSplitChange: (ratio: number) => void
  isMobile: boolean
}

export interface CodeEditorProps {
  language: CodeLanguage
  initialCode: string
  onCodeChange: (code: string) => void
  onExecute: (code: string) => void
  readOnly: boolean
  theme: Theme
}

export interface VisualizationPaneProps {
  algorithmType: 'binary-search' | 'linear-search' | 'sorting'
  data: number[]
  currentStep: AlgorithmStep
  animationSpeed: number
  onStepComplete: () => void
}

// Global state type
export interface GlobalState {
  algorithm: AlgorithmState
  ui: UIState
  performance: PerformanceState
  codeExecution: CodeExecutionState
}