import { LearningMode } from '@/lib/types'

export interface EducationalContent {
  id: string
  concept: string
  type: 'analogy' | 'code-explanation' | 'technical-detail' | 'hint' | 'example'
  title: string
  content: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  modes: LearningMode[]
  prerequisites?: string[]
  relatedConcepts?: string[]
  interactiveElements?: InteractiveElement[]
}

export interface InteractiveElement {
  id: string
  type: 'demo' | 'quiz' | 'exercise' | 'simulation'
  title: string
  description: string
  data: any
}

export interface ContentDeliveryStrategy {
  mode: LearningMode
  contentTypes: string[]
  maxConcurrentItems: number
  adaptiveHints: boolean
  progressTracking: boolean
}

export interface LearningPath {
  concept: string
  steps: LearningStep[]
  estimatedDuration: number
  prerequisites: string[]
}

export interface LearningStep {
  id: string
  title: string
  contentIds: string[]
  requiredInteractions: string[]
  completionCriteria: CompletionCriteria
}

export interface CompletionCriteria {
  timeSpent?: number
  interactionsCompleted?: number
  quizScore?: number
  demonstrationCompleted?: boolean
}

export class EducationalContentService {
  private content: Map<string, EducationalContent> = new Map()
  private strategies: Map<LearningMode, ContentDeliveryStrategy> = new Map()
  private learningPaths: Map<string, LearningPath> = new Map()

  constructor() {
    this.initializeStrategies()
    this.loadDefaultContent()
  }

  private initializeStrategies() {
    this.strategies.set('beginner', {
      mode: 'beginner',
      contentTypes: ['analogy', 'hint', 'example'],
      maxConcurrentItems: 2,
      adaptiveHints: true,
      progressTracking: true
    })

    this.strategies.set('curious', {
      mode: 'curious',
      contentTypes: ['analogy', 'code-explanation', 'hint', 'example'],
      maxConcurrentItems: 3,
      adaptiveHints: true,
      progressTracking: true
    })

    this.strategies.set('details', {
      mode: 'details',
      contentTypes: ['code-explanation', 'technical-detail', 'example'],
      maxConcurrentItems: 4,
      adaptiveHints: false,
      progressTracking: true
    })
  }

  private loadDefaultContent() {
    // Binary Search Content
    this.addContent({
      id: 'binary-search-dictionary-analogy',
      concept: 'binary-search',
      type: 'analogy',
      title: 'Dictionary Search Analogy',
      content: 'Finding a word in a dictionary is just like binary search! You open to the middle, see if your word comes before or after that page, then eliminate half the dictionary.',
      difficulty: 'beginner',
      modes: ['beginner', 'curious'],
      relatedConcepts: ['divide-and-conquer', 'logarithmic-complexity'],
      interactiveElements: [{
        id: 'dictionary-demo',
        type: 'demo',
        title: 'Interactive Dictionary Search',
        description: 'Try searching for a word using the binary search method',
        data: { words: ['apple', 'banana', 'cherry', 'date', 'elderberry'] }
      }]
    })

    this.addContent({
      id: 'binary-search-code-js',
      concept: 'binary-search',
      type: 'code-explanation',
      title: 'Binary Search Implementation (JavaScript)',
      content: 'Step-by-step breakdown of the binary search algorithm implementation',
      difficulty: 'intermediate',
      modes: ['curious', 'details'],
      prerequisites: ['basic-javascript', 'arrays'],
      interactiveElements: [{
        id: 'code-stepper',
        type: 'simulation',
        title: 'Code Step-Through',
        description: 'Step through the code execution line by line',
        data: { language: 'javascript' }
      }]
    })

    this.addContent({
      id: 'binary-search-complexity',
      concept: 'binary-search',
      type: 'technical-detail',
      title: 'Time and Space Complexity Analysis',
      content: 'Deep dive into the mathematical analysis of binary search complexity',
      difficulty: 'advanced',
      modes: ['details'],
      prerequisites: ['big-o-notation', 'logarithms'],
      relatedConcepts: ['divide-and-conquer', 'recurrence-relations']
    })

    // Create learning path
    this.addLearningPath({
      concept: 'binary-search',
      steps: [
        {
          id: 'understand-concept',
          title: 'Understand the Concept',
          contentIds: ['binary-search-dictionary-analogy'],
          requiredInteractions: ['dictionary-demo'],
          completionCriteria: { timeSpent: 120, demonstrationCompleted: true }
        },
        {
          id: 'explore-code',
          title: 'Explore the Code',
          contentIds: ['binary-search-code-js'],
          requiredInteractions: ['code-stepper'],
          completionCriteria: { interactionsCompleted: 5 }
        },
        {
          id: 'analyze-complexity',
          title: 'Analyze Complexity',
          contentIds: ['binary-search-complexity'],
          requiredInteractions: [],
          completionCriteria: { timeSpent: 300 }
        }
      ],
      estimatedDuration: 900, // 15 minutes
      prerequisites: ['basic-programming']
    })
  }

