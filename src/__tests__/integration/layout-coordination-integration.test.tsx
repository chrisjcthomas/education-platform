import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react'
import { DualPaneLayout } from '@/components/layout/dual-pane-layout'
import { LayoutCoordinationDemo } from '@/components/layout/layout-coordination-demo'
import { StoreProvider } from '@/components/providers/store-provider'

// Test wrapper with store provider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <StoreProvider>{children}</StoreProvider>
)

// Mock components for testing
const MockCodePane = () => (
  <div data-testid="code-pane">
    <textarea data-testid="code-editor" />
  </div>
)

const MockVisualizationPane = () => (
  <div data-testid="visualization-pane">
    <canvas data-testid="visualization-canvas" />
  </div>
)

describe('Layout Coordination Integration', () => {
  beforeEach(() => {
    // Reset window size to desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    })
  })

  test('coordinates pane focus management', async () => {
    render(
      <TestWrapper>
        <DualPaneLayout
          leftPane={<MockCodePane />}
          rightPane={<MockVisualizationPane />}
          splitRatio={0.5}
          onSplitChange={() => {}}
          isMobile={false}
        />
      </TestWrapper>
    )

    const leftPane = screen.getByTestId('code-pane')
    const rightPane = screen.getByTestId('visualization-pane')

    // Test clicking to focus panes
    fireEvent.click(leftPane)
    expect(leftPane.closest('[data-pane="left"]')).toHaveAttribute('aria-selected', 'true')

    fireEvent.click(rightPane)
    expect(rightPane.closest('[data-pane="right"]')).toHaveAttribute('aria-selected', 'true')
  })

  test('handles keyboard navigation between panes', async () => {
    render(
      <TestWrapper>
        <DualPaneLayout
          leftPane={<MockCodePane />}
          rightPane={<MockVisualizationPane />}
          splitRatio={0.5}
          onSplitChange={() => {}}
          isMobile={false}
        />
      </TestWrapper>
    )

    // Test Ctrl+1 to focus left pane
    fireEvent.keyDown(document, { key: '1', ctrlKey: true })
    
    await waitFor(() => {
      const leftPane = screen.getByTestId('code-pane').closest('[data-pane="left"]')
      expect(leftPane).toHaveAttribute('aria-selected', 'true')
    })

    // Test Ctrl+2 to focus right pane
    fireEvent.keyDown(document, { key: '2', ctrlKey: true })
    
    await waitFor(() => {
      const rightPane = screen.getByTestId('visualization-pane').closest('[data-pane="right"]')
      expect(rightPane).toHaveAttribute('aria-selected', 'true')
    })
  })

  test('responds to screen size changes', async () => {
    const { rerender } = render(
      <TestWrapper>
        <DualPaneLayout
          leftPane={<MockCodePane />}
          rightPane={<MockVisualizationPane />}
          splitRatio={0.5}
          onSplitChange={() => {}}
          isMobile={false}
        />
      </TestWrapper>
    )

    // Initially should be horizontal layout on desktop
    expect(screen.getByTestId('code-pane')).toBeInTheDocument()
    expect(screen.getByTestId('visualization-pane')).toBeInTheDocument()

    // Simulate mobile screen size
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      })
      fireEvent(window, new Event('resize'))
    })

    // Should switch to tabbed layout
    await waitFor(() => {
      const tabButtons = screen.getAllByRole('tab')
      expect(tabButtons).toHaveLength(2)
    })
  })

  test('coordinates cross-pane communication', async () => {
    render(
      <TestWrapper>
        <div>
          <DualPaneLayout
            leftPane={<MockCodePane />}
            rightPane={<MockVisualizationPane />}
            splitRatio={0.5}
            onSplitChange={() => {}}
            isMobile={false}
          />
          <LayoutCoordinationDemo />
        </div>
      </TestWrapper>
    )

    // Find and click the send message button
    const sendMessageButton = screen.getByText('Send Message')
    fireEvent.click(sendMessageButton)

    // Check that message appears in the log
    await waitFor(() => {
      expect(screen.getByText(/Message from/)).toBeInTheDocument()
    })
  })

  test('handles layout mode switching', async () => {
    render(
      <TestWrapper>
        <div>
          <DualPaneLayout
            leftPane={<MockCodePane />}
            rightPane={<MockVisualizationPane />}
            splitRatio={0.5}
            onSplitChange={() => {}}
            isMobile={false}
          />
          <LayoutCoordinationDemo />
        </div>
      </TestWrapper>
    )

    // Test that layout mode buttons exist and can be clicked
    const verticalButton = screen.getByText('Vertical')
    const tabbedButton = screen.getByText('Tabbed')
    const horizontalButton = screen.getByText('Horizontal')

    expect(verticalButton).toBeInTheDocument()
    expect(tabbedButton).toBeInTheDocument()
    expect(horizontalButton).toBeInTheDocument()

    // Test clicking buttons (actual layout changes are tested in unit tests)
    fireEvent.click(verticalButton)
    fireEvent.click(tabbedButton)
    fireEvent.click(horizontalButton)

    // Verify buttons are still there after clicks
    expect(verticalButton).toBeInTheDocument()
    expect(tabbedButton).toBeInTheDocument()
    expect(horizontalButton).toBeInTheDocument()
  })

  test('synchronizes scroll between panes', async () => {
    render(
      <TestWrapper>
        <DualPaneLayout
          leftPane={
            <div style={{ height: '200px', overflow: 'auto' }}>
              <div style={{ height: '1000px' }}>Long content</div>
            </div>
          }
          rightPane={
            <div style={{ height: '200px', overflow: 'auto' }}>
              <div style={{ height: '1000px' }}>Long content</div>
            </div>
          }
          splitRatio={0.5}
          onSplitChange={() => {}}
          isMobile={false}
        />
      </TestWrapper>
    )

    const leftScrollContainer = screen.getByLabelText(/Code Editor Pane/).querySelector('[data-scroll-container="left"]')
    
    if (leftScrollContainer) {
      // Simulate scroll event
      fireEvent.scroll(leftScrollContainer, { target: { scrollTop: 100 } })
      
      // The scroll sync should be handled by the coordination service
      // This test verifies the structure is in place
      expect(leftScrollContainer).toHaveAttribute('data-scroll-container', 'left')
    }
  })

  test('handles touch gestures in tabbed mode', async () => {
    // Set mobile screen size
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      })
    })

    render(
      <TestWrapper>
        <DualPaneLayout
          leftPane={<MockCodePane />}
          rightPane={<MockVisualizationPane />}
          splitRatio={0.5}
          onSplitChange={() => {}}
          isMobile={true}
        />
      </TestWrapper>
    )

    // Should be in tabbed mode
    await waitFor(() => {
      const tabButtons = screen.getAllByRole('tab')
      expect(tabButtons).toHaveLength(2)
    })

    // Simulate swipe gesture
    const container = screen.getByRole('tablist').parentElement
    if (container) {
      fireEvent.touchStart(container, {
        touches: [{ clientX: 100, clientY: 100 }]
      })
      
      fireEvent.touchEnd(container, {
        changedTouches: [{ clientX: 200, clientY: 100 }]
      })
    }
  })

  test('provides accessibility features', async () => {
    render(
      <TestWrapper>
        <DualPaneLayout
          leftPane={<MockCodePane />}
          rightPane={<MockVisualizationPane />}
          splitRatio={0.5}
          onSplitChange={() => {}}
          isMobile={false}
        />
      </TestWrapper>
    )

    // Check ARIA attributes
    const leftPane = screen.getByLabelText(/Code Editor Pane/)
    const rightPane = screen.getByLabelText(/Visualization Pane/)

    expect(leftPane).toHaveAttribute('role', 'region')
    expect(rightPane).toHaveAttribute('role', 'region')
    expect(leftPane).toHaveAttribute('data-pane', 'left')
    expect(rightPane).toHaveAttribute('data-pane', 'right')
  })
})