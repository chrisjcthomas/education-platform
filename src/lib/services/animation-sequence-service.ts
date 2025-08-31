import { AlgorithmStep } from '../types';

export interface AnimationSequence {
  id: string;
  steps: AnimationStep[];
  duration: number;
  priority: 'low' | 'medium' | 'high';
}

export interface AnimationStep {
  type: 'element' | 'pointer' | 'range' | 'indicator';
  target: string | number;
  action: 'highlight' | 'dim' | 'move' | 'fade' | 'scale' | 'shake';
  duration: number;
  delay: number;
  easing?: string;
  metadata?: Record<string, unknown>;
}

export interface AnimationConfig {
  speed: number;
  reducedMotion: boolean;
  isLowPerformance: boolean;
  animationSpeed: number;
}

export class AnimationSequenceService {
  private activeSequences = new Map<string, AnimationSequence>();
  private animationQueue: AnimationSequence[] = [];
  private isProcessing = false;
  private config: AnimationConfig;

  constructor(config: AnimationConfig) {
    this.config = config;
  }

  updateConfig(config: Partial<AnimationConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Convert algorithm step to animation sequence
   */
  createAnimationSequence(algorithmStep: AlgorithmStep, stepIndex: number): AnimationSequence {
    const sequenceId = `step-${stepIndex}-${Date.now()}`;
    const baseDuration = this.calculateBaseDuration();
    
    const animationSteps: AnimationStep[] = [];

    switch (algorithmStep.type) {
      case 'highlight':
        animationSteps.push(...this.createHighlightAnimation(algorithmStep, baseDuration));
        break;
      
      case 'compare':
        animationSteps.push(...this.createCompareAnimation(algorithmStep, baseDuration));
        break;
      
      case 'eliminate':
        animationSteps.push(...this.createEliminateAnimation(algorithmStep, baseDuration));
        break;
      
      case 'found':
        animationSteps.push(...this.createFoundAnimation(algorithmStep, baseDuration));
        break;
      
      case 'swap':
        animationSteps.push(...this.createSwapAnimation(algorithmStep, baseDuration));
        break;
      
      default:
        animationSteps.push(...this.createDefaultAnimation(algorithmStep, baseDuration));
    }

    return {
      id: sequenceId,
      steps: animationSteps,
      duration: this.calculateTotalDuration(animationSteps),
      priority: this.determinePriority(algorithmStep.type)
    };
  }

  /**
   * Queue animation sequence for execution
   */
  queueAnimation(sequence: AnimationSequence): void {
    // Insert based on priority
    const insertIndex = this.animationQueue.findIndex(
      seq => this.getPriorityValue(seq.priority) < this.getPriorityValue(sequence.priority)
    );
    
    if (insertIndex === -1) {
      this.animationQueue.push(sequence);
    } else {
      this.animationQueue.splice(insertIndex, 0, sequence);
    }

    // Don't auto-process queue in tests or when reduced motion is enabled
    if (!this.config.reducedMotion && typeof window !== 'undefined') {
      this.processQueue();
    }
  }

  /**
   * Execute animation sequence immediately
   */
  async executeSequence(sequence: AnimationSequence): Promise<void> {
    if (this.config.reducedMotion) {
      // Skip animations in reduced motion mode
      return Promise.resolve();
    }

    this.activeSequences.set(sequence.id, sequence);

    try {
      await this.runAnimationSteps(sequence.steps);
    } finally {
      this.activeSequences.delete(sequence.id);
    }
  }

  /**
   * Cancel all animations
   */
  cancelAllAnimations(): void {
    this.animationQueue.length = 0;
    this.activeSequences.clear();
    this.isProcessing = false;
  }

  /**
   * Cancel specific animation sequence
   */
  cancelAnimation(sequenceId: string): void {
    this.activeSequences.delete(sequenceId);
    this.animationQueue = this.animationQueue.filter(seq => seq.id !== sequenceId);
  }

  /**
   * Get current animation status
   */
  getAnimationStatus() {
    return {
      isProcessing: this.isProcessing,
      queueLength: this.animationQueue.length,
      activeCount: this.activeSequences.size,
      activeSequences: Array.from(this.activeSequences.keys())
    };
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.animationQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.animationQueue.length > 0) {
      const sequence = this.animationQueue.shift()!;
      await this.executeSequence(sequence);
    }

    this.isProcessing = false;
  }

