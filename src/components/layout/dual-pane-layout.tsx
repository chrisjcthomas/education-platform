'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/lib/stores/ui-store'
import { DualPaneLayoutProps } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useLayoutCoordination } from '@/hooks/use-layout-coordination'
import { LeftPaneContainer, RightPaneContainer } from './pane-container'

interface ResizeHandleProps {
  onResize: (ratio: number) => void
  splitRatio: number
  isVertical: boolean
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ onResize, isVertical }) => {
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const handleMove = (clientX: number, clientY: number) => {
      if (!containerRef.current) return

      const container = containerRef.current.parentElement
      if (!container) return

      const rect = container.getBoundingClientRect()
      const position = isVertical ? clientY - rect.top : clientX - rect.left
      const size = isVertical ? rect.height : rect.width
      const newRatio = Math.max(0.2, Math.min(0.8, position / size))
      
      onResize(newRatio)
    }

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    const handleEnd = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleEnd)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleEnd)
    }
  }, [isDragging, isVertical, onResize])

  return (
    <div
      ref={containerRef}
      className={cn(
        'group relative flex items-center justify-center bg-border transition-colors hover:bg-border/80',
        isVertical ? 'h-2 cursor-row-resize' : 'w-2 cursor-col-resize',
        isDragging && 'bg-primary'
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div
        className={cn(
          'bg-muted-foreground/30 group-hover:bg-muted-foreground/50 transition-colors',
          isVertical ? 'h-0.5 w-8' : 'w-0.5 h-8',
          isDragging && 'bg-primary'
        )}
      />
    </div>
  )
}

interface TabSwitcherProps {
  activePane: 'left' | 'right'
  onPaneChange: (pane: 'left' | 'right') => void
  leftLabel?: string
  rightLabel?: string
}

const TabSwitcher: React.FC<TabSwitcherProps> = ({ 
  activePane, 
  onPaneChange, 
  leftLabel = 'Code', 
  rightLabel = 'Visualization' 
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, pane: 'left' | 'right') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onPaneChange(pane)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      const targetPane = e.key === 'ArrowLeft' ? 'left' : 'right'
      onPaneChange(targetPane)
    }
  }

  return (
    <div 
      className="flex border-b bg-background"
      role="tablist"
      aria-label="Layout panes"
    >
      <button
        className={cn(
          'flex-1 px-4 py-2 text-sm font-medium transition-colors',
          'border-b-2 border-transparent focus:outline-none focus:ring-2 focus:ring-primary/20',
          activePane === 'left' 
            ? 'border-primary text-primary bg-muted/50' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
        )}
        onClick={() => onPaneChange('left')}
        onKeyDown={(e) => handleKeyDown(e, 'left')}
        role="tab"
        aria-selected={activePane === 'left'}
        aria-controls="left-pane-content"
        tabIndex={activePane === 'left' ? 0 : -1}
      >
        {leftLabel}
      </button>
      <button
        className={cn(
          'flex-1 px-4 py-2 text-sm font-medium transition-colors',
          'border-b-2 border-transparent focus:outline-none focus:ring-2 focus:ring-primary/20',
          activePane === 'right' 
            ? 'border-primary text-primary bg-muted/50' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
        )}
        onClick={() => onPaneChange('right')}
        onKeyDown={(e) => handleKeyDown(e, 'right')}
        role="tab"
        aria-selected={activePane === 'right'}
        aria-controls="right-pane-content"
        tabIndex={activePane === 'right' ? 0 : -1}
      >
        {rightLabel}
      </button>
    </div>
  )
}

