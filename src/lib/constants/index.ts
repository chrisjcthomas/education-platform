import { LearningMode } from '@/lib/types'

// Animation constants
export const ANIMATION_SPEEDS = {
  SLOW: 2000,
  NORMAL: 1000,
  FAST: 500,
  VERY_FAST: 200,
} as const

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  MIN_FPS: 30,
  MAX_MEMORY_MB: 100,
  MAX_RENDER_TIME_MS: 16,
} as const

// Layout constants
export const LAYOUT_BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280,
} as const

// Default array configurations
export const DEFAULT_ARRAYS = {
  BINARY_SEARCH: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19],
  LINEAR_SEARCH: [4, 2, 7, 1, 9, 3, 8, 5, 6],
  SORTING: [64, 34, 25, 12, 22, 11, 90],
} as const

// Learning mode configurations
export const LEARNING_MODE_CONFIG: Record<LearningMode, {
  showCode: boolean
  showTechnicalDetails: boolean
  showBigO: boolean
  allowCodeEditing: boolean
  showAnalogies: boolean
}> = {
  beginner: {
    showCode: false,
    showTechnicalDetails: false,
    showBigO: false,
    allowCodeEditing: false,
    showAnalogies: true,
  },
  curious: {
    showCode: true,
    showTechnicalDetails: false,
    showBigO: true,
    allowCodeEditing: false,
    showAnalogies: true,
  },
  details: {
    showCode: true,
    showTechnicalDetails: true,
    showBigO: true,
    allowCodeEditing: true,
    showAnalogies: false,
  },
} as const

// Color scheme for visualizations
export const VISUALIZATION_COLORS = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  MUTED: '#6b7280',
  BACKGROUND: '#f8fafc',
  ELIMINATED: '#e5e7eb',
  ACTIVE: '#dbeafe',
  FOUND: '#dcfce7',
} as const

// Code templates
export const CODE_TEMPLATES = {
  BINARY_SEARCH_JS: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}`,
  BINARY_SEARCH_PYTHON: `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1`,
} as const

// Educational content
export const ANALOGIES = {
  BINARY_SEARCH: {
    title: "Finding a Word in a Dictionary",
    description: "Binary search is like looking up a word in a dictionary. You don't start from page 1 - you open to the middle and see if your word comes before or after that page, then eliminate half the dictionary and repeat!",
    steps: [
      "Open the dictionary to the middle page",
      "Is your word before or after this page?",
      "Eliminate the half that doesn't contain your word",
      "Repeat with the remaining half until found"
    ]
  },
  LINEAR_SEARCH: {
    title: "Looking for Your Keys",
    description: "Linear search is like looking for your keys by checking every possible place one by one until you find them.",
    steps: [
      "Start at the first location",
      "Check if your keys are there",
      "If not, move to the next location",
      "Repeat until you find your keys"
    ]
  }
} as const

// Error messages
export const ERROR_MESSAGES = {
  SYNTAX_ERROR: "Oops! There's a syntax error in your code. Check for missing brackets, semicolons, or typos.",
  RUNTIME_ERROR: "Your code ran into an issue while executing. Let's debug this together!",
  TIMEOUT_ERROR: "Your code is taking too long to run. Check for infinite loops or very large inputs.",
  INVALID_INPUT: "The input doesn't look quite right. Make sure you're using numbers separated by commas.",
} as const