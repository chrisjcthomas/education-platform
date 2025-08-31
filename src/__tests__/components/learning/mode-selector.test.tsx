import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ModeSelector } from '@/components/learning/mode-selector'
import { useUIStore } from '@/lib/stores/ui-store'

// Mock the UI store
jest.mock('@/lib/stores/ui-store')
const mockUseUIStore = useUIStore as jest.MockedFunction<typeof useUIStore>

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('ModeSelector', () => {
  const mockSetLearningMode = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseUIStore.mockReturnValue({
      learningMode: 'beginner',
      setLearningMode: mockSetLearningMode,
    } as any)
  })

  it('renders all three learning modes', () => {
    render(<ModeSelector />)
    
    expect(screen.getByText('Complete Beginner')).toBeInTheDocument()
    expect(screen.getByText('Curious About Code')).toBeInTheDocument()
    expect(screen.getByText('Show Me Details')).toBeInTheDocument()
  })

  it('shows descriptions when showDescriptions is true', () => {
    render(<ModeSelector showDescriptions={true} />)
    
    expect(screen.getAllByText('Visual analogies and simple explanations')).toHaveLength(2) // Button + info section
    expect(screen.getByText('Pre-written code with guided explanations')).toBeInTheDocument()
    expect(screen.getByText('Full code editor with technical implementation')).toBeInTheDocument()
  })

  it('hides descriptions when showDescriptions is false', () => {
    render(<ModeSelector showDescriptions={false} />)
    
    // Should only appear once in the info section, not in buttons
    expect(screen.getAllByText('Visual analogies and simple explanations')).toHaveLength(1)
    expect(screen.queryByText('Pre-written code with guided explanations')).not.toBeInTheDocument()
    expect(screen.queryByText('Full code editor with technical implementation')).not.toBeInTheDocument()
  })

  it('highlights the current learning mode', () => {
    mockUseUIStore.mockReturnValue({
      learningMode: 'curious',
      setLearningMode: mockSetLearningMode,
    } as any)

    render(<ModeSelector />)
    
    const curiousButton = screen.getByRole('button', { name: /curious about code/i })
    expect(curiousButton).toHaveClass('ring-2', 'ring-blue-500')
  })

  it('calls setLearningMode when a mode is selected', () => {
    render(<ModeSelector />)
    
    const detailsButton = screen.getByRole('button', { name: /show me details/i })
    fireEvent.click(detailsButton)
    
    expect(mockSetLearningMode).toHaveBeenCalledWith('details')
  })

  it('displays current mode information', () => {
    mockUseUIStore.mockReturnValue({
      learningMode: 'beginner',
      setLearningMode: mockSetLearningMode,
    } as any)

    render(<ModeSelector />)
    
    expect(screen.getByText('🌱 Complete Beginner')).toBeInTheDocument()
    expect(screen.getAllByText('Visual analogies and simple explanations')).toHaveLength(2) // Button + info section
    expect(screen.getByText('Visual analogies')).toBeInTheDocument()
    expect(screen.getByText('No code required')).toBeInTheDocument()
    expect(screen.getByText('Step-by-step guidance')).toBeInTheDocument()
  })

  it('updates mode information when learning mode changes', () => {
    const { rerender } = render(<ModeSelector />)
    
    // Initially shows beginner mode info
    expect(screen.getByText('🌱 Complete Beginner')).toBeInTheDocument()
    
    // Change to curious mode
    mockUseUIStore.mockReturnValue({
      learningMode: 'curious',
      setLearningMode: mockSetLearningMode,
    } as any)
    
    rerender(<ModeSelector />)
    
    expect(screen.getByText('🔍 Curious About Code')).toBeInTheDocument()
    expect(screen.getByText('Code examples')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<ModeSelector className="custom-class" />)
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders mode icons correctly', () => {
    render(<ModeSelector />)
    
    expect(screen.getByText('🌱')).toBeInTheDocument()
    expect(screen.getByText('🔍')).toBeInTheDocument()
    expect(screen.getByText('⚡')).toBeInTheDocument()
  })
})