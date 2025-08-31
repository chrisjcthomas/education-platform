import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BinarySearchVisualization } from '@/components/visualization/binary-search-visualization';
import { AlgorithmStep } from '@/lib/types';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock the visualization components
jest.mock('@/components/visualization/array-element', () => ({
  ArrayElement: ({ value, index, onClick }: any) => (
    <div 
      onClick={() => onClick?.(index)}
      onKeyDown={(e: any) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick(index);
        }
      }}
      role="button"
      tabIndex={onClick ? 0 : -1}
      aria-label={`Array element ${index} with value ${value}, state: normal`}
    >
      {value}
    </div>
  ),
}));

jest.mock('@/components/visualization/pointer-marker', () => ({
  PointerMarker: ({ type, position, label }: any) => (
    <div>{label || `${type.charAt(0).toUpperCase() + type.slice(1)} (${position})`}</div>
  ),
}));

jest.mock('@/components/visualization/range-highlight', () => ({
  RangeHighlight: ({ type, label }: any) => (
    <div>{label || type}</div>
  ),
}));

jest.mock('@/components/visualization/step-indicator', () => ({
  StepIndicator: ({ currentStep, totalSteps, description, details }: any) => (
    <div>
      <div>Step {currentStep} of {totalSteps}</div>
      <div>{description}</div>
      {details && <div>{details}</div>}
    </div>
  ),
}));

