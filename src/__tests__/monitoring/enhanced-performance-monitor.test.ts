import { EnhancedPerformanceMonitor } from '../../lib/monitoring/enhanced-performance-monitor'

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024 // 50MB
  }
}

// Mock navigator
const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  deviceMemory: 8,
  hardwareConcurrency: 8,
  maxTouchPoints: 0,
  getBattery: jest.fn()
}

// Mock window.matchMedia
const mockMatchMedia = jest.fn((query) => ({
  matches: query.includes('max-width: 768px') ? false : query.includes('prefers-reduced-motion') ? false : false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn()
}))

// Mock requestAnimationFrame
let animationFrameCallbacks: (() => void)[] = []
const mockRequestAnimationFrame = jest.fn((callback) => {
  animationFrameCallbacks.push(callback)
  return animationFrameCallbacks.length
})

const mockCancelAnimationFrame = jest.fn((id) => {
  if (animationFrameCallbacks[id - 1]) {
    delete animationFrameCallbacks[id - 1]
  }
})

// Mock canvas for WebGL detection
const mockCanvas = {
  getContext: jest.fn((type) => {
    if (type === 'webgl' || type === 'experimental-webgl' || type === 'webgl2') {
      return {} // Mock WebGL context
    }
    return null
  })
}

const mockCreateElement = jest.fn((tagName) => {
  if (tagName === 'canvas') {
    return mockCanvas
  }
  return {}
})

