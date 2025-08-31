/**
 * Feature Detection and Graceful Degradation Service
 * Detects browser capabilities and provides fallbacks for unsupported features
 */

export interface BrowserCapabilities {
  webAssembly: boolean;
  webWorkers: boolean;
  requestAnimationFrame: boolean;
  localStorage: boolean;
  touchEvents: boolean;
  webGL: boolean;
  audioContext: boolean;
  intersectionObserver: boolean;
  resizeObserver: boolean;
  performanceAPI: boolean;
}

export interface FeatureFallback {
  feature: string;
  isSupported: boolean;
  fallbackStrategy: 'disable' | 'polyfill' | 'alternative' | 'simplify';
  fallbackImplementation?: () => void;
  userMessage?: string;
}

export class FeatureDetectionService {
  private static instance: FeatureDetectionService;
  private capabilities: BrowserCapabilities;
  private fallbacks: Map<string, FeatureFallback> = new Map();

  private constructor() {
    this.capabilities = this.detectCapabilities();
    this.initializeFallbacks();
  }

  public static getInstance(): FeatureDetectionService {
    if (!FeatureDetectionService.instance) {
      FeatureDetectionService.instance = new FeatureDetectionService();
    }
    return FeatureDetectionService.instance;
  }

  /**
   * Get browser capabilities
   */
  public getCapabilities(): BrowserCapabilities {
    return { ...this.capabilities };
  }

  /**
   * Check if a specific feature is supported
   */
  public isFeatureSupported(feature: keyof BrowserCapabilities): boolean {
    return this.capabilities[feature];
  }

  /**
   * Get fallback strategy for a feature
   */
  public getFallback(feature: string): FeatureFallback | null {
    return this.fallbacks.get(feature) || null;
  }

  /**
   * Apply graceful degradation for unsupported features
   */
  public applyGracefulDegradation(): void {
    for (const [feature, fallback] of this.fallbacks) {
      if (!fallback.isSupported && fallback.fallbackImplementation) {
        try {
          fallback.fallbackImplementation();
          console.log(`Applied fallback for ${feature}: ${fallback.fallbackStrategy}`);
        } catch (error) {
          console.warn(`Failed to apply fallback for ${feature}:`, error);
        }
      }
    }
  }

  /**
   * Get user-friendly messages about unsupported features
   */
  public getUnsupportedFeatureMessages(): string[] {
    const messages: string[] = [];
    
    for (const fallback of this.fallbacks.values()) {
      if (!fallback.isSupported && fallback.userMessage) {
        messages.push(fallback.userMessage);
      }
    }

    return messages;
  }

  /**
   * Check if the platform can run the full educational experience
   */
  public canRunFullExperience(): boolean {
    const criticalFeatures: (keyof BrowserCapabilities)[] = [
      'requestAnimationFrame',
      'localStorage'
    ];

    return criticalFeatures.every(feature => this.capabilities[feature]);
  }

  /**
   * Get recommended experience level based on capabilities
   */
  public getRecommendedExperience(): 'full' | 'reduced' | 'minimal' {
    const score = this.calculateCapabilityScore();
    
    if (score >= 0.8) return 'full';
    if (score >= 0.5) return 'reduced';
    return 'minimal';
  }

  private detectCapabilities(): BrowserCapabilities {
    return {
      webAssembly: this.detectWebAssembly(),
      webWorkers: this.detectWebWorkers(),
      requestAnimationFrame: this.detectRequestAnimationFrame(),
      localStorage: this.detectLocalStorage(),
      touchEvents: this.detectTouchEvents(),
      webGL: this.detectWebGL(),
      audioContext: this.detectAudioContext(),
      intersectionObserver: this.detectIntersectionObserver(),
      resizeObserver: this.detectResizeObserver(),
      performanceAPI: this.detectPerformanceAPI()
    };
  }

  private initializeFallbacks(): void {
    // WebAssembly fallback (for Pyodide)
    this.fallbacks.set('webAssembly', {
      feature: 'webAssembly',
      isSupported: this.capabilities.webAssembly,
      fallbackStrategy: 'disable',
      userMessage: this.capabilities.webAssembly ? undefined : 
        'Python code execution is not available in your browser. You can still learn with JavaScript examples.',
      fallbackImplementation: () => {
        // Disable Python language option
        window.dispatchEvent(new CustomEvent('disable-python-support'));
      }
    });

    // Web Workers fallback
    this.fallbacks.set('webWorkers', {
      feature: 'webWorkers',
      isSupported: this.capabilities.webWorkers,
      fallbackStrategy: 'alternative',
      userMessage: this.capabilities.webWorkers ? undefined :
        'Code execution will run on the main thread. Complex algorithms might cause temporary freezing.',
      fallbackImplementation: () => {
        // Use main thread execution instead of web workers
        window.dispatchEvent(new CustomEvent('use-main-thread-execution'));
      }
    });

    // Animation fallback
    this.fallbacks.set('requestAnimationFrame', {
      feature: 'requestAnimationFrame',
      isSupported: this.capabilities.requestAnimationFrame,
      fallbackStrategy: 'polyfill',
      fallbackImplementation: () => {
        // Polyfill requestAnimationFrame
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = (callback) => {
            return window.setTimeout(callback, 1000 / 60);
          };
        }
      }
    });

