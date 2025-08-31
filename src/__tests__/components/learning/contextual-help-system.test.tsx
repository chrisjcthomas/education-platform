import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ContextualHelpSystem, useContextualHelp } from '@/components/learning/contextual-help-system'
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

describe('ContextualHelpSystem', () => {
  const mockHelpItems = [
    {
      id: 'test-hint',
      title: 'Test Hint',
      content: 'This is a test hint for beginners.',
      type: 'hint' as const,
      context: ['test-context'],
      difficulty: 'beginner' as const,
      trigger: 'manual' as const,
      priority: 'medium' as const
    },
    {
      id: 'test-warning',
      title: 'Test Warning',
      content: 'This is a test warning with high priority.',
      type: 'warning' as const,
      context: ['test-context'],
      difficulty: 'beginner' as const,
      trigger: 'automatic' as const,
      priority: 'high' as const
    },
    {
      id: 'advanced-tip',
      title: 'Advanced Tip',
      content: 'This is an advanced tip.',
      type: 'tip' as const,
      context: ['test-context'],
      difficulty: 'advanced' as const,
      trigger: 'manual' as const,
      priority: 'low' as const
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseUIStore.mockReturnValue({
      learningMode: 'beginner',
      config: {
        showHints: true,
        showTechnicalDetails: false
      }
    } as any)
  })

  it('renders help system with relevant items', () => {
    // Mock beginner mode config
    mockUseUIStore.mockReturnValue({
      learningMode: 'beginner',
    } as any)

    render(
      <ContextualHelpSystem 
        helpItems={mockHelpItems}
        currentContext={['test-context']}
        autoShow={false}
      />
    )
    
    // Should show beginner-level items
    expect(screen.getByText('Test Hint')).toBeInTheDocument()
    expect(screen.getByText('Test Warning')).toBeInTheDocument()
  })

  it('filters items by difficulty level', () => {
    // Mock details mode config with technical details enabled
    mockUseUIStore.mockReturnValue({
      learningMode: 'details',
      config: {
        showHints: true,
        showTechnicalDetails: true
      }
    } as any)

    render(
      <ContextualHelpSystem
        helpItems={mockHelpItems}
        currentContext={['test-context']}
        autoShow={false}
      />
    )

    // Should show advanced items in details mode
    expect(screen.getByText('Advanced Tip')).toBeInTheDocument()
  })

  it('auto-shows high priority items when autoShow is true', () => {
    mockUseUIStore.mockReturnValue({
      learningMode: 'beginner',
    } as any)

    render(
      <ContextualHelpSystem 
        helpItems={mockHelpItems}
        currentContext={['test-context']}
        autoShow={true}
      />
    )
    
    // High priority warning should be visible
    expect(screen.getByText('This is a test warning with high priority.')).toBeInTheDocument()
  })

  it('shows available help items as buttons', () => {
    mockUseUIStore.mockReturnValue({
      learningMode: 'beginner',
    } as any)

    render(
      <ContextualHelpSystem 
        helpItems={mockHelpItems}
        currentContext={['test-context']}
        autoShow={false}
      />
    )
    
    // Should show clickable help items
    expect(screen.getByText('Test Hint')).toBeInTheDocument()
    expect(screen.getByText('Test Warning')).toBeInTheDocument()
  })

  it('expands help item when clicked', () => {
    mockUseUIStore.mockReturnValue({
      learningMode: 'beginner',
    } as any)

    render(
      <ContextualHelpSystem 
        helpItems={mockHelpItems}
        currentContext={['test-context']}
        autoShow={false}
      />
    )
    
    // Click on a help item
    fireEvent.click(screen.getByText('Test Hint'))
    
    // Should show the full content
    expect(screen.getByText('This is a test hint for beginners.')).toBeInTheDocument()
  })

  it('dismisses help item when dismiss button is clicked', () => {
    mockUseUIStore.mockReturnValue({
      learningMode: 'beginner',
    } as any)

    render(
      <ContextualHelpSystem 
        helpItems={mockHelpItems}
        currentContext={['test-context']}
        autoShow={true}
      />
    )
    
    // Find and click dismiss button (trash icon)
    const dismissButton = screen.getByTitle('Don\'t show again')
    fireEvent.click(dismissButton)
    
    // Item should be removed
    expect(screen.queryByText('This is a test warning with high priority.')).not.toBeInTheDocument()
  })

  it('hides help item when hide button is clicked', () => {
    mockUseUIStore.mockReturnValue({
      learningMode: 'beginner',
    } as any)

    render(
      <ContextualHelpSystem 
        helpItems={mockHelpItems}
        currentContext={['test-context']}
        autoShow={true}
      />
    )
    
    // Find and click hide button (X)
    const hideButton = screen.getByTitle('Hide')
    fireEvent.click(hideButton)
    
    // Item should be hidden but still available
    expect(screen.queryByText('This is a test warning with high priority.')).not.toBeInTheDocument()
  })

  it('respects maxItems limit', () => {
    const manyItems = Array.from({ length: 5 }, (_, i) => ({
      id: `item-${i}`,
      title: `Item ${i}`,
      content: `Content ${i}`,
      type: 'hint' as const,
      context: ['test-context'],
      difficulty: 'beginner' as const,
      trigger: 'manual' as const,
      priority: 'medium' as const
    }))

    mockUseUIStore.mockReturnValue({
      learningMode: 'beginner',
    } as any)

    render(
      <ContextualHelpSystem 
        helpItems={manyItems}
        currentContext={['test-context']}
        maxItems={2}
        autoShow={false}
      />
    )
    
    // Should only show first 2 items
    expect(screen.getByText('Item 0')).toBeInTheDocument()
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.queryByText('Item 2')).not.toBeInTheDocument()
  })

  it('filters by context', () => {
    const contextItems = [
      {
        id: 'relevant',
        title: 'Relevant Item',
        content: 'This is relevant.',
        type: 'hint' as const,
        context: ['test-context'],
        difficulty: 'beginner' as const,
        trigger: 'manual' as const,
        priority: 'medium' as const
      },
      {
        id: 'irrelevant',
        title: 'Irrelevant Item',
        content: 'This is not relevant.',
        type: 'hint' as const,
        context: ['other-context'],
        difficulty: 'beginner' as const,
        trigger: 'manual' as const,
        priority: 'medium' as const
      }
    ]

    mockUseUIStore.mockReturnValue({
      learningMode: 'beginner',
    } as any)

    render(
      <ContextualHelpSystem 
        helpItems={contextItems}
        currentContext={['test-context']}
        autoShow={false}
      />
    )
    
    expect(screen.getByText('Relevant Item')).toBeInTheDocument()
    expect(screen.queryByText('Irrelevant Item')).not.toBeInTheDocument()
  })

  it('returns null when showHints is false', () => {
    mockUseUIStore.mockReturnValue({
      learningMode: 'beginner',
      config: {
        showHints: false,
        showTechnicalDetails: false
      }
    } as any)

    const { container } = render(
      <ContextualHelpSystem
        helpItems={mockHelpItems}
        currentContext={['test-context']}
      />
    )

    // Should render nothing when hints are disabled
    expect(container.firstChild).toBeNull()
  })
})

