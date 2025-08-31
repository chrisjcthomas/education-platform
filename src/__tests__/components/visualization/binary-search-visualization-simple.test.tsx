import React from 'react';
import { render, screen } from '@testing-library/react';
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
  ArrayElement: ({ value, index }: any) => (
    <div data-testid={`array-element-${index}`}>{value}</div>
  ),
}));

jest.mock('@/components/visualization/pointer-marker', () => ({
  PointerMarker: ({ type, position }: any) => (
    <div data-testid={`pointer-${type}`}>Pointer at {position}</div>
  ),
}));

jest.mock('@/components/visualization/range-highlight', () => ({
  RangeHighlight: ({ type }: any) => (
    <div data-testid={`range-${type}`}>Range highlight</div>
  ),
}));

jest.mock('@/components/visualization/step-indicator', () => ({
  StepIndicator: ({ currentStep, totalSteps, description }: any) => (
    <div data-testid="step-indicator">
      <div>Step {currentStep} of {totalSteps}</div>
      <div>{description}</div>
    </div>
  ),
}));

describe('BinarySearchVisualization - Simple Tests', () => {
  const mockData = [1, 3, 5, 7, 9];
  const mockTarget = 7;

  const defaultProps = {
    data: mockData,
    target: mockTarget,
    currentStep: null,
    stepNumber: 0,
    totalSteps: 3,
    isRunning: false,
    animationSpeed: 1,
  };

  it('renders array elements correctly', () => {
    render(<BinarySearchVisualization {...defaultProps} />);
    
    // Check that all array elements are rendered
    mockData.forEach((value, index) => {
      expect(screen.getByTestId(`array-element-${index}`)).toBeInTheDocument();
    });
  });

  it('displays target information', () => {
    render(<BinarySearchVisualization {...defaultProps} />);
    
    expect(screen.getByText('Searching for')).toBeInTheDocument();
    expect(screen.getByText(`Array size: ${mockData.length}`)).toBeInTheDocument();
  });

  it('shows Big-O analysis overlay', () => {
    render(<BinarySearchVisualization {...defaultProps} />);
    
    expect(screen.getByText('Big-O Analysis')).toBeInTheDocument();
    expect(screen.getByText('O(log n)')).toBeInTheDocument();
    expect(screen.getByText('O(1)')).toBeInTheDocument();
  });

  it('displays step indicator', () => {
    render(<BinarySearchVisualization {...defaultProps} />);
    
    expect(screen.getByTestId('step-indicator')).toBeInTheDocument();
    expect(screen.getByText('Step 0 of 3')).toBeInTheDocument();
    expect(screen.getByText('Ready to start binary search')).toBeInTheDocument();
  });

  it('handles compare step with pointers', () => {
    const compareStep: AlgorithmStep = {
      type: 'compare',
      indices: [2],
      metadata: {
        left: 0,
        right: 4,
        mid: 2,
        targetValue: 7,
        midValue: 5,
        comparisonCount: 1,
      },
      description: 'Compare target(7) with mid(5)',
    };

    render(
      <BinarySearchVisualization
        {...defaultProps}
        currentStep={compareStep}
        stepNumber={1}
      />
    );

    // Check that pointers are rendered
    expect(screen.getByTestId('pointer-left')).toBeInTheDocument();
    expect(screen.getByTestId('pointer-right')).toBeInTheDocument();
    expect(screen.getByTestId('pointer-mid')).toBeInTheDocument();
    
    // Check step description includes comparison count
    expect(screen.getByText('Compare target(7) with mid(5) (1 comparisons so far)')).toBeInTheDocument();
  });

  it('shows found state correctly', () => {
    const foundStep: AlgorithmStep = {
      type: 'found',
      indices: [3],
      metadata: {
        found: true,
        foundIndex: 3,
      },
      description: 'Found target at index 3',
    };

    render(
      <BinarySearchVisualization
        {...defaultProps}
        currentStep={foundStep}
        stepNumber={2}
      />
    );

    expect(screen.getByText('🎉 Found at index 3!')).toBeInTheDocument();
    expect(screen.getByTestId('range-found')).toBeInTheDocument();
  });

  it('displays search range information', () => {
    const searchStep: AlgorithmStep = {
      type: 'compare',
      indices: [2],
      metadata: {
        left: 1,
        right: 3,
        mid: 2,
        comparisonCount: 1,
      },
      description: 'Searching in range',
    };

    render(
      <BinarySearchVisualization
        {...defaultProps}
        currentStep={searchStep}
        stepNumber={1}
      />
    );

    // Should show range highlight and pointers
    expect(screen.getByTestId('range-searching')).toBeInTheDocument();
    expect(screen.getByTestId('pointer-left')).toBeInTheDocument();
    expect(screen.getByTestId('pointer-right')).toBeInTheDocument();
    expect(screen.getByTestId('pointer-mid')).toBeInTheDocument();
  });

  it('handles empty array', () => {
    const emptyProps = {
      ...defaultProps,
      data: [],
    };

    render(<BinarySearchVisualization {...emptyProps} />);
    
    expect(screen.getByText('Array size: 0')).toBeInTheDocument();
    expect(screen.getByText('Ready to start binary search')).toBeInTheDocument();
  });

  it('shows Big-O step count when available', () => {
    const stepWithComparisons: AlgorithmStep = {
      type: 'compare',
      indices: [2],
      metadata: {
        comparisonCount: 2,
      },
      description: 'Comparing elements',
    };

    render(
      <BinarySearchVisualization
        {...defaultProps}
        currentStep={stepWithComparisons}
        stepNumber={2}
      />
    );

    const maxComparisons = Math.ceil(Math.log2(mockData.length));
    expect(screen.getByText(`2/${maxComparisons}`)).toBeInTheDocument();
  });
});