'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ResponsiveLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function ResponsiveLayout({
  children,
  sidebar,
  header,
  footer,
  className
}: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setSidebarOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      {/* Header */}
      {header && (
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            {header}
            {sidebar && isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {sidebarOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </header>
      )}

      <div className="flex">
        {/* Sidebar */}
        {sidebar && (
          <>
            {/* Desktop Sidebar */}
            {!isMobile && (
              <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
                <div className="p-4">
                  {sidebar}
                </div>
              </aside>
            )}

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
              {isMobile && sidebarOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black bg-opacity-50"
                    onClick={() => setSidebarOpen(false)}
                  />
                  <motion.aside
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'tween', duration: 0.3 }}
                    className="fixed left-0 top-0 z-50 w-64 h-full bg-white border-r border-gray-200 overflow-y-auto"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Menu</h2>
                        <button
                          onClick={() => setSidebarOpen(false)}
                          className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      {sidebar}
                    </div>
                  </motion.aside>
                </>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Main Content */}
        <main className={cn(
          "flex-1 min-h-screen",
          !isMobile && sidebar ? "ml-0" : ""
        )}>
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      {footer && (
        <footer className="bg-white border-t border-gray-200">
          <div className="px-4 py-6">
            {footer}
          </div>
        </footer>
      )}
    </div>
  )
}

interface MobileOptimizedCodeEditorProps {
  children: React.ReactNode
  controls?: React.ReactNode
  results?: React.ReactNode
  className?: string
}

export function MobileOptimizedCodeEditor({
  children,
  controls,
  results,
  className
}: MobileOptimizedCodeEditorProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'results'>('editor')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!isMobile) {
    // Desktop layout - side by side
    return (
      <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6", className)}>
        <div className="space-y-4">
          {controls}
          {children}
        </div>
        {results && (
          <div className="space-y-4">
            {results}
          </div>
        )}
      </div>
    )
  }

  // Mobile layout - tabbed
  return (
    <div className={cn("space-y-4", className)}>
      {controls}
      
      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('editor')}
          className={cn(
            "flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors",
            activeTab === 'editor'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          Code Editor
        </button>
        {results && (
          <button
            onClick={() => setActiveTab('results')}
            className={cn(
              "flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors",
              activeTab === 'results'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Results
          </button>
        )}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'editor' ? children : results}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

interface TouchOptimizedControlsProps {
  children: React.ReactNode
  className?: string
}

export function TouchOptimizedControls({
  children,
  className
}: TouchOptimizedControlsProps) {
  return (
    <div className={cn(
      "flex flex-wrap gap-2 p-3 bg-white rounded-lg border border-gray-200",
      "md:gap-3 md:p-4",
      className
    )}>
      {children}
    </div>
  )
}

interface MobileButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}

export function MobileButton({
  children,
  onClick,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  className
}: MobileButtonProps) {
  const baseClasses = "font-medium rounded-lg transition-colors touch-manipulation"
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:border-gray-200 disabled:text-gray-400"
  }
  
  const sizeClasses = {
    sm: "px-3 py-2 text-sm min-h-[36px]",
    md: "px-4 py-2.5 text-sm min-h-[40px]",
    lg: "px-6 py-3 text-base min-h-[44px]"
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && "cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  )
}