describe('useContextualHelp', () => {
  it('manages context correctly', () => {
    const TestComponent = () => {
      const { currentContext, addContext, removeContext } = useContextualHelp()
      
      return (
        <div>
          <div data-testid="context">{currentContext.join(',')}</div>
          <button onClick={() => addContext('new-context')}>Add Context</button>
          <button onClick={() => removeContext('binary-search')}>Remove Context</button>
        </div>
      )
    }

    render(<TestComponent />)
    
    // Initial context
    expect(screen.getByTestId('context')).toHaveTextContent('binary-search')
    
    // Add context
    fireEvent.click(screen.getByText('Add Context'))
    expect(screen.getByTestId('context')).toHaveTextContent('binary-search,new-context')
    
    // Remove context
    fireEvent.click(screen.getByText('Remove Context'))
    expect(screen.getByTestId('context')).toHaveTextContent('new-context')
  })

  it('triggers help items correctly', () => {
    const TestComponent = () => {
      const { triggerHelp, triggeredItems } = useContextualHelp()
      
      return (
        <div>
          <div data-testid="triggered">{triggeredItems.size}</div>
          <button onClick={() => triggerHelp('error', ['binary-search'])}>Trigger Error</button>
        </div>
      )
    }

    render(<TestComponent />)
    
    // Initially no triggered items
    expect(screen.getByTestId('triggered')).toHaveTextContent('0')
    
    // Trigger help
    fireEvent.click(screen.getByText('Trigger Error'))
    expect(screen.getByTestId('triggered')).toHaveTextContent('2') // Should trigger error-type items
  })
})