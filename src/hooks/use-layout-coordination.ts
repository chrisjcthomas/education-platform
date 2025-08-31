'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useUIStore } from '@/lib/stores/ui-store'
import {
  layoutCoordinationService,
  createPaneFocusManager,
  createScrollSyncManager,
  createCrossPaneCommunication,
  createKeyboardNavigationManager,
  type PaneFocusManager,
  type ScrollSyncManager,
  type CrossPaneCommunication,
  type KeyboardNavigationManager
} from '@/lib/services/layout-coordination-service'

interface LayoutCoordinationOptions {
  enableScrollSync?: boolean
  enableKeyboardNavigation?: boolean
  enableCrossPaneComm?: boolean
  paneId?: 'left' | 'right'
}

export const useLayoutCoordination = (options: LayoutCoordinationOptions = {}) => {
  const {
    enableScrollSync = true,
    enableKeyboardNavigation = true,
    enableCrossPaneComm = true,
    paneId
  } = options

  const { layout } = useUIStore()
  const managersRef = useRef<{
    focusManager: PaneFocusManager
    scrollManager: ScrollSyncManager
    commManager: CrossPaneCommunication
    keyboardManager: KeyboardNavigationManager
  } | null>(null)

  // Initialize managers
  useEffect(() => {
    managersRef.current = {
      focusManager: createPaneFocusManager(),
      scrollManager: createScrollSyncManager(),
      commManager: createCrossPaneCommunication(),
      keyboardManager: createKeyboardNavigationManager()
    }

    // Enable/disable scroll sync based on options
    if (enableScrollSync) {
      managersRef.current.scrollManager.enableSync()
    } else {
      managersRef.current.scrollManager.disableSync()
    }

    // Register keyboard shortcuts if enabled
    if (enableKeyboardNavigation) {
      managersRef.current.keyboardManager.registerShortcuts()
    }

    return () => {
      if (managersRef.current && enableKeyboardNavigation) {
        managersRef.current.keyboardManager.unregisterShortcuts()
      }
    }
  }, [enableScrollSync, enableKeyboardNavigation])

  // Pane focus management
  const focusPane = useCallback((pane: 'left' | 'right') => {
    managersRef.current?.focusManager.focusPane(pane)
  }, [])

  const getActivePane = useCallback(() => {
    return managersRef.current?.focusManager.getActivePane() || 'left'
  }, [])

  const onPaneFocus = useCallback((callback: (pane: 'left' | 'right') => void) => {
    return managersRef.current?.focusManager.onPaneFocus(callback) || (() => {})
  }, [])

  // Scroll synchronization
  const syncScroll = useCallback((scrollTop: number, scrollLeft: number = 0) => {
    if (paneId && managersRef.current) {
      managersRef.current.scrollManager.syncScroll(paneId, scrollTop, scrollLeft)
    }
  }, [paneId])

  const toggleScrollSync = useCallback(() => {
    if (!managersRef.current) return false
    
    if (managersRef.current.scrollManager.isSyncEnabled()) {
      managersRef.current.scrollManager.disableSync()
      return false
    } else {
      managersRef.current.scrollManager.enableSync()
      return true
    }
  }, [])

  // Cross-pane communication
  const sendMessage = useCallback((targetPane: 'left' | 'right', message: unknown) => {
    if (enableCrossPaneComm && managersRef.current) {
      managersRef.current.commManager.sendMessage(targetPane, message)
    }
  }, [enableCrossPaneComm])

  const onMessage = useCallback((callback: (sourcePane: 'left' | 'right', message: unknown) => void) => {
    if (enableCrossPaneComm && managersRef.current) {
      return managersRef.current.commManager.onMessage(callback)
    }
    return () => {}
  }, [enableCrossPaneComm])

  // Layout coordination helpers
  const coordinateLayoutChange = useCallback((newMode: 'horizontal' | 'vertical' | 'tabbed') => {
    layoutCoordinationService.coordinateLayoutChange(newMode)
  }, [])

  const focusCodeEditor = useCallback(() => {
    layoutCoordinationService.focusCodeEditor()
  }, [])

  const focusVisualization = useCallback(() => {
    layoutCoordinationService.focusVisualization()
  }, [])

  const syncCodeExecution = useCallback((executionStep: unknown) => {
    layoutCoordinationService.syncCodeExecutionWithVisualization(executionStep)
  }, [])

  const syncVisualizationState = useCallback((visualState: unknown) => {
    layoutCoordinationService.syncVisualizationStateWithCode(visualState)
  }, [])

  return {
    // Current layout state
    layout,
    isActivePane: paneId ? layout.activePane === paneId : false,
    
    // Focus management
    focusPane,
    getActivePane,
    onPaneFocus,
    
    // Scroll synchronization
    syncScroll,
    toggleScrollSync,
    isScrollSyncEnabled: managersRef.current?.scrollManager.isSyncEnabled() || false,
    
    // Cross-pane communication
    sendMessage,
    onMessage,
    
    // Layout coordination
    coordinateLayoutChange,
    focusCodeEditor,
    focusVisualization,
    syncCodeExecution,
    syncVisualizationState,
    
    // Utility functions
    isHorizontalLayout: layout.mode === 'horizontal',
    isVerticalLayout: layout.mode === 'vertical',
    isTabbedLayout: layout.mode === 'tabbed',
    isMobileLayout: layout.mode === 'tabbed',
  }
}

// Specialized hooks for specific panes
export const useLeftPaneCoordination = (options: Omit<LayoutCoordinationOptions, 'paneId'> = {}) => {
  return useLayoutCoordination({ ...options, paneId: 'left' })
}

export const useRightPaneCoordination = (options: Omit<LayoutCoordinationOptions, 'paneId'> = {}) => {
  return useLayoutCoordination({ ...options, paneId: 'right' })
}

// Hook for scroll synchronization in specific elements
export const useScrollSync = (elementRef: React.RefObject<HTMLElement>, paneId: 'left' | 'right') => {
  const { syncScroll, isScrollSyncEnabled } = useLayoutCoordination({ paneId })

  useEffect(() => {
    const element = elementRef.current
    if (!element || !isScrollSyncEnabled) return

    const handleScroll = () => {
      syncScroll(element.scrollTop, element.scrollLeft)
    }

    element.addEventListener('scroll', handleScroll, { passive: true })
    return () => element.removeEventListener('scroll', handleScroll)
  }, [syncScroll, isScrollSyncEnabled, elementRef])

  return { isScrollSyncEnabled }
}

export default useLayoutCoordination