export const DualPaneLayout: React.FC<DualPaneLayoutProps> = ({
  leftPane,
  rightPane,
  splitRatio: propSplitRatio,
  onSplitChange,
  isMobile: _propIsMobile // Unused parameter
}) => {
  const { 
    layout, 
    setActivePane, 
    setSplitRatio,
    setLayoutMode,
    shouldReduceMotion 
  } = useUIStore()

  const {
    coordinateLayoutChange
  } = useLayoutCoordination({
    enableScrollSync: true,
    enableKeyboardNavigation: true,
    enableCrossPaneComm: true
  })

  // Use layout splitRatio from store, fallback to prop
  const splitRatio = layout.splitRatio || propSplitRatio

  // Handle responsive layout changes
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const aspectRatio = width / height
      let newMode: 'horizontal' | 'vertical' | 'tabbed'
      
      if (width < 768) {
        // Mobile: use tabbed layout
        newMode = 'tabbed'
      } else if (width < 1024 || height < 600 || aspectRatio < 1.2) {
        // Tablet or narrow screens: use vertical layout
        newMode = 'vertical'
      } else {
        // Desktop: use horizontal layout
        newMode = 'horizontal'
      }

      if (layout.mode !== newMode) {
        setLayoutMode(newMode)
        coordinateLayoutChange(newMode)
      }
    }

    // Initial layout detection
    handleResize()
    
    // Debounced resize handler to prevent excessive updates
    let resizeTimeout: NodeJS.Timeout
    const debouncedResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(handleResize, 150)
    }

    window.addEventListener('resize', debouncedResize)
    return () => {
      window.removeEventListener('resize', debouncedResize)
      clearTimeout(resizeTimeout)
    }
  }, [setLayoutMode, coordinateLayoutChange, layout.mode])

  // Keyboard navigation is now handled by the layout coordination service

  // Handle touch gestures for mobile with improved sensitivity
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (layout.mode !== 'tabbed') return
    
    const touch = e.touches[0]
    touchStartRef.current = { 
      x: touch.clientX, 
      y: touch.clientY,
      time: Date.now()
    }
  }, [layout.mode])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (layout.mode !== 'tabbed' || !touchStartRef.current) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    const deltaTime = Date.now() - touchStartRef.current.time

    // Only handle horizontal swipes that are fast enough and long enough
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50
    const isFastSwipe = deltaTime < 300 // Must be completed within 300ms
    
    if (isHorizontalSwipe && isFastSwipe) {
      if (deltaX > 0 && layout.activePane === 'right') {
        setActivePane('left')
      } else if (deltaX < 0 && layout.activePane === 'left') {
        setActivePane('right')
      }
    }

    touchStartRef.current = null
  }, [layout.mode, layout.activePane, setActivePane])

  const handleSplitChange = useCallback((ratio: number) => {
    setSplitRatio(ratio)
    onSplitChange(ratio)
  }, [setSplitRatio, onSplitChange])

  const animationProps = shouldReduceMotion() 
    ? {} 
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 }
      }

  // Tabbed layout for mobile
  if (layout.mode === 'tabbed') {
    return (
      <div 
        className="flex flex-col h-full"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <TabSwitcher
          activePane={layout.activePane}
          onPaneChange={setActivePane}
        />
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {layout.activePane === 'left' ? (
              <motion.div
                key="left-pane"
                id="left-pane-content"
                className="h-full"
                role="tabpanel"
                aria-labelledby="left-tab"
                {...animationProps}
              >
                {leftPane}
              </motion.div>
            ) : (
              <motion.div
                key="right-pane"
                id="right-pane-content"
                className="h-full"
                role="tabpanel"
                aria-labelledby="right-tab"
                {...animationProps}
              >
                {rightPane}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  // Split layout for desktop and tablet
  const isVertical = layout.mode === 'vertical'
  const leftSize = `${splitRatio * 100}%`
  const rightSize = `${(1 - splitRatio) * 100}%`

  return (
    <div 
      className={cn(
        'flex h-full',
        isVertical ? 'flex-col' : 'flex-row'
      )}
    >
      {/* Left/Top Pane */}
      <LeftPaneContainer
        className="overflow-hidden"
        style={{
          [isVertical ? 'height' : 'width']: leftSize
        }}
        enableScrollSync={true}
        enableFocusManagement={true}
        onFocus={() => console.log('Left pane focused')}
        onMessage={(sourcePane, message) => {
          console.log('Left pane received message from', sourcePane, message)
        }}
      >
        {leftPane}
      </LeftPaneContainer>

      {/* Resize Handle */}
      <ResizeHandle
        onResize={handleSplitChange}
        splitRatio={splitRatio}
        isVertical={isVertical}
      />

      {/* Right/Bottom Pane */}
      <RightPaneContainer
        className="overflow-hidden"
        style={{
          [isVertical ? 'height' : 'width']: rightSize
        }}
        enableScrollSync={true}
        enableFocusManagement={true}
        onFocus={() => console.log('Right pane focused')}
        onMessage={(sourcePane, message) => {
          console.log('Right pane received message from', sourcePane, message)
        }}
      >
        {rightPane}
      </RightPaneContainer>
    </div>
  )
}

export default DualPaneLayout