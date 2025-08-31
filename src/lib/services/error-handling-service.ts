/**
 * Educational Error Handling Service
 * Provides educational error messages and recovery strategies for common coding mistakes
 */

export interface EducationalError {
  message: string;
  suggestion: string;
  codeExample?: string;
  relatedConcept?: string;
  severity: 'info' | 'warning' | 'error';
  recoveryAction?: string;
}

export interface ErrorContext {
  code: string;
  language: 'javascript' | 'python';
  algorithmType?: string;
  userLevel: 'beginner' | 'curious' | 'details';
}

export class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private errorPatterns: Map<string, EducationalError> = new Map();

  private constructor() {
    this.initializeErrorPatterns();
  }

  public static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  private initializeErrorPatterns(): void {
    // JavaScript syntax errors
    this.errorPatterns.set('SyntaxError: Unexpected token', {
      message: 'There\'s a syntax error in your code',
      suggestion: 'Check for missing brackets, semicolons, or quotes',
      codeExample: 'if (condition) {\n  // code here\n}',
      relatedConcept: 'JavaScript Syntax',
      severity: 'error',
      recoveryAction: 'Fix the syntax error and try again'
    });

    this.errorPatterns.set('ReferenceError: .* is not defined', {
      message: 'You\'re trying to use a variable that doesn\'t exist',
      suggestion: 'Make sure to declare your variables before using them',
      codeExample: 'let myVariable = 10;\nconsole.log(myVariable);',
      relatedConcept: 'Variable Declaration',
      severity: 'error',
      recoveryAction: 'Declare the variable or check the spelling'
    });

    // Python syntax errors
    this.errorPatterns.set('IndentationError', {
      message: 'Python code needs proper indentation',
      suggestion: 'Use consistent spaces or tabs for indentation',
      codeExample: 'if condition:\n    # indented code here\n    print("Hello")',
      relatedConcept: 'Python Indentation',
      severity: 'error',
      recoveryAction: 'Fix the indentation and try again'
    });

    // Algorithm-specific errors
    this.errorPatterns.set('IndexError: list index out of range', {
      message: 'You\'re trying to access an array position that doesn\'t exist',
      suggestion: 'Check that your index is within the array bounds',
      codeExample: 'if (index >= 0 && index < array.length) {\n  // safe to access array[index]\n}',
      relatedConcept: 'Array Bounds',
      severity: 'error',
      recoveryAction: 'Add bounds checking to your code'
    });

    this.errorPatterns.set('infinite-loop', {
      message: 'Your code might be running in an infinite loop',
      suggestion: 'Make sure your loop condition will eventually become false',
      codeExample: 'while (left <= right) {\n  // make sure left and right change\n  left++; // or right--\n}',
      relatedConcept: 'Loop Control',
      severity: 'warning',
      recoveryAction: 'Check your loop conditions and increment/decrement statements'
    });
  }

  public handleError(error: Error, context: ErrorContext): EducationalError {
    const errorMessage = error.message;
    const errorName = error.name;
    
    // Try to match specific error patterns
    for (const [pattern, educationalError] of this.errorPatterns) {
      if (new RegExp(pattern).test(errorMessage) || new RegExp(pattern).test(errorName)) {
        return this.adaptErrorForUserLevel(educationalError, context);
      }
    }

    // Default educational error for unmatched errors
    return this.createDefaultEducationalError(error, context);
  }

  public handleSyntaxError(error: SyntaxError, context: ErrorContext): EducationalError {
    const baseError = this.handleError(error, context);
    
    if (context.language === 'python') {
      return {
        ...baseError,
        message: 'Python syntax error: ' + baseError.message,
        suggestion: 'Python is picky about syntax. ' + baseError.suggestion
      };
    }

    return {
      ...baseError,
      message: 'JavaScript syntax error: ' + baseError.message
    };
  }

  public handleRuntimeError(error: Error, context: ErrorContext): EducationalError {
    const baseError = this.handleError(error, context);
    
    return {
      ...baseError,
      message: 'Runtime error: ' + baseError.message,
      suggestion: 'This error happened while your code was running. ' + baseError.suggestion
    };
  }

  public handleLogicError(expected: any, actual: any, context: ErrorContext): EducationalError {
    return {
      message: `Your algorithm produced unexpected results`,
      suggestion: `Expected ${expected}, but got ${actual}. Let's trace through your logic step by step.`,
      codeExample: this.generateLogicErrorExample(context),
      relatedConcept: 'Algorithm Logic',
      severity: 'warning',
      recoveryAction: 'Use the step-by-step debugger to trace your algorithm'
    };
  }

  private adaptErrorForUserLevel(error: EducationalError, context: ErrorContext): EducationalError {
    switch (context.userLevel) {
      case 'beginner':
        return {
          ...error,
          message: this.simplifyLanguage(error.message),
          suggestion: this.addEncouragement(error.suggestion)
        };
      
      case 'curious':
        return {
          ...error,
          suggestion: error.suggestion + ' Would you like to see how to fix this?'
        };
      
      case 'details':
        return {
          ...error,
          suggestion: error.suggestion + ' Technical details: ' + this.getTechnicalDetails(error)
        };
      
      default:
        return error;
    }
  }

  private createDefaultEducationalError(error: Error, context: ErrorContext): EducationalError {
    return {
      message: 'Something went wrong with your code',
      suggestion: 'Don\'t worry! Errors are part of learning. Let\'s figure this out together.',
      relatedConcept: 'Debugging',
      severity: 'error',
      recoveryAction: 'Try running your code step by step to find the issue'
    };
  }

  private generateLogicErrorExample(context: ErrorContext): string {
    if (context.algorithmType === 'binary-search') {
      return context.language === 'python' 
        ? 'def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    # Check your loop condition and pointer updates'
        : 'function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  // Check your loop condition and pointer updates\n}';
    }
    
    return 'Check your algorithm logic step by step';
  }

  private simplifyLanguage(message: string): string {
    return message
      .replace(/syntax error/gi, 'code formatting problem')
      .replace(/reference error/gi, 'variable not found')
      .replace(/index out of range/gi, 'trying to access a position that doesn\'t exist');
  }

  private addEncouragement(suggestion: string): string {
    const encouragements = [
      'You\'re doing great! ',
      'This is a common mistake - ',
      'No worries, this happens to everyone! ',
      'Let\'s fix this together: '
    ];
    
    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    return randomEncouragement + suggestion;
  }

  private getTechnicalDetails(error: EducationalError): string {
    // Add technical context based on error type
    if (error.relatedConcept === 'JavaScript Syntax') {
      return 'JavaScript uses C-style syntax with curly braces and semicolons.';
    }
    if (error.relatedConcept === 'Python Indentation') {
      return 'Python uses indentation to define code blocks instead of curly braces.';
    }
    return 'Check the documentation for more details.';
  }
}