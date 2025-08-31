import { LayoutMode } from '@/lib/types'

interface LayoutPreferences {
  splitRatio: number
  preferredMode?: LayoutMode
  lastActivePane: 'left' | 'right'
  customBreakpoints?: {
    mobile: number
    tablet: number
    desktop: number
  }
}

const STORAGE_KEY = 'dual-pane-layout-preferences'

export class LayoutPersistence {
  private static instance: LayoutPersistence
  private preferences: LayoutPreferences

  private constructor() {
    this.preferences = this.loadPreferences()
  }

  static getInstance(): LayoutPersistence {
    if (!LayoutPersistence.instance) {
      LayoutPersistence.instance = new LayoutPersistence()
    }
    return LayoutPersistence.instance
  }

  private loadPreferences(): LayoutPreferences {
    if (typeof window === 'undefined') {
      return this.getDefaultPreferences()
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return { ...this.getDefaultPreferences(), ...parsed }
      }
    } catch (error) {
      console.warn('Failed to load layout preferences:', error)
    }

    return this.getDefaultPreferences()
  }

  private getDefaultPreferences(): LayoutPreferences {
    return {
      splitRatio: 0.5,
      lastActivePane: 'left',
      customBreakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1200
      }
    }
  }

  savePreferences(preferences: Partial<LayoutPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences }
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences))
      } catch (error) {
        console.warn('Failed to save layout preferences:', error)
      }
    }
  }

  getPreferences(): LayoutPreferences {
    return { ...this.preferences }
  }

  getSplitRatio(): number {
    return this.preferences.splitRatio
  }

  setSplitRatio(ratio: number): void {
    const clampedRatio = Math.max(0.1, Math.min(0.9, ratio))
    this.savePreferences({ splitRatio: clampedRatio })
  }

  getLastActivePane(): 'left' | 'right' {
    return this.preferences.lastActivePane
  }

  setLastActivePane(pane: 'left' | 'right'): void {
    this.savePreferences({ lastActivePane: pane })
  }

  getPreferredMode(): LayoutMode | undefined {
    return this.preferences.preferredMode
  }

  setPreferredMode(mode: LayoutMode): void {
    this.savePreferences({ preferredMode: mode })
  }

  getCustomBreakpoints() {
    return this.preferences.customBreakpoints
  }

  setCustomBreakpoints(breakpoints: { mobile: number; tablet: number; desktop: number }): void {
    this.savePreferences({ customBreakpoints: breakpoints })
  }

  reset(): void {
    this.preferences = this.getDefaultPreferences()
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (error) {
        console.warn('Failed to reset layout preferences:', error)
      }
    }
  }

  // Utility methods for common layout calculations
  calculateOptimalSplitRatio(containerWidth: number, containerHeight: number, mode: LayoutMode): number {
    const aspectRatio = containerWidth / containerHeight
    
    switch (mode) {
      case 'horizontal':
        // For horizontal layout, prefer slightly more space for code on wider screens
        return aspectRatio > 1.5 ? 0.55 : 0.5
      case 'vertical':
        // For vertical layout, prefer more space for visualization on taller screens
        return aspectRatio < 0.8 ? 0.45 : 0.5
      case 'tabbed':
        // Tabbed layout doesn't use split ratio
        return 0.5
      default:
        return this.getSplitRatio()
    }
  }

  shouldAutoAdjustSplit(currentRatio: number, optimalRatio: number): boolean {
    const threshold = 0.1 // 10% difference threshold
    return Math.abs(currentRatio - optimalRatio) > threshold
  }
}

// Export singleton instance
export const layoutPersistence = LayoutPersistence.getInstance()

// Hook for React components
export const useLayoutPersistence = () => {
  return layoutPersistence
}