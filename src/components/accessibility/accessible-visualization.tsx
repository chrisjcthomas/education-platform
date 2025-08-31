'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAccessibility } from '../../hooks/use-accessibility';

interface AccessibleVisualizationProps {
  type: 'array' | 'binary-search' | 'sorting';
  data: number[];
  currentStep?: number;
  pointers?: { left?: number; right?: number; mid?: number };
  highlighted?: number[];
  eliminated?: number[];
  children: React.ReactNode;
  className?: string;
  onVisualizationChange?: (change: {
    type: 'highlight' | 'eliminate' | 'compare' | 'found';
    elements: number[];
    description: string;
  }) => void;
}

export function AccessibleVisualization({
  type,
  data,
  currentStep,
  pointers,
  highlighted = [],
  eliminated = [],
  children,
  className = '',
  onVisualizationChange
}: AccessibleVisualizationProps) {
  const { 
    preferences, 
    isScreenReaderActive, 
    generateVisualizationAltText,
    announceVisualizationChange 
  } = useAccessibility();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [previousState, setPreviousState] = useState({
    highlighted: [] as number[],
    eliminated: [] as number[],
    pointers: {} as any
  });

  // Generate comprehensive alt text
  const altText = generateVisualizationAltText({
    type,
    data,
    currentStep,
    pointers,
    highlighted,
    eliminated
  });

  // Detect and announce changes
  useEffect(() => {
    // Check for highlighting changes
    const newHighlighted = highlighted.filter(h => !previousState.highlighted.includes(h));
    const removedHighlighted = previousState.highlighted.filter(h => !highlighted.includes(h));

    if (newHighlighted.length > 0) {
      const description = `Elements at positions ${newHighlighted.join(', ')} are now highlighted`;
      announceVisualizationChange({
        type: 'highlight',
        elements: newHighlighted,
        description
      });
      onVisualizationChange?.({
        type: 'highlight',
        elements: newHighlighted,
        description
      });
    }

    // Check for elimination changes
    const newEliminated = eliminated.filter(e => !previousState.eliminated.includes(e));
    if (newEliminated.length > 0) {
      const description = `Elements at positions ${newEliminated.join(', ')} have been eliminated from consideration`;
      announceVisualizationChange({
        type: 'eliminate',
        elements: newEliminated,
        description
      });
      onVisualizationChange?.({
        type: 'eliminate',
        elements: newEliminated,
        description
      });
    }

    // Check for pointer changes
    if (pointers && type === 'binary-search') {
      const prevPointers = previousState.pointers;
      const changes = [];

      if (pointers.left !== prevPointers.left) {
        changes.push(`left pointer moved to position ${pointers.left}`);
      }
      if (pointers.right !== prevPointers.right) {
        changes.push(`right pointer moved to position ${pointers.right}`);
      }
      if (pointers.mid !== prevPointers.mid) {
        changes.push(`middle pointer moved to position ${pointers.mid}`);
      }

      if (changes.length > 0) {
        const description = changes.join(', ');
        announceVisualizationChange({
          type: 'compare',
          elements: [pointers.mid || 0],
          description
        });
      }
    }

    // Update previous state
    setPreviousState({
      highlighted: [...highlighted],
      eliminated: [...eliminated],
      pointers: { ...pointers }
    });
  }, [highlighted, eliminated, pointers, type]);

  // Provide keyboard navigation for visualization elements
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !preferences?.keyboardNavigationOnly) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!container.contains(event.target as Node)) return;

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
          event.preventDefault();
          navigateArrayElements(event.key === 'ArrowRight' ? 1 : -1);
          break;
        
        case 'Home':
          event.preventDefault();
          focusArrayElement(0);
          break;
        
        case 'End':
          event.preventDefault();
          focusArrayElement(data.length - 1);
          break;
        
        case 'Enter':
        case ' ':
          event.preventDefault();
          announceCurrentElement();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [data, preferences?.keyboardNavigationOnly]);

  const navigateArrayElements = (direction: number) => {
    const elements = containerRef.current?.querySelectorAll('[data-array-element]');
    if (!elements) return;

    const currentIndex = Array.from(elements).findIndex(el => el === document.activeElement);
    const nextIndex = Math.max(0, Math.min(elements.length - 1, currentIndex + direction));
    
    (elements[nextIndex] as HTMLElement)?.focus();
  };

  const focusArrayElement = (index: number) => {
    const elements = containerRef.current?.querySelectorAll('[data-array-element]');
    if (elements && elements[index]) {
      (elements[index] as HTMLElement).focus();
    }
  };

  const announceCurrentElement = () => {
    const activeElement = document.activeElement;
    if (activeElement && activeElement.hasAttribute('data-array-element')) {
      const index = parseInt(activeElement.getAttribute('data-array-index') || '0');
      const value = data[index];
      const status = [];

      if (highlighted.includes(index)) status.push('highlighted');
      if (eliminated.includes(index)) status.push('eliminated');
      if (pointers?.left === index) status.push('left pointer');
      if (pointers?.right === index) status.push('right pointer');
      if (pointers?.mid === index) status.push('middle pointer');

      const statusText = status.length > 0 ? `, ${status.join(', ')}` : '';
      announceVisualizationChange({
        type: 'compare',
        elements: [index],
        description: `Element at position ${index} has value ${value}${statusText}`
      });
    }
  };

  // Generate detailed description for screen readers
  const getDetailedDescription = () => {
    let description = `${type} visualization with ${data.length} elements. `;
    
    if (currentStep) {
      description += `Currently on step ${currentStep}. `;
    }

    if (highlighted.length > 0) {
      description += `Highlighted elements at positions: ${highlighted.join(', ')}. `;
    }

    if (eliminated.length > 0) {
      description += `Eliminated elements at positions: ${eliminated.join(', ')}. `;
    }

    if (pointers && type === 'binary-search') {
      const pointerDesc = [];
      if (pointers.left !== undefined) pointerDesc.push(`left at ${pointers.left}`);
      if (pointers.right !== undefined) pointerDesc.push(`right at ${pointers.right}`);
      if (pointers.mid !== undefined) pointerDesc.push(`middle at ${pointers.mid}`);
      
      if (pointerDesc.length > 0) {
        description += `Search pointers: ${pointerDesc.join(', ')}. `;
      }
    }

    description += 'Use arrow keys to navigate elements, Enter to hear details about the current element.';
    
    return description;
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      role="img"
      aria-label={altText}
      aria-describedby={isScreenReaderActive ? 'visualization-description' : undefined}
      tabIndex={preferences?.keyboardNavigationOnly ? 0 : -1}
    >
      {/* Hidden detailed description for screen readers */}
      {isScreenReaderActive && (
        <div
          id="visualization-description"
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          {getDetailedDescription()}
        </div>
      )}

      {/* Main visualization content */}
      <div className={preferences?.reducedMotion ? 'reduce-motion' : ''}>
        {children}
      </div>

      {/* Keyboard navigation instructions */}
      {preferences?.keyboardNavigationOnly && (
        <div className="sr-only" aria-live="polite">
          Use arrow keys to navigate array elements. Press Enter to hear details about the current element.
          Press Home to go to first element, End to go to last element.
        </div>
      )}

      {/* High contrast overlay if enabled */}
      {preferences?.highContrastMode && (
        <div className="absolute inset-0 pointer-events-none high-contrast-overlay" />
      )}
    </div>
  );
}

