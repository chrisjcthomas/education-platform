import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VisualizationCoordinator } from '@/components/visualization/visualization-coordinator';
import { useAlgorithmStore } from '@/lib/stores/algorithm-store';
import { usePerformanceStore } from '@/lib/stores/performance-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { AlgorithmStep } from '@/lib/types';

// Mock the stores
jest.mock('@/lib/stores/algorithm-store');
jest.mock('@/lib/stores/performance-store');
jest.mock('@/lib/stores/ui-store');

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockAlgorithmStore = {
  data: [1, 3, 5, 7, 9, 11, 13, 15],
  currentStep: 0,
  totalSteps: 5,
  executionHistory: [
    {
      type: 'init',
      indices: [],
      metadata: { left: 0, right: 7, target: 7 },
      description: 'Initialize search',
    },
    {
      type: 'highlight',
      indices: [0, 7],
      metadata: { left: 0, right: 7, searchRange: true },
      description: 'Highlight search range',
    },
    {
      type: 'compare',
      indices: [3],
      metadata: { left: 0, right: 7, mid: 3, comparison: '7 vs 7' },
      description: 'Compare with middle element',
    },
    {
      type: 'found',
      indices: [3],
      metadata: { left: 0, right: 7, mid: 3, found: true },
      description: 'Found target!',
    },
  ] as AlgorithmStep[],
  isRunning: false,
  isPaused: false,
  speed: 1,
  pointers: { left: 0, right: 7, mid: 3 },
  target: 7,
  getCurrentStepData: jest.fn(),
  nextStep: jest.fn(),
  pause: jest.fn(),
  play: jest.fn(),
  reset: jest.fn(),
  getProgress: jest.fn(() => 0.6),
};

const mockPerformanceStore = {
  fps: 60,
  isLowPerformance: false,
  updateFPS: jest.fn(),
  updatePerformanceMetrics: jest.fn(),
};

const mockUIStore = {
  preferences: {
    reducedMotion: false,
    animationSpeed: 1,
  },
};

