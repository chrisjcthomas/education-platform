'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { usePerformanceAdaptation } from '../../hooks/use-enhanced-performance'

interface ProgressiveEnhancementProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireFeatures?: FeatureRequirement[]
  className?: string
}

interface FeatureRequirement {
  name: string
  check: () => boolean
  fallback?: React.ReactNode
}

interface FeatureSupport {
  webgl: boolean
  webgl2: boolean
  webAssembly: boolean
  intersectionObserver: boolean
  resizeObserver: boolean
  requestIdleCallback: boolean
  webWorkers: boolean
  serviceWorker: boolean
  localStorage: boolean
  sessionStorage: boolean
  indexedDB: boolean
  geolocation: boolean
  deviceMotion: boolean
  vibration: boolean
  fullscreen: boolean
  pictureInPicture: boolean
  webRTC: boolean
  mediaRecorder: boolean
  speechRecognition: boolean
  speechSynthesis: boolean
}

export function ProgressiveEnhancement({
  children,
  fallback,
  requireFeatures = [],
  className = ''
}: ProgressiveEnhancementProps) {
  const { deviceCapabilities, isLowEnd, isMobile } = usePerformanceAdaptation()
  const [featureSupport, setFeatureSupport] = useState<FeatureSupport | null>(null)
  const [canRender, setCanRender] = useState(false)

  // Detect feature support
  useEffect(() => {
    const detectFeatures = (): FeatureSupport => {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl')
      const gl2 = canvas.getContext('webgl2')

      return {
        webgl: !!gl,
        webgl2: !!gl2,
        webAssembly: typeof WebAssembly !== 'undefined',
        intersectionObserver: 'IntersectionObserver' in window,
        resizeObserver: 'ResizeObserver' in window,
        requestIdleCallback: 'requestIdleCallback' in window,
        webWorkers: typeof Worker !== 'undefined',
        serviceWorker: 'serviceWorker' in navigator,
        localStorage: (() => {
          try {
            const test = '__test__'
            localStorage.setItem(test, test)
            localStorage.removeItem(test)
            return true
          } catch {
            return false
          }
        })(),
        sessionStorage: (() => {
          try {
            const test = '__test__'
            sessionStorage.setItem(test, test)
            sessionStorage.removeItem(test)
            return true
          } catch {
            return false
          }
        })(),
        indexedDB: 'indexedDB' in window,
        geolocation: 'geolocation' in navigator,
        deviceMotion: 'DeviceMotionEvent' in window,
        vibration: 'vibrate' in navigator,
        fullscreen: 'requestFullscreen' in document.documentElement,
        pictureInPicture: 'pictureInPictureEnabled' in document,
        webRTC: 'RTCPeerConnection' in window,
        mediaRecorder: 'MediaRecorder' in window,
        speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
        speechSynthesis: 'speechSynthesis' in window
      }
    }

    const features = detectFeatures()
    setFeatureSupport(features)

    // Check if all required features are supported
    const allRequiredSupported = requireFeatures.every(req => req.check())
    setCanRender(allRequiredSupported)
  }, [requireFeatures])

  if (!featureSupport) {
    return <div className={className}>Loading...</div>
  }

  if (!canRender && fallback) {
    return <div className={className}>{fallback}</div>
  }

  if (!canRender) {
    return (
      <div className={`${className} p-4 text-center text-gray-500`}>
        <p>This feature requires capabilities not available on your device.</p>
      </div>
    )
  }

  return <div className={className}>{children}</div>
}

// Feature-specific enhancement components
export function WebGLEnhancement({ 
  children, 
  fallback,
  requireWebGL2 = false 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode
  requireWebGL2?: boolean
}) {
  const requirements: FeatureRequirement[] = [
    {
      name: 'webgl',
      check: () => {
        const canvas = document.createElement('canvas')
        const context = requireWebGL2 
          ? canvas.getContext('webgl2')
          : canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        return !!context
      }
    }
  ]

  return (
    <ProgressiveEnhancement requireFeatures={requirements} fallback={fallback}>
      {children}
    </ProgressiveEnhancement>
  )
}

