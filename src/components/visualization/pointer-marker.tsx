'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface PointerMarkerProps {
  type: 'left' | 'right' | 'mid' | 'current' | 'target';
  position: number;
  label?: string;
  visible?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const typeConfig = {
  left: {
    color: '#3b82f6',
    label: 'L',
    shape: 'triangle-down' as const,
  },
  right: {
    color: '#ef4444',
    label: 'R',
    shape: 'triangle-down' as const,
  },
  mid: {
    color: '#10b981',
    label: 'M',
    shape: 'triangle-down' as const,
  },
  current: {
    color: '#f59e0b',
    label: '→',
    shape: 'arrow' as const,
  },
  target: {
    color: '#8b5cf6',
    label: '★',
    shape: 'star' as const,
  },
};

const sizeVariants = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
};

const shapeVariants = {
  'triangle-down': {
    clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)',
  },
  arrow: {
    clipPath: 'polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)',
  },
  star: {
    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  },
};

export function PointerMarker({
  type,
  position,
  label,
  visible = true,
  color,
  size = 'md',
  className,
}: PointerMarkerProps) {
  const config = typeConfig[type];
  const displayColor = color || config.color;
  const displayLabel = label || config.label;

  if (!visible) {
    return null;
  }

  return (
    <motion.div
      className="absolute flex flex-col items-center pointer-events-none"
      initial={{ opacity: 0, y: -20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        x: position * 64 + 16, // Assuming 64px spacing between elements
      }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300,
        duration: 0.4,
      }}
      style={{ top: '-40px' }}
    >
      {/* Pointer Shape */}
      <motion.div
        className={cn(
          'flex items-center justify-center font-bold text-white shadow-lg',
          sizeVariants[size],
          className
        )}
        style={{
          backgroundColor: displayColor,
          ...shapeVariants[config.shape],
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        {config.shape === 'triangle-down' || config.shape === 'star' ? (
          <span className="mt-1">{displayLabel}</span>
        ) : (
          <span>{displayLabel}</span>
        )}
      </motion.div>

      {/* Optional Label */}
      {label && label !== config.label && (
        <motion.div
          className="mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {label}
        </motion.div>
      )}

      {/* Connection Line */}
      <motion.div
        className="w-0.5 bg-gray-400"
        style={{ height: '20px', backgroundColor: displayColor }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      />
    </motion.div>
  );
}