import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TouchControls } from '@/components/controls/touch-controls'
import { useAlgorithmStore } from '@/lib/stores/algorithm-store'
import { useUIStore } from '@/lib/stores/ui-store'

// Mock the stores
jest.mock('@/lib/stores/algorithm-store')
jest.mock('@/lib/stores/ui-store')

const mockAlgorithmStore = {
  isRunning: false,
  currentStep: 0,
  totalSteps: 5,
  play: jest.fn(),
  pause: jest.fn(),
  reset: jest.fn(),
  nextStep: jest.fn(),
  previousStep: jest.fn(),
  isAtEnd: jest.fn(() => false),
  isAtStart: jest.fn(() => true)
}

const mockUIStore = {
  preferences: {
    soundEnabled: false
  },
  updatePreferences: jest.fn()
}

describe('TouchControls', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAlgorithmStore as jest.Mock).mockReturnValue(mockAlgorithmStore)
    ;(useUIStore as jest.Mock).mockReturnValue(mockUIStore)
  })

  it('renders touch-friendly control buttons', () => {
    render(<TouchControls />)
    
    expect(screen.getByLabelText('Play algorithm')).toBeInTheDocument()
    expect(screen.getByLabelText('Reset algorithm')).toBeInTheDocument()
    expect(screen.getByLabelText('Previous step')).toBeInTheDocument()
    expect(screen.getByLabelText('Next step')).toBeInTheDocument()
  })

  it('shows pause button when algorithm is running', () => {
    ;(useAlgorithmStore as jest.Mock).mockReturnValue({
      ...mockAlgorithmStore,
      isRunning: true
    })

    render(<TouchControls />)
    
    expect(screen.getByLabelText('Pause algorithm')).toBeInTheDocument()
  })

  it('calls play when play button is touched', () => {
    render(<TouchControls />)
    
    fireEvent.click(screen.getByLabelText('Play algorithm'))
    
    expect(mockAlgorithmStore.play).toHaveBeenCalledTimes(1)
  })

  it('calls pause when pause button is touched', () => {
    ;(useAlgorithmStore as jest.Mock).mockReturnValue({
      ...mockAlgorithmStore,
      isRunning: true
    })

    render(<TouchControls />)
    
    fireEvent.click(screen.getByLabelText('Pause algorithm'))
    
    expect(mockAlgorithmStore.pause).toHaveBeenCalledTimes(1)
  })

  it('calls reset when reset button is touched', () => {
    render(<TouchControls />)
    
    fireEvent.click(screen.getByLabelText('Reset algorithm'))
    
    expect(mockAlgorithmStore.reset).toHaveBeenCalledTimes(1)
  })

  it('calls nextStep when next step button is touched', () => {
    render(<TouchControls />)
    
    fireEvent.click(screen.getByLabelText('Next step'))
    
    expect(mockAlgorithmStore.nextStep).toHaveBeenCalledTimes(1)
  })

  it('calls previousStep when previous step button is touched', () => {
    ;(useAlgorithmStore as jest.Mock).mockReturnValue({
      ...mockAlgorithmStore,
      isAtStart: jest.fn(() => false)
    })

    render(<TouchControls />)
    
    fireEvent.click(screen.getByLabelText('Previous step'))
    
    expect(mockAlgorithmStore.previousStep).toHaveBeenCalledTimes(1)
  })

  it('disables buttons when no steps are available', () => {
    ;(useAlgorithmStore as jest.Mock).mockReturnValue({
      ...mockAlgorithmStore,
      totalSteps: 0
    })

    render(<TouchControls />)
    
    expect(screen.getByLabelText('Play algorithm')).toBeDisabled()
    expect(screen.getByLabelText('Reset algorithm')).toBeDisabled()
    expect(screen.getByLabelText('Previous step')).toBeDisabled()
    expect(screen.getByLabelText('Next step')).toBeDisabled()
  })

  it('disables previous step button at start', () => {
    render(<TouchControls />)
    
    expect(screen.getByLabelText('Previous step')).toBeDisabled()
  })

  it('disables next step button at end', () => {
    ;(useAlgorithmStore as jest.Mock).mockReturnValue({
      ...mockAlgorithmStore,
      isAtEnd: jest.fn(() => true)
    })

    render(<TouchControls />)
    
    expect(screen.getByLabelText('Next step')).toBeDisabled()
  })

  it('displays current step information', () => {
    ;(useAlgorithmStore as jest.Mock).mockReturnValue({
      ...mockAlgorithmStore,
      currentStep: 2,
      totalSteps: 5
    })

    render(<TouchControls />)
    
    expect(screen.getByText('3/5')).toBeInTheDocument()
    expect(screen.getByText('Step')).toBeInTheDocument()
  })

  it('shows placeholder when no steps', () => {
    ;(useAlgorithmStore as jest.Mock).mockReturnValue({
      ...mockAlgorithmStore,
      totalSteps: 0
    })

    render(<TouchControls />)
    
    expect(screen.getByText('-/-')).toBeInTheDocument()
  })

  it('toggles sound when sound button is touched', () => {
    render(<TouchControls />)
    
    fireEvent.click(screen.getByLabelText('Enable sound'))
    
    expect(mockUIStore.updatePreferences).toHaveBeenCalledWith({ soundEnabled: true })
  })

  it('shows correct sound icon based on preference', () => {
    ;(useUIStore as jest.Mock).mockReturnValue({
      ...mockUIStore,
      preferences: { soundEnabled: true }
    })

    render(<TouchControls />)
    
    expect(screen.getByLabelText('Disable sound')).toBeInTheDocument()
  })

  it('handles swipe gestures', async () => {
    const onSwipeLeft = jest.fn()
    const onSwipeRight = jest.fn()
    
    render(
      <TouchControls 
        onSwipeLeft={onSwipeLeft}
        onSwipeRight={onSwipeRight}
      />
    )
    
    const container = screen.getByRole('toolbar')
    
    // Simulate swipe right (deltaX > 0)
    fireEvent.touchStart(container, {
      touches: [{ clientX: 100, clientY: 100 }]
    })
    
    fireEvent.touchEnd(container, {
      changedTouches: [{ clientX: 200, clientY: 100 }]
    })
    
    await waitFor(() => {
      expect(onSwipeRight).toHaveBeenCalledTimes(1)
    })
  })

  it('handles double tap gesture', async () => {
    const onDoubleTap = jest.fn()
    
    render(<TouchControls onDoubleTap={onDoubleTap} />)
    
    const container = screen.getByRole('toolbar')
    
    // First tap
    fireEvent.touchStart(container, {
      touches: [{ clientX: 100, clientY: 100 }]
    })
    fireEvent.touchEnd(container, {
      changedTouches: [{ clientX: 100, clientY: 100 }]
    })
    
    // Second tap within 300ms
    setTimeout(() => {
      fireEvent.touchStart(container, {
        touches: [{ clientX: 100, clientY: 100 }]
      })
      fireEvent.touchEnd(container, {
        changedTouches: [{ clientX: 100, clientY: 100 }]
      })
    }, 100)
    
    await waitFor(() => {
      expect(onDoubleTap).toHaveBeenCalledTimes(1)
    }, { timeout: 500 })
  })

  it('shows touch gesture hints', () => {
    render(<TouchControls />)
    
    expect(screen.getByText('Swipe left/right to navigate steps')).toBeInTheDocument()
    expect(screen.getByText('Double tap to play/pause')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<TouchControls />)
    
    const toolbar = screen.getByRole('toolbar')
    expect(toolbar).toHaveAttribute('aria-label', 'Touch-friendly algorithm controls')
    
    // Check that buttons have proper touch-manipulation class
    const playButton = screen.getByLabelText('Play algorithm')
    expect(playButton).toHaveClass('touch-manipulation')
  })

  it('has appropriate button sizes for touch', () => {
    render(<TouchControls />)
    
    const playButton = screen.getByLabelText('Play algorithm')
    expect(playButton).toHaveClass('min-w-[3.5rem]', 'min-h-[3.5rem]')
    
    const stepButton = screen.getByLabelText('Next step')
    expect(stepButton).toHaveClass('min-w-[3rem]', 'min-h-[3rem]')
  })
})