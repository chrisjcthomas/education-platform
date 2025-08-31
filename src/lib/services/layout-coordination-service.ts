import { useUIStore } from '@/lib/stores/ui-store'
import { LayoutMode } from '@/lib/types'

export interface PaneFocusManager {
  focusPane: (pane: 'left' | 'right') => void
  getActivePane: () => 'left' | 'right'
  onPaneFocus: (callback: (pane: 'left' | 'right') => void) => () => void
}

export interface ScrollSyncManager {
  syncScroll: (sourcePane: 'left' | 'right', scrollTop: number, scrollLeft: number) => void
  enableSync: () => void
  disableSync: () => void
  isSyncEnabled: () => boolean
}

export interface CrossPaneCommunication {
  sendMessage: (targetPane: 'left' | 'right', message: any) => void
  onMessage: (callback: (sourcePane: 'left' | 'right', message: any) => void) => () => void
}

export interface KeyboardNavigationManager {
  registerShortcuts: () => void
  unregisterShortcuts: () => void
  handleKeyDown: (event: KeyboardEvent) => boolean
}

class LayoutCoordinationService {
  private static instance: LayoutCoordinationService
  private focusCallbacks: Set<(pane: 'left' | 'right') => void> = new Set()
  private messageCallbacks: Set<(sourcePane: 'left' | 'right', message: any) => void> = new Set()
  private scrollSyncEnabled = true
  private keyboardShortcutsRegistered = false

  static getInstance(): LayoutCoordinationService {
    if (!LayoutCoordinationService.instance) {
      LayoutCoordinationService.instance = new LayoutCoordinationService()
    }
    return LayoutCoordinationService.instance
  }

  // Pane Focus Management
  createPaneFocusManager(): PaneFocusManager {
    return {
      focusPane: (pane: 'left' | 'right') => {
        const { setActivePane } = useUIStore.getState()
        setActivePane(pane)
        this.notifyFocusChange(pane)
      },

      getActivePane: () => {
        const { layout } = useUIStore.getState()
        return layout.activePane
      },

      onPaneFocus: (callback: (pane: 'left' | 'right') => void) => {
        this.focusCallbacks.add(callback)
        return () => {
          this.focusCallbacks.delete(callback)
        }
      }
    }
  }

  private notifyFocusChange(pane: 'left' | 'right') {
    this.focusCallbacks.forEach(callback => callback(pane))
  }

  // Scroll Synchronization
  createScrollSyncManager(): ScrollSyncManager {
    return {
      syncScroll: (sourcePane: 'left' | 'right', scrollTop: number, scrollLeft: number) => {
        if (!this.scrollSyncEnabled) return

        const targetPane = sourcePane === 'left' ? 'right' : 'left'
        const targetElement = document.querySelector(`[data-pane="${targetPane}"]`)
        
        if (targetElement && targetElement.scrollTo) {
          // Sync vertical scroll with a ratio to account for different content heights
          const syncRatio = 0.8 // Adjust based on content relationship
          targetElement.scrollTo({
            top: scrollTop * syncRatio,
            left: scrollLeft,
            behavior: 'auto'
          })
        }
      },

      enableSync: () => {
        this.scrollSyncEnabled = true
      },

      disableSync: () => {
        this.scrollSyncEnabled = false
      },

      isSyncEnabled: () => this.scrollSyncEnabled
    }
  }

  // Cross-Pane Communication
  createCrossPaneCommunication(): CrossPaneCommunication {
    return {
      sendMessage: (targetPane: 'left' | 'right', message: any) => {
        // Notify all listeners about the message
        this.messageCallbacks.forEach(callback => {
          const sourcePane = targetPane === 'left' ? 'right' : 'left'
          callback(sourcePane, message)
        })
      },

      onMessage: (callback: (sourcePane: 'left' | 'right', message: any) => void) => {
        this.messageCallbacks.add(callback)
        return () => {
          this.messageCallbacks.delete(callback)
        }
      }
    }
  }

