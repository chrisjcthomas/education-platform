import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PerformanceSettings } from '../../../components/settings/performance-settings'
import { enhancedPerformanceMonitor } from '../../../lib/monitoring/enhanced-performance-monitor'

// Mock the enhanced performance monitor
jest.mock('../../../lib/monitoring/enhanced-performance-monitor', () => ({
  enhancedPerformanceMonitor: {
    getSettings: jest.fn(),
    getDeviceCapabilities: jest.fn(),
    updateSettings: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    forceGarbageCollection: jest.fn(),
    getOptimalSettings: jest.fn(),
    onUpdate: jest.fn(() => jest.fn()), // Return unsubscribe function
  }
}))

const mockEnhancedPerformanceMonitor = enhancedPerformanceMonitor as jest.Mocked<typeof enhancedPerformanceMonitor>

describe('PerformanceSettings', () => {
  const mockSettings = {
    enableAutoFallback: true,
    fpsThreshold: 30,
    memoryThreshold: 100,
    frameDropThreshold: 10,
    animationQuality: 'auto' as const,
    enableBatterySaving: false,
    enableReducedMotion: false
  }

  const mockDeviceCapabilities = {
    deviceMemory: 8,
    hardwareConcurrency: 8,
    maxTouchPoints: 0,
    isMobile: false,
    isLowEnd: false,
    supportedFeatures: {
      webgl: true,
      webgl2: true,
      webAssembly: true,
      intersectionObserver: true,
      resizeObserver: true
    }
  }

  const mockOptimalSettings = {
    maxElements: 100,
    animationDuration: 300,
    useSimplifiedAnimations: false,
    enableParallax: true,
    enableShadows: true,
    enableBlur: true
  }

  beforeEach(() => {
    mockEnhancedPerformanceMonitor.getSettings.mockReturnValue(mockSettings)
    mockEnhancedPerformanceMonitor.getDeviceCapabilities.mockReturnValue(mockDeviceCapabilities)
    mockEnhancedPerformanceMonitor.getOptimalSettings.mockReturnValue(mockOptimalSettings)
    mockEnhancedPerformanceMonitor.onUpdate.mockReturnValue(jest.fn())
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('renders device capabilities correctly', () => {
    render(<PerformanceSettings />)

    expect(screen.getByText('8GB')).toBeInTheDocument()
    expect(screen.getByText('Memory')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('CPU Cores')).toBeInTheDocument()
    expect(screen.getByText('High-End')).toBeInTheDocument()
    expect(screen.getByText('Desktop')).toBeInTheDocument()
  })

  test('renders supported features badges', () => {
    render(<PerformanceSettings />)

    expect(screen.getByText('WebGL ✓')).toBeInTheDocument()
    expect(screen.getByText('WebGL2 ✓')).toBeInTheDocument()
    expect(screen.getByText('WebAssembly ✓')).toBeInTheDocument()
  })

  test('shows mobile device capabilities', () => {
    mockEnhancedPerformanceMonitor.getDeviceCapabilities.mockReturnValue({
      ...mockDeviceCapabilities,
      isMobile: true,
      isLowEnd: true,
      maxTouchPoints: 5
    })

    render(<PerformanceSettings />)

    expect(screen.getByText('Low-End')).toBeInTheDocument()
    expect(screen.getByText('Mobile')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Touch Points')).toBeInTheDocument()
  })

  test('starts and stops monitoring', () => {
    render(<PerformanceSettings />)

    const startButton = screen.getByText('Start Monitoring')
    fireEvent.click(startButton)

    expect(mockEnhancedPerformanceMonitor.start).toHaveBeenCalled()
    expect(screen.getByText('Stop Monitoring')).toBeInTheDocument()
  })

  test('forces garbage collection', () => {
    render(<PerformanceSettings />)

    const cleanButton = screen.getByText('Clean Memory')
    fireEvent.click(cleanButton)

    expect(mockEnhancedPerformanceMonitor.forceGarbageCollection).toHaveBeenCalled()
  })

  test('displays performance metrics when monitoring', async () => {
    const mockMetrics = {
      fps: 58.5,
      frameDrops: 2,
      memoryUsage: 75.3,
      renderTime: 16.8,
      timestamp: Date.now(),
      deviceCapabilities: mockDeviceCapabilities,
      performanceLevel: 'high' as const,
      batteryLevel: 0.85,
      isCharging: true
    }

    let updateCallback: (metrics: any) => void = () => {}
    mockEnhancedPerformanceMonitor.onUpdate.mockImplementation((callback) => {
      updateCallback = callback
      return jest.fn()
    })

    render(<PerformanceSettings />)

    // Start monitoring
    const startButton = screen.getByText('Start Monitoring')
    fireEvent.click(startButton)

    // Simulate metrics update
    updateCallback(mockMetrics)

    await waitFor(() => {
      expect(screen.getByText('58.5')).toBeInTheDocument()
      expect(screen.getByText('FPS')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('Frame Drops')).toBeInTheDocument()
      expect(screen.getByText('75.3MB')).toBeInTheDocument()
      expect(screen.getByText('Memory')).toBeInTheDocument()
      expect(screen.getByText('HIGH')).toBeInTheDocument()
    })
  })

  test('displays battery information when available', async () => {
    const mockMetrics = {
      fps: 60,
      frameDrops: 0,
      memoryUsage: 50,
      renderTime: 16,
      timestamp: Date.now(),
      deviceCapabilities: mockDeviceCapabilities,
      performanceLevel: 'high' as const,
      batteryLevel: 0.65,
      isCharging: false
    }

    let updateCallback: (metrics: any) => void = () => {}
    mockEnhancedPerformanceMonitor.onUpdate.mockImplementation((callback) => {
      updateCallback = callback
      return jest.fn()
    })

    render(<PerformanceSettings />)

    // Start monitoring and update metrics
    const startButton = screen.getByText('Start Monitoring')
    fireEvent.click(startButton)
    updateCallback(mockMetrics)

    await waitFor(() => {
      expect(screen.getByText('Battery:')).toBeInTheDocument()
      expect(screen.getByText('65%')).toBeInTheDocument()
    })
  })

  test('shows charging indicator when battery is charging', async () => {
    const mockMetrics = {
      fps: 60,
      frameDrops: 0,
      memoryUsage: 50,
      renderTime: 16,
      timestamp: Date.now(),
      deviceCapabilities: mockDeviceCapabilities,
      performanceLevel: 'high' as const,
      batteryLevel: 0.45,
      isCharging: true
    }

    let updateCallback: (metrics: any) => void = () => {}
    mockEnhancedPerformanceMonitor.onUpdate.mockImplementation((callback) => {
      updateCallback = callback
      return jest.fn()
    })

    render(<PerformanceSettings />)

    const startButton = screen.getByText('Start Monitoring')
    fireEvent.click(startButton)
    updateCallback(mockMetrics)

    await waitFor(() => {
      expect(screen.getByText('Charging')).toBeInTheDocument()
    })
  })

  test('updates auto fallback setting', () => {
    const onSettingsChange = jest.fn()
    render(<PerformanceSettings onSettingsChange={onSettingsChange} />)

    const checkbox = screen.getByRole('checkbox', { name: /auto performance fallback/i })
    fireEvent.click(checkbox)

    expect(mockEnhancedPerformanceMonitor.updateSettings).toHaveBeenCalledWith({
      ...mockSettings,
      enableAutoFallback: false
    })
    expect(onSettingsChange).toHaveBeenCalled()
  })

  test('updates FPS threshold', () => {
    const onSettingsChange = jest.fn()
    render(<PerformanceSettings onSettingsChange={onSettingsChange} />)

    const slider = screen.getByDisplayValue('30')
    fireEvent.change(slider, { target: { value: '45' } })

    expect(mockEnhancedPerformanceMonitor.updateSettings).toHaveBeenCalledWith({
      ...mockSettings,
      fpsThreshold: 45
    })
    expect(onSettingsChange).toHaveBeenCalled()
  })

  test('updates memory threshold', () => {
    const onSettingsChange = jest.fn()
    render(<PerformanceSettings onSettingsChange={onSettingsChange} />)

    const slider = screen.getByDisplayValue('100')
    fireEvent.change(slider, { target: { value: '150' } })

    expect(mockEnhancedPerformanceMonitor.updateSettings).toHaveBeenCalledWith({
      ...mockSettings,
      memoryThreshold: 150
    })
    expect(onSettingsChange).toHaveBeenCalled()
  })

  test('updates animation quality', () => {
    const onSettingsChange = jest.fn()
    render(<PerformanceSettings onSettingsChange={onSettingsChange} />)

    const select = screen.getByDisplayValue('Auto (Recommended)')
    fireEvent.change(select, { target: { value: 'high' } })

    expect(mockEnhancedPerformanceMonitor.updateSettings).toHaveBeenCalledWith({
      ...mockSettings,
      animationQuality: 'high'
    })
    expect(onSettingsChange).toHaveBeenCalled()
  })

  test('updates battery saving mode', () => {
    const onSettingsChange = jest.fn()
    render(<PerformanceSettings onSettingsChange={onSettingsChange} />)

    const checkbox = screen.getByRole('checkbox', { name: /battery saving mode/i })
    fireEvent.click(checkbox)

    expect(mockEnhancedPerformanceMonitor.updateSettings).toHaveBeenCalledWith({
      ...mockSettings,
      enableBatterySaving: true
    })
    expect(onSettingsChange).toHaveBeenCalled()
  })

  test('updates reduced motion setting', () => {
    const onSettingsChange = jest.fn()
    render(<PerformanceSettings onSettingsChange={onSettingsChange} />)

    const checkbox = screen.getByRole('checkbox', { name: /reduced motion/i })
    fireEvent.click(checkbox)

    expect(mockEnhancedPerformanceMonitor.updateSettings).toHaveBeenCalledWith({
      ...mockSettings,
      enableReducedMotion: true
    })
    expect(onSettingsChange).toHaveBeenCalled()
  })

  test('displays optimal settings when metrics are available', async () => {
    const mockMetrics = {
      fps: 60,
      frameDrops: 0,
      memoryUsage: 50,
      renderTime: 16,
      timestamp: Date.now(),
      deviceCapabilities: mockDeviceCapabilities,
      performanceLevel: 'high' as const
    }

    let updateCallback: (metrics: any) => void = () => {}
    mockEnhancedPerformanceMonitor.onUpdate.mockImplementation((callback) => {
      updateCallback = callback
      return jest.fn()
    })

    render(<PerformanceSettings />)

    const startButton = screen.getByText('Start Monitoring')
    fireEvent.click(startButton)
    updateCallback(mockMetrics)

    await waitFor(() => {
      expect(screen.getByText('Current Optimal Settings')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument() // maxElements
      expect(screen.getByText('Max Elements')).toBeInTheDocument()
      expect(screen.getByText('300ms')).toBeInTheDocument() // animationDuration
      expect(screen.getByText('Animation Duration')).toBeInTheDocument()
      expect(screen.getByText('Full Animations')).toBeInTheDocument()
    })
  })

  test('shows simplified animations when optimal settings indicate so', async () => {
    mockEnhancedPerformanceMonitor.getOptimalSettings.mockReturnValue({
      ...mockOptimalSettings,
      useSimplifiedAnimations: true
    })

    const mockMetrics = {
      fps: 25,
      frameDrops: 5,
      memoryUsage: 120,
      renderTime: 40,
      timestamp: Date.now(),
      deviceCapabilities: mockDeviceCapabilities,
      performanceLevel: 'low' as const
    }

    let updateCallback: (metrics: any) => void = () => {}
    mockEnhancedPerformanceMonitor.onUpdate.mockImplementation((callback) => {
      updateCallback = callback
      return jest.fn()
    })

    render(<PerformanceSettings />)

    const startButton = screen.getByText('Start Monitoring')
    fireEvent.click(startButton)
    updateCallback(mockMetrics)

    await waitFor(() => {
      expect(screen.getByText('Simplified Animations')).toBeInTheDocument()
    })
  })
})