'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface TechnicalDetail {
  id: string
  title: string
  category: 'complexity' | 'implementation' | 'optimization' | 'theory' | 'edge-cases'
  content: string
  codeExample?: string
  mathematicalNotation?: string
  relatedConcepts: string[]
  difficulty: 'intermediate' | 'advanced' | 'expert'
  concept: string
}

interface TechnicalDetailOverlayProps {
  details: TechnicalDetail[]
  currentConcept?: string
  className?: string
  defaultCategory?: string
}

const BINARY_SEARCH_TECHNICAL_DETAILS: TechnicalDetail[] = [
  {
    id: 'time-complexity-analysis',
    title: 'Time Complexity Analysis',
    category: 'complexity',
    content: 'Binary search achieves O(log n) time complexity because it eliminates half of the remaining elements with each comparison. In the worst case, we need at most ⌊log₂(n)⌋ + 1 comparisons to find an element or determine it doesn\'t exist.',
    mathematicalNotation: 'T(n) = T(n/2) + O(1) = O(log n)',
    relatedConcepts: ['divide-and-conquer', 'logarithmic-growth', 'recurrence-relations'],
    difficulty: 'intermediate',
    concept: 'binary-search'
  },
  {
    id: 'space-complexity-variants',
    title: 'Space Complexity Variants',
    category: 'complexity',
    content: 'Iterative binary search uses O(1) space complexity, while recursive implementation uses O(log n) space due to the call stack. The iterative version is generally preferred for this reason.',
    codeExample: `// Iterative: O(1) space
function binarySearchIterative(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    let mid = left + Math.floor((right - left) / 2);
    if (arr[mid] === target) return mid;
    arr[mid] < target ? left = mid + 1 : right = mid - 1;
  }
  return -1;
}

// Recursive: O(log n) space
function binarySearchRecursive(arr, target, left = 0, right = arr.length - 1) {
  if (left > right) return -1;
  let mid = left + Math.floor((right - left) / 2);
  if (arr[mid] === target) return mid;
  return arr[mid] < target 
    ? binarySearchRecursive(arr, target, mid + 1, right)
    : binarySearchRecursive(arr, target, left, mid - 1);
}`,
    relatedConcepts: ['recursion', 'call-stack', 'memory-optimization'],
    difficulty: 'intermediate',
    concept: 'binary-search'
  },
  {
    id: 'overflow-prevention',
    title: 'Integer Overflow Prevention',
    category: 'implementation',
    content: 'The naive calculation mid = (left + right) / 2 can cause integer overflow when left and right are large. The safe approach is mid = left + (right - left) / 2, which is mathematically equivalent but prevents overflow.',
    codeExample: `// Unsafe - can overflow
let mid = Math.floor((left + right) / 2);

// Safe - prevents overflow
let mid = left + Math.floor((right - left) / 2);

// Alternative safe method
let mid = Math.floor(left + (right - left) / 2);`,
    mathematicalNotation: 'mid = left + ⌊(right - left) / 2⌋',
    relatedConcepts: ['integer-overflow', 'numerical-stability', 'defensive-programming'],
    difficulty: 'advanced',
    concept: 'binary-search'
  },
  {
    id: 'boundary-conditions',
    title: 'Boundary Condition Analysis',
    category: 'edge-cases',
    content: 'Binary search has several critical boundary conditions: empty arrays, single-element arrays, target at boundaries, and target not present. Each requires careful handling to avoid infinite loops or incorrect results.',
    codeExample: `// Edge case handling
function robustBinarySearch(arr, target) {
  // Handle empty array
  if (!arr || arr.length === 0) return -1;
  
  let left = 0, right = arr.length - 1;
  
  while (left <= right) {
    // Prevent overflow
    let mid = left + Math.floor((right - left) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;  // Critical: mid + 1, not mid
    } else {
      right = mid - 1; // Critical: mid - 1, not mid
    }
  }
  
  return -1; // Not found
}`,
    relatedConcepts: ['edge-cases', 'boundary-testing', 'loop-invariants'],
    difficulty: 'intermediate',
    concept: 'binary-search'
  },
  {
    id: 'variant-algorithms',
    title: 'Binary Search Variants',
    category: 'implementation',
    content: 'Several variants exist: finding first/last occurrence of duplicates, finding insertion point, and searching in rotated arrays. Each requires slight modifications to the basic algorithm.',
    codeExample: `// Find first occurrence
function findFirst(arr, target) {
  let left = 0, right = arr.length - 1, result = -1;
  while (left <= right) {
    let mid = left + Math.floor((right - left) / 2);
    if (arr[mid] === target) {
      result = mid;
      right = mid - 1; // Continue searching left
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return result;
}

// Find insertion point
function findInsertionPoint(arr, target) {
  let left = 0, right = arr.length;
  while (left < right) {
    let mid = left + Math.floor((right - left) / 2);
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left;
}`,
    relatedConcepts: ['algorithm-variants', 'duplicate-handling', 'insertion-sort'],
    difficulty: 'advanced',
    concept: 'binary-search'
  },
  {
    id: 'performance-characteristics',
    title: 'Performance Characteristics',
    category: 'optimization',
    content: 'Binary search performance depends on memory access patterns, cache locality, and branch prediction. For very small arrays (n < 10), linear search might be faster due to lower overhead and better cache performance.',
    mathematicalNotation: 'Break-even point: n ≈ 8-12 elements (architecture dependent)',
    relatedConcepts: ['cache-locality', 'branch-prediction', 'micro-optimizations'],
    difficulty: 'expert',
    concept: 'binary-search'
  },
  {
    id: 'theoretical-foundations',
    title: 'Theoretical Foundations',
    category: 'theory',
    content: 'Binary search is optimal for comparison-based searching in sorted arrays. The information-theoretic lower bound for searching n elements is Ω(log n), which binary search achieves. This optimality proof uses decision tree analysis.',
    mathematicalNotation: 'Lower bound: Ω(log n), Upper bound: O(log n) ⟹ Θ(log n)',
    relatedConcepts: ['information-theory', 'decision-trees', 'optimality-proofs'],
    difficulty: 'expert',
    concept: 'binary-search'
  }
]

