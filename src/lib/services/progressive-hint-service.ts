/**
 * Progressive Hint Service
 * Provides increasingly specific hints to help struggling learners
 */

export interface Hint {
  id: string;
  level: number; // 1-5, increasing specificity
  title: string;
  content: string;
  codeExample?: string;
  visualAid?: string;
  nextHintDelay: number; // milliseconds before next hint becomes available
}

export interface LearningContext {
  algorithmType: string;
  currentStep: number;
  errorCount: number;
  timeSpent: number;
  userLevel: 'beginner' | 'curious' | 'details';
  previousHints: string[];
}

export interface StruggleIndicators {
  repeatedErrors: boolean;
  longTimeOnStep: boolean;
  multipleResets: boolean;
  helpRequested: boolean;
}

export class ProgressiveHintService {
  private static instance: ProgressiveHintService;
  private hintDatabase: Map<string, Hint[]> = new Map();
  private userHintHistory: Map<string, string[]> = new Map();
  private struggleThresholds = {
    errorCount: 3,
    timeThreshold: 120000, // 2 minutes
    resetCount: 2
  };

  private constructor() {
    this.initializeHints();
  }

  public static getInstance(): ProgressiveHintService {
    if (!ProgressiveHintService.instance) {
      ProgressiveHintService.instance = new ProgressiveHintService();
    }
    return ProgressiveHintService.instance;
  }

  private initializeHints(): void {
    // Binary Search hints
    this.hintDatabase.set('binary-search', [
      {
        id: 'bs-hint-1',
        level: 1,
        title: 'Think About the Middle',
        content: 'Binary search works by looking at the middle element first. Think about how you would find a word in a dictionary.',
        visualAid: 'dictionary-analogy',
        nextHintDelay: 30000
      },
      {
        id: 'bs-hint-2',
        level: 2,
        title: 'Eliminate Half the Possibilities',
        content: 'After checking the middle element, you can eliminate half of the remaining elements. Which half should you eliminate?',
        visualAid: 'elimination-demo',
        nextHintDelay: 45000
      },
      {
        id: 'bs-hint-3',
        level: 3,
        title: 'Update Your Search Range',
        content: 'You need to update either the left or right boundary of your search. If the target is smaller than the middle, which boundary should change?',
        codeExample: 'if (target < middle) {\n  // update right boundary\n} else {\n  // update left boundary\n}',
        nextHintDelay: 60000
      },
      {
        id: 'bs-hint-4',
        level: 4,
        title: 'Check Your Loop Condition',
        content: 'Your loop should continue while there are still elements to search. Make sure your condition allows the search to continue when left equals right.',
        codeExample: 'while (left <= right) {\n  // search logic here\n}',
        nextHintDelay: 90000
      },
      {
        id: 'bs-hint-5',
        level: 5,
        title: 'Complete Implementation Guide',
        content: 'Here\'s the step-by-step approach: 1) Find middle index, 2) Compare with target, 3) Update boundaries, 4) Repeat until found or no elements left.',
        codeExample: 'function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  \n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    \n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  \n  return -1;\n}',
        nextHintDelay: 0
      }
    ]);

    // General algorithm hints
    this.hintDatabase.set('general-algorithm', [
      {
        id: 'gen-hint-1',
        level: 1,
        title: 'Break It Down',
        content: 'Complex algorithms are just simple steps combined. Try to identify the basic operations your algorithm needs to perform.',
        nextHintDelay: 20000
      },
      {
        id: 'gen-hint-2',
        level: 2,
        title: 'Test with Simple Examples',
        content: 'Start with a small, simple example. How would you solve this problem by hand?',
        nextHintDelay: 30000
      },
      {
        id: 'gen-hint-3',
        level: 3,
        title: 'Check Edge Cases',
        content: 'Consider what happens with empty arrays, single elements, or when the target isn\'t found.',
        nextHintDelay: 45000
      }
    ]);

    // Debugging hints
    this.hintDatabase.set('debugging', [
      {
        id: 'debug-hint-1',
        level: 1,
        title: 'Use the Step-by-Step Mode',
        content: 'Try running your algorithm one step at a time to see exactly where things go wrong.',
        nextHintDelay: 15000
      },
      {
        id: 'debug-hint-2',
        level: 2,
        title: 'Check Your Variables',
        content: 'Make sure your variables have the values you expect. Print them out or use the debugger to inspect them.',
        nextHintDelay: 30000
      },
      {
        id: 'debug-hint-3',
        level: 3,
        title: 'Trace Through an Example',
        content: 'Pick a simple example and manually trace through each step of your algorithm. Where does it differ from what you expect?',
        nextHintDelay: 45000
      }
    ]);
  }

  /**
   * Analyze if the user is struggling and needs hints
   */
  public analyzeStruggle(context: LearningContext): StruggleIndicators {
    return {
      repeatedErrors: context.errorCount >= this.struggleThresholds.errorCount,
      longTimeOnStep: context.timeSpent >= this.struggleThresholds.timeThreshold,
      multipleResets: this.getUserResetCount(context.algorithmType) >= this.struggleThresholds.resetCount,
      helpRequested: false // This would be set by UI interactions
    };
  }

