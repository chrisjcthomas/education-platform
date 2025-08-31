'use client'

import { useEffect, useState } from 'react'
import { useUIStore } from '@/lib/stores/ui-store'
import { LayoutMode } from '@/lib/types'

interface ResponsiveBreakpoints {
  mobile: number
  tablet: number
  desktop: number
}

interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  width: number
  height: number
  orientation: 'portrait' | 'landscape'
  touchSupported: boolean
}

const DEFAULT_BREAKPOINTS: ResponsiveBreakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200
}

export const useResponsiveLayout = (breakpoints: ResponsiveBreakpoints = DEFAULT_BREAKPOINTS) => {
  const { setLayoutMode, layout } = useUIStore()
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: 1200,
    height: 800,
    orientation: 'landscape',
    touchSupported: false
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isMobile = width < breakpoints.mobile
      const isTablet = width >= breakpoints.mobile && width < breakpoints.tablet
      const isDesktop = width >= breakpoints.tablet
      const orientation = width > height ? 'landscape' : 'portrait'
      const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        width,
        height,
        orientation,
        touchSupported
      })

      // Auto-adjust layout mode based on device
      let newLayoutMode: LayoutMode
      
      if (isMobile) {
        newLayoutMode = 'tabbed'
      } else if (isTablet || (height < 600 && orientation === 'landscape')) {
        newLayoutMode = 'vertical'
      } else {
        newLayoutMode = 'horizontal'
      }

      if (layout.mode !== newLayoutMode) {
        setLayoutMode(newLayoutMode)
      }
    }

    // Initial check
    updateDeviceInfo()

    // Listen for resize events
    window.addEventListener('resize', updateDeviceInfo)
    
    // Listen for orientation changes
    window.addEventListener('orientationchange', () => {
      // Delay to ensure dimensions are updated
      setTimeout(updateDeviceInfo, 100)
    })

    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
      window.removeEventListener('orientationchange', updateDeviceInfo)
    }
  }, [breakpoints, layout.mode, setLayoutMode])

  return {
    deviceInfo,
    breakpoints,
    // Utility functions
    isMobileLayout: () => deviceInfo.isMobile,
    isTabletLayout: () => deviceInfo.isTablet,
    isDesktopLayout: () => deviceInfo.isDesktop,
    shouldUseVerticalLayout: () => deviceInfo.isTablet || (deviceInfo.height < 600 && deviceInfo.orientation === 'landscape'),
    shouldUseTabbedLayout: () => deviceInfo.isMobile,
    getTouchTargetSize: () => deviceInfo.touchSupported ? 44 : 32, // Minimum touch target size
    getOptimalSplitRatio: () => {
      // Provide optimal split ratios based on device
      if (deviceInfo.isMobile) return 0.5
      if (deviceInfo.isTablet) return deviceInfo.orientation === 'portrait' ? 0.4 : 0.6
      return 0.5
    }
  }
}

export default useResponsiveLayout