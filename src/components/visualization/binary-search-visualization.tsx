'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrayElement } from './array-element';
import { PointerMarker } from './pointer-marker';
import { RangeHighlight } from './range-highlight';
import { StepIndicator } from './step-indicator';
import { cn } from '@/lib/utils';
import { AlgorithmStep } from '@/lib/types';

export interface BinarySearchVisualizationProps {
  data: number[];
  target: number;
  currentStep: AlgorithmStep | null;
  stepNumber: number;
  totalSteps: number;
  isRunning: boolean;
  animationSpeed: number;
  onElementClick?: (index: number) => void;
  className?: string;
}

interface VisualizationState {
  left?: number;
  right?: number;
  mid?: number;
  found?: boolean;
  foundIndex?: number;
  eliminatedRanges: Array<{ start: number; end: number }>;
}

export function BinarySearchVisualization({
  data,
  target,
  currentStep,
  stepNumber,
  totalSteps,
  isRunning,
  animationSpeed,
  onElementClick,
  className,
}: BinarySearchVisualizationProps) {
  // Extract visualization state from current step
  const getVisualizationState = (): VisualizationState => {
    if (!currentStep) {
      return { eliminatedRanges: [] };
    }

    const metadata = currentStep.metadata as any;
    const state: VisualizationState = {
      eliminatedRanges: [],
    };

    // Extract pointer positions
    if (metadata.left !== undefined) state.left = metadata.left;
    if (metadata.right !== undefined) state.right = metadata.right;
    if (metadata.mid !== undefined) state.mid = metadata.mid;
    if (metadata.found !== undefined) state.found = metadata.found;
    if (metadata.foundIndex !== undefined) state.foundIndex = metadata.foundIndex;

    // Calculate eliminated ranges based on step history
    if (currentStep.type === 'eliminate' && metadata.eliminatedRange) {
      state.eliminatedRanges.push(metadata.eliminatedRange);
    }

    return state;
  };

  const vizState = getVisualizationState();

  // Determine element states
  const getElementState = (index: number): 'normal' | 'highlighted' | 'dimmed' | 'found' | 'eliminated' => {
    // Found element
    if (vizState.found && vizState.foundIndex === index) {
      return 'found';
    }

    // Eliminated elements
    for (const range of vizState.eliminatedRanges) {
      if (index >= range.start && index <= range.end) {
        return 'eliminated';
      }
    }

    // Current mid element being compared
    if (currentStep?.type === 'compare' && vizState.mid === index) {
      return 'highlighted';
    }

    // Elements outside current search range
    if (vizState.left !== undefined && vizState.right !== undefined) {
      if (index < vizState.left || index > vizState.right) {
        return 'dimmed';
      }
    }

    return 'normal';
  };

  // Get operation type for step indicator
  const getOperationType = (): 'compare' | 'move' | 'found' | 'eliminate' | 'init' | 'complete' => {
    if (!currentStep) return 'init';
    
    switch (currentStep.type) {
      case 'compare':
        return 'compare';
      case 'eliminate':
        return 'eliminate';
      case 'found':
        return 'found';
      case 'init':
        return 'init';
      default:
        return stepNumber === totalSteps ? 'complete' : 'compare';
    }
  };

  // Get step description with Big-O context
  const getStepDescription = (): string => {
    if (!currentStep) return 'Ready to start binary search';

    const metadata = currentStep.metadata as any;
    let description = currentStep.description;

    // Add Big-O context
    if (metadata.comparisonCount) {
      description += ` (${metadata.comparisonCount} comparisons so far)`;
    }

    return description;
  };

  // Get details for step indicator
  const getStepDetails = (): string | undefined => {
    if (!currentStep) return undefined;

    const metadata = currentStep.metadata as any;
    const details: string[] = [];

    if (metadata.targetValue !== undefined && metadata.midValue !== undefined) {
      details.push(`Target: ${metadata.targetValue}, Mid: ${metadata.midValue}`);
    }

    if (vizState.left !== undefined && vizState.right !== undefined) {
      const searchSpaceSize = vizState.right - vizState.left + 1;
      details.push(`Search space: ${searchSpaceSize} elements`);
    }

    if (metadata.comparisonCount) {
      const maxComparisons = Math.ceil(Math.log2(data.length));
      details.push(`Max possible: ${maxComparisons} comparisons (O(log n))`);
    }

    return details.length > 0 ? details.join(' • ') : undefined;
  };

  return (
    <div className={cn('relative w-full p-8', className)}>
      {/* Array Visualization Container */}
      <div className="relative flex justify-center items-center min-h-[120px] mb-8">
        {/* Range Highlights */}
        <AnimatePresence>
          {/* Active search range */}
          {vizState.left !== undefined && vizState.right !== undefined && !vizState.found && (
            <RangeHighlight
              key="active-range"
              startIndex={vizState.left}
              endIndex={vizState.right}
              type="searching"
              label={`Search Range (${vizState.right - vizState.left + 1} elements)`}
              visible={true}
            />
          )}

          {/* Found element highlight */}
          {vizState.found && vizState.foundIndex !== undefined && (
            <RangeHighlight
              key="found-range"
              startIndex={vizState.foundIndex}
              endIndex={vizState.foundIndex}
              type="found"
              label="Found!"
              visible={true}
            />
          )}

          {/* Eliminated ranges */}
          {vizState.eliminatedRanges.map((range, index) => (
            <RangeHighlight
              key={`eliminated-${index}`}
              startIndex={range.start}
              endIndex={range.end}
              type="eliminated"
              label="Eliminated"
              visible={true}
            />
          ))}
        </AnimatePresence>

        {/* Array Elements */}
        <div className="flex space-x-4 relative z-10">
          {data.map((value, index) => (
            <motion.div
              key={`element-${index}`}
              className="relative"
              layout
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300,
                duration: 0.6 / animationSpeed,
              }}
            >
              <ArrayElement
                value={value}
                index={index}
                state={getElementState(index)}
                onClick={onElementClick}
                size="lg"
              />
              
              {/* Index labels */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 font-medium">
                {index}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pointer Markers */}
        <AnimatePresence>
          {vizState.left !== undefined && (
            <PointerMarker
              key="left-pointer"
              type="left"
              position={vizState.left}
              label={`Left (${vizState.left})`}
              visible={true}
              size="md"
            />
          )}
          
          {vizState.right !== undefined && (
            <PointerMarker
              key="right-pointer"
              type="right"
              position={vizState.right}
              label={`Right (${vizState.right})`}
              visible={true}
              size="md"
            />
          )}
          
          {vizState.mid !== undefined && (
            <PointerMarker
              key="mid-pointer"
              type="mid"
              position={vizState.mid}
              label={`Mid (${vizState.mid})`}
              visible={true}
              size="lg"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Step Indicator */}
      <AnimatePresence mode="wait">
        <StepIndicator
          key={stepNumber}
          currentStep={stepNumber}
          totalSteps={totalSteps}
          operation={currentStep?.type || 'init'}
          description={getStepDescription()}
          details={getStepDetails()}
          operationType={getOperationType()}
          visible={true}
          position="bottom"
        />
      </AnimatePresence>

      {/* Big-O Analysis Overlay */}
      <motion.div
        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-sm font-semibold text-gray-700 mb-1">
          Big-O Analysis
        </div>
        <div className="text-xs text-gray-600 space-y-1">
          <div>Time: <span className="font-mono text-blue-600">O(log n)</span></div>
          <div>Space: <span className="font-mono text-green-600">O(1)</span></div>
          {currentStep?.metadata && (currentStep.metadata as any).comparisonCount && (
            <div>
              Steps: <span className="font-mono text-purple-600">
                {(currentStep.metadata as any).comparisonCount}/{Math.ceil(Math.log2(data.length))}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Target Information */}
      <motion.div
        className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-sm font-semibold text-gray-700 mb-1">
          Searching for
        </div>
        <div className="text-2xl font-bold text-purple-600">
          {target}
        </div>
        <div className="text-xs text-gray-600 mt-1">
          Array size: {data.length}
        </div>
      </motion.div>

      {/* Success Animation */}
      <AnimatePresence>
        {vizState.found && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{
                type: 'spring',
                damping: 15,
                stiffness: 300,
              }}
            >
              🎉 Found at index {vizState.foundIndex}!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}