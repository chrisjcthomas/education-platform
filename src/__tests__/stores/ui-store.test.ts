import { renderHook, act } from '@testing-library/react'
import { useUIStore } from '@/lib/stores/ui-store'

// Mock localStorage for persistence tests
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock matchMedia for reduced motion tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

beforeEach(() => {
  // Reset store to initial state
  useUIStore.setState({
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
  })
  
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
})

describe('UIStore', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useUIStore())
    
    expect(result.current.learningMode).toBe('beginner')
    expect(result.current.theme).toBe('light')
    expect(result.current.layout.mode).toBe('horizontal')
    expect(result.current.layout.splitRatio).toBe(0.5)
    expect(result.current.preferences.animationSpeed).toBe(1)
  })

  it('should update learning mode', () => {
    const { result } = renderHook(() => useUIStore())
    
    act(() => {
      result.current.setLearningMode('curious')
    })
    
    expect(result.current.learningMode).toBe('curious')
    
    act(() => {
      result.current.setLearningMode('details')
    })
    
    expect(result.current.learningMode).toBe('details')
  })

  it('should update theme', () => {
    const { result } = renderHook(() => useUIStore())
    
    act(() => {
      result.current.setTheme('dark')
    })
    
    expect(result.current.theme).toBe('dark')
  })

  it('should update layout configuration', () => {
    const { result } = renderHook(() => useUIStore())
    
    act(() => {
      result.current.updateLayout({
        mode: 'vertical',
        splitRatio: 0.7,
        activePane: 'right'
      })
    })
    
    expect(result.current.layout.mode).toBe('vertical')
    expect(result.current.layout.splitRatio).toBe(0.7)
    expect(result.current.layout.activePane).toBe('right')
  })

  it('should update user preferences', () => {
    const { result } = renderHook(() => useUIStore())
    
    act(() => {
      result.current.updatePreferences({
        animationSpeed: 2,
        soundEnabled: true,
        reducedMotion: true
      })
    })
    
    expect(result.current.preferences.animationSpeed).toBe(2)
    expect(result.current.preferences.soundEnabled).toBe(true)
    expect(result.current.preferences.reducedMotion).toBe(true)
  })

  it('should toggle sidebar (active pane)', () => {
    const { result } = renderHook(() => useUIStore())
    
    expect(result.current.layout.activePane).toBe('left')
    
    act(() => {
      result.current.toggleSidebar()
    })
    
    expect(result.current.layout.activePane).toBe('right')
    
    act(() => {
      result.current.toggleSidebar()
    })
    
    expect(result.current.layout.activePane).toBe('left')
  })

  it('should clamp split ratio values', () => {
    const { result } = renderHook(() => useUIStore())
    
    // Test minimum ratio
    act(() => {
      result.current.setSplitRatio(0.1)
    })
    expect(result.current.layout.splitRatio).toBe(0.2)
    
    // Test maximum ratio
    act(() => {
      result.current.setSplitRatio(0.9)
    })
    expect(result.current.layout.splitRatio).toBe(0.8)
    
    // Test normal ratio
    act(() => {
      result.current.setSplitRatio(0.6)
    })
    expect(result.current.layout.splitRatio).toBe(0.6)
  })

  it('should detect mobile layout correctly', () => {
    const { result } = renderHook(() => useUIStore())
    
    // Horizontal layout is not mobile
    expect(result.current.isMobileLayout()).toBe(false)
    
    // Vertical layout is mobile
    act(() => {
      result.current.setLayoutMode('vertical')
    })
    expect(result.current.isMobileLayout()).toBe(true)
    
    // Tabbed layout is mobile
    act(() => {
      result.current.setLayoutMode('tabbed')
    })
    expect(result.current.isMobileLayout()).toBe(true)
  })

  it('should handle reduced motion preference', () => {
    const { result } = renderHook(() => useUIStore())
    
    // Initially no reduced motion
    expect(result.current.shouldReduceMotion()).toBe(false)
    
    // Enable reduced motion in preferences
    act(() => {
      result.current.updatePreferences({ reducedMotion: true })
    })
    expect(result.current.shouldReduceMotion()).toBe(true)
  })

  it('should calculate effective animation speed', () => {
    const { result } = renderHook(() => useUIStore())
    
    // Normal speed
    expect(result.current.getEffectiveAnimationSpeed()).toBe(1)
    
    // Increased speed
    act(() => {
      result.current.updatePreferences({ animationSpeed: 2 })
    })
    expect(result.current.getEffectiveAnimationSpeed()).toBe(2)
    
    // Reduced motion should halve the speed
    act(() => {
      result.current.updatePreferences({ reducedMotion: true })
    })
    expect(result.current.getEffectiveAnimationSpeed()).toBe(0.5)
  })

  it('should handle system reduced motion preference', () => {
    // Mock system prefers reduced motion
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))

    const { result } = renderHook(() => useUIStore())
    
    // Should detect system preference
    expect(result.current.shouldReduceMotion()).toBe(true)
  })
})