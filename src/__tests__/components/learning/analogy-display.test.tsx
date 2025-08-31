import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { AnalogyDisplay } from '@/components/learning/analogy-display'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('AnalogyDisplay', () => {
  const mockAnalogies = [
    {
      id: 'test-analogy-1',
      title: 'Test Analogy 1',
      description: 'This is a test analogy description.',
      visualAid: '🔍 → 📄 → 🎯',
      interactiveDemo: true,
      relatedConcept: 'test-concept',
      difficulty: 'simple' as const
    },
    {
      id: 'test-analogy-2',
      title: 'Test Analogy 2',
      description: 'This is another test analogy description.',
      visualAid: '📚 → 📖 → ✅',
      interactiveDemo: false,
      relatedConcept: 'test-concept',
      difficulty: 'intermediate' as const
    }
  ]

  it('renders analogy display with default content', () => {
    render(<AnalogyDisplay />)
    
    expect(screen.getAllByText('Dictionary Search')).toHaveLength(2) // Button and heading
    expect(screen.getByText(/Finding a word in a dictionary/)).toBeInTheDocument()
  })

  it('renders custom analogies', () => {
    render(
      <AnalogyDisplay 
        analogies={mockAnalogies}
        currentConcept="test-concept"
      />
    )
    
    expect(screen.getAllByText('Test Analogy 1')).toHaveLength(2) // Button and heading
    expect(screen.getByText('This is a test analogy description.')).toBeInTheDocument()
  })

  it('shows analogy selector when multiple analogies exist', () => {
    render(
      <AnalogyDisplay 
        analogies={mockAnalogies}
        currentConcept="test-concept"
      />
    )
    
    expect(screen.getAllByText('Test Analogy 1')).toHaveLength(2) // Button and heading
    expect(screen.getByRole('button', { name: 'Test Analogy 2' })).toBeInTheDocument()
  })

  it('switches between analogies when selector is clicked', () => {
    render(
      <AnalogyDisplay 
        analogies={mockAnalogies}
        currentConcept="test-concept"
      />
    )
    
    // Initially shows first analogy
    expect(screen.getByText('This is a test analogy description.')).toBeInTheDocument()
    
    // Click second analogy
    fireEvent.click(screen.getByText('Test Analogy 2'))
    
    // Should show second analogy
    expect(screen.getByText('This is another test analogy description.')).toBeInTheDocument()
  })

  it('displays visual aid when provided', () => {
    render(
      <AnalogyDisplay 
        analogies={mockAnalogies}
        currentConcept="test-concept"
      />
    )
    
    expect(screen.getByText('🔍 → 📄 → 🎯')).toBeInTheDocument()
  })

  it('shows interactive demo button for interactive analogies', () => {
    render(
      <AnalogyDisplay 
        analogies={mockAnalogies}
        currentConcept="test-concept"
        interactive={true}
      />
    )
    
    expect(screen.getByText('Try Interactive Demo')).toBeInTheDocument()
  })

  it('does not show interactive demo button when interactive is false', () => {
    render(
      <AnalogyDisplay 
        analogies={mockAnalogies}
        currentConcept="test-concept"
        interactive={false}
      />
    )
    
    expect(screen.queryByText('Try Interactive Demo')).not.toBeInTheDocument()
  })

  it('toggles interactive demo when button is clicked', () => {
    render(
      <AnalogyDisplay 
        analogies={mockAnalogies}
        currentConcept="test-concept"
        interactive={true}
      />
    )
    
    const demoButton = screen.getByText('Try Interactive Demo')
    fireEvent.click(demoButton)
    
    expect(screen.getByText('Hide Demo')).toBeInTheDocument()
    expect(screen.getByText('Interactive Demo')).toBeInTheDocument()
  })

  it('filters analogies by concept', () => {
    const mixedAnalogies = [
      ...mockAnalogies,
      {
        id: 'different-concept',
        title: 'Different Concept',
        description: 'This is for a different concept.',
        relatedConcept: 'different-concept',
        difficulty: 'simple' as const
      }
    ]

    render(
      <AnalogyDisplay 
        analogies={mixedAnalogies}
        currentConcept="test-concept"
      />
    )
    
    expect(screen.getAllByText('Test Analogy 1')).toHaveLength(2) // Button and heading
    expect(screen.getByRole('button', { name: 'Test Analogy 2' })).toBeInTheDocument() // Only button visible
    expect(screen.queryByText('Different Concept')).not.toBeInTheDocument()
  })

  it('shows fallback message when no analogies match', () => {
    render(
      <AnalogyDisplay 
        analogies={mockAnalogies}
        currentConcept="non-existent-concept"
      />
    )
    
    expect(screen.getByText('No analogies available for this concept.')).toBeInTheDocument()
  })

  it('displays connection explanation', () => {
    render(
      <AnalogyDisplay 
        analogies={mockAnalogies}
        currentConcept="test-concept"
      />
    )
    
    expect(screen.getByText(/How this relates to/)).toBeInTheDocument()
    expect(screen.getByText(/test concept/)).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <AnalogyDisplay 
        analogies={mockAnalogies}
        currentConcept="test-concept"
        className="custom-class"
      />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })
})