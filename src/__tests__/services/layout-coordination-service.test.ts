import {
  layoutCoordinationService,
  createPaneFocusManager,
  createScrollSyncManager,
  createCrossPaneCommunication,
  createKeyboardNavigationManager
} from '@/lib/services/layout-coordination-service'

// Mock the UI store
jest.mock('@/lib/stores/ui-store', () => ({
  useUIStore: {
    getState: jest.fn(() => ({
      layout: {
        mode: 'horizontal',
        activePane: 'left',
        splitRatio: 0.5,
        isResizing: false
      },
      setActivePane: jest.fn(),
      setLayoutMode: jest.fn(),
      setSplitRatio: jest.fn()
    }))
  }
}))

describe('LayoutCoordinationService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('PaneFocusManager', () => {
    it('should manage pane focus correctly', () => {
      const focusManager = createPaneFocusManager()
      const mockCallback = jest.fn()

      // Test focus callback registration
      const unsubscribe = focusManager.onPaneFocus(mockCallback)
      
      // Test focus change
      focusManager.focusPane('right')
      
      expect(mockCallback).toHaveBeenCalledWith('right')
      
      // Test unsubscribe
      unsubscribe()
      focusManager.focusPane('left')
      
      // Should not be called again after unsubscribe
      expect(mockCallback).toHaveBeenCalledTimes(1)
    })

    it('should get active pane correctly', () => {
      const focusManager = createPaneFocusManager()
      const activePane = focusManager.getActivePane()
      
      expect(activePane).toBe('left')
    })
  })

  describe('ScrollSyncManager', () => {
    it('should manage scroll synchronization', () => {
      const scrollManager = createScrollSyncManager()
      
      // Test initial state
      expect(scrollManager.isSyncEnabled()).toBe(true)
      
      // Test disable
      scrollManager.disableSync()
      expect(scrollManager.isSyncEnabled()).toBe(false)
      
      // Test enable
      scrollManager.enableSync()
      expect(scrollManager.isSyncEnabled()).toBe(true)
    })

    it('should sync scroll when enabled', () => {
      const scrollManager = createScrollSyncManager()
      
      // Mock DOM element
      const mockElement = {
        scrollTo: jest.fn()
      }
      
      // Mock querySelector
      const originalQuerySelector = document.querySelector
      document.querySelector = jest.fn(() => mockElement as any)
      
      scrollManager.syncScroll('left', 100, 50)
      
      expect(mockElement.scrollTo).toHaveBeenCalledWith({
        top: 80, // 100 * 0.8 sync ratio
        left: 50,
        behavior: 'auto'
      })
      
      // Restore original querySelector
      document.querySelector = originalQuerySelector
    })
  })

  describe('CrossPaneCommunication', () => {
    it('should handle cross-pane messaging', () => {
      const commManager = createCrossPaneCommunication()
      const mockCallback = jest.fn()
      
      // Register message listener
      const unsubscribe = commManager.onMessage(mockCallback)
      
      // Send message
      const testMessage = { type: 'test', data: 'hello' }
      commManager.sendMessage('right', testMessage)
      
      expect(mockCallback).toHaveBeenCalledWith('left', testMessage)
      
      // Test unsubscribe
      unsubscribe()
      commManager.sendMessage('left', testMessage)
      
      // Should not be called again after unsubscribe
      expect(mockCallback).toHaveBeenCalledTimes(1)
    })
  })

  describe('KeyboardNavigationManager', () => {
    it('should handle keyboard shortcuts', () => {
      const keyboardManager = createKeyboardNavigationManager()
      
      // Mock event
      const mockEvent = {
        ctrlKey: true,
        key: '1',
        preventDefault: jest.fn()
      } as any
      
      const result = keyboardManager.handleKeyDown(mockEvent)
      
      expect(result).toBe(true)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('should register and unregister shortcuts', () => {
      const keyboardManager = createKeyboardNavigationManager()
      
      // Mock addEventListener and removeEventListener
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener')
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')
      
      keyboardManager.registerShortcuts()
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
      
      keyboardManager.unregisterShortcuts()
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
      
      addEventListenerSpy.mockRestore()
      removeEventListenerSpy.mockRestore()
    })
  })

  describe('Layout Coordination', () => {
    it('should coordinate layout changes', () => {
      // The coordinateLayoutChange method exists and can be called
      expect(() => {
        layoutCoordinationService.coordinateLayoutChange('horizontal')
      }).not.toThrow()
    })

    it('should focus code editor', () => {
      // The focusCodeEditor method exists and can be called
      expect(() => {
        layoutCoordinationService.focusCodeEditor()
      }).not.toThrow()
    })

    it('should sync code execution with visualization', () => {
      const commManager = createCrossPaneCommunication()
      const mockCallback = jest.fn()
      
      commManager.onMessage(mockCallback)
      
      const executionStep = { step: 1, operation: 'compare' }
      layoutCoordinationService.syncCodeExecutionWithVisualization(executionStep)
      
      expect(mockCallback).toHaveBeenCalledWith('left', {
        type: 'execution-step',
        data: executionStep
      })
    })
  })
})