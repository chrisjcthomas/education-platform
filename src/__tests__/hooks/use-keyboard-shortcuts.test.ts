import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'

describe('useKeyboardShortcuts', () => {
  const mockAction1 = jest.fn()
  const mockAction2 = jest.fn()

  const shortcuts = [
    {
      key: ' ',
      action: mockAction1,
      description: 'Play/Pause'
    },
    {
      key: 'r',
      action: mockAction2,
      description: 'Reset',
      ctrlKey: true
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    // Clean up event listeners
    document.removeEventListener('keydown', jest.fn())
  })

  it('registers keyboard shortcuts', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(shortcuts))
    
    expect(result.current.shortcuts).toHaveLength(2)
    expect(result.current.shortcuts[0].description).toBe('Play/Pause')
    expect(result.current.shortcuts[1].description).toBe('Reset')
  })

  it('triggers action on matching key press', () => {
    renderHook(() => useKeyboardShortcuts(shortcuts))
    
    // Simulate spacebar press
    const spaceEvent = new KeyboardEvent('keydown', {
      key: ' ',
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false
    })
    
    document.dispatchEvent(spaceEvent)
    
    expect(mockAction1).toHaveBeenCalledTimes(1)
    expect(mockAction2).not.toHaveBeenCalled()
  })

  it('triggers action with modifier keys', () => {
    renderHook(() => useKeyboardShortcuts(shortcuts))
    
    // Simulate Ctrl+R press
    const ctrlREvent = new KeyboardEvent('keydown', {
      key: 'r',
      ctrlKey: true,
      altKey: false,
      shiftKey: false,
      metaKey: false
    })
    
    document.dispatchEvent(ctrlREvent)
    
    expect(mockAction2).toHaveBeenCalledTimes(1)
    expect(mockAction1).not.toHaveBeenCalled()
  })

  it('does not trigger when modifier keys do not match', () => {
    renderHook(() => useKeyboardShortcuts(shortcuts))
    
    // Simulate R press without Ctrl
    const rEvent = new KeyboardEvent('keydown', {
      key: 'r',
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false
    })
    
    document.dispatchEvent(rEvent)
    
    expect(mockAction2).not.toHaveBeenCalled()
  })

  it('does not trigger when disabled', () => {
    renderHook(() => useKeyboardShortcuts(shortcuts, { enabled: false }))
    
    const spaceEvent = new KeyboardEvent('keydown', {
      key: ' ',
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false
    })
    
    document.dispatchEvent(spaceEvent)
    
    expect(mockAction1).not.toHaveBeenCalled()
  })

  it('does not trigger when typing in input fields', () => {
    // Create and focus an input element
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    
    renderHook(() => useKeyboardShortcuts(shortcuts))
    
    const spaceEvent = new KeyboardEvent('keydown', {
      key: ' ',
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false
    })
    
    document.dispatchEvent(spaceEvent)
    
    expect(mockAction1).not.toHaveBeenCalled()
    
    // Cleanup
    document.body.removeChild(input)
  })

  it('does not trigger when typing in textarea', () => {
    // Create and focus a textarea element
    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    textarea.focus()
    
    renderHook(() => useKeyboardShortcuts(shortcuts))
    
    const spaceEvent = new KeyboardEvent('keydown', {
      key: ' ',
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false
    })
    
    document.dispatchEvent(spaceEvent)
    
    expect(mockAction1).not.toHaveBeenCalled()
    
    // Cleanup
    document.body.removeChild(textarea)
  })

  it('does not trigger when typing in contentEditable element', () => {
    // Create and focus a contentEditable element
    const div = document.createElement('div')
    div.contentEditable = 'true'
    document.body.appendChild(div)
    
    // Mock document.activeElement to return our contentEditable div
    Object.defineProperty(document, 'activeElement', {
      value: div,
      writable: true
    })
    
    renderHook(() => useKeyboardShortcuts(shortcuts))
    
    const spaceEvent = new KeyboardEvent('keydown', {
      key: ' ',
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false
    })
    
    document.dispatchEvent(spaceEvent)
    
    expect(mockAction1).not.toHaveBeenCalled()
    
    // Cleanup
    document.body.removeChild(div)
    Object.defineProperty(document, 'activeElement', {
      value: null,
      writable: true
    })
  })

  it('handles case-insensitive key matching', () => {
    const shortcuts = [
      {
        key: 'A',
        action: mockAction1,
        description: 'Test action'
      }
    ]
    
    renderHook(() => useKeyboardShortcuts(shortcuts))
    
    // Test lowercase 'a'
    const aEvent = new KeyboardEvent('keydown', {
      key: 'a',
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false
    })
    
    document.dispatchEvent(aEvent)
    
    expect(mockAction1).toHaveBeenCalledTimes(1)
  })

  it('prevents default behavior by default', () => {
    const preventDefault = jest.fn()
    
    renderHook(() => useKeyboardShortcuts(shortcuts))
    
    const spaceEvent = new KeyboardEvent('keydown', {
      key: ' ',
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false
    })
    
    // Mock preventDefault
    spaceEvent.preventDefault = preventDefault
    
    document.dispatchEvent(spaceEvent)
    
    expect(preventDefault).toHaveBeenCalled()
  })

  it('allows default behavior when preventDefault is false', () => {
    const shortcutsWithoutPreventDefault = [
      {
        key: ' ',
        action: mockAction1,
        description: 'Play/Pause',
        preventDefault: false
      }
    ]
    
    const preventDefault = jest.fn()
    
    renderHook(() => useKeyboardShortcuts(shortcutsWithoutPreventDefault))
    
    const spaceEvent = new KeyboardEvent('keydown', {
      key: ' ',
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false
    })
    
    // Mock preventDefault
    spaceEvent.preventDefault = preventDefault
    
    document.dispatchEvent(spaceEvent)
    
    expect(preventDefault).not.toHaveBeenCalled()
    expect(mockAction1).toHaveBeenCalled()
  })
})