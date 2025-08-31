/**
 * Accessibility Service
 * Provides comprehensive accessibility support including screen reader integration,
 * keyboard navigation, and visual accessibility features
 */

export interface AccessibilityPreferences {
  screenReaderEnabled: boolean;
  highContrastMode: boolean;
  reducedMotion: boolean;
  keyboardNavigationOnly: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  focusIndicatorStyle: 'default' | 'high-contrast' | 'thick';
}

export interface AriaAnnouncement {
  message: string;
  priority: 'polite' | 'assertive';
  delay?: number;
}

export interface FocusableElement {
  element: HTMLElement;
  tabIndex: number;
  role?: string;
  ariaLabel?: string;
}

export class AccessibilityService {
  private static instance: AccessibilityService;
  private preferences: AccessibilityPreferences;
  private announcer: HTMLElement | null = null;
  private focusableElements: FocusableElement[] = [];
  private currentFocusIndex = -1;

  private constructor() {
    this.preferences = this.getDefaultPreferences();
    this.initializeAnnouncer();
    this.detectAccessibilityPreferences();
    this.setupEventListeners();
  }

  public static getInstance(): AccessibilityService {
    if (!AccessibilityService.instance) {
      AccessibilityService.instance = new AccessibilityService();
    }
    return AccessibilityService.instance;
  }

  /**
   * Initialize the service and apply accessibility features
   */
  public initialize(): void {
    this.applyAccessibilityPreferences();
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.announcePageLoad();
  }

  /**
   * Announce a message to screen readers
   */
  public announce(announcement: AriaAnnouncement): void {
    if (!this.announcer) return;

    const message = announcement.message;
    const delay = announcement.delay || 0;

    setTimeout(() => {
      if (this.announcer) {
        this.announcer.setAttribute('aria-live', announcement.priority);
        this.announcer.textContent = message;
        
        // Clear the message after a short delay to allow for re-announcements
        setTimeout(() => {
          if (this.announcer) {
            this.announcer.textContent = '';
          }
        }, 1000);
      }
    }, delay);
  }

  /**
   * Announce algorithm state changes
   */
  public announceAlgorithmState(state: {
    step: number;
    totalSteps: number;
    currentOperation: string;
    arrayState?: number[];
    pointers?: { left?: number; right?: number; mid?: number };
  }): void {
    let message = `Step ${state.step} of ${state.totalSteps}: ${state.currentOperation}`;
    
    if (state.pointers) {
      const pointerInfo = [];
      if (state.pointers.left !== undefined) pointerInfo.push(`left pointer at position ${state.pointers.left}`);
      if (state.pointers.right !== undefined) pointerInfo.push(`right pointer at position ${state.pointers.right}`);
      if (state.pointers.mid !== undefined) pointerInfo.push(`middle pointer at position ${state.pointers.mid}`);
      
      if (pointerInfo.length > 0) {
        message += `. ${pointerInfo.join(', ')}`;
      }
    }

    this.announce({
      message,
      priority: 'polite'
    });
  }

  /**
   * Announce visualization changes
   */
  public announceVisualizationChange(change: {
    type: 'highlight' | 'eliminate' | 'compare' | 'found';
    elements: number[];
    description: string;
  }): void {
    let message = '';
    
    switch (change.type) {
      case 'highlight':
        message = `Highlighting elements at positions ${change.elements.join(', ')}. ${change.description}`;
        break;
      case 'eliminate':
        message = `Eliminating elements at positions ${change.elements.join(', ')}. ${change.description}`;
        break;
      case 'compare':
        message = `Comparing elements. ${change.description}`;
        break;
      case 'found':
        message = `Target found at position ${change.elements[0]}! ${change.description}`;
        break;
    }

    this.announce({
      message,
      priority: 'polite',
      delay: 500 // Small delay to avoid overwhelming screen readers
    });
  }

  /**
   * Update accessibility preferences
   */
  public updatePreferences(newPreferences: Partial<AccessibilityPreferences>): void {
    this.preferences = { ...this.preferences, ...newPreferences };
    this.savePreferences();
    this.applyAccessibilityPreferences();
  }

  /**
   * Get current accessibility preferences
   */
  public getPreferences(): AccessibilityPreferences {
    return { ...this.preferences };
  }

  /**
   * Register focusable elements for keyboard navigation
   */
  public registerFocusableElements(elements: FocusableElement[]): void {
    this.focusableElements = elements.sort((a, b) => a.tabIndex - b.tabIndex);
    this.currentFocusIndex = -1;
  }

  /**
   * Navigate to next focusable element
   */
  public focusNext(): boolean {
    if (this.focusableElements.length === 0) return false;
    
    this.currentFocusIndex = (this.currentFocusIndex + 1) % this.focusableElements.length;
    const element = this.focusableElements[this.currentFocusIndex];
    
    element.element.focus();
    this.announceElementFocus(element);
    
    return true;
  }

  /**
   * Navigate to previous focusable element
   */
  public focusPrevious(): boolean {
    if (this.focusableElements.length === 0) return false;
    
    this.currentFocusIndex = this.currentFocusIndex <= 0 
      ? this.focusableElements.length - 1 
      : this.currentFocusIndex - 1;
    
    const element = this.focusableElements[this.currentFocusIndex];
    element.element.focus();
    this.announceElementFocus(element);
    
    return true;
  }

