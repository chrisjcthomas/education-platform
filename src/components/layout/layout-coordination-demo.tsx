'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLayoutCoordination } from '@/hooks/use-layout-coordination'

export const LayoutCoordinationDemo: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([])
  
  const {
    layout,
    focusPane,
    sendMessage,
    onMessage,
    focusCodeEditor,
    focusVisualization,
    syncCodeExecution,
    toggleScrollSync,
    isScrollSyncEnabled,
    coordinateLayoutChange
  } = useLayoutCoordination()

  // Listen for cross-pane messages
  React.useEffect(() => {
    const unsubscribe = onMessage((sourcePane, message) => {
      setMessages(prev => [...prev, `Message from ${sourcePane}: ${JSON.stringify(message)}`])
    })
    return unsubscribe
  }, [onMessage])

  const handleSendMessage = () => {
    const targetPane = layout.activePane === 'left' ? 'right' : 'left'
    sendMessage(targetPane, { 
      type: 'demo-message', 
      timestamp: Date.now(),
      content: 'Hello from the demo!'
    })
  }

  const handleSyncExecution = () => {
    syncCodeExecution({
      step: 1,
      operation: 'compare',
      indices: [0, 5],
      description: 'Comparing elements at indices 0 and 5'
    })
  }

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Layout Coordination Demo</h3>
      
      {/* Current State */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Layout Mode:</strong> {layout.mode}
        </div>
        <div>
          <strong>Active Pane:</strong> {layout.activePane}
        </div>
        <div>
          <strong>Split Ratio:</strong> {layout.splitRatio.toFixed(2)}
        </div>
        <div>
          <strong>Scroll Sync:</strong> {isScrollSyncEnabled ? 'ON' : 'OFF'}
        </div>
      </div>

      {/* Focus Controls */}
      <div className="space-y-2">
        <h4 className="font-medium">Focus Controls</h4>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => focusPane('left')}
          >
            Focus Left Pane
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => focusPane('right')}
          >
            Focus Right Pane
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={focusCodeEditor}
          >
            Focus Code Editor
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={focusVisualization}
          >
            Focus Visualization
          </Button>
        </div>
      </div>

      {/* Layout Mode Controls */}
      <div className="space-y-2">
        <h4 className="font-medium">Layout Mode Controls</h4>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant={layout.mode === 'horizontal' ? 'default' : 'outline'}
            onClick={() => coordinateLayoutChange('horizontal')}
          >
            Horizontal
          </Button>
          <Button 
            size="sm" 
            variant={layout.mode === 'vertical' ? 'default' : 'outline'}
            onClick={() => coordinateLayoutChange('vertical')}
          >
            Vertical
          </Button>
          <Button 
            size="sm" 
            variant={layout.mode === 'tabbed' ? 'default' : 'outline'}
            onClick={() => coordinateLayoutChange('tabbed')}
          >
            Tabbed
          </Button>
        </div>
      </div>

      {/* Communication Controls */}
      <div className="space-y-2">
        <h4 className="font-medium">Cross-Pane Communication</h4>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleSendMessage}
          >
            Send Message
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleSyncExecution}
          >
            Sync Execution Step
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={toggleScrollSync}
          >
            Toggle Scroll Sync
          </Button>
        </div>
      </div>

      {/* Message Log */}
      <div className="space-y-2">
        <h4 className="font-medium">Message Log</h4>
        <div className="bg-muted p-3 rounded-md max-h-32 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-sm">No messages yet...</p>
          ) : (
            messages.map((message, index) => (
              <div key={index} className="text-sm font-mono">
                {message}
              </div>
            ))
          )}
        </div>
        <Button 
          size="sm" 
          variant="ghost"
          onClick={() => setMessages([])}
        >
          Clear Log
        </Button>
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="space-y-2">
        <h4 className="font-medium">Keyboard Shortcuts</h4>
        <div className="text-sm text-muted-foreground space-y-1">
          <div><kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+1</kbd> - Focus left pane</div>
          <div><kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+2</kbd> - Focus right pane</div>
          <div><kbd className="px-1 py-0.5 bg-muted rounded">F11</kbd> - Cycle layout modes</div>
          <div><kbd className="px-1 py-0.5 bg-muted rounded">Tab</kbd> - Switch panes (in tabbed mode)</div>
          <div><kbd className="px-1 py-0.5 bg-muted rounded">Escape</kbd> - Focus active pane</div>
        </div>
      </div>
    </Card>
  )
}

export default LayoutCoordinationDemo