import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { SpeedSlider } from '@/components/controls/speed-slider'

describe('SpeedSlider', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with correct initial value', () => {
    render(<SpeedSlider value={1.5} onChange={mockOnChange} />)
    
    const slider = screen.getByRole('slider')
    expect(slider).toHaveValue('1.5')
  })

  it('displays correct speed label for different values', () => {
    const { rerender } = render(<SpeedSlider value={0.2} onChange={mockOnChange} />)
    expect(screen.getByText('0.2x')).toBeInTheDocument()

    rerender(<SpeedSlider value={0.5} onChange={mockOnChange} />)
    expect(screen.getByText('0.5x')).toBeInTheDocument()

    rerender(<SpeedSlider value={1.0} onChange={mockOnChange} />)
    expect(screen.getByText('1.0x')).toBeInTheDocument()

    rerender(<SpeedSlider value={2.5} onChange={mockOnChange} />)
    expect(screen.getByText('2.5x')).toBeInTheDocument()

    rerender(<SpeedSlider value={5.0} onChange={mockOnChange} />)
    expect(screen.getByText('5.0x')).toBeInTheDocument()
  })

  it('calls onChange when slider value changes', () => {
    render(<SpeedSlider value={1.0} onChange={mockOnChange} />)
    
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '2.5' } })
    
    expect(mockOnChange).toHaveBeenCalledWith(2.5)
  })

  it('has correct accessibility attributes', () => {
    render(<SpeedSlider value={1.5} onChange={mockOnChange} />)
    
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-label', 'Animation speed: Fast') // 1.5 is Fast, not Normal
    expect(slider).toHaveAttribute('aria-valuemin', '0.1')
    expect(slider).toHaveAttribute('aria-valuemax', '5')
    expect(slider).toHaveAttribute('aria-valuenow', '1.5')
    expect(slider).toHaveAttribute('aria-valuetext', '1.5x speed - Fast')
  })

  it('can be disabled', () => {
    render(<SpeedSlider value={1.0} onChange={mockOnChange} disabled />)
    
    const slider = screen.getByRole('slider')
    expect(slider).toBeDisabled()
  })

  it('renders in compact mode correctly', () => {
    render(<SpeedSlider value={1.0} onChange={mockOnChange} compact />)
    
    // In compact mode, the speed value should not be visible
    expect(screen.queryByText('1.0x')).not.toBeInTheDocument()
    
    // But should have screen reader text
    expect(screen.getByText(/Speed: 1.0x - Normal/)).toHaveClass('sr-only')
  })

  it('provides correct speed labels for different ranges', () => {
    const testCases = [
      { value: 0.1, expectedLabel: 'Very Slow' },
      { value: 0.25, expectedLabel: 'Very Slow' },
      { value: 0.5, expectedLabel: 'Slow' },
      { value: 1.0, expectedLabel: 'Normal' },
      { value: 1.5, expectedLabel: 'Fast' },
      { value: 2.5, expectedLabel: 'Very Fast' },
      { value: 5.0, expectedLabel: 'Maximum' }
    ]

    testCases.forEach(({ value, expectedLabel }) => {
      const { rerender } = render(<SpeedSlider value={value} onChange={mockOnChange} />)
      
      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('aria-label', `Animation speed: ${expectedLabel}`)
      
      rerender(<div />)
    })
  })

  it('handles edge cases for slider range', () => {
    render(<SpeedSlider value={1.0} onChange={mockOnChange} />)
    
    const slider = screen.getByRole('slider')
    
    // Test minimum value
    fireEvent.change(slider, { target: { value: '0.1' } })
    expect(mockOnChange).toHaveBeenCalledWith(0.1)
    
    // Test maximum value
    fireEvent.change(slider, { target: { value: '5' } })
    expect(mockOnChange).toHaveBeenCalledWith(5)
  })

  it('has proper styling classes', () => {
    const { container } = render(<SpeedSlider value={1.0} onChange={mockOnChange} />)
    
    const slider = screen.getByRole('slider')
    expect(slider).toHaveClass('cursor-pointer')
    expect(slider).toHaveClass('focus:outline-none')
    expect(slider).toHaveClass('focus:ring-2')
  })

  it('shows gauge icon', () => {
    render(<SpeedSlider value={1.0} onChange={mockOnChange} />)
    
    // The gauge icon should be present with aria-hidden attribute
    const icon = document.querySelector('[aria-hidden="true"]')
    expect(icon).toBeInTheDocument()
  })
})