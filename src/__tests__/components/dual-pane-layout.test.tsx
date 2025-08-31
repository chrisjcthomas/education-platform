import { render, screen } from '@testing-library/react'
import { DualPaneLayout } from '@/components/layout/dual-pane-layout'
import { StoreProvider } from '@/components/providers/store-provider'

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <StoreProvider>{children}</StoreProvider>
)

describe('DualPaneLayout', () => {
  const mockLeftPane = <div data-testid="left-pane">Left Content</div>
  const mockRightPane = <div data-testid="right-pane">Right Content</div>
  const mockOnSplitChange = jest.fn()

  test('renders both panes in horizontal layout on desktop', () => {
    render(
      <TestWrapper>
        <DualPaneLayout
          leftPane={mockLeftPane}
          rightPane={mockRightPane}
          splitRatio={0.5}
          onSplitChange={mockOnSplitChange}
          isMobile={false}
        />
      </TestWrapper>
    )

    expect(screen.getByTestId('left-pane')).toBeInTheDocument()
    expect(screen.getByTestId('right-pane')).toBeInTheDocument()
  })

  test('handles split ratio changes', () => {
    render(
      <TestWrapper>
        <DualPaneLayout
          leftPane={mockLeftPane}
          rightPane={mockRightPane}
          splitRatio={0.6}
          onSplitChange={mockOnSplitChange}
          isMobile={false}
        />
      </TestWrapper>
    )

    expect(screen.getByTestId('left-pane')).toBeInTheDocument()
    expect(screen.getByTestId('right-pane')).toBeInTheDocument()
  })
})