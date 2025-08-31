import { ErrorHandlingService, ErrorContext } from '../../lib/services/error-handling-service';

describe('ErrorHandlingService', () => {
  let service: ErrorHandlingService;
  let mockContext: ErrorContext;

  beforeEach(() => {
    service = ErrorHandlingService.getInstance();
    mockContext = {
      code: 'function test() { return true; }',
      language: 'javascript',
      algorithmType: 'binary-search',
      userLevel: 'beginner'
    };
  });

  describe('handleError', () => {
    it('should handle syntax errors with educational messages', () => {
      const syntaxError = new SyntaxError('Unexpected token');
      const result = service.handleError(syntaxError, mockContext);

      expect(result.message).toBeTruthy();
      expect(result.suggestion).toBeTruthy();
      expect(result.severity).toBe('error');
      expect(result.relatedConcept).toBeTruthy();
    });

    it('should handle reference errors appropriately', () => {
      const referenceError = new ReferenceError('myVariable is not defined');
      const result = service.handleError(referenceError, mockContext);

      expect(result.message).toBeTruthy();
      expect(result.suggestion).toBeTruthy();
      expect(result.relatedConcept).toBeTruthy();
    });

    it('should adapt error messages for different user levels', () => {
      const error = new SyntaxError('Unexpected token');
      
      const beginnerResult = service.handleError(error, { ...mockContext, userLevel: 'beginner' });
      const detailsResult = service.handleError(error, { ...mockContext, userLevel: 'details' });

      expect(beginnerResult.message).toBeTruthy();
      expect(beginnerResult.suggestion).toBeTruthy();
      expect(detailsResult.suggestion).toBeTruthy();
      expect(beginnerResult.severity).toBe('error');
      expect(detailsResult.severity).toBe('error');
    });

    it('should provide default educational error for unknown errors', () => {
      const unknownError = new Error('Some unknown error');
      const result = service.handleError(unknownError, mockContext);

      expect(result.message).toBe('Something went wrong with your code');
      expect(result.suggestion).toContain('Don\'t worry');
      expect(result.relatedConcept).toBe('Debugging');
    });
  });

  describe('handleSyntaxError', () => {
    it('should add language-specific context to syntax errors', () => {
      const syntaxError = new SyntaxError('Unexpected token');
      
      const jsResult = service.handleSyntaxError(syntaxError, { ...mockContext, language: 'javascript' });
      const pyResult = service.handleSyntaxError(syntaxError, { ...mockContext, language: 'python' });

      expect(jsResult.message).toContain('JavaScript syntax error');
      expect(pyResult.message).toContain('Python syntax error');
      expect(pyResult.suggestion).toContain('Python is picky about syntax');
    });
  });

  describe('handleRuntimeError', () => {
    it('should provide runtime-specific guidance', () => {
      const runtimeError = new Error('Cannot read property of undefined');
      const result = service.handleRuntimeError(runtimeError, mockContext);

      expect(result.message).toContain('Runtime error');
      expect(result.suggestion).toContain('while your code was running');
    });
  });

  describe('handleLogicError', () => {
    it('should provide algorithm-specific logic error guidance', () => {
      const result = service.handleLogicError(5, -1, mockContext);

      expect(result.message).toContain('unexpected results');
      expect(result.suggestion).toContain('Expected 5, but got -1');
      expect(result.relatedConcept).toBe('Algorithm Logic');
      expect(result.recoveryAction).toContain('step-by-step debugger');
    });

    it('should generate appropriate code examples for different algorithms', () => {
      const binarySearchResult = service.handleLogicError(5, -1, { 
        ...mockContext, 
        algorithmType: 'binary-search' 
      });

      expect(binarySearchResult.codeExample).toContain('binarySearch');
      expect(binarySearchResult.codeExample).toContain('left');
      expect(binarySearchResult.codeExample).toContain('right');
    });
  });

  describe('user level adaptation', () => {
    it('should simplify language for beginners', () => {
      const error = new ReferenceError('variable is not defined');
      const result = service.handleError(error, { ...mockContext, userLevel: 'beginner' });

      expect(result.message).toBeTruthy();
      expect(result.severity).toBe('error');
    });

    it('should add encouragement for beginners', () => {
      const error = new SyntaxError('Unexpected token');
      const result = service.handleError(error, { ...mockContext, userLevel: 'beginner' });

      expect(result.suggestion).toContain('Don\'t worry!');
    });

    it('should provide technical details for advanced users', () => {
      const error = new SyntaxError('Unexpected token');
      const result = service.handleError(error, { ...mockContext, userLevel: 'details' });

      expect(result.suggestion).toBeTruthy();
      expect(result.relatedConcept).toBeTruthy();
    });
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ErrorHandlingService.getInstance();
      const instance2 = ErrorHandlingService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
});