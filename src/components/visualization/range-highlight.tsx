'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface RangeHighlightProps {
  startIndex: number;
  endIndex: number;
  type: 'active' | 'eliminated' | 'found' | 'searching';
  label?: string;
  visible?: boolean;
  elementWidth?: number;
  elementSpacing?: number;
  className?: string;
}

const typeConfig = {
  active: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)', // Blue with transparency
    borderColor: '#3b82f6',
    label: 'Active Range',
  },
  eliminated: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)', // Red with transparency
    borderColor: '#ef4444',
    label: 'Eliminated',
  },
  found: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)', // Green with transparency
    borderColor: '#10b981',
    label: 'Found',
  },
  searching: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)', // Amber with transparency
    borderColor: '#f59e0b',
    label: 'Searching',
  },
};

export function RangeHighlight({
  startIndex,
  endIndex,
  type,
  label,
  visible = true,
  elementWidth = 48, // Default width of array elements
  elementSpacing = 64, // Default spacing between elements
  className,
}: RangeHighlightProps) {
  const config = typeConfig[type];
  const displayLabel = label || config.label;

  if (!visible || startIndex > endIndex) {
    return null;
  }

  // Calculate position and dimensions
  const rangeWidth = (endIndex - startIndex + 1) * elementSpacing;
  const leftPosition = startIndex * elementSpacing;

  return (
    <motion.div
      className={cn('absolute pointer-events-none', className)}
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ 
        opacity: 1, 
        scaleX: 1,
        x: leftPosition,
      }}
      exit={{ opacity: 0, scaleX: 0 }}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300,
        duration: 0.5,
      }}
      style={{
        width: rangeWidth,
        height: elementWidth + 8, // Slightly larger than elements
        top: '-4px', // Center on elements
      }}
    >
      {/* Background Highlight */}
      <motion.div
        className="w-full h-full rounded-lg border-2 border-dashed"
        style={{
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        }}
        animate={type === 'searching' ? {
          opacity: [0.3, 0.7, 0.3],
        } : undefined}
        transition={type === 'searching' ? {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        } : undefined}
      />

      {/* Range Label */}
      {displayLabel && (
        <motion.div
          className="absolute -top-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div
            className="px-2 py-1 text-xs font-semibold text-white rounded shadow-lg whitespace-nowrap"
            style={{ backgroundColor: config.borderColor }}
          >
            {displayLabel}
          </div>
          {/* Arrow pointing down */}
          <div
            className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: `4px solid ${config.borderColor}`,
            }}
          />
        </motion.div>
      )}

      {/* Animated Border for Active Searching */}
      {type === 'searching' && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2"
          style={{ borderColor: config.borderColor }}
          animate={{
            borderWidth: [2, 4, 2],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  );
}