  /**
   * Generate comprehensive alt text for visualizations
   */
  public generateVisualizationAltText(visualization: {
    type: 'array' | 'binary-search' | 'sorting';
    data: number[];
    currentStep?: number;
    pointers?: { left?: number; right?: number; mid?: number };
    highlighted?: number[];
    eliminated?: number[];
  }): string {
    let altText = '';
    
    switch (visualization.type) {
      case 'array':
        altText = `Array with ${visualization.data.length} elements: ${visualization.data.join(', ')}`;
        break;
        
      case 'binary-search':
        altText = `Binary search visualization. Array: ${visualization.data.join(', ')}`;
        
        if (visualization.pointers) {
          const { left, right, mid } = visualization.pointers;
          if (left !== undefined && right !== undefined) {
            altText += `. Search range from position ${left} to ${right}`;
          }
          if (mid !== undefined) {
            altText += `. Currently examining middle element at position ${mid} with value ${visualization.data[mid]}`;
          }
        }
        
        if (visualization.highlighted && visualization.highlighted.length > 0) {
          altText += `. Highlighted elements at positions: ${visualization.highlighted.join(', ')}`;
        }
        
        if (visualization.eliminated && visualization.eliminated.length > 0) {
          altText += `. Eliminated elements at positions: ${visualization.eliminated.join(', ')}`;
        }
        break;
        
      case 'sorting':
        altText = `Sorting visualization. Array: ${visualization.data.join(', ')}`;
        if (visualization.currentStep) {
          altText += `. Step ${visualization.currentStep}`;
        }
        break;
    }
    
    return altText;
  }

  /**
   * Check if screen reader is likely active
   */
  public isScreenReaderActive(): boolean {
    // Check for common screen reader indicators
    return this.preferences.screenReaderEnabled || 
           window.navigator.userAgent.includes('NVDA') ||
           window.navigator.userAgent.includes('JAWS') ||
           window.speechSynthesis?.speaking === true;
  }

  private getDefaultPreferences(): AccessibilityPreferences {
    return {
      screenReaderEnabled: false,
      highContrastMode: false,
      reducedMotion: false,
      keyboardNavigationOnly: false,
      fontSize: 'medium',
      focusIndicatorStyle: 'default'
    };
  }

  private initializeAnnouncer(): void {
    this.announcer = document.createElement('div');
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.className = 'sr-only';
    this.announcer.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    
    document.body.appendChild(this.announcer);
  }

  private detectAccessibilityPreferences(): void {
    // Detect system preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.preferences.reducedMotion = true;
    }
    
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      this.preferences.highContrastMode = true;
    }

    // Load saved preferences
    const saved = localStorage.getItem('accessibility-preferences');
    if (saved) {
      try {
        const savedPrefs = JSON.parse(saved);
        this.preferences = { ...this.preferences, ...savedPrefs };
      } catch (error) {
        console.warn('Failed to load accessibility preferences:', error);
      }
    }
  }

  private applyAccessibilityPreferences(): void {
    const root = document.documentElement;
    
    // Apply high contrast mode
    if (this.preferences.highContrastMode) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Apply reduced motion
    if (this.preferences.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    // Apply font size
    root.classList.remove('font-small', 'font-medium', 'font-large', 'font-extra-large');
    root.classList.add(`font-${this.preferences.fontSize}`);
    
    // Apply focus indicator style
    root.classList.remove('focus-default', 'focus-high-contrast', 'focus-thick');
    root.classList.add(`focus-${this.preferences.focusIndicatorStyle}`);
  }

  private setupEventListeners(): void {
    // Listen for system preference changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.updatePreferences({ reducedMotion: e.matches });
    });
    
    window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
      this.updatePreferences({ highContrastMode: e.matches });
    });
  }

  private setupKeyboardNavigation(): void {
    document.addEventListener('keydown', (event) => {
      if (!this.preferences.keyboardNavigationOnly && !this.isScreenReaderActive()) {
        return;
      }

      switch (event.key) {
        case 'Tab':
          if (event.shiftKey) {
            event.preventDefault();
            this.focusPrevious();
          } else {
            event.preventDefault();
            this.focusNext();
          }
          break;
          
        case 'Escape':
          // Allow escape to clear focus or close modals
          this.announce({
            message: 'Escape pressed. Clearing focus.',
            priority: 'polite'
          });
          break;
      }
    });
  }

  private setupFocusManagement(): void {
    // Ensure focus is visible
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      if (target && this.preferences.keyboardNavigationOnly) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  private announcePageLoad(): void {
    this.announce({
      message: 'Interactive Algorithm Education Platform loaded. Use Tab to navigate between elements.',
      priority: 'polite',
      delay: 1000
    });
  }

  private announceElementFocus(element: FocusableElement): void {
    let message = element.ariaLabel || element.element.textContent || 'Interactive element';
    
    if (element.role) {
      message += `, ${element.role}`;
    }
    
    this.announce({
      message: `Focused: ${message}`,
      priority: 'polite'
    });
  }

  private savePreferences(): void {
    try {
      localStorage.setItem('accessibility-preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.warn('Failed to save accessibility preferences:', error);
    }
  }
}