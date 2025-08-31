import React from 'react'
import { render, screen } from '@testing-library/react'
import { OperationCounter } from '../../../components/analysis/operation-counter'
import { useBigOStore } from '../../../lib/stores/big-o-store'

// Mock the store
jest.mock('../../../lib/stores/big-o-store')
const mockUseBigOStore = useBigOStore as jest.MockedFunction<typeof useBigOStore>

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}))

describe('OperationCounter', () => {
  const mockStoreState = {
    operationCounter: 5,
    currentAnalysis: {
      complexity: {
        notation: 'O(log n)',
        name: 'Logarithmic',
        category: 'excellent' as const,
        color: '#10b981'
      },
      operationCount: 5,
      inputSize: 16,
      efficiency: 85,
      description: 'Test description',
      plainLanguageExplanation: 'Test explanation'
    },
    showRealTimeCounter: true,
    isTracking: true
  }

  beforeEach(() => {
    mockUseBigOStore.mockReturnValue(mockStoreState as any)
  })

  it('should render operation counter when tracking and showing counter', () => {
    render(<OperationCounter />)

    expect(screen.getByText('Operations:')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('should render complexity badge when showBadge is true', () => {
    render(<OperationCounter showBadge={true} />)

    expect(screen.getByText('O(log n)')).toBeInTheDocument()
  })

  it('should not render complexity badge when showBadge is false', () => {
    render(<OperationCounter showBadge={false} />)

    expect(screen.queryByText('O(log n)')).not.toBeInTheDocument()
  })

  it('should render efficiency details when showDetails is true', () => {
    render(<OperationCounter showDetails={true} />)

    expect(screen.getByText('Efficiency:')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
  })

  it('should not render when not tracking', () => {
    mockUseBigOStore.mockReturnValue({
      ...mockStoreState,
      isTracking: false
    } as any)

    const { container } = render(<OperationCounter />)
    expect(container.firstChild).toBeNull()
  })

  it('should not render when showRealTimeCounter is false', () => {
    mockUseBigOStore.mockReturnValue({
      ...mockStoreState,
      showRealTimeCounter: false
    } as any)

    const { container } = render(<OperationCounter />)
    expect(container.firstChild).toBeNull()
  })

  it('should apply custom className', () => {
    const { container } = render(<OperationCounter className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should handle missing currentAnalysis', () => {
    mockUseBigOStore.mockReturnValue({
      ...mockStoreState,
      currentAnalysis: null
    } as any)

    render(<OperationCounter showBadge={true} />)

    expect(screen.getByText('Operations:')).toBeInTheDocument()
    expect(screen.queryByText('O(log n)')).not.toBeInTheDocument()
  })
})