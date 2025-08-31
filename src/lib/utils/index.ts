import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a random array for algorithm demonstrations
 */
export function generateRandomArray(
  length: number = 10,
  min: number = 1,
  max: number = 100
): number[] {
  return Array.from(
    { length },
    () => Math.floor(Math.random() * (max - min + 1)) + min
  )
}

/**
 * Generate a sorted array for binary search demonstrations
 */
export function generateSortedArray(
  length: number = 10,
  min: number = 1,
  max: number = 100
): number[] {
  const arr = generateRandomArray(length, min, max)
  return arr.sort((a, b) => a - b)
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Check if device is mobile based on screen width
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Format Big-O complexity for display
 */
export function formatComplexity(complexity: string): string {
  const complexityMap: Record<string, string> = {
    'O(1)': 'Constant Time',
    'O(log n)': 'Logarithmic Time',
    'O(n)': 'Linear Time',
    'O(n log n)': 'Linearithmic Time',
    'O(n²)': 'Quadratic Time',
    'O(2^n)': 'Exponential Time',
  }
  return complexityMap[complexity] || complexity
}

/**
 * Calculate Big-O complexity based on operations and input size
 */
export function calculateComplexity(operations: number, inputSize: number): string {
  if (operations <= 1) return 'O(1)'
  if (operations <= Math.log2(inputSize) + 1) return 'O(log n)'
  if (operations <= inputSize) return 'O(n)'
  if (operations <= inputSize * Math.log2(inputSize)) return 'O(n log n)'
  if (operations <= inputSize * inputSize) return 'O(n²)'
  return 'O(2^n)'
}

/**
 * Validate array input for algorithms
 */
export function validateArrayInput(input: string): number[] | null {
  try {
    const parsed = JSON.parse(`[${input}]`)
    if (!Array.isArray(parsed)) return null
    if (!parsed.every(item => typeof item === 'number' && !isNaN(item))) return null
    return parsed
  } catch {
    return null
  }
}

/**
 * Format execution time for display
 */
export function formatExecutionTime(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`
  if (ms < 1000) return `${ms.toFixed(1)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}