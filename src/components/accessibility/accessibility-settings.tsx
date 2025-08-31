'use client';

import React from 'react';
import { Settings, Eye, Volume2, Keyboard, Palette, Type } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useAccessibility } from '../../hooks/use-accessibility';
import { AccessibilityPreferences } from '../../lib/services/accessibility-service';

interface AccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function AccessibilitySettings({ isOpen, onClose, className = '' }: AccessibilitySettingsProps) {
  const { preferences, updatePreferences, announce } = useAccessibility();

  if (!isOpen || !preferences) {
    return null;
  }

  const handleToggle = (key: keyof AccessibilityPreferences, value: any) => {
    updatePreferences({ [key]: value });
    announce(`${key} ${value ? 'enabled' : 'disabled'}`, 'polite');
  };

  const handleFontSizeChange = (size: AccessibilityPreferences['fontSize']) => {
    updatePreferences({ fontSize: size });
    announce(`Font size changed to ${size}`, 'polite');
  };

  const handleFocusStyleChange = (style: AccessibilityPreferences['focusIndicatorStyle']) => {
    updatePreferences({ focusIndicatorStyle: style });
    announce(`Focus indicator style changed to ${style}`, 'polite');
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}>
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Accessibility Settings</h2>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              aria-label="Close accessibility settings"
            >
              ×
            </Button>
          </div>

          {/* Visual Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Visual Settings
            </h3>
            
            <div className="space-y-4">
              {/* High Contrast Mode */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">High Contrast Mode</div>
                  <div className="text-sm text-gray-600">
                    Increases contrast for better visibility
                  </div>
                </div>
                <Button
                  variant={preferences.highContrastMode ? "default" : "outline"}
                  onClick={() => handleToggle('highContrastMode', !preferences.highContrastMode)}
                  aria-pressed={preferences.highContrastMode}
                >
                  {preferences.highContrastMode ? 'On' : 'Off'}
                </Button>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Reduce Motion</div>
                  <div className="text-sm text-gray-600">
                    Minimizes animations and transitions
                  </div>
                </div>
                <Button
                  variant={preferences.reducedMotion ? "default" : "outline"}
                  onClick={() => handleToggle('reducedMotion', !preferences.reducedMotion)}
                  aria-pressed={preferences.reducedMotion}
                >
                  {preferences.reducedMotion ? 'On' : 'Off'}
                </Button>
              </div>

              {/* Font Size */}
              <div className="p-3 border rounded-lg">
                <div className="font-medium mb-3 flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Font Size
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(['small', 'medium', 'large', 'extra-large'] as const).map((size) => (
                    <Button
                      key={size}
                      variant={preferences.fontSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFontSizeChange(size)}
                      aria-pressed={preferences.fontSize === size}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1).replace('-', ' ')}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Focus Indicator Style */}
              <div className="p-3 border rounded-lg">
                <div className="font-medium mb-3">Focus Indicator Style</div>
                <div className="flex gap-2 flex-wrap">
                  {(['default', 'high-contrast', 'thick'] as const).map((style) => (
                    <Button
                      key={style}
                      variant={preferences.focusIndicatorStyle === style ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFocusStyleChange(style)}
                      aria-pressed={preferences.focusIndicatorStyle === style}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1).replace('-', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Navigation Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Navigation Settings
            </h3>
            
            <div className="space-y-4">
              {/* Keyboard Navigation Only */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Keyboard Navigation Only</div>
                  <div className="text-sm text-gray-600">
                    Optimizes interface for keyboard-only navigation
                  </div>
                </div>
                <Button
                  variant={preferences.keyboardNavigationOnly ? "default" : "outline"}
                  onClick={() => handleToggle('keyboardNavigationOnly', !preferences.keyboardNavigationOnly)}
                  aria-pressed={preferences.keyboardNavigationOnly}
                >
                  {preferences.keyboardNavigationOnly ? 'On' : 'Off'}
                </Button>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Screen Reader Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Screen Reader Settings
            </h3>
            
            <div className="space-y-4">
              {/* Screen Reader Support */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Enhanced Screen Reader Support</div>
                  <div className="text-sm text-gray-600">
                    Provides detailed announcements for algorithm steps
                  </div>
                </div>
                <Button
                  variant={preferences.screenReaderEnabled ? "default" : "outline"}
                  onClick={() => handleToggle('screenReaderEnabled', !preferences.screenReaderEnabled)}
                  aria-pressed={preferences.screenReaderEnabled}
                >
                  {preferences.screenReaderEnabled ? 'On' : 'Off'}
                </Button>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Keyboard Shortcuts Reference */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Keyboard Shortcuts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span>Play/Pause Algorithm</span>
                <Badge variant="outline">Space</Badge>
              </div>
              <div className="flex justify-between">
                <span>Step Forward</span>
                <Badge variant="outline">→</Badge>
              </div>
              <div className="flex justify-between">
                <span>Step Backward</span>
                <Badge variant="outline">←</Badge>
              </div>
              <div className="flex justify-between">
                <span>Reset Algorithm</span>
                <Badge variant="outline">R</Badge>
              </div>
              <div className="flex justify-between">
                <span>Toggle Speed</span>
                <Badge variant="outline">S</Badge>
              </div>
              <div className="flex justify-between">
                <span>Help</span>
                <Badge variant="outline">?</Badge>
              </div>
              <div className="flex justify-between">
                <span>Navigate Elements</span>
                <Badge variant="outline">Tab</Badge>
              </div>
              <div className="flex justify-between">
                <span>Activate Element</span>
                <Badge variant="outline">Enter</Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={() => {
                // Reset to defaults
                updatePreferences({
                  screenReaderEnabled: false,
                  highContrastMode: false,
                  reducedMotion: false,
                  keyboardNavigationOnly: false,
                  fontSize: 'medium',
                  focusIndicatorStyle: 'default'
                });
                announce('Settings reset to defaults', 'polite');
              }}
              variant="outline"
              className="flex-1"
            >
              Reset to Defaults
            </Button>
            <Button
              onClick={onClose}
              className="flex-1"
            >
              Done
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}