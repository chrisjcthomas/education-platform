// Algorithm execution hooks
export { 
  useAlgorithmExecution, 
  useVisualizationExecution, 
  useAlgorithmControls 
} from './use-algorithm-execution'

// Layout coordination hooks
export { 
  default as useLayoutCoordination,
  useLeftPaneCoordination,
  useRightPaneCoordination,
  useScrollSync
} from './use-layout-coordination'

// Visualization coordination hooks
export { useVisualizationCoordinator } from './use-visualization-coordinator'

// Responsive layout hooks
export { default as useResponsiveLayout } from './use-responsive-layout'

// Keyboard shortcuts hook
export { useKeyboardShortcuts } from './use-keyboard-shortcuts'

// Re-export types for convenience
export type { UseAlgorithmExecutionReturn } from './use-algorithm-execution'