    // Local Storage fallback
    this.fallbacks.set('localStorage', {
      feature: 'localStorage',
      isSupported: this.capabilities.localStorage,
      fallbackStrategy: 'alternative',
      userMessage: this.capabilities.localStorage ? undefined :
        'Your preferences won\'t be saved between sessions.',
      fallbackImplementation: () => {
        // Use in-memory storage
        window.dispatchEvent(new CustomEvent('use-memory-storage'));
      }
    });

    // Touch Events fallback
    this.fallbacks.set('touchEvents', {
      feature: 'touchEvents',
      isSupported: this.capabilities.touchEvents,
      fallbackStrategy: 'alternative',
      fallbackImplementation: () => {
        // Use mouse events instead of touch events
        window.dispatchEvent(new CustomEvent('use-mouse-events'));
      }
    });

    // WebGL fallback
    this.fallbacks.set('webGL', {
      feature: 'webGL',
      isSupported: this.capabilities.webGL,
      fallbackStrategy: 'simplify',
      userMessage: this.capabilities.webGL ? undefined :
        'Advanced visualizations are simplified for better compatibility.',
      fallbackImplementation: () => {
        // Use CSS animations instead of WebGL
        window.dispatchEvent(new CustomEvent('use-css-animations'));
      }
    });

    // Audio Context fallback
    this.fallbacks.set('audioContext', {
      feature: 'audioContext',
      isSupported: this.capabilities.audioContext,
      fallbackStrategy: 'disable',
      userMessage: this.capabilities.audioContext ? undefined :
        'Audio feedback is not available in your browser.',
      fallbackImplementation: () => {
        // Disable audio features
        window.dispatchEvent(new CustomEvent('disable-audio'));
      }
    });

    // Intersection Observer fallback
    this.fallbacks.set('intersectionObserver', {
      feature: 'intersectionObserver',
      isSupported: this.capabilities.intersectionObserver,
      fallbackStrategy: 'polyfill',
      fallbackImplementation: () => {
        // Use scroll event listeners instead
        window.dispatchEvent(new CustomEvent('use-scroll-detection'));
      }
    });

    // Performance API fallback
    this.fallbacks.set('performanceAPI', {
      feature: 'performanceAPI',
      isSupported: this.capabilities.performanceAPI,
      fallbackStrategy: 'alternative',
      fallbackImplementation: () => {
        // Use Date.now() for timing instead of performance.now()
        window.dispatchEvent(new CustomEvent('use-date-timing'));
      }
    });
  }

  private calculateCapabilityScore(): number {
    const weights = {
      webAssembly: 0.15,
      webWorkers: 0.1,
      requestAnimationFrame: 0.2,
      localStorage: 0.1,
      touchEvents: 0.05,
      webGL: 0.15,
      audioContext: 0.05,
      intersectionObserver: 0.1,
      resizeObserver: 0.05,
      performanceAPI: 0.05
    };

    let score = 0;
    for (const [feature, weight] of Object.entries(weights)) {
      if (this.capabilities[feature as keyof BrowserCapabilities]) {
        score += weight;
      }
    }

    return score;
  }

  // Feature detection methods
  private detectWebAssembly(): boolean {
    return typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function';
  }

  private detectWebWorkers(): boolean {
    return typeof Worker !== 'undefined';
  }

  private detectRequestAnimationFrame(): boolean {
    return typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function';
  }

  private detectLocalStorage(): boolean {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private detectTouchEvents(): boolean {
    return typeof window !== 'undefined' && 'ontouchstart' in window;
  }

  private detectWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  }

  private detectAudioContext(): boolean {
    return typeof window !== 'undefined' && 
           (typeof window.AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined');
  }

  private detectIntersectionObserver(): boolean {
    return typeof window !== 'undefined' && 'IntersectionObserver' in window;
  }

  private detectResizeObserver(): boolean {
    return typeof window !== 'undefined' && 'ResizeObserver' in window;
  }

  private detectPerformanceAPI(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.performance !== 'undefined' && 
           typeof window.performance.now === 'function';
  }
}