// Helper component for accessible array elements
interface AccessibleArrayElementProps {
  value: number;
  index: number;
  isHighlighted?: boolean;
  isEliminated?: boolean;
  hasPointer?: 'left' | 'right' | 'mid';
  children: React.ReactNode;
  className?: string;
}

export function AccessibleArrayElement({
  value,
  index,
  isHighlighted = false,
  isEliminated = false,
  hasPointer,
  children,
  className = ''
}: AccessibleArrayElementProps) {
  const { preferences } = useAccessibility();

  const getAriaLabel = () => {
    const status = [];
    if (isHighlighted) status.push('highlighted');
    if (isEliminated) status.push('eliminated');
    if (hasPointer) status.push(`${hasPointer} pointer`);
    
    const statusText = status.length > 0 ? `, ${status.join(', ')}` : '';
    return `Array element at position ${index}, value ${value}${statusText}`;
  };

  return (
    <div
      data-array-element
      data-array-index={index}
      data-array-value={value}
      className={`${className} ${preferences?.keyboardNavigationOnly ? 'focusable-element' : ''}`}
      role="gridcell"
      aria-label={getAriaLabel()}
      tabIndex={preferences?.keyboardNavigationOnly ? 0 : -1}
      aria-selected={isHighlighted}
      aria-disabled={isEliminated}
    >
      {children}
      
      {/* Screen reader only status */}
      <span className="sr-only">
        {isHighlighted && ' (highlighted)'}
        {isEliminated && ' (eliminated)'}
        {hasPointer && ` (${hasPointer} pointer)`}
      </span>
    </div>
  );
}