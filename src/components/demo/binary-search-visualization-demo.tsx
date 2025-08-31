'use client';

import React, { useState, useEffect } from 'react';
import { BinarySearchVisualization } from '@/components/visualization/binary-search-visualization';
import { BinarySearchService } from '@/lib/services/binary-search-service';
import { AlgorithmStep } from '@/lib/types';
import { Button } from '@/components/ui/button';

export function BinarySearchVisualizationDemo() {
  const [data] = useState([1, 3, 5, 7, 9, 11, 13, 15, 17, 19]);
  const [target] = useState(7);
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [service] = useState(() => new BinarySearchService());

  // Execute binary search and get steps
  useEffect(() => {
    const executeSearch = async () => {
      try {
        const result = await service.execute(data, target, 'javascript', true);
        setSteps(result.steps);
      } catch (error) {
        console.error('Error executing binary search:', error);
      }
    };

    executeSearch();
  }, [data, target, service]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || currentStepIndex >= steps.length) {
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStepIndex(prev => Math.min(prev + 1, steps.length));
      if (currentStepIndex + 1 >= steps.length) {
        setIsPlaying(false);
      }
    }, 1000 / animationSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, steps.length, animationSpeed]);

  const handlePlay = () => {
    if (currentStepIndex >= steps.length) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleStep = () => {
    setIsPlaying(false);
    setCurrentStepIndex(prev => Math.min(prev + 1, steps.length));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const currentStep = currentStepIndex < steps.length ? steps[currentStepIndex] : null;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Binary Search Visualization Demo
        </h2>
        <p className="text-gray-600">
          Watch how binary search efficiently finds elements in a sorted array
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <Button
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={steps.length === 0}
          className="px-6"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        
        <Button
          onClick={handleStep}
          disabled={currentStepIndex >= steps.length || isPlaying}
          variant="outline"
        >
          Step
        </Button>
        
        <Button
          onClick={handleReset}
          disabled={currentStepIndex === 0}
          variant="outline"
        >
          Reset
        </Button>

        <div className="flex items-center space-x-2 ml-8">
          <label htmlFor="speed" className="text-sm font-medium text-gray-700">
            Speed:
          </label>
          <input
            id="speed"
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-sm text-gray-600 w-8">
            {animationSpeed}x
          </span>
        </div>
      </div>

      {/* Visualization */}
      <div className="bg-white border rounded-lg shadow-sm">
        <BinarySearchVisualization
          data={data}
          target={target}
          currentStep={currentStep}
          stepNumber={currentStepIndex}
          totalSteps={steps.length}
          isRunning={isPlaying}
          animationSpeed={animationSpeed}
          className="min-h-[400px]"
        />
      </div>

      {/* Algorithm Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Algorithm Info</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <div>Array Size: {data.length}</div>
            <div>Target: {target}</div>
            <div>Total Steps: {steps.length}</div>
            <div>Current Step: {currentStepIndex}</div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">Complexity</h3>
          <div className="text-sm text-green-800 space-y-1">
            <div>Time: O(log n)</div>
            <div>Space: O(1)</div>
            <div>Max Steps: {Math.ceil(Math.log2(data.length))}</div>
            <div>Actual Steps: {steps.length}</div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-2">Current Step</h3>
          <div className="text-sm text-purple-800">
            {currentStep ? (
              <div className="space-y-1">
                <div>Type: {currentStep.type}</div>
                <div>Description: {currentStep.description}</div>
                {currentStep.metadata && (currentStep.metadata as any).comparisonCount && (
                  <div>Comparisons: {(currentStep.metadata as any).comparisonCount}</div>
                )}
              </div>
            ) : (
              <div>Ready to start</div>
            )}
          </div>
        </div>
      </div>

      {/* Educational Notes */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-semibold text-yellow-900 mb-2">How Binary Search Works</h3>
        <div className="text-sm text-yellow-800 space-y-2">
          <p>
            Binary search works by repeatedly dividing the search space in half. It compares the target 
            with the middle element and eliminates half of the remaining elements based on the comparison.
          </p>
          <p>
            This makes it much more efficient than linear search, especially for large arrays. 
            While linear search takes O(n) time, binary search only takes O(log n) time.
          </p>
          <p>
            Watch how the search range (highlighted in blue) gets smaller with each step, 
            and notice how the left, middle, and right pointers move to narrow down the search.
          </p>
        </div>
      </div>
    </div>
  );
}