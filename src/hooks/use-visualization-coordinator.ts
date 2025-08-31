import { useCallback, useEffect, useRef, useState } from 'react';
import { useAlgorithmStore } from '@/lib/stores/algorithm-store';
import { usePerformanceStore } from '@/lib/stores/performance-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { AnimationSequenceService, AnimationConfig } from '@/lib/services/animation-sequence-service';
import { AlgorithmStep } from '@/lib/types';

export interface VisualizationCoordinatorState {
  isAnimating: boolean;
  currentAnimationId: string | null;
  queuedAnimations: string[];
  animationProgress: number;
}

export interface VisualizationCoordinatorControls {
  playStep: (step?: AlgorithmStep) => Promise<void>;
  pauseAnimation: () => void;
  resumeAnimation: () => void;
  resetAnimation: () => void;
  skipToStep: (stepIndex: number) => void;
  setAnimationSpeed: (speed: number) => void;
  getAnimationStatus: () => {
    isProcessing: boolean;
    queueLength: number;
    activeCount: number;
    activeSequences: string[];
  };
}

export function useVisualizationCoordinator() {
  // Store subscriptions
  const {
    currentStep,
    totalSteps,

    isRunning,
    isPaused,
    speed,
    getCurrentStepData,
    nextStep,
    pause,
    setCurrentStep,
  } = useAlgorithmStore();

  const {
    fps,
    isLowPerformance,
    getOptimalAnimationSettings,
  } = usePerformanceStore();

  const {
    preferences: { reducedMotion, animationSpeed }
  } = useUIStore();

  // Local state
  const [coordinatorState, setCoordinatorState] = useState<VisualizationCoordinatorState>({
    isAnimating: false,
    currentAnimationId: null,
    queuedAnimations: [],
    animationProgress: 0,
  });

  // Services and refs
  const animationServiceRef = useRef<AnimationSequenceService | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize animation service
  useEffect(() => {
    const config: AnimationConfig = {
      speed,
      reducedMotion,
      isLowPerformance,
      animationSpeed,
    };

    animationServiceRef.current = new AnimationSequenceService(config);

    return () => {
      if (animationServiceRef.current) {
        animationServiceRef.current.cancelAllAnimations();
      }
    };
  }, [speed, reducedMotion, isLowPerformance, animationSpeed]);

  // Update animation service config when dependencies change
  useEffect(() => {
    if (animationServiceRef.current) {
      animationServiceRef.current.updateConfig({
        speed,
        reducedMotion,
        isLowPerformance,
        animationSpeed,
      });
    }
  }, [speed, reducedMotion, isLowPerformance, animationSpeed]);

  // Animation progress tracking
  const startProgressTracking = useCallback((duration: number) => {
    const startTime = Date.now();
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setCoordinatorState(prev => ({
        ...prev,
        animationProgress: progress,
      }));

      if (progress < 1) {
        progressIntervalRef.current = setTimeout(updateProgress, 16); // ~60fps
      }
    };

    updateProgress();
  }, []);

  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearTimeout(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    setCoordinatorState(prev => ({
      ...prev,
      animationProgress: 0,
    }));
  }, []);

  // Play animation for a specific step
  const playStep = useCallback(async (step?: AlgorithmStep): Promise<void> => {
    if (!animationServiceRef.current) return;

    const stepData = step || getCurrentStepData();
    if (!stepData) return;

    const animationId = `step-${currentStep}-${Date.now()}`;
    
    setCoordinatorState(prev => ({
      ...prev,
      isAnimating: true,
      currentAnimationId: animationId,
    }));

    try {
      // Create animation sequence
      const sequence = animationServiceRef.current.createAnimationSequence(stepData, currentStep);
      
      // Start progress tracking
      startProgressTracking(sequence.duration);

      // Execute animation
      await animationServiceRef.current.executeSequence(sequence);

      // Animation completed successfully
      setCoordinatorState(prev => ({
        ...prev,
        isAnimating: false,
        currentAnimationId: null,
      }));

    } catch (error) {
      console.error('Animation execution failed:', error);
      
      setCoordinatorState(prev => ({
        ...prev,
        isAnimating: false,
        currentAnimationId: null,
      }));
    } finally {
      stopProgressTracking();
    }
  }, [currentStep, getCurrentStepData, startProgressTracking, stopProgressTracking]);

  // Pause current animation
  const pauseAnimation = useCallback(() => {
    if (animationServiceRef.current && coordinatorState.currentAnimationId) {
      animationServiceRef.current.cancelAnimation(coordinatorState.currentAnimationId);
      
      setCoordinatorState(prev => ({
        ...prev,
        isAnimating: false,
        currentAnimationId: null,
      }));
      
      stopProgressTracking();
    }
  }, [coordinatorState.currentAnimationId, stopProgressTracking]);

  // Resume animation (restart current step)
  const resumeAnimation = useCallback(async () => {
    if (!coordinatorState.isAnimating) {
      await playStep();
    }
  }, [coordinatorState.isAnimating, playStep]);

  // Reset all animations
  const resetAnimation = useCallback(() => {
    if (animationServiceRef.current) {
      animationServiceRef.current.cancelAllAnimations();
    }
    
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    stopProgressTracking();
    
    setCoordinatorState({
      isAnimating: false,
      currentAnimationId: null,
      queuedAnimations: [],
      animationProgress: 0,
    });
  }, [stopProgressTracking]);

  // Skip to specific step
  const skipToStep = useCallback((stepIndex: number) => {
    resetAnimation();
    setCurrentStep(stepIndex);
  }, [resetAnimation, setCurrentStep]);

  // Set animation speed
  const setAnimationSpeed = useCallback((newSpeed: number) => {
    if (animationServiceRef.current) {
      animationServiceRef.current.updateConfig({ speed: newSpeed });
    }
  }, []);

  // Get animation status
  const getAnimationStatus = useCallback(() => {
    return animationServiceRef.current?.getAnimationStatus() || {
      isProcessing: false,
      queueLength: 0,
      activeCount: 0,
      activeSequences: [],
    };
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isRunning || isPaused || coordinatorState.isAnimating) {
      return;
    }

    if (currentStep < totalSteps - 1) {
      const stepData = getCurrentStepData();
      if (stepData) {
        playStep(stepData).then(() => {
          if (isRunning && !isPaused) {
            // Small delay before next step
            animationTimeoutRef.current = setTimeout(() => {
              nextStep();
            }, 100);
          }
        });
      }
    } else {
      // Reached the end
      pause();
    }
  }, [
    isRunning,
    isPaused,
    currentStep,
    totalSteps,
    coordinatorState.isAnimating,
    getCurrentStepData,
    playStep,
    nextStep,
    pause,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetAnimation();
    };
  }, [resetAnimation]);

  // Performance optimization: adjust settings based on performance
  useEffect(() => {
    if (animationServiceRef.current && isLowPerformance) {
      const optimalSettings = getOptimalAnimationSettings();
      animationServiceRef.current.updateConfig({
        animationSpeed: optimalSettings.animationDuration / 800, // Normalize to base duration
      });
    }
  }, [isLowPerformance, getOptimalAnimationSettings]);

  const controls: VisualizationCoordinatorControls = {
    playStep,
    pauseAnimation,
    resumeAnimation,
    resetAnimation,
    skipToStep,
    setAnimationSpeed,
    getAnimationStatus,
  };

  return {
    state: coordinatorState,
    controls,
    // Additional computed values
    canAnimate: !reducedMotion && !isLowPerformance,
    currentFPS: fps,
    isOptimized: isLowPerformance,
  };
}