  addContent(content: EducationalContent) {
    this.content.set(content.id, content)
  }

  addLearningPath(path: LearningPath) {
    this.learningPaths.set(path.concept, path)
  }

  getContentForMode(concept: string, mode: LearningMode): EducationalContent[] {
    const strategy = this.strategies.get(mode)
    if (!strategy) return []

    return Array.from(this.content.values())
      .filter(content => 
        content.concept === concept &&
        content.modes.includes(mode) &&
        strategy.contentTypes.includes(content.type)
      )
      .sort((a, b) => {
        // Sort by difficulty and relevance
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 }
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
      })
      .slice(0, strategy.maxConcurrentItems)
  }

  getAdaptiveContent(
    concept: string, 
    mode: LearningMode, 
    userProgress: any,
    strugglingAreas: string[] = []
  ): EducationalContent[] {
    const baseContent = this.getContentForMode(concept, mode)
    const strategy = this.strategies.get(mode)
    
    if (!strategy?.adaptiveHints) {
      return baseContent
    }

    // Add remedial content for struggling areas
    const remedialContent = Array.from(this.content.values())
      .filter(content => 
        strugglingAreas.some(area => content.relatedConcepts?.includes(area)) &&
        content.difficulty === 'beginner'
      )

    // Combine and deduplicate
    const allContent = [...baseContent, ...remedialContent]
    const uniqueContent = allContent.filter((content, index, self) => 
      index === self.findIndex(c => c.id === content.id)
    )

    return uniqueContent.slice(0, strategy.maxConcurrentItems + 1)
  }

  getLearningPath(concept: string): LearningPath | undefined {
    return this.learningPaths.get(concept)
  }

  getNextStep(concept: string, completedSteps: string[]): LearningStep | undefined {
    const path = this.getLearningPath(concept)
    if (!path) return undefined

    return path.steps.find(step => !completedSteps.includes(step.id))
  }

  validatePrerequisites(contentId: string, completedConcepts: string[]): boolean {
    const content = this.content.get(contentId)
    if (!content?.prerequisites) return true

    return content.prerequisites.every(prereq => completedConcepts.includes(prereq))
  }

  getRelatedContent(contentId: string, mode: LearningMode): EducationalContent[] {
    const content = this.content.get(contentId)
    if (!content?.relatedConcepts) return []

    return Array.from(this.content.values())
      .filter(c => 
        c.id !== contentId &&
        c.modes.includes(mode) &&
        content.relatedConcepts?.some(concept => c.relatedConcepts?.includes(concept))
      )
      .slice(0, 3)
  }

  generatePersonalizedHints(
    concept: string,
    userBehavior: {
      timeSpent: number
      interactionCount: number
      helpRequests: number
      completedSections: string[]
    }
  ): string[] {
    const hints: string[] = []

    // Time-based hints
    if (userBehavior.timeSpent > 600) { // 10 minutes
      hints.push("You've been working hard! Consider taking a short break to help retention.")
    }

    // Interaction-based hints
    if (userBehavior.interactionCount < 3 && userBehavior.timeSpent > 120) {
      hints.push("Try interacting with the examples and demos to better understand the concept.")
    }

    // Help request patterns
    if (userBehavior.helpRequests > 5) {
      hints.push("It looks like this concept is challenging. Consider switching to an easier learning mode.")
    }

    // Progress-based hints
    if (userBehavior.completedSections.length === 0 && userBehavior.timeSpent > 180) {
      hints.push("Try focusing on one section at a time to make steady progress.")
    }

    return hints
  }

  trackContentEngagement(contentId: string, engagementData: {
    timeSpent: number
    interactionsCompleted: string[]
    completionStatus: 'started' | 'in-progress' | 'completed'
    userRating?: number
  }) {
    // This would typically save to a database or analytics service
    console.log(`Content engagement tracked for ${contentId}:`, engagementData)
  }

  getContentAnalytics(concept: string): {
    totalContent: number
    averageEngagementTime: number
    completionRate: number
    popularContent: string[]
  } {
    // This would typically query from analytics data
    return {
      totalContent: this.content.size,
      averageEngagementTime: 240, // 4 minutes average
      completionRate: 0.75, // 75% completion rate
      popularContent: ['binary-search-dictionary-analogy', 'binary-search-code-js']
    }
  }
}

// Singleton instance
export const educationalContentService = new EducationalContentService()