  /**
   * Get the next appropriate hint for the user
   */
  public getNextHint(context: LearningContext, indicators: StruggleIndicators): Hint | null {
    const userId = this.getUserId(); // In a real app, this would come from auth
    const userHints = this.userHintHistory.get(userId) || [];
    
    // Determine which hint category to use
    let hintCategory = context.algorithmType;
    if (indicators.repeatedErrors) {
      hintCategory = 'debugging';
    }

    const availableHints = this.hintDatabase.get(hintCategory) || this.hintDatabase.get('general-algorithm') || [];
    
    // Find the next hint the user hasn't seen
    for (const hint of availableHints) {
      if (!userHints.includes(hint.id)) {
        // Check if enough time has passed since the last hint
        if (this.canShowHint(hint, context)) {
          return this.adaptHintForUserLevel(hint, context.userLevel);
        }
      }
    }

    return null;
  }

  /**
   * Mark a hint as shown to the user
   */
  public markHintShown(hintId: string): void {
    const userId = this.getUserId();
    const userHints = this.userHintHistory.get(userId) || [];
    
    if (!userHints.includes(hintId)) {
      userHints.push(hintId);
      this.userHintHistory.set(userId, userHints);
    }
  }

  /**
   * Get contextual hints based on current error
   */
  public getContextualHints(error: Error, context: LearningContext): Hint[] {
    const hints: Hint[] = [];

    if (error.name === 'SyntaxError') {
      hints.push({
        id: 'syntax-hint',
        level: 1,
        title: 'Syntax Error Help',
        content: 'Check your brackets, parentheses, and semicolons. Every opening bracket needs a closing one.',
        codeExample: 'if (condition) {\n  // code here\n} // Don\'t forget the closing bracket!',
        nextHintDelay: 0
      });
    }

    if (error.message.includes('infinite loop') || error.message.includes('timeout')) {
      hints.push({
        id: 'loop-hint',
        level: 2,
        title: 'Infinite Loop Prevention',
        content: 'Make sure your loop condition will eventually become false. Check that your loop variables are being updated.',
        codeExample: 'while (left <= right) {\n  // Make sure left increases or right decreases\n  left++; // or right--;\n}',
        nextHintDelay: 0
      });
    }

    if (error.message.includes('index') || error.message.includes('range')) {
      hints.push({
        id: 'bounds-hint',
        level: 2,
        title: 'Array Bounds Check',
        content: 'Always check that your array index is valid before accessing an element.',
        codeExample: 'if (index >= 0 && index < array.length) {\n  // Safe to access array[index]\n}',
        nextHintDelay: 0
      });
    }

    return hints;
  }

  /**
   * Reset hint history for a user (useful for testing or new attempts)
   */
  public resetHintHistory(userId?: string): void {
    const targetUserId = userId || this.getUserId();
    this.userHintHistory.delete(targetUserId);
  }

  /**
   * Get hint statistics for analytics
   */
  public getHintStatistics(): any {
    const stats = {
      totalHintsShown: 0,
      hintsByCategory: new Map<string, number>(),
      hintsByLevel: new Map<number, number>()
    };

    for (const userHints of this.userHintHistory.values()) {
      stats.totalHintsShown += userHints.length;
    }

    return stats;
  }

  private canShowHint(hint: Hint, context: LearningContext): boolean {
    // For now, always allow hints. In a real implementation, you might check timing
    return true;
  }

  private adaptHintForUserLevel(hint: Hint, userLevel: string): Hint {
    const adaptedHint = { ...hint };

    switch (userLevel) {
      case 'beginner':
        adaptedHint.content = this.simplifyLanguage(hint.content);
        // Remove code examples for beginners unless specifically needed
        if (!hint.content.includes('code')) {
          delete adaptedHint.codeExample;
        }
        break;
      
      case 'curious':
        // Keep as is, but add encouragement
        adaptedHint.content = hint.content + ' You\'re doing great - keep experimenting!';
        break;
      
      case 'details':
        // Add more technical details if available
        if (hint.codeExample) {
          adaptedHint.content += ' Study the code example carefully to understand the implementation details.';
        }
        break;
    }

    return adaptedHint;
  }

  private simplifyLanguage(content: string): string {
    return content
      .replace(/algorithm/gi, 'method')
      .replace(/implementation/gi, 'way to do it')
      .replace(/iteration/gi, 'step')
      .replace(/boundary/gi, 'edge')
      .replace(/condition/gi, 'rule');
  }

  private getUserId(): string {
    // In a real app, this would come from authentication
    return 'anonymous-user';
  }

  private getUserResetCount(algorithmType: string): number {
    // This would track how many times the user has reset this algorithm
    // For now, return a mock value
    return 0;
  }
}