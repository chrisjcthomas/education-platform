import { render, screen, fireEvent } from '@testing-library/react';
import { ArrayElement } from '@/components/visualization/array-element';

describe('ArrayElement', () => {
  it('renders with correct value and index', () => {
    render(<ArrayElement value={42} index={0} state="normal" />);
    
    const element = screen.getByRole('button');
    expect(element).toHaveTextContent('42');
    expect(element).toHaveAttribute('aria-label', 'Array element 0 with value 42, state: normal');
  });

  it('applies correct styling for different states', () => {
    const { rerender } = render(<ArrayElement value={10} index={0} state="normal" />);
    let element = screen.getByRole('button');
    expect(element).toBeInTheDocument();

    rerender(<ArrayElement value={10} index={0} state="highlighted" />);
    element = screen.getByRole('button');
    expect(element).toHaveAttribute('aria-label', 'Array element 0 with value 10, state: highlighted');

    rerender(<ArrayElement value={10} index={0} state="found" />);
    element = screen.getByRole('button');
    expect(element).toHaveAttribute('aria-label', 'Array element 0 with value 10, state: found');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<ArrayElement value={5} index={2} state="normal" onClick={handleClick} />);
    
    const element = screen.getByRole('button');
    fireEvent.click(element);
    
    expect(handleClick).toHaveBeenCalledWith(2);
  });

  it('handles keyboard events', () => {
    const handleClick = jest.fn();
    render(<ArrayElement value={5} index={2} state="normal" onClick={handleClick} />);
    
    const element = screen.getByRole('button');
    fireEvent.keyDown(element, { key: 'Enter' });
    
    expect(handleClick).toHaveBeenCalledWith(2);
  });

  it('applies different sizes correctly', () => {
    const { rerender } = render(<ArrayElement value={1} index={0} state="normal" size="sm" />);
    let element = screen.getByRole('button');
    expect(element).toHaveClass('w-8', 'h-8', 'text-sm');

    rerender(<ArrayElement value={1} index={0} state="normal" size="lg" />);
    element = screen.getByRole('button');
    expect(element).toHaveClass('w-16', 'h-16', 'text-lg');
  });

  it('does not have click behavior when onClick is not provided', () => {
    render(<ArrayElement value={5} index={2} state="normal" />);
    
    const element = screen.getByRole('button');
    expect(element).toHaveAttribute('tabIndex', '-1');
  });
});