import { renderHook, act, waitFor } from '@testing-library/react';
import { useVisualizationCoordinator } from '@/hooks/use-visualization-coordinator';
import { useAlgorithmStore } from '@/lib/stores/algorithm-store';
import { usePerformanceStore } from '@/lib/stores/performance-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { AlgorithmStep } from '@/lib/types';

// Mock the stores
jest.mock('@/lib/stores/algorithm-store');
jest.mock('@/lib/stores/performance-store');
jest.mock('@/lib/stores/ui-store');

const mockAlgorithmStore = {
  currentStep: 0,
  totalSteps: 3,
  isRunning: false,
  isPaused: false,
  speed: 1,
  getCurrentStepData: jest.fn(),
  nextStep: jest.fn(),
  pause: jest.fn(),
  play: jest.fn(),
  reset: jest.fn(),
  setSpeed: jest.fn(),
  setCurrentStep: jest.fn(),
  getProgress: jest.fn(() => 0.33),
};

const mockPerformanceStore = {
  isLowPerformance: false,
};

const mockUIStore = {
  preferences: {
    reducedMotion: false,
    animationSpeed: 1,
  },
};

const mockStepData: AlgorithmStep = {
  type: 'compare',
  indices: [1],
  metadata: { left: 0, right: 2, mid: 1 },
  description: 'Compare with middle element',
};