const CATEGORY_CONFIG = {
  complexity: { label: 'Complexity Analysis', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  implementation: { label: 'Implementation Details', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  optimization: { label: 'Optimizations', color: 'bg-green-100 text-green-800 border-green-200' },
  theory: { label: 'Theoretical Foundations', color: 'bg-red-100 text-red-800 border-red-200' },
  'edge-cases': { label: 'Edge Cases', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
}

export function TechnicalDetailOverlay({
  details = BINARY_SEARCH_TECHNICAL_DETAILS,
  currentConcept = 'binary-search',
  className = '',
  defaultCategory = 'complexity'
}: TechnicalDetailOverlayProps) {
  const [selectedCategory, setSelectedCategory] = React.useState(defaultCategory)
  const [selectedDetail, setSelectedDetail] = React.useState<string>('')
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set())

  const filteredDetails = details.filter(detail => detail.concept === currentConcept)
  const categories = Array.from(new Set(filteredDetails.map(detail => detail.category)))
  const categoryDetails = filteredDetails.filter(detail => detail.category === selectedCategory)

  React.useEffect(() => {
    if (categoryDetails.length > 0 && !selectedDetail) {
      setSelectedDetail(categoryDetails[0].id)
    }
  }, [selectedCategory, categoryDetails, selectedDetail])

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const currentDetail = filteredDetails.find(detail => detail.id === selectedDetail)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Category Selector */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]
          return (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category)
                setSelectedDetail('')
              }}
              className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 border ${
                selectedCategory === category
                  ? config.color + ' ring-2 ring-offset-1'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
            >
              {config.label}
            </button>
          )
        })}
      </div>

      {/* Detail Selector */}
      {categoryDetails.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {categoryDetails.map((detail) => (
            <button
              key={detail.id}
              onClick={() => setSelectedDetail(detail.id)}
              className={`px-3 py-1.5 text-xs rounded transition-all duration-200 ${
                selectedDetail === detail.id
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {detail.title}
            </button>
          ))}
        </div>
      )}

      {/* Main Technical Detail Display */}
      {currentDetail && (
        <motion.div
          key={selectedDetail}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden bg-gradient-to-br from-gray-50 to-slate-50 border-gray-300">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {currentDetail.title}
                  </h3>
                  <Badge 
                    className={CATEGORY_CONFIG[currentDetail.category].color}
                  >
                    {CATEGORY_CONFIG[currentDetail.category].label}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className={`text-xs ${
                      currentDetail.difficulty === 'intermediate' ? 'border-yellow-400 text-yellow-700' :
                      currentDetail.difficulty === 'advanced' ? 'border-orange-400 text-orange-700' :
                      'border-red-400 text-red-700'
                    }`}
                  >
                    {currentDetail.difficulty}
                  </Badge>
                </div>
              </div>

              {/* Main Content */}
              <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                <p className="text-gray-700 leading-relaxed text-base">
                  {currentDetail.content}
                </p>
              </div>

              {/* Mathematical Notation */}
              {currentDetail.mathematicalNotation && (
                <div className="bg-slate-100 rounded-lg p-4 border border-slate-200">
                  <h4 className="font-medium text-slate-800 mb-2 flex items-center gap-2">
                    <span>📐</span> Mathematical Notation
                  </h4>
                  <div className="font-mono text-slate-700 bg-white p-3 rounded border">
                    {currentDetail.mathematicalNotation}
                  </div>
                </div>
              )}

              {/* Code Example */}
              {currentDetail.codeExample && (
                <div className="space-y-2">
                  <button
                    onClick={() => toggleSection('code-' + currentDetail.id)}
                    className="flex items-center gap-2 text-gray-800 font-medium hover:text-gray-600"
                  >
                    <span>{expandedSections.has('code-' + currentDetail.id) ? '▼' : '▶'}</span>
                    <span>💻</span> Code Implementation
                  </button>
                  
                  <AnimatePresence>
                    {expandedSections.has('code-' + currentDetail.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                          <pre className="text-sm text-green-400">
                            <code>{currentDetail.codeExample}</code>
                          </pre>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Related Concepts */}
              <div className="space-y-2">
                <button
                  onClick={() => toggleSection('concepts-' + currentDetail.id)}
                  className="flex items-center gap-2 text-gray-800 font-medium hover:text-gray-600"
                >
                  <span>{expandedSections.has('concepts-' + currentDetail.id) ? '▼' : '▶'}</span>
                  <span>🔗</span> Related Concepts
                </button>
                
                <AnimatePresence>
                  {expandedSections.has('concepts-' + currentDetail.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex flex-wrap gap-2 pt-2">
                        {currentDetail.relatedConcepts.map((concept, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-white hover:bg-gray-50 cursor-pointer"
                          >
                            {concept.replace('-', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Quick Navigation */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  {categoryDetails.findIndex(d => d.id === selectedDetail) + 1} of {categoryDetails.length} in {CATEGORY_CONFIG[selectedCategory as keyof typeof CATEGORY_CONFIG].label}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentIndex = categoryDetails.findIndex(d => d.id === selectedDetail)
                      if (currentIndex > 0) {
                        setSelectedDetail(categoryDetails[currentIndex - 1].id)
                      }
                    }}
                    disabled={categoryDetails.findIndex(d => d.id === selectedDetail) === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentIndex = categoryDetails.findIndex(d => d.id === selectedDetail)
                      if (currentIndex < categoryDetails.length - 1) {
                        setSelectedDetail(categoryDetails[currentIndex + 1].id)
                      }
                    }}
                    disabled={categoryDetails.findIndex(d => d.id === selectedDetail) === categoryDetails.length - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}