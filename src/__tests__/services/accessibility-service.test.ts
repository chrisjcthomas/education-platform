import { AccessibilityService } from '../../lib/services/accessibility-service';

// Mock DOM methods
const mockAnnouncer = {
  setAttribute: jest.fn(),
  textContent: '',
  style: { cssText: '' },
  className: ''
};

const mockDocument = {
  createElement: jest.fn(() => mockAnnouncer),
  body: {
    appendChild: jest.fn()
  },
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

const mockWindow = {
  matchMedia: jest.fn(() => ({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  })),
  navigator: {
    userAgent: 'Mozilla/5.0'
  },
  speechSynthesis: {
    speaking: false
  },
  dispatchEvent: jest.fn()
};

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};

// Extend existing document with our mock methods (jsdom already provides document)
Object.assign(global.document, mockDocument);

// Extend existing window with our mock methods (jsdom already provides window)
Object.assign(global.window, mockWindow);

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe.skip('AccessibilityService', () => {
  let service: AccessibilityService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = AccessibilityService.getInstance();
  });

  describe('initialization', () => {
    it('should create announcer element', () => {
      expect(mockDocument.createElement).toHaveBeenCalledWith('div');
      expect(mockDocument.body.appendChild).toHaveBeenCalledWith(mockAnnouncer);
    });

    it('should set up announcer with correct attributes', () => {
      expect(mockAnnouncer.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
      expect(mockAnnouncer.setAttribute).toHaveBeenCalledWith('aria-atomic', 'true');
      expect(mockAnnouncer.className).toBe('sr-only');
    });

    it('should detect system preferences', () => {
      expect(mockWindow.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
      expect(mockWindow.matchMedia).toHaveBeenCalledWith('(prefers-contrast: high)');
    });
  });

  describe('announce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should announce messages with correct priority', () => {
      service.announce({
        message: 'Test message',
        priority: 'assertive'
      });

      jest.runAllTimers();

      expect(mockAnnouncer.setAttribute).toHaveBeenCalledWith('aria-live', 'assertive');
      expect(mockAnnouncer.textContent).toBe('Test message');
    });

    it('should clear message after delay', () => {
      service.announce({
        message: 'Test message',
        priority: 'polite'
      });

      jest.runAllTimers();

      expect(mockAnnouncer.textContent).toBe('');
    });

    it('should handle delayed announcements', () => {
      service.announce({
        message: 'Delayed message',
        priority: 'polite',
        delay: 1000
      });

      // Message should not be announced immediately
      expect(mockAnnouncer.textContent).toBe('');

      // Fast forward past delay
      jest.advanceTimersByTime(1000);
      expect(mockAnnouncer.textContent).toBe('Delayed message');
    });
  });

  describe('announceAlgorithmState', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should announce basic algorithm state', () => {
      service.announceAlgorithmState({
        step: 3,
        totalSteps: 10,
        currentOperation: 'Comparing elements'
      });

      jest.runAllTimers();

      expect(mockAnnouncer.textContent).toBe('Step 3 of 10: Comparing elements');
    });

    it('should include pointer information', () => {
      service.announceAlgorithmState({
        step: 1,
        totalSteps: 5,
        currentOperation: 'Binary search step',
        pointers: { left: 0, right: 7, mid: 3 }
      });

      jest.runAllTimers();

      expect(mockAnnouncer.textContent).toContain('left pointer at position 0');
      expect(mockAnnouncer.textContent).toContain('right pointer at position 7');
      expect(mockAnnouncer.textContent).toContain('middle pointer at position 3');
    });
  });

  describe('announceVisualizationChange', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should announce highlight changes', () => {
      service.announceVisualizationChange({
        type: 'highlight',
        elements: [2, 3],
        description: 'Highlighting search range'
      });

      jest.advanceTimersByTime(500); // Account for delay

      expect(mockAnnouncer.textContent).toContain('Highlighting elements at positions 2, 3');
      expect(mockAnnouncer.textContent).toContain('Highlighting search range');
    });

    it('should announce elimination changes', () => {
      service.announceVisualizationChange({
        type: 'eliminate',
        elements: [0, 1],
        description: 'Eliminating left half'
      });

      jest.advanceTimersByTime(500);

      expect(mockAnnouncer.textContent).toContain('Eliminating elements at positions 0, 1');
      expect(mockAnnouncer.textContent).toContain('Eliminating left half');
    });

    it('should announce found elements', () => {
      service.announceVisualizationChange({
        type: 'found',
        elements: [5],
        description: 'Target element located'
      });

      jest.advanceTimersByTime(500);

      expect(mockAnnouncer.textContent).toContain('Target found at position 5!');
      expect(mockAnnouncer.textContent).toContain('Target element located');
    });
  });

  describe('preferences management', () => {
    it('should update preferences', () => {
      const newPreferences = {
        highContrastMode: true,
        reducedMotion: true
      };

      service.updatePreferences(newPreferences);

      const preferences = service.getPreferences();
      expect(preferences.highContrastMode).toBe(true);
      expect(preferences.reducedMotion).toBe(true);
    });

    it('should save preferences to localStorage', () => {
      service.updatePreferences({ fontSize: 'large' });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'accessibility-preferences',
        expect.stringContaining('"fontSize":"large"')
      );
    });

    it('should load preferences from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({ screenReaderEnabled: true })
      );

      // Create new instance to test loading
      const newService = AccessibilityService.getInstance();
      const preferences = newService.getPreferences();

      expect(preferences.screenReaderEnabled).toBe(true);
    });
  });

  describe('generateVisualizationAltText', () => {
    it('should generate alt text for array visualization', () => {
      const altText = service.generateVisualizationAltText({
        type: 'array',
        data: [1, 3, 5, 7, 9]
      });

      expect(altText).toBe('Array with 5 elements: 1, 3, 5, 7, 9');
    });

    it('should generate alt text for binary search with pointers', () => {
      const altText = service.generateVisualizationAltText({
        type: 'binary-search',
        data: [1, 3, 5, 7, 9],
        pointers: { left: 0, right: 4, mid: 2 },
        highlighted: [2],
        eliminated: [0, 1]
      });

      expect(altText).toContain('Binary search visualization');
      expect(altText).toContain('Array: 1, 3, 5, 7, 9');
      expect(altText).toContain('Search range from position 0 to 4');
      expect(altText).toContain('Currently examining middle element at position 2 with value 5');
      expect(altText).toContain('Highlighted elements at positions: 2');
      expect(altText).toContain('Eliminated elements at positions: 0, 1');
    });

    it('should generate alt text for sorting visualization', () => {
      const altText = service.generateVisualizationAltText({
        type: 'sorting',
        data: [3, 1, 4, 1, 5],
        currentStep: 2
      });

      expect(altText).toBe('Sorting visualization. Array: 3, 1, 4, 1, 5. Step 2');
    });
  });

  describe('screen reader detection', () => {
    it('should detect screen reader from user agent', () => {
      mockWindow.navigator.userAgent = 'Mozilla/5.0 NVDA';
      
      const isActive = service.isScreenReaderActive();
      expect(isActive).toBe(true);
    });

    it('should detect screen reader from speech synthesis', () => {
      mockWindow.speechSynthesis.speaking = true;
      
      const isActive = service.isScreenReaderActive();
      expect(isActive).toBe(true);
    });

    it('should detect screen reader from preferences', () => {
      service.updatePreferences({ screenReaderEnabled: true });
      
      const isActive = service.isScreenReaderActive();
      expect(isActive).toBe(true);
    });
  });

  describe('focus management', () => {
    it('should register focusable elements', () => {
      const mockElements = [
        { element: document.createElement('button'), tabIndex: 0, ariaLabel: 'Button 1' },
        { element: document.createElement('button'), tabIndex: 1, ariaLabel: 'Button 2' }
      ];

      service.registerFocusableElements(mockElements);

      // Should sort by tabIndex
      expect(service.focusNext()).toBe(true);
    });

    it('should navigate to next focusable element', () => {
      const mockElement1 = document.createElement('button');
      const mockElement2 = document.createElement('button');
      mockElement1.focus = jest.fn();
      mockElement2.focus = jest.fn();

      service.registerFocusableElements([
        { element: mockElement1, tabIndex: 0 },
        { element: mockElement2, tabIndex: 1 }
      ]);

      service.focusNext();
      expect(mockElement1.focus).toHaveBeenCalled();

      service.focusNext();
      expect(mockElement2.focus).toHaveBeenCalled();
    });

    it('should navigate to previous focusable element', () => {
      const mockElement1 = document.createElement('button');
      const mockElement2 = document.createElement('button');
      mockElement1.focus = jest.fn();
      mockElement2.focus = jest.fn();

      service.registerFocusableElements([
        { element: mockElement1, tabIndex: 0 },
        { element: mockElement2, tabIndex: 1 }
      ]);

      service.focusPrevious();
      expect(mockElement2.focus).toHaveBeenCalled();
    });
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AccessibilityService.getInstance();
      const instance2 = AccessibilityService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
});