'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { AccessibilityService, AccessibilityPreferences, FocusableElement } from '../lib/services/accessibility-service';

export function useAccessibility() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences | null>(null);
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);
  const serviceRef = useRef<AccessibilityService | null>(null);

  useEffect(() => {
    serviceRef.current = AccessibilityService.getInstance();
    serviceRef.current.initialize();
    
    setPreferences(serviceRef.current.getPreferences());
    setIsScreenReaderActive(serviceRef.current.isScreenReaderActive());
  }, []);

  const updatePreferences = useCallback((newPreferences: Partial<AccessibilityPreferences>) => {
    if (serviceRef.current) {
      serviceRef.current.updatePreferences(newPreferences);
      setPreferences(serviceRef.current.getPreferences());
    }
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (serviceRef.current) {
      serviceRef.current.announce({ message, priority });
    }
  }, []);

  const announceAlgorithmState = useCallback((state: {
    step: number;
    totalSteps: number;
    currentOperation: string;
    arrayState?: number[];
    pointers?: { left?: number; right?: number; mid?: number };
  }) => {
    if (serviceRef.current) {
      serviceRef.current.announceAlgorithmState(state);
    }
  }, []);

  const announceVisualizationChange = useCallback((change: {
    type: 'highlight' | 'eliminate' | 'compare' | 'found';
    elements: number[];
    description: string;
  }) => {
    if (serviceRef.current) {
      serviceRef.current.announceVisualizationChange(change);
    }
  }, []);

  const registerFocusableElements = useCallback((elements: FocusableElement[]) => {
    if (serviceRef.current) {
      serviceRef.current.registerFocusableElements(elements);
    }
  }, []);

  const generateVisualizationAltText = useCallback((visualization: {
    type: 'array' | 'binary-search' | 'sorting';
    data: number[];
    currentStep?: number;
    pointers?: { left?: number; right?: number; mid?: number };
    highlighted?: number[];
    eliminated?: number[];
  }) => {
    if (serviceRef.current) {
      return serviceRef.current.generateVisualizationAltText(visualization);
    }
    return '';
  }, []);

  return {
    preferences,
    isScreenReaderActive,
    updatePreferences,
    announce,
    announceAlgorithmState,
    announceVisualizationChange,
    registerFocusableElements,
    generateVisualizationAltText
  };
}

export function useKeyboardNavigation(
  containerRef: React.RefObject<HTMLElement>,
  options: {
    enableArrowKeys?: boolean;
    enableTabTrapping?: boolean;
    onEscape?: () => void;
  } = {}
) {
  const { enableArrowKeys = false, enableTabTrapping = false, onEscape } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          if (onEscape) {
            event.preventDefault();
            onEscape();
          }
          break;

        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          if (enableArrowKeys) {
            event.preventDefault();
            handleArrowNavigation(event.key, container);
          }
          break;

        case 'Tab':
          if (enableTabTrapping) {
            handleTabTrapping(event, container);
          }
          break;

        case 'Enter':
        case ' ':
          // Activate focused element
          const activeElement = document.activeElement as HTMLElement;
          if (activeElement && container.contains(activeElement)) {
            if (activeElement.tagName === 'BUTTON' || activeElement.getAttribute('role') === 'button') {
              event.preventDefault();
              activeElement.click();
            }
          }
          break;
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, enableArrowKeys, enableTabTrapping, onEscape]);

  const handleArrowNavigation = (key: string, container: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    
    let nextIndex = currentIndex;
    
    switch (key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
        break;
    }
    
    if (focusableElements[nextIndex]) {
      focusableElements[nextIndex].focus();
    }
  };

  const handleTabTrapping = (event: KeyboardEvent, container: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  };

  const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
    const selector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]:not([disabled])'
    ].join(', ');

    return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  };
}

export function useFocusManagement() {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, []);

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleFocusChange = () => {
      setFocusedElement(document.activeElement as HTMLElement);
    };

    document.addEventListener('focusin', handleFocusChange);
    document.addEventListener('focusout', handleFocusChange);

    return () => {
      document.removeEventListener('focusin', handleFocusChange);
      document.removeEventListener('focusout', handleFocusChange);
    };
  }, []);

  return {
    focusedElement,
    saveFocus,
    restoreFocus,
    trapFocus
  };
}