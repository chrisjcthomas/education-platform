import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AlgorithmControlPanel } from '@/components/controls/algorithm-control-panel'
import { useAlgorithmStore } from '@/lib/stores/algorithm-store'
import { useUIStore } from '@/lib/stores/ui-store'

// Mock the stores
jest.mock('@/lib/stores/algorithm-store')
jest.mock('@/lib/stores/ui-store')

const mockAlgorithmStore = {
  isRunning: false,
  isPaused: false,
  currentStep: 0,
  totalSteps: 5,
  speed: 1,
  play: jest.fn(),
  pause: jest.fn(),
  reset: jest.fn(),
  nextStep: jest.fn(),
  previousStep: jest.fn(),
  setSpeed: jest.fn(),
  isAtEnd: jest.fn(() => false),
  isAtStart: jest.fn(() => true),
  getProgress: jest.fn(() => 0.2)
}

const mockUIStore = {
  isMobileLayout: jest.fn(() => false)
}

describe('AlgorithmControlPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAlgorithmStore as jest.Mock).mockReturnValue(mockAlgorithmStore)
    ;(useUIStore as jest.Mock).mockReturnValue(mockUIStore)
  })

  it('renders all control buttons', () => {
    render(<AlgorithmControlPanel />)
    
    expect(screen.getByLabelText('Play algorithm')).toBeInTheDocument()
    expect(screen.getByLabelText('Previous step')).toBeInTheDocument()
    expect(screen.getByLabelText('Next step')).toBeInTheDocument()
    expect(screen.getByLabelText('Reset algorithm')).toBeInTheDocument()
  })

  it('shows pause button when algorithm is running', () => {
    ;(useAlgorithmStore as jest.Mock).mockReturnValue({
      ...mockAlgorithmStore,
      isRunning: true
    })

    render(<AlgorithmControlPanel />)
    
    expect(screen.getByLabelText('Pause algorithm')).toBeInTheDocument()
  })

  it('calls play when play button is clicked', () => {
    render(<AlgorithmControlPanel />)
    
    fireEvent.click(screen.getByLabelText('Play algorithm'))
    
    expect(mockAlgorithmStore.play).toHaveBeenCalledTimes(1)
  })

  it('calls pause when pause button is clicked', () => {
    ;(useAlgorithmStore as jest.Mock).mockReturnValue({
      ...mockAlgorithmStore,
      isRunning: true
    })

    render(<AlgorithmControlPanel />)
    
    fireEvent.click(screen.getByLabelText('Pause algorithm'))
    
    expect(mockAlgorithmStore.pause).toHaveBeenCalledTimes(1)
  })

  it('calls nextStep when next step button is clicked', () => {
    render(<AlgorithmControlPanel />)
    
    fireEvent.click(screen.getByLabelText('Next step'))
    
    expect(mockAlgorithmStore.nextStep).toHaveBeenCalledTimes(1)
  })

  it('calls previousStep when previous step button is clicked', () => {
    ;(useAlgorithmStore as jest.Mock).mockReturnValue({
      ...mockAlgorithmStore,
      isAtStart: jest.fn(() => false)
    })

    render(<AlgorithmControlPanel />)
    
    fireEvent.click(screen.getByLabelText('Previous step'))
    
    expect(mockAlgorithmStore.previousStep).toHaveBeenCalledTimes(1)
  })

  it('calls reset when reset button is clicked', () => {
    render(<AlgorithmControlPanel />)
    
    fireEvent.click(screen.getByLabelText('Reset algorithm'))
    
    expect(mockAlgorithmStore.reset).toHaveBeenCalledTimes(1)
  })

  it('disables buttons when no steps are available', () => {
    ;(useAlgorithmStore as jest.Mock).mockReturnValue({
      ...mockAlgorithmStore,
      totalSteps: 0
    })

    render(<AlgorithmControlPanel />)
    
    expect(screen.getByLabelText('Play algorithm')).toBeDisabled()
    expect(screen.getByLabelText('Previous step')).toBeDisabled()
    expect(screen.getByLabelText('Next step')).toBeDisabled()
    expect(screen.getByLabelText('Reset algorithm')).toBeDisabled()
  })

  it('disables previous step button at start', () => {
    render(<AlgorithmControlPanel />)
    
    expect(screen.getByLabelText('Previous step')).toBeDisabled()
  })

  it('disables next step button at end', () => {
    ;(useAlgorithmStore as jest.Mock).mockReturnValue({
      ...mockAlgorithmStore,
      isAtEnd: jest.fn(() => true)
    })

    render(<AlgorithmControlPanel />)
    
    expect(screen.getByLabelText('Next step')).toBeDisabled()
  })

  it('renders progress indicator and step counter in full mode', () => {
    render(<AlgorithmControlPanel />)
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders compact layout correctly', () => {
    render(<AlgorithmControlPanel compact />)
    
    // Should still have all buttons but in compact layout
    expect(screen.getByLabelText('Play algorithm')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('handles speed changes', async () => {
    render(<AlgorithmControlPanel />)
    
    const speedSlider = screen.getByLabelText(/Animation speed/)
    
    fireEvent.change(speedSlider, { target: { value: '2' } })
    
    await waitFor(() => {
      expect(mockAlgorithmStore.setSpeed).toHaveBeenCalledWith(2)
    })
  })

  it('adapts to mobile layout', () => {
    ;(useUIStore as jest.Mock).mockReturnValue({
      isMobileLayout: jest.fn(() => true)
    })

    render(<AlgorithmControlPanel />)
    
    // Should render with mobile-friendly classes
    const toolbar = screen.getByRole('toolbar')
    expect(toolbar).toHaveClass('flex-wrap', 'justify-center')
  })

  it('has proper accessibility attributes', () => {
    render(<AlgorithmControlPanel />)
    
    const toolbar = screen.getByRole('toolbar')
    expect(toolbar).toHaveAttribute('aria-label', 'Algorithm execution controls')
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow')
    expect(progressBar).toHaveAttribute('aria-valuemin', '0')
    expect(progressBar).toHaveAttribute('aria-valuemax', '100')
  })

  it('updates progress display correctly', () => {
    ;(useAlgorithmStore as jest.Mock).mockReturnValue({
      ...mockAlgorithmStore,
      currentStep: 2,
      totalSteps: 5,
      getProgress: jest.fn(() => 0.6)
    })

    render(<AlgorithmControlPanel />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '60')
    
    const stepCounter = screen.getByRole('status')
    expect(stepCounter).toHaveAttribute('aria-label', 'Step 3 of 5')
  })
})