describe('BinarySearchVisualization', () => {
  const mockData = [1, 3, 5, 7, 9, 11, 13, 15];
  const mockTarget = 7;

  const createMockStep = (
    type: string,
    metadata: Record<string, any> = {},
    description: string = 'Test step'
  ): AlgorithmStep => ({
    type: type as any,
    indices: [],
    metadata,
    description,
    operationCount: 1,
  });

  const defaultProps = {
    data: mockData,
    target: mockTarget,
    currentStep: null,
    stepNumber: 0,
    totalSteps: 5,
    isRunning: false,
    animationSpeed: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders array elements correctly', () => {
      render(<BinarySearchVisualization {...defaultProps} />);

      mockData.forEach((value, index) => {
        // Use more specific query by aria-label to avoid conflicts
        expect(screen.getByLabelText(`Array element ${index} with value ${value}, state: normal`)).toBeInTheDocument();
      });
    });

    it('displays target information', () => {
      render(<BinarySearchVisualization {...defaultProps} />);

      expect(screen.getByText('Searching for')).toBeInTheDocument();
      // Use more specific query for target value in the search info panel
      expect(screen.getByText('Searching for').parentElement?.querySelector('.text-2xl')).toHaveTextContent(mockTarget.toString());
      expect(screen.getByText(`Array size: ${mockData.length}`)).toBeInTheDocument();
    });

    it('shows Big-O analysis overlay', () => {
      render(<BinarySearchVisualization {...defaultProps} />);
      
      expect(screen.getByText('Big-O Analysis')).toBeInTheDocument();
      expect(screen.getByText('O(log n)')).toBeInTheDocument();
      expect(screen.getByText('O(1)')).toBeInTheDocument();
    });

    it('displays initial step indicator', () => {
      render(<BinarySearchVisualization {...defaultProps} />);
      
      expect(screen.getByText('Ready to start binary search')).toBeInTheDocument();
      expect(screen.getByText('Step 0 of 5')).toBeInTheDocument();
    });
  });

  describe('Step Visualization', () => {
    it('highlights mid element during compare step', () => {
      const compareStep = createMockStep('compare', {
        left: 0,
        right: 7,
        mid: 3,
        targetValue: 7,
        midValue: 7,
        comparisonCount: 1,
      }, 'Compare target(7) with mid(7)');

      render(
        <BinarySearchVisualization
          {...defaultProps}
          currentStep={compareStep}
          stepNumber={1}
        />
      );

      expect(screen.getByText('Compare target(7) with mid(7) (1 comparisons so far)')).toBeInTheDocument();
    });

    it('shows pointer markers for left, right, and mid', () => {
      const stepWithPointers = createMockStep('compare', {
        left: 0,
        right: 7,
        mid: 3,
      });

      render(
        <BinarySearchVisualization
          {...defaultProps}
          currentStep={stepWithPointers}
        />
      );

      // Check for pointer labels (these would be in the PointerMarker components)
      expect(screen.getByText('Left (0)')).toBeInTheDocument();
      expect(screen.getByText('Right (7)')).toBeInTheDocument();
      expect(screen.getByText('Mid (3)')).toBeInTheDocument();
    });

    it('displays found state correctly', () => {
      const foundStep = createMockStep('found', {
        found: true,
        foundIndex: 3,
      }, 'Found target at index 3');

      render(
        <BinarySearchVisualization
          {...defaultProps}
          currentStep={foundStep}
        />
      );

      expect(screen.getByText('🎉 Found at index 3!')).toBeInTheDocument();
    });

    it('shows elimination ranges', () => {
      const eliminateStep = createMockStep('eliminate', {
        eliminatedRange: { start: 4, end: 7 },
      });

      render(
        <BinarySearchVisualization
          {...defaultProps}
          currentStep={eliminateStep}
        />
      );

      // The RangeHighlight component should render with eliminated type
      expect(screen.getByText('Eliminated')).toBeInTheDocument();
    });
  });

  describe('Big-O Integration', () => {
    it('displays comparison count in step details', () => {
      const stepWithComparisons = createMockStep('compare', {
        comparisonCount: 2,
        targetValue: 7,
        midValue: 9,
      });

      render(
        <BinarySearchVisualization
          {...defaultProps}
          currentStep={stepWithComparisons}
        />
      );

      const maxComparisons = Math.ceil(Math.log2(mockData.length));
      expect(screen.getByText(new RegExp(`Max possible: ${maxComparisons} comparisons \\(O\\(log n\\)\\)`))).toBeInTheDocument();
    });

    it('shows current step count in Big-O overlay', () => {
      const stepWithComparisons = createMockStep('compare', {
        comparisonCount: 2,
      });

      render(
        <BinarySearchVisualization
          {...defaultProps}
          currentStep={stepWithComparisons}
        />
      );

      const maxComparisons = Math.ceil(Math.log2(mockData.length));
      expect(screen.getByText(`2/${maxComparisons}`)).toBeInTheDocument();
    });
  });

  describe('Interactive Features', () => {
    it('calls onElementClick when element is clicked', () => {
      const mockOnElementClick = jest.fn();
      
      render(
        <BinarySearchVisualization
          {...defaultProps}
          onElementClick={mockOnElementClick}
        />
      );

      // Find the first array element and click it
      const firstElement = screen.getByLabelText('Array element 0 with value 1, state: normal');
      fireEvent.click(firstElement);

      expect(mockOnElementClick).toHaveBeenCalledWith(0);
    });

    it('handles keyboard navigation on elements', () => {
      const mockOnElementClick = jest.fn();
      
      render(
        <BinarySearchVisualization
          {...defaultProps}
          onElementClick={mockOnElementClick}
        />
      );

      const firstElement = screen.getByLabelText('Array element 0 with value 1, state: normal');
      fireEvent.keyDown(firstElement, { key: 'Enter' });

      expect(mockOnElementClick).toHaveBeenCalledWith(0);
    });
  });

  describe('Animation Speed', () => {
    it('applies animation speed to transitions', () => {
      const fastAnimationProps = {
        ...defaultProps,
        animationSpeed: 2,
      };

      render(<BinarySearchVisualization {...fastAnimationProps} />);
      
      // The component should render without errors with different animation speeds
      expect(screen.getByText('Searching for')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty array', () => {
      const emptyArrayProps = {
        ...defaultProps,
        data: [],
      };

      render(<BinarySearchVisualization {...emptyArrayProps} />);
      
      expect(screen.getByText('Array size: 0')).toBeInTheDocument();
    });

    it('handles single element array', () => {
      const singleElementProps = {
        ...defaultProps,
        data: [5],
      };

      render(<BinarySearchVisualization {...singleElementProps} />);
      
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Array size: 1')).toBeInTheDocument();
    });

    it('handles null current step', () => {
      render(
        <BinarySearchVisualization
          {...defaultProps}
          currentStep={null}
        />
      );

      expect(screen.getByText('Ready to start binary search')).toBeInTheDocument();
    });
  });

  describe('Search Range Visualization', () => {
    it('shows active search range', () => {
      const searchStep = createMockStep('compare', {
        left: 2,
        right: 5,
      });

      render(
        <BinarySearchVisualization
          {...defaultProps}
          currentStep={searchStep}
        />
      );

      const searchSpaceSize = 5 - 2 + 1;
      expect(screen.getByText(`Search Range (${searchSpaceSize} elements)`)).toBeInTheDocument();
    });

    it('displays search space size in step details', () => {
      const searchStep = createMockStep('compare', {
        left: 1,
        right: 6,
        comparisonCount: 1,
      });

      render(
        <BinarySearchVisualization
          {...defaultProps}
          currentStep={searchStep}
        />
      );

      expect(screen.getByText('Search space: 6 elements')).toBeInTheDocument();
    });
  });

  describe('Success Animation', () => {
    it('shows success animation when element is found', () => {
      const successStep = createMockStep('found', {
        found: true,
        foundIndex: 4,
      });

      render(
        <BinarySearchVisualization
          {...defaultProps}
          currentStep={successStep}
        />
      );

      expect(screen.getByText('🎉 Found at index 4!')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels for array elements', () => {
      render(<BinarySearchVisualization {...defaultProps} />);
      
      const firstElement = screen.getByLabelText(/Array element 0 with value 1/);
      expect(firstElement).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      const mockOnElementClick = jest.fn();
      
      render(
        <BinarySearchVisualization
          {...defaultProps}
          onElementClick={mockOnElementClick}
        />
      );

      const firstElement = screen.getByText('1');
      
      // Test Enter key
      fireEvent.keyDown(firstElement, { key: 'Enter' });
      expect(mockOnElementClick).toHaveBeenCalledWith(0);

      // Test Space key
      fireEvent.keyDown(firstElement, { key: ' ' });
      expect(mockOnElementClick).toHaveBeenCalledTimes(2);
    });
  });
});