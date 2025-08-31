import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />)
    
    const heading = screen.getByRole('heading', {
      name: /interactive algorithm education platform/i,
    })
    
    expect(heading).toBeInTheDocument()
  })

  it('renders all three learning modes', () => {
    render(<Home />)
    
    expect(screen.getByText('Complete Beginner')).toBeInTheDocument()
    expect(screen.getByText('Curious About Code')).toBeInTheDocument()
    expect(screen.getByText('Show Me Details')).toBeInTheDocument()
  })

  it('renders the binary search visualization preview', () => {
    render(<Home />)
    
    expect(screen.getByText('Featured: Binary Search Visualization')).toBeInTheDocument()
    expect(screen.getByText('Target: 7 | Steps: 0 | Complexity: O(log n)')).toBeInTheDocument()
  })

  it('renders control buttons', () => {
    render(<Home />)
    
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /step/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })
})