  private async runAnimationSteps(steps: AnimationStep[]): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const step of steps) {
      const promise = new Promise<void>(resolve => {
        setTimeout(() => {
          this.executeAnimationStep(step);
          resolve();
        }, step.delay);
      });
      
      promises.push(promise);
    }

    await Promise.all(promises);
  }

  private executeAnimationStep(step: AnimationStep): void {
    // This would trigger the actual DOM animations
    // For now, we'll emit events that components can listen to
    const event = new CustomEvent('animation-step', {
      detail: step
    });
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
    }
  }

  private createHighlightAnimation(step: AlgorithmStep, baseDuration: number): AnimationStep[] {
    return step.indices.map((index, i) => ({
      type: 'element' as const,
      target: index,
      action: 'highlight' as const,
      duration: baseDuration,
      delay: i * 100, // Stagger highlights
      easing: 'ease-out',
      metadata: { originalStep: step }
    }));
  }

  private createCompareAnimation(step: AlgorithmStep, baseDuration: number): AnimationStep[] {
    const animations: AnimationStep[] = [];
    
    // Highlight elements being compared
    step.indices.forEach((index, i) => {
      animations.push({
        type: 'element' as const,
        target: index,
        action: 'highlight' as const,
        duration: baseDuration * 0.6,
        delay: i * 50,
        easing: 'ease-in-out'
      });
    });

    // Add pointer movements if metadata contains pointer info
    if (step.metadata.left !== undefined) {
      animations.push({
        type: 'pointer' as const,
        target: 'left',
        action: 'move' as const,
        duration: baseDuration * 0.4,
        delay: 0,
        metadata: { position: step.metadata.left }
      });
    }

    if (step.metadata.right !== undefined) {
      animations.push({
        type: 'pointer' as const,
        target: 'right',
        action: 'move' as const,
        duration: baseDuration * 0.4,
        delay: 0,
        metadata: { position: step.metadata.right }
      });
    }

    if (step.metadata.mid !== undefined) {
      animations.push({
        type: 'pointer' as const,
        target: 'mid',
        action: 'move' as const,
        duration: baseDuration * 0.4,
        delay: 0,
        metadata: { position: step.metadata.mid }
      });
    }

    return animations;
  }

  private createEliminateAnimation(step: AlgorithmStep, baseDuration: number): AnimationStep[] {
    const animations: AnimationStep[] = [];
    
    // Fade out eliminated elements
    step.indices.forEach((index, i) => {
      animations.push({
        type: 'element' as const,
        target: index,
        action: 'dim' as const,
        duration: baseDuration,
        delay: i * 50,
        easing: 'ease-out'
      });
    });

    // Update range highlight
    if (step.metadata.searchRange) {
      animations.push({
        type: 'range' as const,
        target: 'search-range',
        action: 'highlight' as const,
        duration: baseDuration * 0.8,
        delay: 100,
        metadata: {
          startIndex: step.metadata.left,
          endIndex: step.metadata.right
        }
      });
    }

    return animations;
  }

  private createFoundAnimation(step: AlgorithmStep, baseDuration: number): AnimationStep[] {
    const animations: AnimationStep[] = [];
    
    step.indices.forEach((index, i) => {
      // Success highlight
      animations.push({
        type: 'element' as const,
        target: index,
        action: 'highlight' as const,
        duration: baseDuration * 0.6,
        delay: i * 100,
        easing: 'ease-out'
      });

      // Success scale animation
      animations.push({
        type: 'element' as const,
        target: index,
        action: 'scale' as const,
        duration: baseDuration * 0.4,
        delay: (i * 100) + (baseDuration * 0.3),
        easing: 'ease-in-out'
      });
    });

    return animations;
  }

  private createSwapAnimation(step: AlgorithmStep, baseDuration: number): AnimationStep[] {
    if (step.indices.length !== 2) {
      return this.createDefaultAnimation(step, baseDuration);
    }

    const [indexA, indexB] = step.indices;
    
    return [
      {
        type: 'element' as const,
        target: indexA,
        action: 'move' as const,
        duration: baseDuration,
        delay: 0,
        easing: 'ease-in-out',
        metadata: { targetPosition: indexB }
      },
      {
        type: 'element' as const,
        target: indexB,
        action: 'move' as const,
        duration: baseDuration,
        delay: 0,
        easing: 'ease-in-out',
        metadata: { targetPosition: indexA }
      }
    ];
  }

  private createDefaultAnimation(step: AlgorithmStep, baseDuration: number): AnimationStep[] {
    return [{
      type: 'indicator' as const,
      target: 'step-indicator',
      action: 'fade' as const,
      duration: baseDuration * 0.3,
      delay: 0,
      metadata: { step }
    }];
  }

  private calculateBaseDuration(): number {
    const baseDuration = 800; // Base duration in ms
    const speedMultiplier = 1 / this.config.speed;
    const performanceMultiplier = this.config.isLowPerformance ? 0.5 : 1;
    const userSpeedMultiplier = this.config.animationSpeed;
    
    return baseDuration * speedMultiplier * performanceMultiplier * userSpeedMultiplier;
  }

  private calculateTotalDuration(steps: AnimationStep[]): number {
    if (steps.length === 0) return 0;
    
    return Math.max(...steps.map(step => step.delay + step.duration));
  }

  private determinePriority(stepType: string): 'low' | 'medium' | 'high' {
    switch (stepType) {
      case 'found':
        return 'high';
      case 'compare':
      case 'eliminate':
        return 'medium';
      default:
        return 'low';
    }
  }

  private getPriorityValue(priority: 'low' | 'medium' | 'high'): number {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
    }
  }
}