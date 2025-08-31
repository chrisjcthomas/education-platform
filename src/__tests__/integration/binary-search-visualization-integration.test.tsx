import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BinarySearchVisualization } from '@/components/visualization/binary-search-visualization';
import { BinarySearchService } from '@/lib/services/binary-search-service';
import { AlgorithmStep } from '@/lib/types';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('BinarySearchVisualization Integration', () => {
  let binarySearchService: BinarySearchService;
  const testData = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const target = 7;

  beforeEach(() => {
    binarySearchService = new BinarySearchService();
  });

  describe('Algorithm Step Integration', () => {
    it('correctly visualizes binary search execution steps', async () => {
      // Execute binary search to get real steps
      const result = await binarySearchService.execute(testData, target, 'javascript', true);
      
      expect(result.found).toBe(true);
      expect(result.index).toBe(3); // 7 is at index 3
      expect(result.steps).toBeDefined();
      expect(result.steps.length).toBeGreaterThan(0);

      // Test each step visualization
      for (let i = 0; i < result.steps.length; i++) {
        const step = result.steps[i];
        
        render(
          <BinarySearchVisualization
            data={testData}
            target={target}
            currentStep={step}
            stepNumber={i + 1}
            totalSteps={result.steps.length}
            isRunning={false}
            animationSpeed={1}
          />
        );

        // Verify step is displayed
        expect(screen.getByText(step.description)).toBeInTheDocument();
        
        // Verify step counter
        expect(screen.getByText(`Step ${i + 1} of ${result.steps.length}`)).toBeInTheDocument();
      }
    });

    it('displays correct pointer positions throughout search', async () => {
      const result = await binarySearchService.execute(testData, target, 'javascript', true);
      
      // Find a compare step to test pointer visualization
      const compareStep = result.steps.find(step => step.type === 'compare');
      expect(compareStep).toBeDefined();

      if (compareStep) {
        const metadata = compareStep.metadata as any;
        
        render(
          <BinarySearchVisualization
            data={testData}
            target={target}
            currentStep={compareStep}
            stepNumber={1}
            totalSteps={result.steps.length}
            isRunning={false}
            animationSpeed={1}
          />
        );

        // Verify pointer labels are displayed
        if (metadata.left !== undefined) {
          expect(screen.getByText(`Left (${metadata.left})`)).toBeInTheDocument();
        }
        if (metadata.right !== undefined) {
          expect(screen.getByText(`Right (${metadata.right})`)).toBeInTheDocument();
        }
        if (metadata.mid !== undefined) {
          expect(screen.getByText(`Mid (${metadata.mid})`)).toBeInTheDocument();
        }
      }
    });

    it('shows Big-O analysis with real comparison counts', async () => {
      const result = await binarySearchService.execute(testData, target, 'javascript', true);
      
      // Find a step with comparison count
      const stepWithComparisons = result.steps.find(step => 
        step.metadata && (step.metadata as any).comparisonCount
      );

      if (stepWithComparisons) {
        const metadata = stepWithComparisons.metadata as any;
        
        render(
          <BinarySearchVisualization
            data={testData}
            target={target}
            currentStep={stepWithComparisons}
            stepNumber={1}
            totalSteps={result.steps.length}
            isRunning={false}
            animationSpeed={1}
          />
        );

        // Verify Big-O information is displayed
        expect(screen.getByText('Big-O Analysis')).toBeInTheDocument();
        expect(screen.getByText('O(log n)')).toBeInTheDocument();
        
        // Verify comparison count
        const maxComparisons = Math.ceil(Math.log2(testData.length));
        expect(screen.getByText(`${metadata.comparisonCount}/${maxComparisons}`)).toBeInTheDocument();
      }
    });

    it('correctly handles found element visualization', async () => {
      const result = await binarySearchService.execute(testData, target, 'javascript', true);
      
      // Find the found step
      const foundStep = result.steps.find(step => step.type === 'found');
      expect(foundStep).toBeDefined();

      if (foundStep) {
        render(
          <BinarySearchVisualization
            data={testData}
            target={target}
            currentStep={foundStep}
            stepNumber={result.steps.length}
            totalSteps={result.steps.length}
            isRunning={false}
            animationSpeed={1}
          />
        );

        // Verify success message
        expect(screen.getByText(`🎉 Found at index ${result.index}!`)).toBeInTheDocument();
        
        // Verify found range highlight
        expect(screen.getByText('Found!')).toBeInTheDocument();
      }
    });
  });

  describe('Edge Case Integration', () => {
    it('handles target not found scenario', async () => {
      const notFoundTarget = 100; // Not in array
      const result = await binarySearchService.execute(testData, notFoundTarget, 'javascript', true);
      
      expect(result.found).toBe(false);
      expect(result.index).toBe(-1);

      // Test visualization with final step
      const lastStep = result.steps[result.steps.length - 1];
      
      render(
        <BinarySearchVisualization
          data={testData}
          target={notFoundTarget}
          currentStep={lastStep}
          stepNumber={result.steps.length}
          totalSteps={result.steps.length}
          isRunning={false}
          animationSpeed={1}
        />
      );

      // Should not show success animation
      expect(screen.queryByText(/🎉 Found at index/)).not.toBeInTheDocument();
    });

    it('handles single element array', async () => {
      const singleElementData = [5];
      const result = await binarySearchService.execute(singleElementData, 5, 'javascript', true);
      
      expect(result.found).toBe(true);
      expect(result.index).toBe(0);

      if (result.steps.length > 0) {
        const step = result.steps[0];
        
        render(
          <BinarySearchVisualization
            data={singleElementData}
            target={5}
            currentStep={step}
            stepNumber={1}
            totalSteps={result.steps.length}
            isRunning={false}
            animationSpeed={1}
          />
        );

        expect(screen.getByText('Array size: 1')).toBeInTheDocument();
      }
    });

    it('handles empty array', async () => {
      const emptyData: number[] = [];
      const result = await binarySearchService.execute(emptyData, target, 'javascript', true);
      
      expect(result.found).toBe(false);
      expect(result.steps.length).toBe(0);

      render(
        <BinarySearchVisualization
          data={emptyData}
          target={target}
          currentStep={null}
          stepNumber={0}
          totalSteps={0}
          isRunning={false}
          animationSpeed={1}
        />
      );

      expect(screen.getByText('Array size: 0')).toBeInTheDocument();
      expect(screen.getByText('Ready to start binary search')).toBeInTheDocument();
    });
  });

  describe('Performance Integration', () => {
    it('correctly calculates and displays Big-O metrics', async () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => i * 2); // Even numbers 0-1998
      const targetValue = 500;
      
      const result = await binarySearchService.execute(largeData, targetValue, 'javascript', true);
      
      expect(result.found).toBe(true);
      expect(result.comparisons).toBeLessThanOrEqual(Math.ceil(Math.log2(largeData.length)));

      // Test with a step that has comparison data
      const stepWithComparisons = result.steps.find(step => 
        step.metadata && (step.metadata as any).comparisonCount
      );

      if (stepWithComparisons) {
        render(
          <BinarySearchVisualization
            data={largeData.slice(0, 20)} // Show only first 20 for visualization
            target={targetValue}
            currentStep={stepWithComparisons}
            stepNumber={1}
            totalSteps={result.steps.length}
            isRunning={false}
            animationSpeed={1}
          />
        );

        // Verify Big-O complexity is shown
        expect(screen.getByText('O(log n)')).toBeInTheDocument();
        expect(screen.getByText('O(1)')).toBeInTheDocument();
      }
    });
  });

  describe('Educational Content Integration', () => {
    it('provides educational step descriptions', async () => {
      const result = await binarySearchService.execute(testData, target, 'javascript', true);
      
      // Test that each step has educational content
      for (const step of result.steps) {
        render(
          <BinarySearchVisualization
            data={testData}
            target={target}
            currentStep={step}
            stepNumber={1}
            totalSteps={result.steps.length}
            isRunning={false}
            animationSpeed={1}
          />
        );

        // Each step should have a description
        expect(screen.getByText(step.description)).toBeInTheDocument();
        
        // Steps with metadata should show additional details
        if (step.metadata && (step.metadata as any).comparisonCount) {
          expect(screen.getByText(/comparisons so far/)).toBeInTheDocument();
        }
      }
    });

    it('shows search space reduction information', async () => {
      const result = await binarySearchService.execute(testData, target, 'javascript', true);
      
      // Find a step with left/right pointers
      const searchStep = result.steps.find(step => {
        const metadata = step.metadata as any;
        return metadata.left !== undefined && metadata.right !== undefined;
      });

      if (searchStep) {
        const metadata = searchStep.metadata as any;
        const searchSpaceSize = metadata.right - metadata.left + 1;
        
        render(
          <BinarySearchVisualization
            data={testData}
            target={target}
            currentStep={searchStep}
            stepNumber={1}
            totalSteps={result.steps.length}
            isRunning={false}
            animationSpeed={1}
          />
        );

        // Should show search space information
        expect(screen.getByText(`Search space: ${searchSpaceSize} elements`)).toBeInTheDocument();
      }
    });
  });

  describe('Animation Coordination', () => {
    it('coordinates animations with algorithm steps', async () => {
      const result = await binarySearchService.execute(testData, target, 'javascript', true);
      
      // Test that visualization updates correctly for each step
      for (let i = 0; i < result.steps.length; i++) {
        const step = result.steps[i];
        
        const { rerender } = render(
          <BinarySearchVisualization
            data={testData}
            target={target}
            currentStep={step}
            stepNumber={i + 1}
            totalSteps={result.steps.length}
            isRunning={true}
            animationSpeed={1}
          />
        );

        // Verify step indicator updates
        expect(screen.getByText(`Step ${i + 1} of ${result.steps.length}`)).toBeInTheDocument();

        // Test animation speed changes
        rerender(
          <BinarySearchVisualization
            data={testData}
            target={target}
            currentStep={step}
            stepNumber={i + 1}
            totalSteps={result.steps.length}
            isRunning={true}
            animationSpeed={2}
          />
        );

        // Component should still render correctly with different animation speed
        expect(screen.getByText(`Step ${i + 1} of ${result.steps.length}`)).toBeInTheDocument();
      }
    });
  });
});