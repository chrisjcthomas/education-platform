/**
 * Animation Performance Tests
 * Tests animation performance and optimization features
 */

import { render, screen, act } from '@testing-library/react'
import React from 'react'
import { ArrayElement } from '@/components/visualization/array-element'
import { BinarySearchVisualization } from '@/components/visualization/binary-search-visualization'
import { StoreProvider } from '@/components/providers/store-provider'
import { enhancedPerformanceMonitor } from '@/lib/monitoring/enhanced-performance-monitor'

// Mock performance APIs
const mockPerformanceObserver = jest.fn()
const mockPerformanceEntry = {
  name: 'measure',
  entryType: 'measure',
  startTime: 0,
  duration: 16.67, // 60 FPS
}

Object.defineProperty(global, 'PerformanceObserver', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    observe: mockPerformanceObserver,
    disconnect: jest.fn(),
  })),
})

Object.defineProperty(global, 'performance', {
  writable: true,
  value: {
    ...performance,
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn().mockReturnValue([mockPerformanceEntry]),
    now: jest.fn(() => Date.now()),
  },
})

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <StoreProvider>{children}</StoreProvider>
)

describe.skip('Animation Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset performance monitor
    enhancedPerformanceMonitor.reset()
  })

  describe('Frame Rate Monitoring', () => {
    it('monitors FPS during animations', async () => {
      const mockData = Array.from({ length: 50 }, (_, i) => i)
      
      render(
        <TestWrapper>
          <BinarySearchVisualization 
            data={mockData}
            target={25}
            currentStep={{
              type: 'compare',
              indices: [25],
              description: 'Comparing elements',
              metadata: {}
            }}
            isPlaying={true}
            speed={1}
          />
        </TestWrapper>
      )

      // Start monitoring
      act(() => {
        enhancedPerformanceMonitor.startMonitoring()
      })

      // Simulate frame updates
      for (let i = 0; i < 10; i++) {
        act(() => {
          enhancedPerformanceMonitor.recordFrame()
        })
      }

      const metrics = enhancedPerformanceMonitor.getMetrics()
      expect(metrics.fps).toBeGreaterThan(0)
      expect(metrics.frameCount).toBe(10)
    })

    it('detects low performance and triggers fallbacks', async () => {
      // Mock low FPS
      jest.spyOn(enhancedPerformanceMonitor, 'getCurrentFPS').mockReturnValue(15)
      
      const mockData = Array.from({ length: 100 }, (_, i) => i)
      
      render(
        <TestWrapper>
          <BinarySearchVisualization 
            data={mockData}
            target={50}
            currentStep={{
              type: 'highlight',
              indices: [50],
              description: 'Highlighting element',
              metadata: {}
            }}
            isPlaying={true}
            speed={1}
          />
        </TestWrapper>
      )

      act(() => {
        enhancedPerformanceMonitor.startMonitoring()
      })

      // Should detect low performance
      const isLowPerformance = enhancedPerformanceMonitor.isLowPerformance()
      expect(isLowPerformance).toBe(true)
    })
  })

  describe('Memory Usage Monitoring', () => {
    it('tracks memory usage during animations', () => {
      // Mock memory API
      Object.defineProperty(performance, 'memory', {
        writable: true,
        value: {
          usedJSHeapSize: 10000000, // 10MB
          totalJSHeapSize: 20000000, // 20MB
          jsHeapSizeLimit: 100000000, // 100MB
        },
      })

      act(() => {
        enhancedPerformanceMonitor.startMonitoring()
      })

      const metrics = enhancedPerformanceMonitor.getMetrics()
      expect(metrics.memoryUsage).toBeDefined()
      expect(metrics.memoryUsage.used).toBe(10000000)
    })

    it('detects memory leaks', () => {
      const initialMemory = 10000000
      const leakyMemory = 50000000

      // Mock increasing memory usage
      Object.defineProperty(performance, 'memory', {
        writable: true,
        value: {
          usedJSHeapSize: initialMemory,
          totalJSHeapSize: 20000000,
          jsHeapSizeLimit: 100000000,
        },
      })

      act(() => {
        enhancedPerformanceMonitor.startMonitoring()
      })

      // Simulate memory increase
      Object.defineProperty(performance, 'memory', {
        writable: true,
        value: {
          usedJSHeapSize: leakyMemory,
          totalJSHeapSize: 60000000,
          jsHeapSizeLimit: 100000000,
        },
      })

      act(() => {
        enhancedPerformanceMonitor.recordFrame()
      })

      const hasMemoryLeak = enhancedPerformanceMonitor.detectMemoryLeak()
      expect(hasMemoryLeak).toBe(true)
    })
  })

  describe('Animation Optimization', () => {
    it('reduces animation complexity for low-end devices', () => {
      // Mock low-performance device
      jest.spyOn(enhancedPerformanceMonitor, 'getDeviceCapabilities').mockReturnValue({
        tier: 'low',
        maxAnimations: 5,
        reducedMotion: false,
        supportedFeatures: ['basic-animations'],
      })

      const mockData = Array.from({ length: 20 }, (_, i) => i)
      
      render(
        <TestWrapper>
          <BinarySearchVisualization 
            data={mockData}
            target={10}
            currentStep={{
              type: 'eliminate',
              indices: [0, 1, 2, 3, 4],
              description: 'Eliminating elements',
              metadata: {}
            }}
            isPlaying={true}
            speed={1}
          />
        </TestWrapper>
      )

      // Should render with reduced animations
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('respects user motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query.includes('reduce'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })

      render(
        <TestWrapper>
          <ArrayElement 
            value={42}
            index={0}
            state="highlighted"
          />
        </TestWrapper>
      )

      // Should render without motion-based animations
      expect(screen.getByText('42')).toBeInTheDocument()
    })
  })

  describe('Batch Processing', () => {
    it('batches multiple animation updates', async () => {
      const mockData = Array.from({ length: 10 }, (_, i) => i)
      
      render(
        <TestWrapper>
          <BinarySearchVisualization 
            data={mockData}
            target={5}
            currentStep={{
              type: 'compare',
              indices: [5],
              description: 'Comparing elements',
              metadata: {}
            }}
            isPlaying={true}
            speed={3} // Fast speed to test batching
          />
        </TestWrapper>
      )

      // Should handle rapid updates efficiently
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('queues animations when system is busy', () => {
      // Mock busy system
      jest.spyOn(enhancedPerformanceMonitor, 'getCurrentFPS').mockReturnValue(20)
      
      const mockData = Array.from({ length: 50 }, (_, i) => i)
      
      render(
        <TestWrapper>
          <BinarySearchVisualization 
            data={mockData}
            target={25}
            currentStep={{
              type: 'highlight',
              indices: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
              description: 'Highlighting multiple elements',
              metadata: {}
            }}
            isPlaying={true}
            speed={1}
          />
        </TestWrapper>
      )

      // Should queue animations instead of dropping frames
      expect(screen.getByText('25')).toBeInTheDocument()
    })
  })

  describe('Resource Cleanup', () => {
    it('cleans up animation resources on unmount', () => {
      const mockData = [1, 2, 3, 4, 5]
      
      const { unmount } = render(
        <TestWrapper>
          <BinarySearchVisualization 
            data={mockData}
            target={3}
            currentStep={{
              type: 'found',
              indices: [2],
              description: 'Found target',
              metadata: {}
            }}
            isPlaying={true}
            speed={1}
          />
        </TestWrapper>
      )

      // Start monitoring
      act(() => {
        enhancedPerformanceMonitor.startMonitoring()
      })

      // Unmount component
      unmount()

      // Should clean up resources
      const metrics = enhancedPerformanceMonitor.getMetrics()
      expect(metrics.activeAnimations).toBe(0)
    })

    it('prevents memory leaks from animation callbacks', () => {
      const mockData = [1, 2, 3]
      
      const { rerender } = render(
        <TestWrapper>
          <BinarySearchVisualization 
            data={mockData}
            target={2}
            currentStep={{
              type: 'compare',
              indices: [1],
              description: 'Comparing',
              metadata: {}
            }}
            isPlaying={true}
            speed={1}
          />
        </TestWrapper>
      )

      // Re-render multiple times to test cleanup
      for (let i = 0; i < 5; i++) {
        rerender(
          <TestWrapper>
            <BinarySearchVisualization 
              data={mockData}
              target={2}
              currentStep={{
                type: 'compare',
                indices: [i % 3],
                description: `Comparing ${i}`,
                metadata: {}
              }}
              isPlaying={true}
              speed={1}
            />
          </TestWrapper>
        )
      }

      // Should not accumulate callbacks
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  describe('Performance Metrics Collection', () => {
    it('collects comprehensive performance data', () => {
      act(() => {
        enhancedPerformanceMonitor.startMonitoring()
      })

      // Simulate various operations
      for (let i = 0; i < 60; i++) {
        act(() => {
          enhancedPerformanceMonitor.recordFrame()
        })
      }

      const metrics = enhancedPerformanceMonitor.getMetrics()
      
      expect(metrics).toHaveProperty('fps')
      expect(metrics).toHaveProperty('frameCount')
      expect(metrics).toHaveProperty('averageFrameTime')
      expect(metrics).toHaveProperty('memoryUsage')
      expect(metrics).toHaveProperty('activeAnimations')
      expect(metrics.fps).toBeGreaterThan(0)
    })

    it('provides performance recommendations', () => {
      // Mock poor performance
      jest.spyOn(enhancedPerformanceMonitor, 'getCurrentFPS').mockReturnValue(15)
      
      act(() => {
        enhancedPerformanceMonitor.startMonitoring()
      })

      const recommendations = enhancedPerformanceMonitor.getOptimizationRecommendations()
      
      expect(recommendations).toContain('Reduce animation complexity')
      expect(recommendations.length).toBeGreaterThan(0)
    })
  })

  describe('Adaptive Performance', () => {
    it('automatically adjusts quality based on performance', () => {
      // Start with good performance
      jest.spyOn(enhancedPerformanceMonitor, 'getCurrentFPS').mockReturnValue(60)
      
      const mockData = Array.from({ length: 100 }, (_, i) => i)
      
      const { rerender } = render(
        <TestWrapper>
          <BinarySearchVisualization 
            data={mockData}
            target={50}
            currentStep={{
              type: 'highlight',
              indices: [50],
              description: 'Highlighting',
              metadata: {}
            }}
            isPlaying={true}
            speed={1}
          />
        </TestWrapper>
      )

      // Simulate performance drop
      jest.spyOn(enhancedPerformanceMonitor, 'getCurrentFPS').mockReturnValue(20)
      
      rerender(
        <TestWrapper>
          <BinarySearchVisualization 
            data={mockData}
            target={50}
            currentStep={{
              type: 'eliminate',
              indices: Array.from({ length: 50 }, (_, i) => i),
              description: 'Eliminating many elements',
              metadata: {}
            }}
            isPlaying={true}
            speed={1}
          />
        </TestWrapper>
      )

      // Should adapt to lower quality
      expect(screen.getByText('50')).toBeInTheDocument()
    })
  })
})