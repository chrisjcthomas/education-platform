'use client'

import React, { useRef, useEffect, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { useLayoutCoordination, useScrollSync } from '@/hooks/use-layout-coordination'
import { cn } from '@/lib/utils'

interface PaneContainerProps {
  paneId: 'left' | 'right'
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  enableScrollSync?: boolean
  enableFocusManagement?: boolean
  onFocus?: () => void
  onMessage?: (sourcePane: 'left' | 'right', message: unknown) => void
}

export const PaneContainer = forwardRef<HTMLDivElement, PaneContainerProps>(({
  paneId,
  children,
  className,
  style,
  enableScrollSync = true,
  enableFocusManagement = true,
  onFocus,
  onMessage
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  const {
    layout,
    isActivePane,
    focusPane,
    onPaneFocus,
    onMessage: onCrossPaneMessage,
    isScrollSyncEnabled
  } = useLayoutCoordination({
    paneId,
    enableScrollSync,
    enableCrossPaneComm: true
  })

  // Set up scroll synchronization
  useScrollSync(scrollContainerRef as React.RefObject<HTMLElement>, paneId)

  // Handle focus management
  useEffect(() => {
    if (!enableFocusManagement) return

    const unsubscribe = onPaneFocus((focusedPane) => {
      if (focusedPane === paneId && containerRef.current) {
        containerRef.current.focus()
        onFocus?.()
      }
    })

    return unsubscribe
  }, [paneId, enableFocusManagement, onPaneFocus, onFocus])

  // Handle cross-pane messages
  useEffect(() => {
    if (!onMessage) return

    const unsubscribe = onCrossPaneMessage((sourcePane, message) => {
      // Only handle messages intended for this pane
      if (sourcePane !== paneId) {
        onMessage(sourcePane, message)
      }
    })

    return unsubscribe
  }, [paneId, onMessage, onCrossPaneMessage])

  // Handle click to focus
  const handleClick = () => {
    if (enableFocusManagement) {
      focusPane(paneId)
    }
  }

  // Handle keyboard navigation within pane
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Allow Escape to blur the pane
    if (event.key === 'Escape') {
      if (containerRef.current) {
        containerRef.current.blur()
      }
    }
  }

  // Combine refs
  const combinedRef = (node: HTMLDivElement) => {
    containerRef.current = node
    if (typeof ref === 'function') {
      ref(node)
    } else if (ref) {
      ref.current = node
    }
  }

  return (
    <motion.div
      ref={combinedRef}
      data-pane={paneId}
      className={cn(
        'relative h-full outline-none transition-all duration-200',
        'focus-within:ring-2 focus-within:ring-primary/20',
        isActivePane && 'ring-2 ring-primary/30',
        className
      )}
      style={style}
      tabIndex={-1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...(layout.mode !== 'tabbed' && { layout: true })}
      transition={{ duration: 0.2 }}
      role="region"
      aria-label={`${paneId === 'left' ? 'Code Editor' : 'Visualization'} Pane`}
      aria-current={isActivePane ? 'page' : undefined}
    >
      {/* Focus indicator */}
      {isActivePane && (
        <motion.div
          className="absolute inset-0 pointer-events-none border-2 border-primary/20 rounded-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        />
      )}

      {/* Scroll sync indicator */}
      {enableScrollSync && isScrollSyncEnabled && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-md">
            Sync: ON
          </div>
        </div>
      )}

      {/* Scrollable content container */}
      <div
        ref={scrollContainerRef}
        className="h-full overflow-auto"
        data-scroll-container={paneId}
      >
        {children}
      </div>
    </motion.div>
  )
})

PaneContainer.displayName = 'PaneContainer'

// Specialized components for left and right panes
export const LeftPaneContainer = forwardRef<HTMLDivElement, Omit<PaneContainerProps, 'paneId'>>(
  (props, ref) => <PaneContainer {...props} paneId="left" ref={ref} />
)

export const RightPaneContainer = forwardRef<HTMLDivElement, Omit<PaneContainerProps, 'paneId'>>(
  (props, ref) => <PaneContainer {...props} paneId="right" ref={ref} />
)

LeftPaneContainer.displayName = 'LeftPaneContainer'
RightPaneContainer.displayName = 'RightPaneContainer'

export default PaneContainer