import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TouchOptimizedControls } from '../../../components/mobile/touch-optimized-controls'

// Mock the performance adaptation hook
jest.mock('../../../hooks/use-enhanced-performance', () => ({
  usePerformanceAdaptation: () => ({
    isMobile: true,
    getAnimationConfig: () => ({ duration: 0.3, type: 'spring' })
  })
}))

describe('TouchOptimizedControls', () => {
  const defaultProps = {
    isPlaying: false,
    canStep: true,
    canReset: true,
    speed: 1,
    currentStep: 5,
    totalSteps: 10,
    onPlay: jest.fn(),
    onPause: jest.fn(),
    onStep: jest.fn(),
    onReset: jest.fn(),
    onSpeedChange: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders all control buttons', () => {
    render(<TouchOptimizedControls {...defaultProps} />)

    expect(screen.getByLabelText('Play algorithm')).toBeInTheDocument()
    expect(screen.getByLabelText('Step forward one operation')).toBeInTheDocument()
    expect(screen.getByLabelText('Reset algorithm to beginning')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle speed controls')).toBeInTheDocument()
  })

  test('shows play button when not playing', () => {
    render(<TouchOptimizedControls {...defaultProps} />)

    const playButton = screen.getByLabelText('Play algorithm')
    expect(playButton).toHaveClass('bg-green-500')
  })

  test('shows pause button when playing', () => {
    render(<TouchOptimizedControls {...defaultProps} isPlaying={true} />)

    const pauseButton = screen.getByLabelText('Pause algorithm')
    expect(pauseButton).toHaveClass('bg-red-500')
  })

  test('calls onPlay when play button is clicked', () => {
    render(<TouchOptimizedControls {...defaultProps} />)

    const playButton = screen.getByLabelText('Play algorithm')
    fireEvent.click(playButton)

    expect(defaultProps.onPlay).toHaveBeenCalledTimes(1)
  })

  test('calls onPause when pause button is clicked', () => {
    render(<TouchOptimizedControls {...defaultProps} isPlaying={true} />)

    const pauseButton = screen.getByLabelText('Pause algorithm')
    fireEvent.click(pauseButton)

    expect(defaultProps.onPause).toHaveBeenCalledTimes(1)
  })

  test('calls onStep when step button is clicked', () => {
    render(<TouchOptimizedControls {...defaultProps} />)

    const stepButton = screen.getByLabelText('Step forward one operation')
    fireEvent.click(stepButton)

    expect(defaultProps.onStep).toHaveBeenCalledTimes(1)
  })

  test('calls onReset when reset button is clicked', () => {
    render(<TouchOptimizedControls {...defaultProps} />)

    const resetButton = screen.getByLabelText('Reset algorithm to beginning')
    fireEvent.click(resetButton)

    expect(defaultProps.onReset).toHaveBeenCalledTimes(1)
  })

  test('disables step button when cannot step', () => {
    render(<TouchOptimizedControls {...defaultProps} canStep={false} />)

    const stepButton = screen.getByLabelText('Step forward one operation')
    expect(stepButton).toBeDisabled()
  })

  test('disables step button when playing', () => {
    render(<TouchOptimizedControls {...defaultProps} isPlaying={true} />)

    const stepButton = screen.getByLabelText('Step forward one operation')
    expect(stepButton).toBeDisabled()
  })

  test('disables reset button when cannot reset', () => {
    render(<TouchOptimizedControls {...defaultProps} canReset={false} />)

    const resetButton = screen.getByLabelText('Reset algorithm to beginning')
    expect(resetButton).toBeDisabled()
  })

  test('displays current progress correctly', () => {
    render(<TouchOptimizedControls {...defaultProps} />)

    expect(screen.getByText('Step 5 of 10')).toBeInTheDocument()
    expect(screen.getByText('1x')).toBeInTheDocument()
  })

  test('shows progress bar with correct width', () => {
    render(<TouchOptimizedControls {...defaultProps} />)

    const progressBar = screen.getByRole('progressbar', { hidden: true })
    expect(progressBar).toHaveStyle('width: 50%') // 5/10 * 100%
  })

  test('toggles speed controls visibility', async () => {
    render(<TouchOptimizedControls {...defaultProps} />)

    const speedToggle = screen.getByLabelText('Toggle speed controls')
    
    // Speed controls should not be visible initially
    expect(screen.queryByText('Speed: 1x')).not.toBeInTheDocument()

    // Click to show speed controls
    fireEvent.click(speedToggle)

    await waitFor(() => {
      expect(screen.getByText('Speed: 1x')).toBeInTheDocument()
    })

    // Click again to hide speed controls
    fireEvent.click(speedToggle)

    await waitFor(() => {
      expect(screen.queryByText('Speed: 1x')).not.toBeInTheDocument()
    })
  })

  test('shows speed preset buttons for mobile', async () => {
    render(<TouchOptimizedControls {...defaultProps} />)

    const speedToggle = screen.getByLabelText('Toggle speed controls')
    fireEvent.click(speedToggle)

    await waitFor(() => {
      // Check that speed controls are visible after toggle
      expect(screen.getByText('Speed:')).toBeInTheDocument()
      // Check that some speed options are available
      const speedButtons = screen.getAllByRole('button')
      expect(speedButtons.length).toBeGreaterThan(4) // Should have multiple speed buttons
    })
  })

  test('calls onSpeedChange when speed preset is clicked', async () => {
    render(<TouchOptimizedControls {...defaultProps} />)

    const speedToggle = screen.getByLabelText('Toggle speed controls')
    fireEvent.click(speedToggle)

    await waitFor(() => {
      const speed2x = screen.getByText('2x')
      fireEvent.click(speed2x)
    })

    expect(defaultProps.onSpeedChange).toHaveBeenCalledWith(2)
  })

  test('highlights current speed preset', async () => {
    render(<TouchOptimizedControls {...defaultProps} speed={2} />)

    const speedToggle = screen.getByLabelText('Toggle speed controls')
    fireEvent.click(speedToggle)

    await waitFor(() => {
      const speed2xButtons = screen.getAllByText('2x')
      expect(speed2xButtons.length).toBeGreaterThan(0)
      // Check that at least one 2x button has the primary styling (not outline)
      const primaryButton = speed2xButtons.find(btn => 
        btn.className.includes('bg-primary') || !btn.className.includes('variant-outline')
      )
      expect(primaryButton).toBeDefined()
    })
  })

  test('shows mobile touch instructions', () => {
    render(<TouchOptimizedControls {...defaultProps} />)

    expect(screen.getByText('Tap controls to interact')).toBeInTheDocument()
    expect(screen.getByText('Double-tap play button for quick pause/resume')).toBeInTheDocument()
  })

  test('shows swipe instructions when speed controls are visible', async () => {
    render(<TouchOptimizedControls {...defaultProps} />)

    const speedToggle = screen.getByLabelText('Toggle speed controls')
    fireEvent.click(speedToggle)

    await waitFor(() => {
      expect(screen.getByText('Swipe left/right to adjust')).toBeInTheDocument()
    })
  })

  test('handles touch gestures for speed control', async () => {
    render(<TouchOptimizedControls {...defaultProps} />)

    const speedToggle = screen.getByLabelText('Toggle speed controls')
    fireEvent.click(speedToggle)

    await waitFor(() => {
      const speedControls = screen.getByText('Speed: 1x').closest('div')
      
      // Simulate touch start
      fireEvent.touchStart(speedControls!, {
        touches: [{ clientX: 100, clientY: 100 }]
      })

      // Simulate touch move (swipe right)
      fireEvent.touchMove(speedControls!, {
        touches: [{ clientX: 150, clientY: 100 }]
      })

      // Simulate touch end
      fireEvent.touchEnd(speedControls!)
    })

    expect(defaultProps.onSpeedChange).toHaveBeenCalled()
  })

  test('closes speed controls when clicking outside', async () => {
    render(<TouchOptimizedControls {...defaultProps} />)

    const speedToggle = screen.getByLabelText('Toggle speed controls')
    fireEvent.click(speedToggle)

    await waitFor(() => {
      expect(screen.getByText('Speed: 1x')).toBeInTheDocument()
    })

    // Click outside the speed controls
    fireEvent.mouseDown(document.body)

    await waitFor(() => {
      expect(screen.queryByText('Speed: 1x')).not.toBeInTheDocument()
    })
  })

  test('uses larger button sizes for mobile', () => {
    render(<TouchOptimizedControls {...defaultProps} />)

    const playButton = screen.getByLabelText('Play algorithm')
    expect(playButton).toHaveClass('min-h-[48px]', 'min-w-[48px]')
  })
})