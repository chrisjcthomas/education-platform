'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { usePerformanceAdaptation } from '../../hooks/use-enhanced-performance'

interface MobileResponsiveLayoutProps {
  codePane: React.ReactNode
  visualizationPane: React.ReactNode
  controlsPane: React.ReactNode
  className?: string
}

type LayoutMode = 'dual-pane' | 'tabbed' | 'stacked'
type ActivePane = 'code' | 'visualization' | 'controls'

export function MobileResponsiveLayout({
  codePane,
  visualizationPane,
  controlsPane,
  className = ''
}: MobileResponsiveLayoutProps) {
  const { isMobile, isLowEnd, getAnimationConfig, shouldUseFallback } = usePerformanceAdaptation()
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('dual-pane')
  const [activePane, setActivePane] = useState<ActivePane>('visualization')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  // Detect screen size and orientation changes
  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isPortrait = height > width

      setOrientation(isPortrait ? 'portrait' : 'landscape')

      // Determine layout mode based on screen size and device capabilities
      if (width < 768) {
        // Mobile: use tabbed layout
        setLayoutMode('tabbed')
      } else if (width < 1024 || isLowEnd) {
        // Tablet or low-end: use stacked layout
        setLayoutMode('stacked')
      } else {
        // Desktop: use dual-pane layout
        setLayoutMode('dual-pane')
      }
    }

    updateLayout()
    window.addEventListener('resize', updateLayout)
    window.addEventListener('orientationchange', updateLayout)

    return () => {
      window.removeEventListener('resize', updateLayout)
      window.removeEventListener('orientationchange', updateLayout)
    }
  }, [isLowEnd])

  // Animation configurations based on performance
  const animationConfig = getAnimationConfig()
  const reducedAnimations = shouldUseFallback || isLowEnd

  const paneTransition = reducedAnimations
    ? { duration: 0 }
    : {
        type: 'spring' as const,
        damping: 25,
        stiffness: 300,
        duration: 0.3
      }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: reducedAnimations ? 1 : 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: reducedAnimations ? 1 : 0
    })
  }

  // Swipe gesture handling for mobile
  const [swipeDirection, setSwipeDirection] = useState(0)
  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (layoutMode !== 'tabbed') return

    const panes: ActivePane[] = ['code', 'visualization', 'controls']
    const currentIndex = panes.indexOf(activePane)

    if (direction === 'right' && currentIndex > 0) {
      setSwipeDirection(-1)
      setActivePane(panes[currentIndex - 1])
    } else if (direction === 'left' && currentIndex < panes.length - 1) {
      setSwipeDirection(1)
      setActivePane(panes[currentIndex + 1])
    }
  }, [layoutMode, activePane])

  // Touch gesture detection
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchEnd({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const deltaX = touchStart.x - touchEnd.x
    const deltaY = touchStart.y - touchEnd.y
    const minSwipeDistance = 50

    // Only handle horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        handleSwipe('left')
      } else {
        handleSwipe('right')
      }
    }

    setTouchStart(null)
    setTouchEnd(null)
  }

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  // Render based on layout mode
  const renderDualPaneLayout = () => (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 h-full ${className}`}>
      <div className="flex flex-col space-y-4">
        {codePane}
        {controlsPane}
      </div>
      <div className="flex flex-col">
        {visualizationPane}
      </div>
    </div>
  )

  const renderStackedLayout = () => (
    <div className={`flex flex-col space-y-4 ${className}`}>
      {/* Controls always at top for easy access */}
      <div className="order-1">
        {controlsPane}
      </div>
      
      {/* Visualization in the middle */}
      <div className="order-2">
        {visualizationPane}
      </div>
      
      {/* Code at bottom */}
      <div className="order-3">
        {codePane}
      </div>
    </div>
  )

  const renderTabbedLayout = () => (
    <div 
      className={`flex flex-col h-full ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Tab Navigation */}
      <div className="flex-shrink-0 mb-4">
        <Tabs value={activePane} onValueChange={(value) => setActivePane(value as ActivePane)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="code" className="text-sm">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Code
            </TabsTrigger>
            <TabsTrigger value="visualization" className="text-sm">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
              </svg>
              Visual
            </TabsTrigger>
            <TabsTrigger value="controls" className="text-sm">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Controls
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content with Swipe Animation */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={swipeDirection}>
          <motion.div
            key={activePane}
            custom={swipeDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={paneTransition}
            className="absolute inset-0 w-full h-full"
          >
            {activePane === 'code' && (
              <div className="h-full overflow-auto">
                {codePane}
              </div>
            )}
            {activePane === 'visualization' && (
              <div className="h-full overflow-auto">
                {visualizationPane}
              </div>
            )}
            {activePane === 'controls' && (
              <div className="h-full overflow-auto">
                {controlsPane}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Swipe Indicators */}
      <div className="flex justify-center mt-2 space-x-2">
        {['code', 'visualization', 'controls'].map((pane, index) => (
          <div
            key={pane}
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              activePane === pane ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Swipe Instructions */}
      <div className="text-xs text-gray-500 text-center mt-2">
        Swipe left/right or tap tabs to navigate
      </div>
    </div>
  )

  // Layout mode indicator for debugging/development
  const LayoutModeIndicator = () => (
    <div className="fixed top-4 right-4 z-50">
      <Badge variant="outline" className="text-xs">
        {layoutMode} | {orientation} | {isMobile ? 'mobile' : 'desktop'}
        {isLowEnd && ' | low-end'}
      </Badge>
    </div>
  )

  return (
    <div className={`w-full h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Layout Mode Indicator (only in development) */}
      {process.env.NODE_ENV === 'development' && <LayoutModeIndicator />}

      {/* Fullscreen Toggle */}
      {isMobile && (
        <Button
          onClick={toggleFullscreen}
          size="sm"
          variant="outline"
          className="fixed top-4 left-4 z-40"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          )}
        </Button>
      )}

      {/* Main Content */}
      <div className={`w-full h-full ${isFullscreen ? 'p-4' : ''}`}>
        {layoutMode === 'dual-pane' && renderDualPaneLayout()}
        {layoutMode === 'stacked' && renderStackedLayout()}
        {layoutMode === 'tabbed' && renderTabbedLayout()}
      </div>
    </div>
  )
}

// Hook for responsive layout detection
export function useResponsiveLayout() {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('dual-pane')
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 })
  const { isMobile, isLowEnd } = usePerformanceAdaptation()

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setScreenSize({ width, height })

      if (width < 768) {
        setLayoutMode('tabbed')
      } else if (width < 1024 || isLowEnd) {
        setLayoutMode('stacked')
      } else {
        setLayoutMode('dual-pane')
      }
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
    
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [isLowEnd])

  return {
    layoutMode,
    screenSize,
    isMobile,
    isLowEnd,
    isTablet: screenSize.width >= 768 && screenSize.width < 1024,
    isDesktop: screenSize.width >= 1024,
    orientation: screenSize.height > screenSize.width ? 'portrait' : 'landscape'
  }
}