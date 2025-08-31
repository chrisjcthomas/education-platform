'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { useEnhancedPerformance } from '../../hooks/use-enhanced-performance'

interface BatterySavingModeProps {
  onModeChange?: (enabled: boolean) => void
  className?: string
}

interface BatteryInfo {
  level: number
  charging: boolean
  chargingTime?: number
  dischargingTime?: number
}

export function BatterySavingMode({ onModeChange, className = '' }: BatterySavingModeProps) {
  const { settings, updateSettings, metrics } = useEnhancedPerformance()
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [autoEnabled, setAutoEnabled] = useState(false)

  // Monitor battery status
  useEffect(() => {
    const monitorBattery = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery()
          setIsSupported(true)

          const updateBatteryInfo = () => {
            const info: BatteryInfo = {
              level: battery.level,
              charging: battery.charging,
              chargingTime: battery.chargingTime,
              dischargingTime: battery.dischargingTime
            }
            setBatteryInfo(info)

            // Auto-enable battery saving when battery is low and not charging
            const shouldAutoEnable = info.level < 0.2 && !info.charging
            if (shouldAutoEnable && !settings.enableBatterySaving) {
              setAutoEnabled(true)
              updateSettings({ enableBatterySaving: true })
              onModeChange?.(true)
            }
          }

          // Initial update
          updateBatteryInfo()

          // Listen for battery changes
          battery.addEventListener('levelchange', updateBatteryInfo)
          battery.addEventListener('chargingchange', updateBatteryInfo)
          battery.addEventListener('chargingtimechange', updateBatteryInfo)
          battery.addEventListener('dischargingtimechange', updateBatteryInfo)

          return () => {
            battery.removeEventListener('levelchange', updateBatteryInfo)
            battery.removeEventListener('chargingchange', updateBatteryInfo)
            battery.removeEventListener('chargingtimechange', updateBatteryInfo)
            battery.removeEventListener('dischargingtimechange', updateBatteryInfo)
          }
        } catch (error) {
          console.warn('Battery API not available:', error)
          setIsSupported(false)
        }
      } else {
        setIsSupported(false)
      }
    }

    monitorBattery()
  }, [settings.enableBatterySaving, updateSettings, onModeChange])

  const toggleBatterySaving = useCallback(() => {
    const newValue = !settings.enableBatterySaving
    updateSettings({ enableBatterySaving: newValue })
    onModeChange?.(newValue)
    
    if (!newValue) {
      setAutoEnabled(false)
    }
  }, [settings.enableBatterySaving, updateSettings, onModeChange])

  const getBatteryLevelColor = (level: number) => {
    if (level > 0.5) return 'text-green-600'
    if (level > 0.2) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getBatteryIcon = (level: number, charging: boolean) => {
    if (charging) {
      return (
        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      )
    }

    if (level > 0.75) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 8V6a6 6 0 1112 0v2h1a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2v-8a2 2 0 012-2h1zm5-6a4 4 0 00-4 4v2h8V6a4 4 0 00-4-4z" />
        </svg>
      )
    } else if (level > 0.5) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 8V6a6 6 0 1112 0v2h1a2 2 0 012 2v6a2 2 0 01-2 2H3a2 2 0 01-2-2v-6a2 2 0 012-2h1zm5-6a4 4 0 00-4 4v2h8V6a4 4 0 00-4-4z" />
        </svg>
      )
    } else if (level > 0.25) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 8V6a6 6 0 1112 0v2h1a2 2 0 012 2v4a2 2 0 01-2 2H3a2 2 0 01-2-2v-4a2 2 0 012-2h1zm5-6a4 4 0 00-4 4v2h8V6a4 4 0 00-4-4z" />
        </svg>
      )
    } else {
      return (
        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 8V6a6 6 0 1112 0v2h1a2 2 0 012 2v2a2 2 0 01-2 2H3a2 2 0 01-2-2v-2a2 2 0 012-2h1zm5-6a4 4 0 00-4 4v2h8V6a4 4 0 00-4-4z" />
        </svg>
      )
    }
  }

  const formatTime = (seconds: number) => {
    if (seconds === Infinity || isNaN(seconds)) return 'Unknown'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const getBatterySavingFeatures = () => [
    {
      name: 'Reduced Animations',
      description: 'Simplify or disable complex animations',
      enabled: settings.enableBatterySaving
    },
    {
      name: 'Lower Frame Rate',
      description: 'Target 30 FPS instead of 60 FPS',
      enabled: settings.enableBatterySaving
    },
    {
      name: 'Simplified Visuals',
      description: 'Disable shadows, blur, and parallax effects',
      enabled: settings.enableBatterySaving
    },
    {
      name: 'Reduced Complexity',
      description: 'Limit maximum elements and operations',
      enabled: settings.enableBatterySaving
    },
    {
      name: 'Background Optimization',
      description: 'Pause animations when tab is not active',
      enabled: settings.enableBatterySaving
    }
  ]

  if (!isSupported && !settings.enableBatterySaving) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
          </svg>
          <p className="text-sm">Battery API not supported on this device</p>
          <Button
            onClick={toggleBatterySaving}
            size="sm"
            variant="outline"
            className="mt-2"
          >
            Enable Battery Saving Manually
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Battery Saving Mode</h3>
          <Button
            onClick={toggleBatterySaving}
            size="sm"
            variant={settings.enableBatterySaving ? 'default' : 'outline'}
            className={settings.enableBatterySaving ? 'bg-green-500 hover:bg-green-600' : ''}
          >
            {settings.enableBatterySaving ? 'Enabled' : 'Disabled'}
          </Button>
        </div>

        {/* Battery Status */}
        {batteryInfo && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getBatteryIcon(batteryInfo.level, batteryInfo.charging)}
                <div>
                  <div className={`text-lg font-semibold ${getBatteryLevelColor(batteryInfo.level)}`}>
                    {Math.round(batteryInfo.level * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    {batteryInfo.charging ? 'Charging' : 'Discharging'}
                  </div>
                </div>
              </div>
              
              <div className="text-right text-sm text-gray-600">
                {batteryInfo.charging && batteryInfo.chargingTime && (
                  <div>Full in {formatTime(batteryInfo.chargingTime)}</div>
                )}
                {!batteryInfo.charging && batteryInfo.dischargingTime && (
                  <div>Empty in {formatTime(batteryInfo.dischargingTime)}</div>
                )}
              </div>
            </div>

            {/* Auto-enabled notification */}
            {autoEnabled && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-yellow-800">
                    Battery saving mode was automatically enabled due to low battery
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Battery Saving Features */}
        <div className="space-y-3">
          <h4 className="font-medium">Active Optimizations</h4>
          <div className="space-y-2">
            {getBatterySavingFeatures().map((feature, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div>
                  <div className="text-sm font-medium">{feature.name}</div>
                  <div className="text-xs text-gray-600">{feature.description}</div>
                </div>
                <Badge variant={feature.enabled ? 'default' : 'secondary'}>
                  {feature.enabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Impact */}
        {settings.enableBatterySaving && metrics && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium">Performance Impact</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {metrics.fps.toFixed(1)}
                  </div>
                  <div className="text-gray-600">Current FPS</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    ~30%
                  </div>
                  <div className="text-gray-600">Battery Savings</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tips */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Battery Saving Tips</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Reduce screen brightness for additional savings</li>
            <li>• Close other browser tabs and applications</li>
            <li>• Use Wi-Fi instead of cellular data when possible</li>
            <li>• Enable system-wide battery saving mode</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}

// Hook for battery-aware optimizations
export function useBatteryOptimization() {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)
  const [isCharging, setIsCharging] = useState<boolean | null>(null)
  const [isLowBattery, setIsLowBattery] = useState(false)

  useEffect(() => {
    const monitorBattery = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery()

          const updateBatteryStatus = () => {
            setBatteryLevel(battery.level)
            setIsCharging(battery.charging)
            setIsLowBattery(battery.level < 0.2 && !battery.charging)
          }

          updateBatteryStatus()

          battery.addEventListener('levelchange', updateBatteryStatus)
          battery.addEventListener('chargingchange', updateBatteryStatus)

          return () => {
            battery.removeEventListener('levelchange', updateBatteryStatus)
            battery.removeEventListener('chargingchange', updateBatteryStatus)
          }
        } catch (error) {
          console.warn('Battery monitoring failed:', error)
        }
      }
    }

    monitorBattery()
  }, [])

  const getOptimizedSettings = useCallback(() => {
    if (isLowBattery) {
      return {
        maxFPS: 30,
        animationDuration: 100,
        useSimplifiedAnimations: true,
        enableShadows: false,
        enableBlur: false,
        enableParallax: false,
        maxElements: 20
      }
    } else if (batteryLevel !== null && batteryLevel < 0.5 && !isCharging) {
      return {
        maxFPS: 45,
        animationDuration: 200,
        useSimplifiedAnimations: false,
        enableShadows: true,
        enableBlur: false,
        enableParallax: false,
        maxElements: 50
      }
    } else {
      return {
        maxFPS: 60,
        animationDuration: 300,
        useSimplifiedAnimations: false,
        enableShadows: true,
        enableBlur: true,
        enableParallax: true,
        maxElements: 100
      }
    }
  }, [batteryLevel, isCharging, isLowBattery])

  return {
    batteryLevel,
    isCharging,
    isLowBattery,
    isSupported: 'getBattery' in navigator,
    getOptimizedSettings
  }
}