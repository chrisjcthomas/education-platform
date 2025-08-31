/**
 * Error Recovery Service
 * Handles state restoration and recovery strategies when errors occur
 */

import type { AlgorithmState, UIState } from '../types';

export interface RecoveryCheckpoint {
  id: string;
  timestamp: Date;
  algorithmState: AlgorithmState;
  uiState: Partial<UIState>;
  codeSnapshot: string;
  description: string;
}

export interface RecoveryStrategy {
  type: 'restore' | 'reset' | 'continue' | 'guide';
  description: string;
  action: () => Promise<void>;
  confidence: number; // 0-1, how likely this strategy will help
}

export class ErrorRecoveryService {
  private static instance: ErrorRecoveryService;
  private checkpoints: Map<string, RecoveryCheckpoint> = new Map();
  private maxCheckpoints = 10;
  private autoSaveInterval = 30000; // 30 seconds

  private constructor() {
    this.startAutoSave();
  }

  public static getInstance(): ErrorRecoveryService {
    if (!ErrorRecoveryService.instance) {
      ErrorRecoveryService.instance = new ErrorRecoveryService();
    }
    return ErrorRecoveryService.instance;
  }

  /**
   * Create a recovery checkpoint
   */
  public createCheckpoint(
    algorithmState: AlgorithmState,
    uiState: Partial<UIState>,
    code: string,
    description: string = 'Auto-save'
  ): string {
    const id = `checkpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const checkpoint: RecoveryCheckpoint = {
      id,
      timestamp: new Date(),
      algorithmState: { ...algorithmState },
      uiState: { ...uiState },
      codeSnapshot: code,
      description
    };

    this.checkpoints.set(id, checkpoint);
    this.cleanupOldCheckpoints();
    
    return id;
  }

  /**
   * Get available recovery strategies for an error
   */
  public getRecoveryStrategies(
    error: Error,
    currentState: AlgorithmState,
    currentCode: string
  ): RecoveryStrategy[] {
    const strategies: RecoveryStrategy[] = [];

    // Strategy 1: Restore to last working checkpoint
    const lastWorkingCheckpoint = this.getLastWorkingCheckpoint();
    if (lastWorkingCheckpoint) {
      strategies.push({
        type: 'restore',
        description: `Go back to "${lastWorkingCheckpoint.description}" (${this.formatTimeAgo(lastWorkingCheckpoint.timestamp)})`,
        action: async () => { await this.restoreCheckpoint(lastWorkingCheckpoint.id); },
        confidence: 0.8
      });
    }

    // Strategy 2: Reset to clean state
    strategies.push({
      type: 'reset',
      description: 'Start fresh with a clean algorithm',
      action: async () => this.resetToCleanState(),
      confidence: 0.6
    });

    // Strategy 3: Continue with error handling
    if (this.canContinueWithError(error)) {
      strategies.push({
        type: 'continue',
        description: 'Continue with error handling enabled',
        action: async () => this.enableErrorHandling(),
        confidence: 0.4
      });
    }

    // Strategy 4: Guided recovery
    strategies.push({
      type: 'guide',
      description: 'Get step-by-step help to fix this issue',
      action: async () => this.startGuidedRecovery(error, currentCode),
      confidence: 0.9
    });

    return strategies.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Restore a specific checkpoint
   */
  public async restoreCheckpoint(checkpointId: string): Promise<boolean> {
    const checkpoint = this.checkpoints.get(checkpointId);
    if (!checkpoint) {
      console.warn(`Checkpoint ${checkpointId} not found`);
      return false;
    }

    try {
      // Emit restoration events that stores can listen to
      window.dispatchEvent(new CustomEvent('algorithm-state-restore', {
        detail: checkpoint.algorithmState
      }));

      window.dispatchEvent(new CustomEvent('ui-state-restore', {
        detail: checkpoint.uiState
      }));

      window.dispatchEvent(new CustomEvent('code-restore', {
        detail: checkpoint.codeSnapshot
      }));

      console.log(`Restored to checkpoint: ${checkpoint.description}`);
      return true;
    } catch (error) {
      console.error('Failed to restore checkpoint:', error);
      return false;
    }
  }

  /**
   * Get all available checkpoints
   */
  public getCheckpoints(): RecoveryCheckpoint[] {
    return Array.from(this.checkpoints.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Clear all checkpoints
   */
  public clearCheckpoints(): void {
    this.checkpoints.clear();
  }

  /**
   * Get recovery suggestions based on error type
   */
  public getRecoverySuggestions(error: Error, context: any): string[] {
    const suggestions: string[] = [];

    if (error.name === 'SyntaxError') {
      suggestions.push('Check your brackets, parentheses, and semicolons');
      suggestions.push('Make sure all strings are properly quoted');
      suggestions.push('Verify your function declarations are complete');
    }

    if (error.name === 'ReferenceError') {
      suggestions.push('Make sure all variables are declared before use');
      suggestions.push('Check for typos in variable names');
      suggestions.push('Verify function names are spelled correctly');
    }

    if (error.message.includes('timeout')) {
      suggestions.push('Your code might have an infinite loop');
      suggestions.push('Check your loop conditions');
      suggestions.push('Make sure loop variables are being updated');
    }

    if (error.message.includes('index') || error.message.includes('range')) {
      suggestions.push('Check array bounds before accessing elements');
      suggestions.push('Make sure your indices are within valid range');
      suggestions.push('Consider edge cases like empty arrays');
    }

    // Add general suggestions if no specific ones found
    if (suggestions.length === 0) {
      suggestions.push('Try running your code step by step');
      suggestions.push('Check the console for more detailed error information');
      suggestions.push('Consider starting with a simpler version of your algorithm');
    }

    return suggestions;
  }

  private getLastWorkingCheckpoint(): RecoveryCheckpoint | null {
    const checkpoints = this.getCheckpoints();
    
    // Find the most recent checkpoint that wasn't created due to an error
    for (const checkpoint of checkpoints) {
      if (!checkpoint.description.toLowerCase().includes('error')) {
        return checkpoint;
      }
    }

    return checkpoints[0] || null;
  }

  private canContinueWithError(error: Error): boolean {
    // Some errors allow continuation with error handling
    const continuableErrors = ['TypeError', 'ReferenceError'];
    return continuableErrors.includes(error.name);
  }

  private async resetToCleanState(): Promise<void> {
    window.dispatchEvent(new CustomEvent('algorithm-reset'));
    window.dispatchEvent(new CustomEvent('ui-reset'));
    window.dispatchEvent(new CustomEvent('code-reset'));
  }

  private async enableErrorHandling(): Promise<void> {
    window.dispatchEvent(new CustomEvent('enable-error-handling'));
  }

  private async startGuidedRecovery(error: Error, code: string): Promise<void> {
    window.dispatchEvent(new CustomEvent('start-guided-recovery', {
      detail: { error, code }
    }));
  }

  private cleanupOldCheckpoints(): void {
    const checkpoints = this.getCheckpoints();
    
    if (checkpoints.length > this.maxCheckpoints) {
      const toRemove = checkpoints.slice(this.maxCheckpoints);
      toRemove.forEach(checkpoint => {
        this.checkpoints.delete(checkpoint.id);
      });
    }
  }

  private startAutoSave(): void {
    setInterval(() => {
      // Auto-save will be triggered by components when they detect stable states
      window.dispatchEvent(new CustomEvent('auto-save-trigger'));
    }, this.autoSaveInterval);
  }

  private formatTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  }
}