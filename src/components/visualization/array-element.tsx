'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ArrayElementProps {
  value: number;
  index: number;
  state: 'normal' | 'highlighted' | 'dimmed' | 'found' | 'eliminated';
  position?: { x: number; y: number };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: (index: number) => void;
}

const stateVariants = {
  normal: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
    color: '#374151',
    scale: 1,
    opacity: 1,
  },
  highlighted: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    color: '#ffffff',
    scale: 1.05,
    opacity: 1,
  },
  dimmed: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    color: '#9ca3af',
    scale: 0.95,
    opacity: 0.6,
  },
  found: {
    backgroundColor: '#10b981',
    borderColor: '#059669',
    color: '#ffffff',
    scale: 1.1,
    opacity: 1,
  },
  eliminated: {
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
    color: '#ffffff',
    scale: 0.9,
    opacity: 0.4,
  },
};

const sizeVariants = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-lg',
};

export function ArrayElement({
  value,
  index,
  state = 'normal',
  position,
  size = 'md',
  className,
  onClick,
}: ArrayElementProps) {
  const handleClick = () => {
    onClick?.(index);
  };

  return (
    <motion.div
      className={cn(
        'flex items-center justify-center border-2 rounded-lg font-semibold cursor-pointer select-none',
        sizeVariants[size],
        className
      )}
      variants={stateVariants}
      animate={state}
      initial="normal"
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      layout
      layoutId={`array-element-${index}`}
      style={position ? { x: position.x, y: position.y } : undefined}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300,
        duration: 0.3,
      }}
      onClick={handleClick}
      role="button"
      tabIndex={onClick ? 0 : -1}
      aria-label={`Array element ${index} with value ${value}, state: ${state}`}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {value}
    </motion.div>
  );
}