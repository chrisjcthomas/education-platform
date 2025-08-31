'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, RefreshCw, Lightbulb, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ErrorHandlingService, EducationalError, ErrorContext } from '../../lib/services/error-handling-service';
import { ErrorRecoveryService, RecoveryStrategy } from '../../lib/services/error-recovery-service';
import { ProgressiveHintService, Hint, LearningContext, StruggleIndicators } from '../../lib/services/progressive-hint-service';

interface ComprehensiveErrorHandlerProps {
  error: Error | null;
  errorContext: ErrorContext;
  learningContext: LearningContext;
  onRecovery: () => void;
  onDismiss: () => void;
  className?: string;
}

export function ComprehensiveErrorHandler({
  error,
  errorContext,
  learningContext,
  onRecovery,
  onDismiss,
  className = ''
}: ComprehensiveErrorHandlerProps) {
  const [educationalError, setEducationalError] = useState<EducationalError | null>(null);
  const [recoveryStrategies, setRecoveryStrategies] = useState<RecoveryStrategy[]>([]);
  const [availableHints, setAvailableHints] = useState<Hint[]>([]);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  const errorService = ErrorHandlingService.getInstance();
  const recoveryService = ErrorRecoveryService.getInstance();
  const hintService = ProgressiveHintService.getInstance();

  useEffect(() => {
    if (error) {
      handleError(error);
    }
  }, [error, errorContext]);

  const handleError = useCallback(async (error: Error) => {
    // Get educational error message
    const educationalErr = errorService.handleError(error, errorContext);
    setEducationalError(educationalErr);

    // Get recovery strategies
    const strategies = recoveryService.getRecoveryStrategies(
      error,
      learningContext as any, // Type assertion for compatibility
      errorContext.code
    );
    setRecoveryStrategies(strategies);

    // Check if user is struggling and get hints
    const struggleIndicators = hintService.analyzeStruggle(learningContext);
    const contextualHints = hintService.getContextualHints(error, learningContext);
    const nextHint = hintService.getNextHint(learningContext, struggleIndicators);
    
    const allHints = [...contextualHints];
    if (nextHint) {
      allHints.push(nextHint);
    }
    
    setAvailableHints(allHints);
    setCurrentHintIndex(0);

    // Auto-show hints if user is struggling
    if (struggleIndicators.repeatedErrors || struggleIndicators.longTimeOnStep) {
      setShowHints(true);
    }
  }, [errorContext, learningContext]);

  const handleRecoveryStrategy = async (strategy: RecoveryStrategy) => {
    setIsRecovering(true);
    try {
      await strategy.action();
      onRecovery();
    } catch (recoveryError) {
      console.error('Recovery strategy failed:', recoveryError);
    } finally {
      setIsRecovering(false);
    }
  };

  const showNextHint = () => {
    if (currentHintIndex < availableHints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
      hintService.markHintShown(availableHints[currentHintIndex + 1].id);
    }
  };

  const showPreviousHint = () => {
    if (currentHintIndex > 0) {
      setCurrentHintIndex(currentHintIndex - 1);
    }
  };

  if (!error || !educationalError) {
    return null;
  }

  const currentHint = availableHints[currentHintIndex];
  const severityColor = {
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200'
  }[educationalError.severity];

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}>
      <Card className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto ${severityColor}`}>
        <div className="p-6">
          {/* Error Header */}
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className={`w-6 h-6 mt-1 ${
              educationalError.severity === 'error' ? 'text-red-500' :
              educationalError.severity === 'warning' ? 'text-yellow-500' :
              'text-blue-500'
            }`} />
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">
                {educationalError.message}
              </h2>
              <Badge variant="outline" className="mb-3">
                {error.name}
              </Badge>
              <p className="text-gray-700 mb-4">
                {educationalError.suggestion}
              </p>
            </div>
          </div>

          {/* Code Example */}
          {educationalError.codeExample && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Example:</h3>
              <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                <code>{educationalError.codeExample}</code>
              </pre>
            </div>
          )}

          {/* Recovery Strategies */}
          {recoveryStrategies.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Recovery Options
              </h3>
              <div className="space-y-2">
                {recoveryStrategies.map((strategy, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => handleRecoveryStrategy(strategy)}
                    disabled={isRecovering}
                  >
                    <div>
                      <div className="font-medium">{strategy.description}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Confidence: {Math.round(strategy.confidence * 100)}%
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Hints Section */}
          {availableHints.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Learning Hints
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHints(!showHints)}
                >
                  {showHints ? 'Hide' : 'Show'} Hints
                </Button>
              </div>

              {showHints && currentHint && (
                <Card className="p-4 bg-white">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{currentHint.title}</h4>
                    <Badge variant="secondary">
                      Level {currentHint.level}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-700 mb-3">
                    {currentHint.content}
                  </p>

                  {currentHint.codeExample && (
                    <pre className="bg-gray-100 p-3 rounded-md text-sm mb-3 overflow-x-auto">
                      <code>{currentHint.codeExample}</code>
                    </pre>
                  )}

                  {/* Hint Navigation */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={showPreviousHint}
                        disabled={currentHintIndex === 0}
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={showNextHint}
                        disabled={currentHintIndex === availableHints.length - 1}
                      >
                        Next
                        <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
                      </Button>
                    </div>
                    <span className="text-sm text-gray-500">
                      {currentHintIndex + 1} of {availableHints.length}
                    </span>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Related Concept */}
          {educationalError.relatedConcept && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <HelpCircle className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-blue-700">Related Concept</span>
              </div>
              <p className="text-blue-600 text-sm">
                {educationalError.relatedConcept}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onDismiss}
              className="flex-1"
            >
              I'll Fix It Myself
            </Button>
            {educationalError.recoveryAction && (
              <Button
                onClick={() => {
                  // Trigger the recovery action
                  onRecovery();
                }}
                className="flex-1"
                disabled={isRecovering}
              >
                {isRecovering ? 'Recovering...' : educationalError.recoveryAction}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}