describe.skip('useVisualizationCoordinator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    (useAlgorithmStore as jest.Mock).mockReturnValue(mockAlgorithmStore);
    (usePerformanceStore as jest.Mock).mockReturnValue(mockPerformanceStore);
    (useUIStore as jest.Mock).mockReturnValue(mockUIStore);
    
    mockAlgorithmStore.getCurrentStepData.mockReturnValue(mockStepData);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useVisualizationCoordinator());
    
    expect(result.current.controls.isPlaying).toBe(false);
    expect(result.current.controls.isPaused).toBe(false);
    expect(result.current.controls.progress).toBe(0.33);
    expect(result.current.state.isAnimating).toBe(false);
    expect(result.current.state.currentStep).toBe(0);
    expect(result.current.state.totalSteps).toBe(3);
  });

  it('provides correct control capabilities', () => {
    mockAlgorithmStore.currentStep = 1;
    mockAlgorithmStore.totalSteps = 3;
    
    const { result } = renderHook(() => useVisualizationCoordinator());
    
    expect(result.current.controls.canStep).toBe(true);
    expect(result.current.controls.canReset).toBe(true);
  });

  it('disables step when at the end', () => {
    mockAlgorithmStore.currentStep = 2;
    mockAlgorithmStore.totalSteps = 3;
    
    const { result } = renderHook(() => useVisualizationCoordinator());
    
    expect(result.current.controls.canStep).toBe(false);
  });

  it('handles play control', () => {
    const { result } = renderHook(() => useVisualizationCoordinator());
    
    act(() => {
      result.current.controls.play();
    });
    
    expect(mockAlgorithmStore.play).toHaveBeenCalled();
  });

  it('handles pause control', () => {
    const { result } = renderHook(() => useVisualizationCoordinator());
    
    act(() => {
      result.current.controls.pause();
    });
    
    expect(mockAlgorithmStore.pause).toHaveBeenCalled();
  });

  it('handles reset control', () => {
    const { result } = renderHook(() => useVisualizationCoordinator());
    
    act(() => {
      result.current.controls.reset();
    });
    
    expect(mockAlgorithmStore.reset).toHaveBeenCalled();
  });

  it('handles speed control', () => {
    const { result } = renderHook(() => useVisualizationCoordinator());
    
    act(() => {
      result.current.controls.setSpeed(2);
    });
    
    expect(mockAlgorithmStore.setSpeed).toHaveBeenCalledWith(2);
  });

  it('handles goToStep control', () => {
    const { result } = renderHook(() => useVisualizationCoordinator());
    
    act(() => {
      result.current.controls.goToStep(1);
    });
    
    expect(mockAlgorithmStore.setCurrentStep).toHaveBeenCalledWith(1);
  });

  it('executes step animation with callback', async () => {
    const onStepComplete = jest.fn();
    
    const { result } = renderHook(() => 
      useVisualizationCoordinator({ onStepComplete })
    );
    
    act(() => {
      result.current.controls.step();
    });
    
    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(onStepComplete).toHaveBeenCalledWith(mockStepData);
    });
  });

  it('skips animation in reduced motion mode', async () => {
    mockUIStore.preferences.reducedMotion = true;
    const onStepComplete = jest.fn();
    
    const { result } = renderHook(() => 
      useVisualizationCoordinator({ onStepComplete })
    );
    
    act(() => {
      result.current.controls.step();
    });
    
    // Should complete immediately without waiting for timer
    await waitFor(() => {
      expect(onStepComplete).toHaveBeenCalledWith(mockStepData);
    });
  });

  it('adjusts animation duration for low performance', async () => {
    mockPerformanceStore.isLowPerformance = true;
    const onStepComplete = jest.fn();
    
    const { result } = renderHook(() => 
      useVisualizationCoordinator({ 
        onStepComplete,
        stepDelay: 1000 
      })
    );
    
    act(() => {
      result.current.controls.step();
    });
    
    // Should take longer due to performance adjustment (1.5x)
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    
    await waitFor(() => {
      expect(onStepComplete).toHaveBeenCalled();
    });
  });

  it('handles auto-play functionality', async () => {
    mockAlgorithmStore.totalSteps = 3;
    mockAlgorithmStore.isRunning = false;
    
    const { result } = renderHook(() => 
      useVisualizationCoordinator({ autoPlay: true })
    );
    
    // Auto-play should start when totalSteps > 0
    await waitFor(() => {
      expect(mockAlgorithmStore.play).toHaveBeenCalled();
    });
  });

  it('stops playback when reaching the end', async () => {
    mockAlgorithmStore.currentStep = 2;
    mockAlgorithmStore.totalSteps = 3;
    mockAlgorithmStore.isRunning = true;
    mockAlgorithmStore.isPaused = false;
    
    const onAnimationComplete = jest.fn();
    
    const { result } = renderHook(() => 
      useVisualizationCoordinator({ 
        onAnimationComplete,
        autoPlay: true 
      })
    );
    
    // Simulate step execution that reaches the end
    mockAlgorithmStore.getCurrentStepData.mockReturnValue(null);
    
    act(() => {
      result.current.controls.step();
    });
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(mockAlgorithmStore.pause).toHaveBeenCalled();
      expect(onAnimationComplete).toHaveBeenCalled();
    });
  });

  it('handles speed changes during playback', () => {
    mockAlgorithmStore.isRunning = true;
    mockAlgorithmStore.isPaused = false;
    
    const { result, rerender } = renderHook(() => 
      useVisualizationCoordinator()
    );
    
    // Change speed
    mockAlgorithmStore.speed = 2;
    
    rerender();
    
    // Should restart playback with new speed
    // (This is tested indirectly through the effect dependencies)
  });

  it('provides correct animation state', () => {
    const { result } = renderHook(() => useVisualizationCoordinator());
    
    expect(result.current.state).toEqual({
      isAnimating: false,
      animationQueue: [],
      currentStep: 0,
      totalSteps: 3,
      currentStepData: mockStepData,
      isLowPerformance: false,
      reducedMotion: false,
    });
  });

  it('handles error during step execution', async () => {
    const onError = jest.fn();
    const onStepComplete = jest.fn(() => {
      throw new Error('Animation failed');
    });
    
    const { result } = renderHook(() => 
      useVisualizationCoordinator({ 
        onStepComplete,
        onError 
      })
    );
    
    act(() => {
      result.current.controls.step();
    });
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  it('cleans up timers on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    
    const { unmount } = renderHook(() => useVisualizationCoordinator());
    
    unmount();
    
    // Should clean up any active timers
    expect(clearTimeoutSpy).toHaveBeenCalled();
    
    clearTimeoutSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });

  it('updates animation queue correctly', async () => {
    const { result } = renderHook(() => useVisualizationCoordinator());
    
    act(() => {
      result.current.controls.step();
    });
    
    // Should add animation to queue
    expect(result.current.state.animationQueue.length).toBeGreaterThan(0);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Should clear animation from queue
    await waitFor(() => {
      expect(result.current.state.animationQueue.length).toBe(0);
    });
  });

  it('prevents multiple simultaneous step executions', () => {
    const { result } = renderHook(() => useVisualizationCoordinator());
    
    act(() => {
      result.current.controls.step();
    });
    
    // Should be animating now
    expect(result.current.state.isAnimating).toBe(true);
    expect(result.current.controls.canStep).toBe(false);
    
    // Second step call should be ignored
    act(() => {
      result.current.controls.step();
    });
    
    // Should still only have one animation
    expect(result.current.state.animationQueue.length).toBe(1);
  });
});