describe('VisualizationCoordinator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    (useAlgorithmStore as jest.Mock).mockReturnValue(mockAlgorithmStore);
    (usePerformanceStore as jest.Mock).mockReturnValue(mockPerformanceStore);
    (useUIStore as jest.Mock).mockReturnValue(mockUIStore);
    
    mockAlgorithmStore.getCurrentStepData.mockReturnValue(mockAlgorithmStore.executionHistory[0]);
  });

  it('renders array elements correctly', () => {
    render(<VisualizationCoordinator />);
    
    // Check that all array elements are rendered
    mockAlgorithmStore.data.forEach((value) => {
      expect(screen.getByText(value.toString())).toBeInTheDocument();
    });
  });

  it('displays target indicator when target is set', () => {
    render(<VisualizationCoordinator />);
    
    expect(screen.getByText('Target: 7')).toBeInTheDocument();
  });

  it('shows step indicator by default', () => {
    render(<VisualizationCoordinator />);
    
    expect(screen.getByText('Initialize search')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
  });

  it('hides step indicator when showStepIndicator is false', () => {
    render(<VisualizationCoordinator showStepIndicator={false} />);
    
    expect(screen.queryByText('Initialize search')).not.toBeInTheDocument();
  });

  it('applies correct element states based on current step', () => {
    // Set current step to highlight step
    mockAlgorithmStore.getCurrentStepData.mockReturnValue(mockAlgorithmStore.executionHistory[1]);
    
    render(<VisualizationCoordinator />);
    
    // Elements at indices 0 and 7 should be highlighted
    const elements = screen.getAllByRole('button');
    expect(elements).toHaveLength(8); // All array elements
  });

  it('shows range highlights for search operations', () => {
    // Set current step to highlight step with search range
    mockAlgorithmStore.getCurrentStepData.mockReturnValue(mockAlgorithmStore.executionHistory[1]);
    
    render(<VisualizationCoordinator />);
    
    // Should show range highlight
    expect(screen.getByText('Search Range [0, 7]')).toBeInTheDocument();
  });

  it('displays pointer markers when showPointers is true', () => {
    // Set current step to compare step with pointers
    mockAlgorithmStore.getCurrentStepData.mockReturnValue(mockAlgorithmStore.executionHistory[2]);
    
    render(<VisualizationCoordinator showPointers={true} />);
    
    // Should render pointer markers (L, R, M)
    expect(screen.getByText('L')).toBeInTheDocument();
    expect(screen.getByText('R')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('hides pointer markers when showPointers is false', () => {
    mockAlgorithmStore.getCurrentStepData.mockReturnValue(mockAlgorithmStore.executionHistory[2]);
    
    render(<VisualizationCoordinator showPointers={false} />);
    
    expect(screen.queryByText('L')).not.toBeInTheDocument();
    expect(screen.queryByText('R')).not.toBeInTheDocument();
    expect(screen.queryByText('M')).not.toBeInTheDocument();
  });

  it('calls onStepComplete when step animation completes', async () => {
    const onStepComplete = jest.fn();
    
    render(
      <VisualizationCoordinator 
        onStepComplete={onStepComplete}
        autoPlay={true}
      />
    );
    
    // Mock running state
    mockAlgorithmStore.isRunning = true;
    mockAlgorithmStore.isPaused = false;
    
    // Wait for animation to complete
    await waitFor(() => {
      expect(onStepComplete).toHaveBeenCalledWith(mockAlgorithmStore.executionHistory[0]);
    }, { timeout: 2000 });
  });

  it('calls onAnimationComplete when reaching the end', async () => {
    const onAnimationComplete = jest.fn();
    
    // Set to last step
    mockAlgorithmStore.currentStep = 4;
    mockAlgorithmStore.getCurrentStepData.mockReturnValue(mockAlgorithmStore.executionHistory[3]);
    
    render(
      <VisualizationCoordinator 
        onAnimationComplete={onAnimationComplete}
        autoPlay={true}
      />
    );
    
    mockAlgorithmStore.isRunning = true;
    mockAlgorithmStore.isPaused = false;
    
    await waitFor(() => {
      expect(onAnimationComplete).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('respects reduced motion preference', () => {
    mockUIStore.preferences.reducedMotion = true;
    
    render(<VisualizationCoordinator />);
    
    expect(screen.getByText('Reduced Motion Mode')).toBeInTheDocument();
  });

  it('shows performance indicator in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    render(<VisualizationCoordinator />);
    
    expect(screen.getByText('FPS: 60')).toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });

  it('shows low performance mode indicator', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    mockPerformanceStore.isLowPerformance = true;
    
    render(<VisualizationCoordinator />);
    
    expect(screen.getByText('FPS: 60 (Low Performance Mode)')).toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });

  it('handles different element sizes', () => {
    const { rerender } = render(<VisualizationCoordinator elementSize="sm" />);
    
    // Check that elements have small size class
    const elements = screen.getAllByRole('button');
    elements.forEach(element => {
      expect(element).toHaveClass('w-8', 'h-8');
    });
    
    rerender(<VisualizationCoordinator elementSize="lg" />);
    
    // Check that elements have large size class
    const largeElements = screen.getAllByRole('button');
    largeElements.forEach(element => {
      expect(element).toHaveClass('w-16', 'h-16');
    });
  });

  it('handles empty data array', () => {
    mockAlgorithmStore.data = [];
    mockAlgorithmStore.getCurrentStepData.mockReturnValue(null);
    
    render(<VisualizationCoordinator />);
    
    // Should not crash and should not show any elements
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('updates performance metrics during animation', async () => {
    render(<VisualizationCoordinator />);
    
    // Wait for performance monitoring to start
    await waitFor(() => {
      expect(mockPerformanceStore.updateFPS).toHaveBeenCalled();
    });
  });

  it('handles step changes correctly', () => {
    const { rerender } = render(<VisualizationCoordinator />);
    
    // Change to next step
    mockAlgorithmStore.currentStep = 1;
    mockAlgorithmStore.getCurrentStepData.mockReturnValue(mockAlgorithmStore.executionHistory[1]);
    
    rerender(<VisualizationCoordinator />);
    
    expect(screen.getByText('Highlight search range')).toBeInTheDocument();
  });

  it('cleans up resources on unmount', () => {
    const { unmount } = render(<VisualizationCoordinator />);
    
    // Mock RAF and timeout cleanup
    const cancelAnimationFrameSpy = jest.spyOn(window, 'cancelAnimationFrame');
    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');
    
    unmount();
    
    // Cleanup should be called (though we can't easily test the exact calls)
    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
    
    cancelAnimationFrameSpy.mockRestore();
    clearTimeoutSpy.mockRestore();
  });
});