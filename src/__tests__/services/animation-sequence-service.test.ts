import { AnimationSequenceService, AnimationConfig } from '@/lib/services/animation-sequence-service';
import { AlgorithmStep } from '@/lib/types';

// Mock window and performance APIs
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
  },
});

Object.defineProperty(window, 'requestAnimationFrame', {
  value: jest.fn((callback: FrameRequestCallback) => {
    return setTimeout(callback, 16);
  }),
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  value: jest.fn((id: number) => {
    clearTimeout(id);
  }),
});

describe('AnimationSequenceService', () => {
  let service: AnimationSequenceService;
  let mockConfig: AnimationConfig;

  beforeEach(() => {
    mockConfig = {
      speed: 1,
      reducedMotion: false,
      isLowPerformance: false,
      animationSpeed: 1,
    };
    service = new AnimationSequenceService(mockConfig);
    jest.clearAllMocks();
  });

  afterEach(() => {
    service.cancelAllAnimations();
  });

  describe('createAnimationSequence', () => {
    it('should create highlight animation sequence', () => {
      const algorithmStep: AlgorithmStep = {
        type: 'highlight',
        indices: [1, 3, 5],
        metadata: { reason: 'Highlighting elements' },
        description: 'Highlight selected elements',
      };

      const sequence = service.createAnimationSequence(algorithmStep, 0);

      expect(sequence.id).toMatch(/^step-0-\d+$/);
      expect(sequence.steps).toHaveLength(3);
      expect(sequence.steps[0]).toMatchObject({
        type: 'element',
        target: 1,
        action: 'highlight',
        delay: 0,
      });
      expect(sequence.steps[1]).toMatchObject({
        type: 'element',
        target: 3,
        action: 'highlight',
        delay: 100,
      });
      expect(sequence.priority).toBe('low');
    });

    it('should create compare animation sequence with pointers', () => {
      const algorithmStep: AlgorithmStep = {
        type: 'compare',
        indices: [2, 4],
        metadata: { 
          left: 0, 
          right: 7, 
          mid: 3,
          reason: 'Comparing elements' 
        },
        description: 'Compare elements at positions',
      };

      const sequence = service.createAnimationSequence(algorithmStep, 1);

      expect(sequence.steps.length).toBeGreaterThan(2);
      
      // Should have element highlights
      const elementAnimations = sequence.steps.filter(step => step.type === 'element');
      expect(elementAnimations).toHaveLength(2);
      
      // Should have pointer movements
      const pointerAnimations = sequence.steps.filter(step => step.type === 'pointer');
      expect(pointerAnimations).toHaveLength(3); // left, right, mid
      
      expect(sequence.priority).toBe('medium');
    });

    it('should create eliminate animation sequence', () => {
      const algorithmStep: AlgorithmStep = {
        type: 'eliminate',
        indices: [0, 1, 2],
        metadata: { 
          left: 3, 
          right: 7,
          searchRange: true,
          reason: 'Eliminating left half' 
        },
        description: 'Eliminate elements from search',
      };

      const sequence = service.createAnimationSequence(algorithmStep, 2);

      const elementAnimations = sequence.steps.filter(step => step.type === 'element');
      expect(elementAnimations).toHaveLength(3);
      expect(elementAnimations[0].action).toBe('dim');
      
      const rangeAnimations = sequence.steps.filter(step => step.type === 'range');
      expect(rangeAnimations).toHaveLength(1);
      expect(rangeAnimations[0].metadata).toMatchObject({
        startIndex: 3,
        endIndex: 7,
      });
      
      expect(sequence.priority).toBe('medium');
    });

    it('should create found animation sequence', () => {
      const algorithmStep: AlgorithmStep = {
        type: 'found',
        indices: [4],
        metadata: { reason: 'Target found' },
        description: 'Target element found',
      };

      const sequence = service.createAnimationSequence(algorithmStep, 3);

      expect(sequence.steps).toHaveLength(2);
      expect(sequence.steps[0]).toMatchObject({
        type: 'element',
        target: 4,
        action: 'highlight',
      });
      expect(sequence.steps[1]).toMatchObject({
        type: 'element',
        target: 4,
        action: 'scale',
      });
      expect(sequence.priority).toBe('high');
    });

    it('should create swap animation sequence', () => {
      const algorithmStep: AlgorithmStep = {
        type: 'swap',
        indices: [2, 5],
        metadata: { reason: 'Swapping elements' },
        description: 'Swap two elements',
      };

      const sequence = service.createAnimationSequence(algorithmStep, 4);

      expect(sequence.steps).toHaveLength(2);
      expect(sequence.steps[0]).toMatchObject({
        type: 'element',
        target: 2,
        action: 'move',
        metadata: { targetPosition: 5 },
      });
      expect(sequence.steps[1]).toMatchObject({
        type: 'element',
        target: 5,
        action: 'move',
        metadata: { targetPosition: 2 },
      });
    });

    it('should adjust duration based on config', () => {
      const algorithmStep: AlgorithmStep = {
        type: 'highlight',
        indices: [0],
        metadata: {},
        description: 'Test step',
      };

      // Test with different speeds
      service.updateConfig({ speed: 2 });
      const fastSequence = service.createAnimationSequence(algorithmStep, 0);
      
      service.updateConfig({ speed: 0.5 });
      const slowSequence = service.createAnimationSequence(algorithmStep, 0);

      expect(slowSequence.duration).toBeGreaterThan(fastSequence.duration);
    });

    it('should adjust duration for low performance', () => {
      const algorithmStep: AlgorithmStep = {
        type: 'highlight',
        indices: [0],
        metadata: {},
        description: 'Test step',
      };

      const normalSequence = service.createAnimationSequence(algorithmStep, 0);
      
      service.updateConfig({ isLowPerformance: true });
      const lowPerfSequence = service.createAnimationSequence(algorithmStep, 0);

      expect(lowPerfSequence.duration).toBeLessThan(normalSequence.duration);
    });
  });

  describe('queueAnimation', () => {
    it('should queue animations by priority', () => {
      const lowPriorityStep: AlgorithmStep = {
        type: 'highlight',
        indices: [0],
        metadata: {},
        description: 'Low priority',
      };

      const highPriorityStep: AlgorithmStep = {
        type: 'found',
        indices: [1],
        metadata: {},
        description: 'High priority',
      };

      const lowSequence = service.createAnimationSequence(lowPriorityStep, 0);
      const highSequence = service.createAnimationSequence(highPriorityStep, 1);

      service.queueAnimation(lowSequence);
      service.queueAnimation(highSequence);

      const status = service.getAnimationStatus();
      expect(status.queueLength).toBe(2);
    });

    it('should process queue automatically', async () => {
      const algorithmStep: AlgorithmStep = {
        type: 'highlight',
        indices: [0],
        metadata: {},
        description: 'Test step',
      };

      const sequence = service.createAnimationSequence(algorithmStep, 0);
      
      // Mock reduced motion to skip actual animations
      service.updateConfig({ reducedMotion: true });
      
      service.queueAnimation(sequence);

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 50));

      const status = service.getAnimationStatus();
      expect(status.queueLength).toBe(0);
    });
  });

  describe('executeSequence', () => {
    it('should skip animations in reduced motion mode', async () => {
      service.updateConfig({ reducedMotion: true });

      const algorithmStep: AlgorithmStep = {
        type: 'highlight',
        indices: [0],
        metadata: {},
        description: 'Test step',
      };

      const sequence = service.createAnimationSequence(algorithmStep, 0);
      const startTime = Date.now();
      
      await service.executeSequence(sequence);
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
    });

    it('should execute animation steps', async () => {
      const algorithmStep: AlgorithmStep = {
        type: 'highlight',
        indices: [0],
        metadata: {},
        description: 'Test step',
      };

      const sequence = service.createAnimationSequence(algorithmStep, 0);
      
      // Mock short duration for testing
      sequence.duration = 50;
      sequence.steps.forEach(step => {
        step.duration = 25;
        step.delay = 0;
      });

      const executionPromise = service.executeSequence(sequence);
      
      const status = service.getAnimationStatus();
      expect(status.activeCount).toBe(1);

      await executionPromise;

      const finalStatus = service.getAnimationStatus();
      expect(finalStatus.activeCount).toBe(0);
    });
  });

  describe('cancelAllAnimations', () => {
    it('should cancel all queued and active animations', () => {
      const algorithmStep: AlgorithmStep = {
        type: 'highlight',
        indices: [0],
        metadata: {},
        description: 'Test step',
      };

      const sequence1 = service.createAnimationSequence(algorithmStep, 0);
      const sequence2 = service.createAnimationSequence(algorithmStep, 1);

      service.queueAnimation(sequence1);
      service.queueAnimation(sequence2);

      expect(service.getAnimationStatus().queueLength).toBe(2);

      service.cancelAllAnimations();

      const status = service.getAnimationStatus();
      expect(status.queueLength).toBe(0);
      expect(status.activeCount).toBe(0);
      expect(status.isProcessing).toBe(false);
    });
  });

  describe('cancelAnimation', () => {
    it('should cancel specific animation by ID', () => {
      const algorithmStep: AlgorithmStep = {
        type: 'highlight',
        indices: [0],
        metadata: {},
        description: 'Test step',
      };

      const sequence1 = service.createAnimationSequence(algorithmStep, 0);
      const sequence2 = service.createAnimationSequence(algorithmStep, 1);

      service.queueAnimation(sequence1);
      service.queueAnimation(sequence2);

      expect(service.getAnimationStatus().queueLength).toBe(2);

      service.cancelAnimation(sequence1.id);

      expect(service.getAnimationStatus().queueLength).toBe(1);
    });
  });

  describe('updateConfig', () => {
    it('should update animation configuration', () => {
      const newConfig = {
        speed: 2,
        reducedMotion: true,
        isLowPerformance: true,
        animationSpeed: 0.5,
      };

      service.updateConfig(newConfig);

      const algorithmStep: AlgorithmStep = {
        type: 'highlight',
        indices: [0],
        metadata: {},
        description: 'Test step',
      };

      const sequence = service.createAnimationSequence(algorithmStep, 0);
      
      // Duration should reflect the new config
      expect(sequence.duration).toBeLessThan(800); // Less than base duration due to speed and performance adjustments
    });

    it('should partially update configuration', () => {
      service.updateConfig({ speed: 3 });

      const algorithmStep: AlgorithmStep = {
        type: 'highlight',
        indices: [0],
        metadata: {},
        description: 'Test step',
      };

      const sequence = service.createAnimationSequence(algorithmStep, 0);
      
      // Should use new speed but keep other defaults
      expect(sequence.duration).toBeLessThan(800 / 3 + 100); // Account for some variance
    });
  });

  describe('getAnimationStatus', () => {
    it('should return current animation status', () => {
      const status = service.getAnimationStatus();

      expect(status).toMatchObject({
        isProcessing: false,
        queueLength: 0,
        activeCount: 0,
        activeSequences: [],
      });
    });

    it('should reflect queued animations in status', () => {
      const algorithmStep: AlgorithmStep = {
        type: 'highlight',
        indices: [0],
        metadata: {},
        description: 'Test step',
      };

      const sequence = service.createAnimationSequence(algorithmStep, 0);
      service.queueAnimation(sequence);

      const status = service.getAnimationStatus();
      expect(status.queueLength).toBeGreaterThan(0);
    });
  });
});