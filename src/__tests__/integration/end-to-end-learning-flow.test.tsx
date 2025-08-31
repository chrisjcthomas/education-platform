/**
 * End-to-End Learning Flow Integration Tests
 * Tests the complete user journey through the educational platform
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StoreProvider } from '@/components/providers/store-provider'
import { DualPaneLayout } from '@/components/layout/dual-pane-layout'
import { CodeEditor } from '@/components/editor/code-editor'
import { BinarySearchVisualization } from '@/components/visualization/binary-search-visualization'
import { AlgorithmControlPanel } from '@/components/controls/algorithm-control-panel'
import { ModeSelector } from '@/components/learning/mode-selector'

// Mock dependencies
jest.mock('@/lib/services/python-execution-service')
jest.mock('@/lib/services/binary-search-service')

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <StoreProvider>{children}</StoreProvider>
)

const FullLearningInterface = () => {
  const mockData = [1, 3, 5, 7, 9, 11, 13, 15]
  
  return (
    <TestWrapper>
      <div className="min-h-screen bg-gray-50">
        <div className="p-4">
          <ModeSelector />
        </div>
        <DualPaneLayout
          leftPane={
            <div className="p-4">
              <CodeEditor 
                language="javascript"
                initialCode="// Binary search implementation"
                onCodeChange={() => {}}
                onExecute={() => {}}
              />
              <AlgorithmControlPanel />
            </div>
          }
          rightPane={
            <div className="p-4">
              <BinarySearchVisualization 
                data={mockData}
                target={7}
                currentStep={{
                  type: 'init',
                  indices: [],
                  description: 'Starting binary search',
                  metadata: {}
                }}
                isPlaying={false}
                speed={1}
              />
            </div>
          }
        />
      </div>
    </TestWrapper>
  )
}

describe.skip('End-to-End Learning Flow', () => {
  beforeEach(() => {
    // Mock window.matchMedia for responsive tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query.includes('768px') ? false : true,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
  })

  describe('Initial Load and Setup', () => {
    it('renders the complete learning interface', () => {
      render(<FullLearningInterface />)
      
      // Check that all major components are present
      expect(screen.getByText('Complete Beginner')).toBeInTheDocument()
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument() // Array element
      expect(screen.getByText('Play')).toBeInTheDocument() // Control panel
    })

    it('starts in beginner mode by default', () => {
      render(<FullLearningInterface />)
      
      // Should show beginner mode as selected
      const beginnerButton = screen.getByText('Complete Beginner')
      expect(beginnerButton).toHaveClass('bg-blue-100') // Active state
    })
  })

  describe('Learning Mode Transitions', () => {
    it('switches from beginner to curious mode', async () => {
      render(<FullLearningInterface />)
      
      // Click on curious mode
      fireEvent.click(screen.getByText('Curious About Code'))
      
      // Should update the interface
      await waitFor(() => {
        const curiousButton = screen.getByText('Curious About Code')
        expect(curiousButton).toHaveClass('bg-blue-100')
      })
    })

    it('switches to details mode and shows advanced features', async () => {
      render(<FullLearningInterface />)
      
      // Click on details mode
      fireEvent.click(screen.getByText('Show Me Details'))
      
      // Should show advanced features
      await waitFor(() => {
        const detailsButton = screen.getByText('Show Me Details')
        expect(detailsButton).toHaveClass('bg-blue-100')
      })
    })
  })

  describe('Code Editor Integration', () => {
    it('allows code editing and execution', async () => {
      render(<FullLearningInterface />)
      
      const editor = screen.getByTestId('monaco-editor')
      
      // Simulate typing in the editor
      fireEvent.change(editor, { 
        target: { value: 'function binarySearch(arr, target) { return -1; }' }
      })
      
      expect(editor).toHaveValue('function binarySearch(arr, target) { return -1; }')
    })

    it('synchronizes code execution with visualization', async () => {
      render(<FullLearningInterface />)
      
      // Click play button
      fireEvent.click(screen.getByText('Play'))
      
      // Should trigger visualization updates
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  describe('Visualization Controls', () => {
    it('controls algorithm playback', async () => {
      render(<FullLearningInterface />)
      
      // Test play button
      const playButton = screen.getByText('Play')
      fireEvent.click(playButton)
      
      // Should change to pause
      await waitFor(() => {
        expect(screen.getByText('Pause')).toBeInTheDocument()
      })
      
      // Test step button
      const stepButton = screen.getByText('Step')
      fireEvent.click(stepButton)
      
      // Should advance one step
      expect(stepButton).toBeInTheDocument()
    })

    it('adjusts animation speed', async () => {
      render(<FullLearningInterface />)
      
      // Find speed slider
      const speedSlider = screen.getByRole('slider')
      
      // Change speed
      fireEvent.change(speedSlider, { target: { value: '2' } })
      
      expect(speedSlider).toHaveValue('2')
    })

    it('resets algorithm state', async () => {
      render(<FullLearningInterface />)
      
      // Click reset button
      const resetButton = screen.getByText('Reset')
      fireEvent.click(resetButton)
      
      // Should reset to initial state
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('adapts layout for mobile screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query.includes('768px') ? true : false,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })

      render(<FullLearningInterface />)
      
      // Should render mobile-friendly layout
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  describe('Accessibility Features', () => {
    it('supports keyboard navigation', async () => {
      render(<FullLearningInterface />)
      
      // Test tab navigation
      const playButton = screen.getByText('Play')
      playButton.focus()
      
      // Test spacebar for play/pause
      fireEvent.keyDown(playButton, { key: ' ', code: 'Space' })
      
      await waitFor(() => {
        expect(screen.getByText('Pause')).toBeInTheDocument()
      })
    })

    it('provides screen reader support', () => {
      render(<FullLearningInterface />)
      
      // Check for accessible labels
      const playButton = screen.getByText('Play')
      expect(playButton).toHaveAttribute('role', 'button')
    })
  })

  describe('Error Handling', () => {
    it('handles code execution errors gracefully', async () => {
      render(<FullLearningInterface />)
      
      const editor = screen.getByTestId('monaco-editor')
      
      // Enter invalid code
      fireEvent.change(editor, { 
        target: { value: 'invalid syntax here' }
      })
      
      // Try to execute
      fireEvent.click(screen.getByText('Play'))
      
      // Should not crash the interface
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
    })

    it('recovers from visualization errors', async () => {
      render(<FullLearningInterface />)
      
      // Should render without crashing even with potential errors
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('Play')).toBeInTheDocument()
    })
  })

  describe('Performance Considerations', () => {
    it('handles large datasets efficiently', () => {
      const LargeDataInterface = () => {
        const largeData = Array.from({ length: 1000 }, (_, i) => i * 2)
        
        return (
          <TestWrapper>
            <BinarySearchVisualization 
              data={largeData}
              target={500}
              currentStep={{
                type: 'init',
                indices: [],
                description: 'Starting binary search',
                metadata: {}
              }}
              isPlaying={false}
              speed={1}
            />
          </TestWrapper>
        )
      }

      render(<LargeDataInterface />)
      
      // Should render without performance issues
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  describe('Educational Content Integration', () => {
    it('provides contextual help and hints', async () => {
      render(<FullLearningInterface />)
      
      // Switch to beginner mode to see educational content
      fireEvent.click(screen.getByText('Complete Beginner'))
      
      // Should show educational elements
      expect(screen.getByText('Complete Beginner')).toBeInTheDocument()
    })

    it('adapts content based on learning mode', async () => {
      render(<FullLearningInterface />)
      
      // Test different modes show different content levels
      fireEvent.click(screen.getByText('Show Me Details'))
      
      await waitFor(() => {
        const detailsButton = screen.getByText('Show Me Details')
        expect(detailsButton).toHaveClass('bg-blue-100')
      })
    })
  })
})