  // Keyboard Navigation
  createKeyboardNavigationManager(): KeyboardNavigationManager {
    return {
      registerShortcuts: () => {
        if (this.keyboardShortcutsRegistered) return
        
        document.addEventListener('keydown', this.handleGlobalKeyDown)
        this.keyboardShortcutsRegistered = true
      },

      unregisterShortcuts: () => {
        if (!this.keyboardShortcutsRegistered) return
        
        document.removeEventListener('keydown', this.handleGlobalKeyDown)
        this.keyboardShortcutsRegistered = false
      },

      handleKeyDown: this.handleGlobalKeyDown
    }
  }

  private handleGlobalKeyDown = (event: KeyboardEvent): boolean => {
    const { layout, setActivePane, setLayoutMode } = useUIStore.getState()
    
    // Don't handle shortcuts if user is typing in an input/textarea
    const activeElement = document.activeElement
    if (activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' ||
      (activeElement as HTMLElement).contentEditable === 'true' ||
      activeElement.classList.contains('monaco-editor')
    )) {
      return false
    }
    
    // Handle Ctrl/Cmd + number keys for pane switching
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case '1':
          event.preventDefault()
          setActivePane('left')
          this.focusCodeEditor()
          return true
        case '2':
          event.preventDefault()
          setActivePane('right')
          this.focusVisualization()
          return true
        case 'Tab':
          if (layout.mode === 'tabbed') {
            event.preventDefault()
            const newPane = layout.activePane === 'left' ? 'right' : 'left'
            setActivePane(newPane)
            if (newPane === 'left') {
              this.focusCodeEditor()
            } else {
              this.focusVisualization()
            }
            return true
          }
          break
        case '\\':
          // Ctrl+\ to toggle layout modes (common in IDEs)
          event.preventDefault()
          const modes: LayoutMode[] = ['horizontal', 'vertical', 'tabbed']
          const currentIndex = modes.indexOf(layout.mode)
          const nextIndex = (currentIndex + 1) % modes.length
          setLayoutMode(modes[nextIndex])
          this.coordinateLayoutChange(modes[nextIndex])
          return true
      }
    }

    // Handle Alt + arrow keys for pane navigation
    if (event.altKey) {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          setActivePane('left')
          this.focusCodeEditor()
          return true
        case 'ArrowRight':
          event.preventDefault()
          setActivePane('right')
          this.focusVisualization()
          return true
      }
    }

    // Handle Tab key for pane switching in tabbed mode (without modifiers)
    if (event.key === 'Tab' && !event.ctrlKey && !event.metaKey && !event.altKey && layout.mode === 'tabbed') {
      // Only handle if not focused on a focusable element
      if (!activeElement || !this.isFocusableElement(activeElement)) {
        event.preventDefault()
        const newPane = layout.activePane === 'left' ? 'right' : 'left'
        setActivePane(newPane)
        if (newPane === 'left') {
          this.focusCodeEditor()
        } else {
          this.focusVisualization()
        }
        return true
      }
    }

    // Handle F11 for layout mode cycling
    if (event.key === 'F11') {
      event.preventDefault()
      const modes: LayoutMode[] = ['horizontal', 'vertical', 'tabbed']
      const currentIndex = modes.indexOf(layout.mode)
      const nextIndex = (currentIndex + 1) % modes.length
      setLayoutMode(modes[nextIndex])
      this.coordinateLayoutChange(modes[nextIndex])
      return true
    }

    // Handle Escape to focus active pane
    if (event.key === 'Escape') {
      const paneElement = document.querySelector(`[data-pane="${layout.activePane}"]`)
      if (paneElement && paneElement instanceof HTMLElement) {
        paneElement.focus()
        return true
      }
    }

    return false
  }

  private isFocusableElement(element: Element): boolean {
    const focusableSelectors = [
      'input', 'textarea', 'select', 'button', 'a[href]',
      '[tabindex]:not([tabindex="-1"])', '[contenteditable="true"]'
    ]
    
    return focusableSelectors.some(selector => 
      element.matches(selector) || element.closest(selector)
    )
  }

  // Layout Mode Coordination
  coordinateLayoutChange(newMode: LayoutMode) {
    const { layout, setSplitRatio } = useUIStore.getState()
    
    // Adjust split ratio based on layout mode and screen characteristics
    switch (newMode) {
      case 'horizontal':
        if (layout.splitRatio < 0.3 || layout.splitRatio > 0.7) {
          setSplitRatio(0.5) // Reset to balanced split
        }
        break
      case 'vertical':
        if (layout.splitRatio < 0.35 || layout.splitRatio > 0.65) {
          setSplitRatio(0.4) // Favor top pane for code editor
        }
        break
      case 'tabbed':
        // Ensure active pane is set appropriately for tabbed mode
        if (!layout.activePane) {
          const { setActivePane } = useUIStore.getState()
          setActivePane('left') // Default to code pane
        }
        break
    }

    // Notify focus change to ensure proper pane activation
    this.notifyFocusChange(layout.activePane)
    
    // Trigger any necessary UI updates for the new layout
    this.handleLayoutModeTransition(layout.mode, newMode)
  }

  private handleLayoutModeTransition(oldMode: LayoutMode, newMode: LayoutMode) {
    // Handle specific transitions that need special coordination
    if (oldMode === 'tabbed' && newMode !== 'tabbed') {
      // Transitioning from tabbed to split view - ensure both panes are ready
      setTimeout(() => {
        const leftPane = document.querySelector('[data-pane="left"]')
        const rightPane = document.querySelector('[data-pane="right"]')
        
        if (leftPane && rightPane) {
          // Both panes are now visible, sync any pending state
          this.syncLayoutState()
        }
      }, 100)
    } else if (oldMode !== 'tabbed' && newMode === 'tabbed') {
      // Transitioning to tabbed view - focus the active pane
      setTimeout(() => {
        const { layout } = useUIStore.getState()
        if (layout.activePane === 'left') {
          this.focusCodeEditor()
        } else {
          this.focusVisualization()
        }
      }, 100)
    }
  }

  private syncLayoutState() {
    // Sync any state that might have gotten out of sync during layout transitions
    const communication = this.createCrossPaneCommunication()
    communication.sendMessage('right', {
      type: 'layout-sync',
      timestamp: Date.now()
    })
  }

  // Screen size detection and layout recommendation
  getRecommendedLayoutMode(): LayoutMode {
    const width = window.innerWidth
    const height = window.innerHeight
    const aspectRatio = width / height
    
    if (width < 768) {
      return 'tabbed'
    } else if (width < 1024 || height < 600 || aspectRatio < 1.2) {
      return 'vertical'
    } else {
      return 'horizontal'
    }
  }

  // Check if current layout is appropriate for screen size
  shouldUpdateLayoutForScreenSize(): boolean {
    const { layout } = useUIStore.getState()
    const recommended = this.getRecommendedLayoutMode()
    return layout.mode !== recommended
  }

  // Utility methods for common coordination tasks
  focusCodeEditor() {
    const { setActivePane } = useUIStore.getState()
    setActivePane('left')
    
    // Try to focus the Monaco editor
    setTimeout(() => {
      const editorElement = document.querySelector('.monaco-editor textarea')
      if (editorElement && editorElement instanceof HTMLElement) {
        editorElement.focus()
      }
    }, 100)
  }

  focusVisualization() {
    const { setActivePane } = useUIStore.getState()
    setActivePane('right')
    
    // Focus the visualization container
    setTimeout(() => {
      const vizElement = document.querySelector('[data-pane="right"]')
      if (vizElement && vizElement instanceof HTMLElement) {
        vizElement.focus()
      }
    }, 100)
  }

  syncCodeExecutionWithVisualization(executionStep: any) {
    // Send execution step to visualization pane
    const communication = this.createCrossPaneCommunication()
    communication.sendMessage('right', {
      type: 'execution-step',
      data: executionStep
    })
  }

  syncVisualizationStateWithCode(visualState: any) {
    // Send visualization state to code pane
    const communication = this.createCrossPaneCommunication()
    communication.sendMessage('left', {
      type: 'visual-state',
      data: visualState
    })
  }
}

// Export singleton instance and factory functions
export const layoutCoordinationService = LayoutCoordinationService.getInstance()

export const createPaneFocusManager = () => layoutCoordinationService.createPaneFocusManager()
export const createScrollSyncManager = () => layoutCoordinationService.createScrollSyncManager()
export const createCrossPaneCommunication = () => layoutCoordinationService.createCrossPaneCommunication()
export const createKeyboardNavigationManager = () => layoutCoordinationService.createKeyboardNavigationManager()