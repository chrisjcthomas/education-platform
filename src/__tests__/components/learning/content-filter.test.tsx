import React from 'react'
import { render, screen } from '@testing-library/react'
import { 
  ContentFilter, 
  ConditionalContent,
  BeginnerOnly,
  CuriousOnly,
  DetailsOnly,
  CodeModes,
  AdvancedModes,
  useModeConfig
} from '@/components/learning/content-filter'
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

describe('ContentFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows content when current mode is in allowed modes', () => {
    mockUseUIStore.mockReturnValue({
      learningMode: 'beginner',
    } as any)

    render(
      <ContentFilter modes={['beginner', 'curious']}>
        <div>Test content</div>
      </ContentFilter>
    )
    
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('hides content when current mode is not in allowed modes', () => {
    mockUseUIStore.mockReturnValue({
      learningMode: 'details',
    } as any)

    render(
      <ContentFilter modes={['beginner', 'curious']}>
        <div>Test content</div>
      </ContentFilter>
    )
    
    expect(screen.queryByText('Test content')).not.toBeInTheDocument()
  })

  it('shows fallback when content is hidden and fallback is provided', () => {
    mockUseUIStore.mockReturnValue({
      learningMode: 'details',
    } as any)

    render(
      <ContentFilter 
        modes={['beginner', 'curious']} 
        fallback={<div>Fallback content</div>}
      >
        <div>Test content</div>
      </ContentFilter>
    )
    
    expect(screen.queryByText('Test content')).not.toBeInTheDocument()
    expect(screen.getByText('Fallback content')).toBeInTheDocument()
  })
})

describe('ConditionalContent', () => {
  it('shows content only for the specified mode', () => {
    mockUseUIStore.mockReturnValue({
      learningMode: 'curious',
    } as any)

    render(
      <ConditionalContent mode="curious">
        <div>Curious content</div>
      </ConditionalContent>
    )
    
    expect(screen.getByText('Curious content')).toBeInTheDocument()
  })

  it('hides content for different modes', () => {
    mockUseUIStore.mockReturnValue({
      learningMode: 'beginner',
    } as any)

    render(
      <ConditionalContent mode="curious">
        <div>Curious content</div>
      </ConditionalContent>
    )
    
    expect(screen.queryByText('Curious content')).not.toBeInTheDocument()
  })
})

describe('Mode-specific components', () => {
  it('BeginnerOnly shows content only in beginner mode', () => {
    mockUseUIStore.mockReturnValue({
      learningMode: 'beginner',
    } as any)

    render(
      <BeginnerOnly>
        <div>Beginner content</div>
      </BeginnerOnly>
    )
    
    expect(screen.getByText('Beginner content')).toBeInTheDocument()
  })

  it('CuriousOnly shows content only in curious mode', () => {
    mockUseUIStore.mockReturnValue({
      learningMode: 'curious',
    } as any)

    render(
      <CuriousOnly>
        <div>Curious content</div>
      </CuriousOnly>
    )
    
    expect(screen.getByText('Curious content')).toBeInTheDocument()
  })

  it('DetailsOnly shows content only in details mode', () => {
    mockUseUIStore.mockReturnValue({
      learningMode: 'details',
    } as any)

    render(
      <DetailsOnly>
        <div>Details content</div>
      </DetailsOnly>
    )
    
    expect(screen.getByText('Details content')).toBeInTheDocument()
  })

  it('CodeModes shows content in curious and details modes', () => {
    mockUseUIStore.mockReturnValue({
      learningMode: 'curious',
    } as any)

    render(
      <CodeModes>
        <div>Code content</div>
      </CodeModes>
    )
    
    expect(screen.getByText('Code content')).toBeInTheDocument()

    // Test details mode
    mockUseUIStore.mockReturnValue({
      learningMode: 'details',
    } as any)

    render(
      <CodeModes>
        <div>Code content 2</div>
      </CodeModes>
    )
    
    expect(screen.getByText('Code content 2')).toBeInTheDocument()
  })

  it('AdvancedModes shows content only in details mode', () => {
    mockUseUIStore.mockReturnValue({
      learningMode: 'details',
    } as any)

    render(
      <AdvancedModes>
        <div>Advanced content</div>
      </AdvancedModes>
    )
    
    expect(screen.getByText('Advanced content')).toBeInTheDocument()
  })
})

describe('useModeConfig hook', () => {
  const TestComponent = () => {
    const config = useModeConfig()
    return (
      <div>
        <div data-testid="show-code">{config.showCode.toString()}</div>
        <div data-testid="show-technical">{config.showTechnicalDetails.toString()}</div>
        <div data-testid="show-analogies">{config.showAnalogies.toString()}</div>
        <div data-testid="animation-speed">{config.animationSpeed}</div>
        <div data-testid="simplified-ui">{config.simplifiedUI.toString()}</div>
      </div>
    )
  }

  it('returns correct config for beginner mode', () => {
    mockUseUIStore.mockReturnValue({
      learningMode: 'beginner',
    } as any)

    render(<TestComponent />)
    
    expect(screen.getByTestId('show-code')).toHaveTextContent('false')
    expect(screen.getByTestId('show-technical')).toHaveTextContent('false')
    expect(screen.getByTestId('show-analogies')).toHaveTextContent('true')
    expect(screen.getByTestId('animation-speed')).toHaveTextContent('0.7')
    expect(screen.getByTestId('simplified-ui')).toHaveTextContent('true')
  })

  it('returns correct config for curious mode', () => {
    mockUseUIStore.mockReturnValue({
      learningMode: 'curious',
    } as any)

    render(<TestComponent />)
    
    expect(screen.getByTestId('show-code')).toHaveTextContent('true')
    expect(screen.getByTestId('show-technical')).toHaveTextContent('false')
    expect(screen.getByTestId('show-analogies')).toHaveTextContent('true')
    expect(screen.getByTestId('animation-speed')).toHaveTextContent('1')
    expect(screen.getByTestId('simplified-ui')).toHaveTextContent('false')
  })

  it('returns correct config for details mode', () => {
    mockUseUIStore.mockReturnValue({
      learningMode: 'details',
    } as any)

    render(<TestComponent />)
    
    expect(screen.getByTestId('show-code')).toHaveTextContent('true')
    expect(screen.getByTestId('show-technical')).toHaveTextContent('true')
    expect(screen.getByTestId('show-analogies')).toHaveTextContent('false')
    expect(screen.getByTestId('animation-speed')).toHaveTextContent('1.2')
    expect(screen.getByTestId('simplified-ui')).toHaveTextContent('false')
  })
})