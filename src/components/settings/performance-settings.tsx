'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { 
  enhancedPerformanceMonitor, 
  type PerformanceSettings,
  type DeviceCapabilities,
  type EnhancedPerformanceMetrics
} from '../../lib/monitoring/enhanced-performance-monitor'

interface PerformanceSettingsProps {
  onSettingsChange?: (settings: PerformanceSettings) => void
}

export function PerformanceSettings({ onSettingsChange }: PerformanceSettingsProps) {
  const [settings, setSettings] = useState<PerformanceSettings>(
    enhancedPerformanceMonitor.getSettings()
  )
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities>(
    enhancedPerformanceMonitor.getDeviceCapabilities()
  )
  const [currentMetrics, setCurrentMetrics] = useState<EnhancedPerformanceMetrics | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)

  useEffect(() => {
    // Subscribe to performance updates
    const unsubscribe = enhancedPerformanceMonitor.onUpdate((metrics) => {
      setCurrentMetrics(metrics)
    })

    return unsubscribe
  }, [])

  const handleSettingChange = (key: keyof PerformanceSettings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    enhancedPerformanceMonitor.updateSettings(newSettings)
    onSettingsChange?.(newSettings)
  }

  const startMonitoring = () => {
    enhancedPerformanceMonitor.start()
    setIsMonitoring(true)
  }

  const stopMonitoring = () => {
    enhancedPerformanceMonitor.stop()
    setIsMonitoring(false)
    setCurrentMetrics(null)
  }

  const forceGarbageCollection = () => {
    enhancedPerformanceMonitor.forceGarbageCollection()
  }

  const getPerformanceLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDeviceTypeColor = (isLowEnd: boolean) => {
    return isLowEnd ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
  }

  return (
    <div className="space-y-6">
      {/* Device Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Device Capabilities</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {deviceCapabilities.deviceMemory}GB
            </div>
            <div className="text-sm text-gray-600">Memory</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {deviceCapabilities.hardwareConcurrency}
            </div>
            <div className="text-sm text-gray-600">CPU Cores</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {deviceCapabilities.maxTouchPoints}
            </div>
            <div className="text-sm text-gray-600">Touch Points</div>
          </div>
          <div className="text-center">
            <Badge className={getDeviceTypeColor(deviceCapabilities.isLowEnd)}>
              {deviceCapabilities.isLowEnd ? 'Low-End' : 'High-End'}
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant={deviceCapabilities.isMobile ? 'default' : 'secondary'}>
            {deviceCapabilities.isMobile ? 'Mobile' : 'Desktop'}
          </Badge>
          <Badge variant={deviceCapabilities.supportedFeatures.webgl ? 'default' : 'secondary'}>
            WebGL {deviceCapabilities.supportedFeatures.webgl ? '✓' : '✗'}
          </Badge>
          <Badge variant={deviceCapabilities.supportedFeatures.webgl2 ? 'default' : 'secondary'}>
            WebGL2 {deviceCapabilities.supportedFeatures.webgl2 ? '✓' : '✗'}
          </Badge>
          <Badge variant={deviceCapabilities.supportedFeatures.webAssembly ? 'default' : 'secondary'}>
            WebAssembly {deviceCapabilities.supportedFeatures.webAssembly ? '✓' : '✗'}
          </Badge>
        </div>
      </Card>

      {/* Performance Monitoring */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Performance Monitoring</h3>
          <div className="flex gap-2">
            <Button
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              variant={isMonitoring ? 'destructive' : 'default'}
              size="sm"
            >
              {isMonitoring ? 'Stop' : 'Start'} Monitoring
            </Button>
            <Button onClick={forceGarbageCollection} variant="outline" size="sm">
              Clean Memory
            </Button>
          </div>
        </div>

        {currentMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {currentMetrics.fps.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">FPS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {currentMetrics.frameDrops}
              </div>
              <div className="text-sm text-gray-600">Frame Drops</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {currentMetrics.memoryUsage.toFixed(1)}MB
              </div>
              <div className="text-sm text-gray-600">Memory</div>
            </div>
            <div className="text-center">
              <Badge className={getPerformanceLevelColor(currentMetrics.performanceLevel)}>
                {currentMetrics.performanceLevel.toUpperCase()}
              </Badge>
            </div>
          </div>
        )}

        {currentMetrics?.batteryLevel !== undefined && (
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Battery:</span>
              <span className="text-sm">{(currentMetrics.batteryLevel * 100).toFixed(0)}%</span>
              {currentMetrics.isCharging && (
                <Badge variant="outline" className="text-xs">Charging</Badge>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Performance Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Settings</h3>
        
        <div className="space-y-4">
          {/* Auto Fallback */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Auto Performance Fallback</label>
              <p className="text-xs text-gray-600">
                Automatically reduce quality when performance drops
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableAutoFallback}
              onChange={(e) => handleSettingChange('enableAutoFallback', e.target.checked)}
              className="h-4 w-4"
            />
          </div>

          <Separator />

          {/* FPS Threshold */}
          <div>
            <label className="text-sm font-medium block mb-2">
              FPS Threshold: {settings.fpsThreshold}
            </label>
            <input
              type="range"
              min="15"
              max="60"
              value={settings.fpsThreshold}
              onChange={(e) => handleSettingChange('fpsThreshold', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>15 FPS</span>
              <span>60 FPS</span>
            </div>
          </div>

          {/* Memory Threshold */}
          <div>
            <label className="text-sm font-medium block mb-2">
              Memory Threshold: {settings.memoryThreshold}MB
            </label>
            <input
              type="range"
              min="25"
              max="200"
              value={settings.memoryThreshold}
              onChange={(e) => handleSettingChange('memoryThreshold', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>25 MB</span>
              <span>200 MB</span>
            </div>
          </div>

          {/* Animation Quality */}
          <div>
            <label className="text-sm font-medium block mb-2">Animation Quality</label>
            <select
              value={settings.animationQuality}
              onChange={(e) => handleSettingChange('animationQuality', e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="auto">Auto (Recommended)</option>
              <option value="high">High Quality</option>
              <option value="medium">Medium Quality</option>
              <option value="low">Low Quality</option>
            </select>
          </div>

          <Separator />

          {/* Battery Saving */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Battery Saving Mode</label>
              <p className="text-xs text-gray-600">
                Reduce animations and effects to save battery
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableBatterySaving}
              onChange={(e) => handleSettingChange('enableBatterySaving', e.target.checked)}
              className="h-4 w-4"
            />
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Reduced Motion</label>
              <p className="text-xs text-gray-600">
                Minimize animations for accessibility
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableReducedMotion}
              onChange={(e) => handleSettingChange('enableReducedMotion', e.target.checked)}
              className="h-4 w-4"
            />
          </div>
        </div>
      </Card>

      {/* Optimal Settings Preview */}
      {currentMetrics && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Current Optimal Settings</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(() => {
              const optimal = enhancedPerformanceMonitor.getOptimalSettings()
              return (
                <>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {optimal.maxElements}
                    </div>
                    <div className="text-sm text-gray-600">Max Elements</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      {optimal.animationDuration}ms
                    </div>
                    <div className="text-sm text-gray-600">Animation Duration</div>
                  </div>
                  <div className="text-center">
                    <Badge variant={optimal.useSimplifiedAnimations ? 'destructive' : 'default'}>
                      {optimal.useSimplifiedAnimations ? 'Simplified' : 'Full'} Animations
                    </Badge>
                  </div>
                </>
              )
            })()}
          </div>
        </Card>
      )}
    </div>
  )
}