'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  ModeSelector,
  ModeTransitionManager,
  ModeAdaptiveUI,
  ModeTypography,
  BeginnerOnly,
  CuriousOnly,
  DetailsOnly,
  CodeModes,
  ModeContentSection,
  useModeConfig,
  AnalogyDisplay,
  CodeExplanationPanel,
  TechnicalDetailOverlay,
  ContextualHelpSystem
} from '@/components/learning'

export function LearningModeDemo() {
  const config = useModeConfig()

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Learning Mode System Demo</h1>
        <p className="text-muted-foreground">
          Experience how the interface adapts to different learning preferences
        </p>
      </div>

      {/* Mode Selector */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Choose Your Learning Mode</h2>
        <ModeSelector />
      </Card>

      {/* Adaptive Content Demo */}
      <ModeTransitionManager>
        <ModeAdaptiveUI>
          <Card className="p-6">
            <ModeContentSection priority="high">
              <ModeTypography variant="heading" className="mb-4">
                Binary Search Algorithm
              </ModeTypography>
            </ModeContentSection>

            <ModeContentSection priority="normal">
              <ModeTypography variant="body" className="mb-6">
                Learn how binary search efficiently finds elements in sorted arrays.
              </ModeTypography>
            </ModeContentSection>

            <div className="grid gap-6">
              {/* Beginner Mode Content */}
              <BeginnerOnly>
                <ModeContentSection>
                  <h3 className="text-lg font-medium mb-3 text-green-800">
                    🌱 Visual Learning Experience
                  </h3>
                  <AnalogyDisplay 
                    analogies={[]}
                    currentConcept="binary-search"
                    interactive={true}
                  />
                </ModeContentSection>
              </BeginnerOnly>

              {/* Curious Mode Content */}
              <CuriousOnly>
                <ModeContentSection>
                  <h3 className="text-lg font-medium mb-3 text-blue-800">
                    🔍 Code Exploration
                  </h3>
                  <CodeExplanationPanel 
                    explanations={[]}
                    currentConcept="binary-search"
                    language="javascript"
                    interactive={true}
                  />
                </ModeContentSection>
              </CuriousOnly>

              {/* Details Mode Content */}
              <DetailsOnly>
                <ModeContentSection>
                  <h3 className="text-lg font-medium mb-3 text-purple-800">
                    ⚡ Technical Implementation
                  </h3>
                  <TechnicalDetailOverlay 
                    details={[]}
                    currentConcept="binary-search"
                    defaultCategory="complexity"
                  />
                </ModeContentSection>
              </DetailsOnly>

              {/* Code-specific features */}
              <CodeModes>
                <Card className="p-4 bg-gray-50 border-gray-200">
                  <ModeContentSection>
                    <h3 className="text-lg font-medium mb-3">Interactive Features</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <h4 className="font-medium">Available in this mode:</h4>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>✅ Code editor</li>
                          <li>✅ Step-by-step execution</li>
                          <li>✅ Variable inspection</li>
                          <li>✅ Performance metrics</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Configuration:</h4>
                        <ul className="space-y-1 text-muted-foreground text-xs">
                          <li>Animation Speed: {config.animationSpeed}x</li>
                          <li>Show Code: {config.showCode ? 'Yes' : 'No'}</li>
                          <li>Show Complexity: {config.showComplexity ? 'Yes' : 'No'}</li>
                          <li>Show Hints: {config.showHints ? 'Yes' : 'No'}</li>
                        </ul>
                      </div>
                    </div>
                  </ModeContentSection>
                </Card>
              </CodeModes>
            </div>

            <Separator className="my-6" />

            {/* Contextual Help System */}
            <ModeContentSection priority="normal">
              <h3 className="text-lg font-medium mb-4">Contextual Help & Hints</h3>
              <ContextualHelpSystem 
                helpItems={[]}
                currentContext={['binary-search', 'implementation']}
                autoShow={true}
                maxItems={2}
              />
            </ModeContentSection>

            <Separator className="my-6" />

            <ModeContentSection priority="low">
              <div className="text-center text-sm text-muted-foreground">
                The interface automatically adapts based on your selected learning mode. 
                Try switching between modes to see the differences!
              </div>
            </ModeContentSection>
          </Card>
        </ModeAdaptiveUI>
      </ModeTransitionManager>
    </div>
  )
}