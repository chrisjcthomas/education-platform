'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  operation: string;
  description: string;
  details?: string;
  operationType?: 'compare' | 'move' | 'found' | 'eliminate' | 'init' | 'complete';
  visible?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const operationTypeConfig = {
  compare: {
    icon: '⚖️',
    color: '#3b82f6',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  move: {
    icon: '➡️',
    color: '#f59e0b',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  found: {
    icon: '✅',
    color: '#10b981',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  eliminate: {
    icon: '❌',
    color: '#ef4444',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  init: {
    icon: '🚀',
    color: '#8b5cf6',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  complete: {
    icon: '🎉',
    color: '#10b981',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
};

const positionVariants = {
  top: 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-4',
  bottom: 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-4',
  left: 'left-0 top-1/2 transform -translate-x-full -translate-y-1/2 mr-4',
  right: 'right-0 top-1/2 transform translate-x-full -translate-y-1/2 ml-4',
};

export function StepIndicator({
  currentStep,
  totalSteps,
  operation,
  description,
  details,
  operationType = 'compare',
  visible = true,
  position = 'bottom',
  className,
}: StepIndicatorProps) {
  const config = operationTypeConfig[operationType];

  if (!visible) {
    return null;
  }

  return (
    <motion.div
      className={cn(
        'absolute z-10 max-w-md',
        positionVariants[position],
        className
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300,
        duration: 0.4,
      }}
    >
      <div
        className={cn(
          'p-4 rounded-lg border-2 shadow-lg backdrop-blur-sm',
          config.bgColor,
          config.borderColor
        )}
      >
        {/* Header with step counter and operation */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <motion.span
              className="text-lg"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              {config.icon}
            </motion.span>
            <span
              className="font-semibold text-sm"
              style={{ color: config.color }}
            >
              {operation}
            </span>
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Step {currentStep} of {totalSteps}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
          <motion.div
            className="h-1.5 rounded-full"
            style={{ backgroundColor: config.color }}
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Description */}
        <AnimatePresence mode="wait">
          <motion.p
            key={description}
            className="text-sm text-gray-700 font-medium mb-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {description}
          </motion.p>
        </AnimatePresence>

        {/* Optional Details */}
        {details && (
          <AnimatePresence>
            <motion.p
              key={details}
              className="text-xs text-gray-600 mt-1"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {details}
            </motion.p>
          </AnimatePresence>
        )}

        {/* Completion Indicator */}
        {currentStep === totalSteps && (
          <motion.div
            className="mt-2 flex items-center space-x-1 text-green-600"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-sm">✨</span>
            <span className="text-xs font-semibold">Complete!</span>
          </motion.div>
        )}
      </div>

      {/* Pointer Arrow (for positioning) */}
      {position === 'top' && (
        <div
          className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: `8px solid ${config.color}`,
          }}
        />
      )}
      {position === 'bottom' && (
        <div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: `8px solid ${config.color}`,
          }}
        />
      )}
      {position === 'left' && (
        <div
          className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0"
          style={{
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderLeft: `8px solid ${config.color}`,
          }}
        />
      )}
      {position === 'right' && (
        <div
          className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0"
          style={{
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: `8px solid ${config.color}`,
          }}
        />
      )}
    </motion.div>
  );
}