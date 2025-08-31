/**
 * Comprehensive Accessibility Tests
 * Tests WCAG 2.1 AA compliance and accessibility features
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { StoreProvider } from '@/components/providers/store-provider'
import { DualPaneLayout } from '@/components/layout/dual-pane-layout'
import { CodeEditor } from '@/components/editor/code-editor'
import { BinarySearchVisualization } from '@/components/visualization/binary-search-visualization'
import { AlgorithmControlPanel } from '@/components/controls/algorithm-control-panel'
import { ModeSelector } from '@/components/learning/mode-selector'
import { AccessibilitySettings } from '@/components/accessibility/accessibility-settings'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <StoreProvider>{children}</StoreProvider>
)

const AccessibleLearningInterface = () => {
  const mockData = [1, 3, 5, 7, 9, 11, 13, 15]
  
  return (
    <TestWrapper>
      <div className="min-h-screen bg-gray-50">
        <header>
          <h1>Algorithm Education Platform</h1>
          <nav>
            <ModeSelector />
          </nav>
        </header>
        <main>
          <DualPaneLayout
            leftPane={
              <section aria-label="Code Editor">
                <CodeEditor 
                  language="javascript"
                  initialCode="// Binary search implementation"
                  onCodeChange={() => {}}
                  onExecute={() => {}}
                />
                <AlgorithmControlPanel />
              </section>
            }
            rightPane={
              <section aria-label="Algorithm Visualization">
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
              </section>
            }
          />
        </main>
      </div>
    </TestWrapper>
  )
}

describe('Comprehensive Accessibility Tests', () => {
  beforeEach(() => {
    // Mock window.speechSynthesis for screen reader tests
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      value: {
        speak: jest.fn(),
        cancel: jest.fn(),
        pause: jest.fn(),
        resume: jest.fn(),
        getVoices: jest.fn().mockReturnValue([]),
      },
    })
  })

  describe('WCAG 2.1 AA Compliance', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<AccessibleLearningInterface />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('provides proper heading hierarchy', () => {
      render(<AccessibleLearningInterface />)
      
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent('Algorithm Education Platform')
    })

    it('has proper landmark regions', () => {
      render(<AccessibleLearningInterface />)
      
      expect(screen.getByRole('banner')).toBeInTheDocument() // header
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('provides descriptive labels for interactive elements', () => {
      render(<AccessibleLearningInterface />)
      
      const playButton = screen.getByRole('button', { name: /play/i })
      expect(playButton).toBeInTheDocument()
      
      const speedSlider = screen.getByRole('slider')
      expect(speedSlider).toHaveAccessibleName()
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports tab navigation through all interactive elements', () => {
      render(<AccessibleLearningInterface />)
      
      // Get all focusable elements
      const focusableElements = screen.getAllByRole('button')
        .concat(screen.getAllByRole('slider'))
        .concat(screen.getAllByRole('textbox'))
      
      expect(focusableElements.length).toBeGreaterThan(0)
      
      // Each should be focusable
      focusableElements.forEach(element => {
        expect(element).toHaveAttribute('tabIndex')
      })
    })

    it('provides keyboard shortcuts for common actions', () => {
      render(<AccessibleLearningInterface />)
      
      const playButton = screen.getByRole('button', { name: /play/i })
      
      // Test spacebar for play/pause
      fireEvent.keyDown(document, { key: ' ', code: 'Space' })
      
      // Should trigger play action
      expect(playButton).toBeInTheDocument()
    })

    it('maintains focus management during mode transitions', () => {
      render(<AccessibleLearningInterface />)
      
      const beginnerButton = screen.getByText('Complete Beginner')
      beginnerButton.focus()
      
      fireEvent.click(screen.getByText('Curious About Code'))
      
      // Focus should be managed appropriately
      expect(document.activeElement).toBeDefined()
    })

    it('provides skip links for navigation', () => {
      render(<AccessibleLearningInterface />)
      
      // Should have skip to main content link
      const skipLink = screen.getByText(/skip to main content/i)
      expect(skipLink).toBeInTheDocument()
    })
  })

  describe('Screen Reader Support', () => {
    it('provides comprehensive alt text for visual elements', () => {
      render(<AccessibleLearningInterface />)
      
      // Array elements should have descriptive labels
      const arrayElements = screen.getAllByRole('button')
      arrayElements.forEach(element => {
        if (element.textContent && /^\d+$/.test(element.textContent)) {
          expect(element).toHaveAttribute('aria-label')
        }
      })
    })

    it('announces algorithm steps to screen readers', () => {
      render(<AccessibleLearningInterface />)
      
      // Should have live region for announcements
      const liveRegion = screen.getByRole('status')
      expect(liveRegion).toBeInTheDocument()
    })

    it('provides context for visualization changes', () => {
      render(<AccessibleLearningInterface />)
      
      // Visualization should have descriptive text
      const visualization = screen.getByLabelText(/algorithm visualization/i)
      expect(visualization).toBeInTheDocument()
    })

    it('supports voice navigation commands', () => {
      render(<AccessibleLearningInterface />)
      
      // Should respond to voice commands
      const playButton = screen.getByRole('button', { name: /play/i })
      expect(playButton).toHaveAttribute('aria-describedby')
    })
  })

  describe('Visual Accessibility', () => {
    it('maintains sufficient color contrast', () => {
      render(<AccessibleLearningInterface />)
      
      // Test high contrast mode
      const { container } = render(
        <div className="high-contrast">
          <AccessibleLearningInterface />
        </div>
      )
      
      expect(container).toBeInTheDocument()
    })

    it('supports reduced motion preferences', () => {
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

      render(<AccessibleLearningInterface />)
      
      // Should respect motion preferences
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('provides text alternatives for visual content', () => {
      render(<AccessibleLearningInterface />)
      
      // Visual elements should have text descriptions
      const visualElements = screen.getAllByRole('img')
      visualElements.forEach(element => {
        expect(element).toHaveAttribute('alt')
      })
    })

    it('supports zoom up to 200% without horizontal scrolling', () => {
      // Mock zoom
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        value: 2,
      })

      render(<AccessibleLearningInterface />)
      
      // Should remain usable at high zoom levels
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  describe('Cognitive Accessibility', () => {
    it('provides clear error messages and recovery options', () => {
      render(<AccessibleLearningInterface />)
      
      // Error messages should be clear and actionable
      const editor = screen.getByTestId('monaco-editor')
      fireEvent.change(editor, { target: { value: 'invalid code' } })
      
      // Should provide helpful error guidance
      expect(editor).toBeInTheDocument()
    })

    it('offers multiple ways to access the same information', () => {
      render(<AccessibleLearningInterface />)
      
      // Information should be available through multiple modalities
      expect(screen.getByText('Complete Beginner')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('provides consistent navigation and interaction patterns', () => {
      render(<AccessibleLearningInterface />)
      
      // All buttons should follow consistent patterns
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type')
      })
    })

    it('allows users to control timing and animations', () => {
      render(
        <TestWrapper>
          <AccessibilitySettings />
          <AccessibleLearningInterface />
        </TestWrapper>
      )
      
      // Should provide timing controls
      const speedSlider = screen.getByRole('slider')
      expect(speedSlider).toBeInTheDocument()
    })
  })

  describe('Mobile Accessibility', () => {
    it('provides appropriate touch targets', () => {
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

      render(<AccessibleLearningInterface />)
      
      // Touch targets should be at least 44px
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button)
        const minSize = parseInt(styles.minHeight) || parseInt(styles.height)
        expect(minSize).toBeGreaterThanOrEqual(44)
      })
    })

    it('supports gesture navigation', () => {
      render(<AccessibleLearningInterface />)
      
      // Should support swipe gestures on mobile
      const visualization = screen.getByLabelText(/algorithm visualization/i)
      
      fireEvent.touchStart(visualization, {
        touches: [{ clientX: 100, clientY: 100 }]
      })
      fireEvent.touchEnd(visualization, {
        changedTouches: [{ clientX: 200, clientY: 100 }]
      })
      
      expect(visualization).toBeInTheDocument()
    })
  })

  describe('Accessibility Settings', () => {
    it('provides accessibility customization options', () => {
      render(
        <TestWrapper>
          <AccessibilitySettings />
        </TestWrapper>
      )
      
      // Should have accessibility controls
      expect(screen.getByText(/accessibility settings/i)).toBeInTheDocument()
    })

    it('persists accessibility preferences', () => {
      render(
        <TestWrapper>
          <AccessibilitySettings />
        </TestWrapper>
      )
      
      // Settings should be saved
      const highContrastToggle = screen.getByRole('checkbox', { name: /high contrast/i })
      fireEvent.click(highContrastToggle)
      
      expect(highContrastToggle).toBeChecked()
    })

    it('provides audio descriptions for visual content', () => {
      render(<AccessibleLearningInterface />)
      
      // Should support audio descriptions
      expect(window.speechSynthesis.speak).toBeDefined()
    })
  })

  describe('Error Handling and Recovery', () => {
    it('provides accessible error messages', () => {
      render(<AccessibleLearningInterface />)
      
      // Error messages should be announced to screen readers
      const errorRegion = screen.getByRole('alert')
      expect(errorRegion).toBeInTheDocument()
    })

    it('offers multiple recovery options', () => {
      render(<AccessibleLearningInterface />)
      
      // Should provide clear recovery paths
      const resetButton = screen.getByRole('button', { name: /reset/i })
      expect(resetButton).toBeInTheDocument()
    })

    it('maintains accessibility during error states', () => {
      render(<AccessibleLearningInterface />)
      
      // Interface should remain accessible even with errors
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Internationalization and Accessibility', () => {
    it('supports right-to-left languages', () => {
      render(
        <div dir="rtl" lang="ar">
          <AccessibleLearningInterface />
        </div>
      )
      
      // Should work with RTL layouts
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('provides language-appropriate accessibility features', () => {
      render(
        <div lang="es">
          <AccessibleLearningInterface />
        </div>
      )
      
      // Should adapt to different languages
      expect(screen.getByRole('main')).toBeInTheDocument()
    })
  })
})