export function WebAssemblyEnhancement({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const requirements: FeatureRequirement[] = [
    {
      name: 'webassembly',
      check: () => typeof WebAssembly !== 'undefined'
    }
  ]

  return (
    <ProgressiveEnhancement requireFeatures={requirements} fallback={fallback}>
      {children}
    </ProgressiveEnhancement>
  )
}

export function IntersectionObserverEnhancement({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const requirements: FeatureRequirement[] = [
    {
      name: 'intersectionObserver',
      check: () => 'IntersectionObserver' in window
    }
  ]

  return (
    <ProgressiveEnhancement requireFeatures={requirements} fallback={fallback}>
      {children}
    </ProgressiveEnhancement>
  )
}

export function DesktopOnlyEnhancement({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { isMobile } = usePerformanceAdaptation()

  if (isMobile) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}

export function HighPerformanceEnhancement({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { isLowEnd, shouldUseFallback } = usePerformanceAdaptation()

  if (isLowEnd || shouldUseFallback) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}

// Hook for progressive enhancement
export function useProgressiveEnhancement() {
  const { deviceCapabilities, isMobile, isLowEnd } = usePerformanceAdaptation()
  const [featureSupport, setFeatureSupport] = useState<Partial<FeatureSupport>>({})

  useEffect(() => {
    // Detect features asynchronously to avoid blocking
    const detectFeatures = async () => {
      const features: Partial<FeatureSupport> = {}

      // Basic feature detection
      features.webgl = deviceCapabilities.supportedFeatures.webgl
      features.webgl2 = deviceCapabilities.supportedFeatures.webgl2
      features.webAssembly = deviceCapabilities.supportedFeatures.webAssembly
      features.intersectionObserver = deviceCapabilities.supportedFeatures.intersectionObserver
      features.resizeObserver = deviceCapabilities.supportedFeatures.resizeObserver

      // Additional features
      features.requestIdleCallback = 'requestIdleCallback' in window
      features.webWorkers = typeof Worker !== 'undefined'
      features.serviceWorker = 'serviceWorker' in navigator
      features.fullscreen = 'requestFullscreen' in document.documentElement
      features.vibration = 'vibrate' in navigator

      // Storage features
      try {
        const test = '__test__'
        localStorage.setItem(test, test)
        localStorage.removeItem(test)
        features.localStorage = true
      } catch {
        features.localStorage = false
      }

      setFeatureSupport(features)
    }

    detectFeatures()
  }, [deviceCapabilities])

  const getEnhancementLevel = useCallback((): 'basic' | 'enhanced' | 'premium' => {
    if (isLowEnd || isMobile) {
      return 'basic'
    } else if (featureSupport.webgl && featureSupport.webAssembly) {
      return 'premium'
    } else {
      return 'enhanced'
    }
  }, [isLowEnd, isMobile, featureSupport])

  const shouldEnableFeature = useCallback((feature: keyof FeatureSupport): boolean => {
    const level = getEnhancementLevel()
    
    // Basic features available on all levels
    const basicFeatures: (keyof FeatureSupport)[] = [
      'localStorage', 'sessionStorage', 'intersectionObserver'
    ]
    
    // Enhanced features for medium-performance devices
    const enhancedFeatures: (keyof FeatureSupport)[] = [
      ...basicFeatures, 'webWorkers', 'resizeObserver', 'requestIdleCallback'
    ]
    
    // Premium features for high-performance devices
    const premiumFeatures: (keyof FeatureSupport)[] = [
      ...enhancedFeatures, 'webgl', 'webgl2', 'webAssembly', 'fullscreen', 'pictureInPicture'
    ]

    switch (level) {
      case 'basic':
        return basicFeatures.includes(feature) && (featureSupport[feature] ?? false)
      case 'enhanced':
        return enhancedFeatures.includes(feature) && (featureSupport[feature] ?? false)
      case 'premium':
        return premiumFeatures.includes(feature) && (featureSupport[feature] ?? false)
      default:
        return false
    }
  }, [getEnhancementLevel, featureSupport])

  const getOptimalFeatureSet = useCallback(() => {
    const level = getEnhancementLevel()
    
    return {
      level,
      animations: level === 'premium' ? 'full' : level === 'enhanced' ? 'reduced' : 'minimal',
      visualEffects: level === 'premium',
      webgl: shouldEnableFeature('webgl'),
      webAssembly: shouldEnableFeature('webAssembly'),
      webWorkers: shouldEnableFeature('webWorkers'),
      advancedInteractions: level !== 'basic',
      offlineSupport: shouldEnableFeature('serviceWorker'),
      fullscreen: shouldEnableFeature('fullscreen')
    }
  }, [getEnhancementLevel, shouldEnableFeature])

  return {
    featureSupport,
    enhancementLevel: getEnhancementLevel(),
    shouldEnableFeature,
    getOptimalFeatureSet,
    isMobile,
    isLowEnd,
    deviceCapabilities
  }
}

// Component for feature detection display (development/debugging)
export function FeatureDetectionDisplay() {
  const { featureSupport, enhancementLevel, getOptimalFeatureSet } = useProgressiveEnhancement()
  const optimalFeatures = getOptimalFeatureSet()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-xs">
        <h4 className="font-semibold mb-2">Feature Detection</h4>
        <div className="space-y-1">
          <div>Enhancement Level: <strong>{enhancementLevel}</strong></div>
          <div>Animations: <strong>{optimalFeatures.animations}</strong></div>
          <div>Visual Effects: <strong>{optimalFeatures.visualEffects ? 'Yes' : 'No'}</strong></div>
        </div>
        
        <details className="mt-2">
          <summary className="cursor-pointer font-medium">Feature Support</summary>
          <div className="mt-1 space-y-1">
            {Object.entries(featureSupport).map(([feature, supported]) => (
              <div key={feature} className="flex justify-between">
                <span>{feature}:</span>
                <span className={supported ? 'text-green-600' : 'text-red-600'}>
                  {supported ? '✓' : '✗'}
                </span>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  )
}