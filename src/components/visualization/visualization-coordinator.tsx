'use client';

import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlgorithmStore } from '@/lib/stores/algorithm-store';
import { usePerformanceStore } from '@/lib/stores/performance-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { useVisualizationCoordinator } from '@/hooks/use-visualization-coordinator';
import { ArrayElement } from './array-element';
import { PointerMarker } from './pointer-marker';
import { RangeHighlight } from './range-highlight';
import { StepIndicator } from './step-indicator';
import { AlgorithmStep } from '@/lib/types';
import { cn } from '@/lib/utils';

export interface VisualizationCoordinatorProps {
  className?: string;
  onStepComplete?: (step: AlgorithmStep) => void;
  onAnimationComplete?: () => void;
  elementSize?: 'sm' | 'md' | 'lg';
  showPointers?: boolean;
  showRangeHighlights?: boolean;
  showStepIndicator?: boolean;
  autoPlay?: boolean;
}

type ElementState = 'normal' | 'highlighted' | 'found' | 'eliminated' | 'dimmed';

export function VisualizationCoordinator({
  className,
  onStepComplete,
  onAnimationComplete,
  elementSize = 'md',
  showPointers = true,
  showRangeHighlights = true,
  showStepIndicator = true,
  autoPlay = false,
}: VisualizationCoordinatorProps) {
  // Store subscriptions
  const {
    data,
    currentStep,
    totalSteps,
    executionHistory,
    target,
    getCurrentStepData,
  } = useAlgorithmStore();

  const { 
    fps,
    isLowPerformance,
  } = usePerformanceStore();

  const { 
    preferences: { reducedMotion }
  } = useUIStore();

  // Visualization coordinator hook
  const { state: coordinatorState, controls, canAnimate } = useVisualizationCoordinator();

  // Refs for cleanup
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Current step data
  const currentStepData = getCurrentStepData();

  // Calculate element states based on current step
  const elementStates = useMemo((): ElementState[] => {
    if (!currentStepData || data.length === 0) {
      return data.map(() => 'normal' as ElementState);
    }

    const states: ElementState[] = data.map(() => 'normal');
    const { type, indices } = currentStepData;

    switch (type) {
      case 'highlight':
        indices.forEach(index => {
          if (index >= 0 && index < states.length) {
            states[index] = 'highlighted';
          }
        });
        break;

      case 'compare':
        indices.forEach(index => {
          if (index >= 0 && index < states.length) {
            states[index] = 'highlighted';
          }
        });
        break;

      case 'found':
        indices.forEach(index => {
          if (index >= 0 && index < states.length) {
            states[index] = 'found';
          }
        });
        break;

      case 'eliminate':
        indices.forEach(index => {
          if (index >= 0 && index < states.length) {
            states[index] = 'eliminated';
          }
        });
        // Keep previously eliminated elements dimmed
        for (let i = 0; i < currentStep; i++) {
          const prevStep = executionHistory[i];
          if (prevStep?.type === 'eliminate') {
            prevStep.indices.forEach(idx => {
              if (idx >= 0 && idx < states.length && states[idx] === 'normal') {
                states[idx] = 'dimmed';
              }
            });
          }
        }
        break;

      default:
        break;
    }

    return states;
  }, [currentStepData, data, currentStep, executionHistory]);

  // Calculate range highlights
  const rangeHighlights = useMemo(() => {
    if (!currentStepData || !showRangeHighlights) return [];

    const highlights = [];
    const { type, metadata } = currentStepData;

    if (type === 'highlight' && metadata.searchRange) {
      highlights.push({
        startIndex: typeof metadata.left === 'number' ? metadata.left : 0,
        endIndex: typeof metadata.right === 'number' ? metadata.right : 0,
        type: 'active' as const,
        label: `Search Range [${metadata.left}, ${metadata.right}]`,
      });
    }

    if (type === 'eliminate') {
      const eliminatedIndices = currentStepData.indices;
      if (eliminatedIndices.length > 0) {
        highlights.push({
          startIndex: Math.min(...eliminatedIndices),
          endIndex: Math.max(...eliminatedIndices),
          type: 'eliminated' as const,
          label: 'Eliminated',
        });
      }
    }

    return highlights;
  }, [currentStepData, showRangeHighlights]);

  // Calculate pointer positions
  const pointerMarkers = useMemo(() => {
    if (!showPointers || !currentStepData) return [];

    const markers = [];
    const { metadata } = currentStepData;

    if (typeof metadata.left === 'number') {
      markers.push({
        type: 'left' as const,
        position: metadata.left,
        visible: true,
      });
    }

    if (typeof metadata.right === 'number') {
      markers.push({
        type: 'right' as const,
        position: metadata.right,
        visible: true,
      });
    }

    if (typeof metadata.mid === 'number') {
      markers.push({
        type: 'mid' as const,
        position: metadata.mid,
        visible: true,
      });
    }

    return markers;
  }, [currentStepData, showPointers]);

  // Handle step completion
  const handleStepComplete = useCallback((stepData: AlgorithmStep) => {
    onStepComplete?.(stepData);
  }, [onStepComplete]);

  // Handle animation completion
  const handleAnimationComplete = useCallback(() => {
    onAnimationComplete?.();
  }, [onAnimationComplete]);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || coordinatorState.isAnimating) {
      return;
    }

    if (currentStep < totalSteps - 1) {
      const stepData = getCurrentStepData();
      if (stepData) {
        controls.playStep(stepData).then(() => {
          handleStepComplete(stepData);
        });
      }
    } else {
      // Reached the end
      handleAnimationComplete();
    }
  }, [
    autoPlay,
    currentStep,
    totalSteps,
    coordinatorState.isAnimating,
    getCurrentStepData,
    controls,
    handleStepComplete,
    handleAnimationComplete,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    const timeoutRef = animationTimeoutRef;
    return () => {
      const timeoutId = timeoutRef.current;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      controls.resetAnimation();
    };
  }, [controls]);

  // Calculate layout dimensions
  const elementSpacing = elementSize === 'sm' ? 48 : elementSize === 'md' ? 64 : 80;
  const containerWidth = data.length * elementSpacing;

  return (
    <div className={cn('relative w-full h-full flex flex-col items-center justify-center p-8', className)}>
      {/* Main visualization container */}
      <div 
        className="relative flex items-center justify-center"
        style={{ width: containerWidth, minHeight: '120px' }}
      >
        {/* Range highlights (behind elements) */}
        <AnimatePresence>
          {rangeHighlights.map((highlight, highlightIndex) => (
            <RangeHighlight
              key={`highlight-${highlightIndex}-${currentStep}`}
              startIndex={highlight.startIndex}
              endIndex={highlight.endIndex}
              type={highlight.type}
              label={highlight.label}
              elementSpacing={elementSpacing}
              visible={true}
            />
          ))}
        </AnimatePresence>

        {/* Array elements */}
        <div className="flex items-center space-x-4">
          <AnimatePresence mode="popLayout">
            {data.map((value, index) => (
              <ArrayElement
                key={`element-${index}`}
                value={value}
                index={index}
                state={elementStates[index] || 'normal'}
                size={elementSize}
                className={cn(
                  'transition-all duration-300',
                  isLowPerformance && 'transition-none'
                )}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Pointer markers (above elements) */}
        <AnimatePresence>
          {pointerMarkers.map((marker) => (
            <PointerMarker
              key={`pointer-${marker.type}-${currentStep}`}
              type={marker.type}
              position={marker.position}
              visible={marker.visible}
              size={elementSize}
            />
          ))}
        </AnimatePresence>

        {/* Target indicator */}
        {target !== undefined && (
          <motion.div
            className="absolute -top-16 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="px-3 py-1 bg-purple-600 text-white text-sm font-semibold rounded-lg shadow-lg">
              Target: {target}
            </div>
          </motion.div>
        )}
      </div>

      {/* Step indicator */}
      {showStepIndicator && currentStepData && (
        <StepIndicator
          currentStep={currentStep + 1}
          totalSteps={totalSteps}
          operation={currentStepData.type.charAt(0).toUpperCase() + currentStepData.type.slice(1)}
          description={currentStepData.description}
          details={typeof currentStepData.metadata.reason === 'string' ? currentStepData.metadata.reason : undefined}
          operationType={
            currentStepData.type === 'swap' ? 'move' :
            currentStepData.type === 'highlight' ? 'compare' :
            currentStepData.type as 'compare' | 'move' | 'found' | 'eliminate' | 'init' | 'complete'
          }
          visible={true}
          position="bottom"
        />
      )}

      {/* Performance indicator (development mode) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 text-xs text-gray-500">
          FPS: {Math.round(fps)} {isLowPerformance && '(Low Performance Mode)'}
          {coordinatorState.isAnimating && (
            <div>Animating: {Math.round(coordinatorState.animationProgress * 100)}%</div>
          )}
        </div>
      )}

      {/* Animation overlay for reduced motion */}
      {reducedMotion && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
          Reduced Motion Mode
        </div>
      )}

      {/* Animation status indicator */}
      {coordinatorState.isAnimating && canAnimate && (
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
          Animating...
        </div>
      )}
    </div>
  );
}