describe('EnhancedPerformanceMonitor', () => {
  let monitor: EnhancedPerformanceMonitor
  let originalPerformance: any
  let originalNavigator: any
  let originalWindow: any
  let originalDocument: any

  beforeEach(() => {
    // Store originals
    originalPerformance = global.performance
    originalNavigator = global.navigator
    originalWindow = global.window
    originalDocument = global.document

    // Setup mocks
    global.performance = mockPerformance as any
    global.navigator = mockNavigator as any
    global.window = {
      ...global.window,
      matchMedia: mockMatchMedia,
      requestAnimationFrame: mockRequestAnimationFrame,
      cancelAnimationFrame: mockCancelAnimationFrame
    } as any
    global.document = {
      ...global.document,
      createElement: mockCreateElement
    } as any

    // Reset animation frame callbacks
    animationFrameCallbacks = []

    // Create new monitor instance
    monitor = new EnhancedPerformanceMonitor()
  })

  afterEach(() => {
    // Restore originals
    global.performance = originalPerformance
    global.navigator = originalNavigator
    global.window = originalWindow
    global.document = originalDocument

    // Stop monitoring
    monitor.stop()

    // Clear all mocks
    jest.clearAllMocks()
  })

  describe('Device Capabilities Detection', () => {
    test('should detect device capabilities correctly', () => {
      const capabilities = monitor.getDeviceCapabilities()

      expect(capabilities.deviceMemory).toBe(8)
      expect(capabilities.hardwareConcurrency).toBe(8)
      expect(capabilities.maxTouchPoints).toBe(0)
      expect(capabilities.isMobile).toBe(false)
      expect(capabilities.isLowEnd).toBe(false)
      expect(capabilities.supportedFeatures.webgl).toBe(true)
      expect(capabilities.supportedFeatures.webgl2).toBe(true)
      expect(capabilities.supportedFeatures.webAssembly).toBe(true)
    })

    test('should detect mobile devices', () => {
      // Mock mobile user agent
      global.navigator = {
        ...mockNavigator,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
      } as any

      const mobileMonitor = new EnhancedPerformanceMonitor()
      const capabilities = mobileMonitor.getDeviceCapabilities()

      expect(capabilities.isMobile).toBe(true)
    })

    test('should detect low-end devices', () => {
      // Mock low-end device
      global.navigator = {
        ...mockNavigator,
        deviceMemory: 2,
        hardwareConcurrency: 2
      } as any

      const lowEndMonitor = new EnhancedPerformanceMonitor()
      const capabilities = lowEndMonitor.getDeviceCapabilities()

      expect(capabilities.isLowEnd).toBe(true)
    })
  })

  describe('Performance Monitoring', () => {
    test('should start and stop monitoring', () => {
      expect(mockRequestAnimationFrame).not.toHaveBeenCalled()

      monitor.start()
      expect(mockRequestAnimationFrame).toHaveBeenCalled()

      monitor.stop()
      expect(mockCancelAnimationFrame).toHaveBeenCalled()
    })

    test('should calculate FPS correctly', () => {
      let callbackMetrics: any = null
      monitor.onUpdate((metrics) => {
        callbackMetrics = metrics
      })

      monitor.start()

      // Simulate frame updates
      mockPerformance.now
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(16.67) // 60 FPS
        .mockReturnValueOnce(33.33)

      // Execute animation frame callbacks
      animationFrameCallbacks.forEach(callback => callback())

      expect(callbackMetrics).toBeTruthy()
      expect(callbackMetrics.fps).toBeCloseTo(60, 0)
    })

    test('should detect frame drops', () => {
      let callbackMetrics: any = null
      monitor.onUpdate((metrics) => {
        callbackMetrics = metrics
      })

      monitor.start()

      // Simulate slow frames (below 30 FPS)
      mockPerformance.now
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(50) // 20 FPS
        .mockReturnValueOnce(100)

      // Execute animation frame callbacks
      animationFrameCallbacks.forEach(callback => callback())

      expect(callbackMetrics).toBeTruthy()
      expect(callbackMetrics.frameDrops).toBeGreaterThan(0)
    })

    test('should calculate memory usage', () => {
      const metrics = monitor.getCurrentMetrics()
      expect(metrics.memoryUsage).toBeCloseTo(50, 0) // 50MB
    })
  })

  describe('Settings Management', () => {
    test('should update settings correctly', () => {
      const newSettings = {
        enableAutoFallback: false,
        fpsThreshold: 25,
        animationQuality: 'low' as const
      }

      monitor.updateSettings(newSettings)
      const settings = monitor.getSettings()

      expect(settings.enableAutoFallback).toBe(false)
      expect(settings.fpsThreshold).toBe(25)
      expect(settings.animationQuality).toBe('low')
    })

    test('should provide optimal settings based on performance', () => {
      const optimal = monitor.getOptimalSettings()

      expect(optimal).toHaveProperty('maxElements')
      expect(optimal).toHaveProperty('animationDuration')
      expect(optimal).toHaveProperty('useSimplifiedAnimations')
      expect(optimal).toHaveProperty('enableParallax')
      expect(optimal).toHaveProperty('enableShadows')
      expect(optimal).toHaveProperty('enableBlur')
    })
  })

  describe('Automatic Fallbacks', () => {
    test('should trigger fallback when performance drops', () => {
      let fallbackLevel: string | null = null
      monitor.onFallback((level) => {
        fallbackLevel = level
      })

      // Set low thresholds to trigger fallback
      monitor.updateSettings({
        enableAutoFallback: true,
        fpsThreshold: 50,
        frameDropThreshold: 1
      })

      monitor.start()

      // Simulate poor performance
      mockPerformance.now
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(100) // 10 FPS

      // Execute animation frame callbacks multiple times to trigger fallback
      for (let i = 0; i < 65; i++) {
        animationFrameCallbacks.forEach(callback => callback())
      }

      expect(fallbackLevel).toBe('low')
    })

    test('should not trigger fallback when disabled', () => {
      let fallbackTriggered = false
      monitor.onFallback(() => {
        fallbackTriggered = true
      })

      monitor.updateSettings({
        enableAutoFallback: false,
        fpsThreshold: 50
      })

      monitor.start()

      // Simulate poor performance
      mockPerformance.now
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(100) // 10 FPS

      // Execute animation frame callbacks
      for (let i = 0; i < 65; i++) {
        animationFrameCallbacks.forEach(callback => callback())
      }

      expect(fallbackTriggered).toBe(false)
    })
  })

  describe('Performance Level Calculation', () => {
    test('should calculate high performance level', () => {
      // Mock high performance
      mockPerformance.now
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(16) // ~62 FPS

      const metrics = monitor.getCurrentMetrics()
      expect(metrics.performanceLevel).toBe('high')
    })

    test('should calculate low performance level', () => {
      // Set up for low performance detection
      monitor.updateSettings({ fpsThreshold: 30 })

      // Mock low performance
      mockPerformance.now
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(100) // 10 FPS

      const metrics = monitor.getCurrentMetrics()
      expect(metrics.performanceLevel).toBe('low')
    })
  })

  describe('Reduced Motion Support', () => {
    test('should detect reduced motion preference', () => {
      // Mock reduced motion preference
      mockMatchMedia.mockImplementation((query) => ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      }))

      const reducedMotionMonitor = new EnhancedPerformanceMonitor()
      const settings = reducedMotionMonitor.getSettings()

      expect(settings.enableReducedMotion).toBe(true)
    })

    test('should provide static settings for reduced motion', () => {
      monitor.updateSettings({ enableReducedMotion: true })
      const optimal = monitor.getOptimalSettings()

      expect(optimal.animationDuration).toBe(0)
      expect(optimal.useSimplifiedAnimations).toBe(true)
      expect(optimal.enableParallax).toBe(false)
      expect(optimal.enableShadows).toBe(false)
      expect(optimal.enableBlur).toBe(false)
    })
  })

  describe('Battery Monitoring', () => {
    test('should handle battery API when available', async () => {
      const mockBattery = {
        level: 0.15, // 15%
        charging: false,
        addEventListener: jest.fn()
      }

      mockNavigator.getBattery.mockResolvedValue(mockBattery)

      const batteryMonitor = new EnhancedPerformanceMonitor()
      batteryMonitor.start()

      // Wait for battery monitoring to initialize
      await new Promise(resolve => setTimeout(resolve, 0))

      const settings = batteryMonitor.getSettings()
      expect(settings.enableBatterySaving).toBe(true)
    })

    test('should handle missing battery API gracefully', async () => {
      mockNavigator.getBattery = undefined

      const noBatteryMonitor = new EnhancedPerformanceMonitor()
      
      // Should not throw
      expect(() => noBatteryMonitor.start()).not.toThrow()
    })
  })
})