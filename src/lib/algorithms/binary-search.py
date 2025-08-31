"""
Python implementation of binary search algorithm with comprehensive step tracking
for educational visualization and analysis.

This module provides a BinarySearchAlgorithm class that implements binary search
with detailed step-by-step tracking for educational purposes.
"""

from typing import List, Dict, Any, Optional, Union
import json


class BinarySearchResult:
    """Result object for binary search execution"""
    
    def __init__(self, found: bool, index: int, steps: List[Dict[str, Any]], comparisons: int):
        self.found = found
        self.index = index
        self.steps = steps
        self.comparisons = comparisons
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert result to dictionary for JSON serialization"""
        return {
            'found': self.found,
            'index': self.index,
            'steps': self.steps,
            'comparisons': self.comparisons
        }


class BinarySearchAlgorithm:
    """
    Python implementation of binary search with educational step tracking
    """
    
    def __init__(self):
        self.steps: List[Dict[str, Any]] = []
        self.comparisons = 0
    
    def execute(self, data: List[Union[int, float]], target: Union[int, float], 
                track_steps: bool = True) -> BinarySearchResult:
        """
        Execute binary search with step-by-step tracking
        
        Args:
            data: Sorted list of numbers to search in
            target: Target value to find
            track_steps: Whether to track steps for visualization
            
        Returns:
            BinarySearchResult containing found status, index, steps, and comparison count
            
        Raises:
            ValueError: If input validation fails
        """
        # Reset tracking state
        self.steps = []
        self.comparisons = 0
        
        # Input validation
        self._validate_input(data, target)
        
        if track_steps:
            self._add_step({
                'type': 'init',
                'indices': [],
                'metadata': {
                    'target': target,
                    'arrayLength': len(data),
                    'algorithm': 'binary-search',
                    'language': 'python'
                },
                'description': f'Initialize binary search for target {target} in sorted array of {len(data)} elements'
            })
        
        # Handle edge cases
        if len(data) == 0:
            if track_steps:
                self._add_step({
                    'type': 'eliminate',
                    'indices': [],
                    'metadata': {'found': False, 'reason': 'empty-array'},
                    'description': 'Array is empty - target cannot be found'
                })
            return BinarySearchResult(False, -1, self.steps, self.comparisons)
        
        # Perform binary search
        result = self._binary_search_core(data, target, track_steps)
        
        return BinarySearchResult(
            result['found'],
            result['index'],
            self.steps,
            self.comparisons
        )
    
    def _binary_search_core(self, data: List[Union[int, float]], target: Union[int, float], 
                           track_steps: bool) -> Dict[str, Any]:
        """
        Core binary search implementation with step tracking
        """
        left = 0
        right = len(data) - 1
        
        while left <= right:
            mid = (left + right) // 2
            
            if track_steps:
                # Show current search range
                self._add_step({
                    'type': 'highlight',
                    'indices': self._generate_range_indices(left, right),
                    'metadata': {
                        'left': left,
                        'right': right,
                        'mid': mid,
                        'searchRange': True,
                        'rangeSize': right - left + 1
                    },
                    'description': f'Search range: [{left}, {right}] ({right - left + 1} elements)'
                })
                
                # Show pointer positions
                self._add_step({
                    'type': 'highlight',
                    'indices': [left, mid, right],
                    'metadata': {
                        'left': left,
                        'right': right,
                        'mid': mid,
                        'pointers': {'left': left, 'mid': mid, 'right': right},
                        'leftValue': data[left],
                        'midValue': data[mid],
                        'rightValue': data[right]
                    },
                    'description': f'Pointers: left={left}({data[left]}), mid={mid}({data[mid]}), right={right}({data[right]})'
                })
            
            # Compare target with middle element
            self.comparisons += 1
            
            if track_steps:
                self._add_step({
                    'type': 'compare',
                    'indices': [mid],
                    'metadata': {
                        'left': left,
                        'right': right,
                        'mid': mid,
                        'targetValue': target,
                        'midValue': data[mid],
                        'comparison': self._get_comparison_result(target, data[mid]),
                        'comparisonCount': self.comparisons
                    },
                    'description': f'Compare: target({target}) {self._get_comparison_symbol(target, data[mid])} mid({data[mid]})'
                })
            
            if data[mid] == target:
                # Target found
                if track_steps:
                    self._add_step({
                        'type': 'found',
                        'indices': [mid],
                        'metadata': {
                            'left': left,
                            'right': right,
                            'mid': mid,
                            'found': True,
                            'targetValue': target,
                            'foundIndex': mid,
                            'totalComparisons': self.comparisons
                        },
                        'description': f'🎉 Found target {target} at index {mid} after {self.comparisons} comparisons!'
                    })
                return {'found': True, 'index': mid}
            
            elif data[mid] < target:
                # Target is in right half - eliminate left half
                if track_steps:
                    eliminated_indices = self._generate_range_indices(left, mid)
                    self._add_step({
                        'type': 'eliminate',
                        'indices': eliminated_indices,
                        'metadata': {
                            'left': left,
                            'right': right,
                            'mid': mid,
                            'eliminated': 'left',
                            'eliminatedRange': [left, mid],
                            'reason': f'{data[mid]} < {target}',
                            'remainingRange': [mid + 1, right],
                            'remainingSize': right - mid
                        },
                        'description': f'{data[mid]} < {target}: eliminate left half [{left}, {mid}], search [{mid + 1}, {right}]'
                    })
                left = mid + 1
            
            else:
                # Target is in left half - eliminate right half
                if track_steps:
                    eliminated_indices = self._generate_range_indices(mid, right)
                    self._add_step({
                        'type': 'eliminate',
                        'indices': eliminated_indices,
                        'metadata': {
                            'left': left,
                            'right': right,
                            'mid': mid,
                            'eliminated': 'right',
                            'eliminatedRange': [mid, right],
                            'reason': f'{data[mid]} > {target}',
                            'remainingRange': [left, mid - 1],
                            'remainingSize': mid - left
                        },
                        'description': f'{data[mid]} > {target}: eliminate right half [{mid}, {right}], search [{left}, {mid - 1}]'
                    })
                right = mid - 1
        
        # Target not found
        if track_steps:
            self._add_step({
                'type': 'eliminate',
                'indices': [],
                'metadata': {
                    'found': False,
                    'totalComparisons': self.comparisons,
                    'searchExhausted': True,
                    'finalLeft': left,
                    'finalRight': right
                },
                'description': f'❌ Target {target} not found after {self.comparisons} comparisons (search space exhausted)'
            })
        
        return {'found': False, 'index': -1}
    
    def _generate_range_indices(self, start: int, end: int) -> List[int]:
        """Generate list of indices for a given range"""
        return list(range(start, end + 1))
    
    def _get_comparison_result(self, target: Union[int, float], mid: Union[int, float]) -> str:
        """Get comparison result as string"""
        if target == mid:
            return 'equal'
        elif target < mid:
            return 'less'
        else:
            return 'greater'
    
    def _get_comparison_symbol(self, target: Union[int, float], mid: Union[int, float]) -> str:
        """Get comparison symbol for display"""
        if target == mid:
            return '=='
        elif target < mid:
            return '<'
        else:
            return '>'
    
    def _add_step(self, step: Dict[str, Any]) -> None:
        """Add a step to the tracking array"""
        step['operationCount'] = len(self.steps) + 1
        self.steps.append(step)
    
    def _validate_input(self, data: List[Union[int, float]], target: Union[int, float]) -> None:
        """
        Validate input parameters
        
        Raises:
            ValueError: If validation fails
        """
        if not isinstance(data, list):
            raise ValueError('Input data must be a list')
        
        if not isinstance(target, (int, float)) or not self._is_finite(target):
            raise ValueError('Target must be a finite number')
        
        # Check if array is sorted (for educational purposes)
        for i in range(1, len(data)):
            if data[i] < data[i - 1]:
                raise ValueError(f'Array must be sorted for binary search. Found {data[i]} < {data[i - 1]} at indices {i} and {i - 1}')
        
        # Check for non-numeric values
        for i, value in enumerate(data):
            if not isinstance(value, (int, float)) or not self._is_finite(value):
                raise ValueError(f'Array element at index {i} must be a finite number, got: {value}')
    
    def _is_finite(self, value: Union[int, float]) -> bool:
        """Check if a number is finite (not NaN or infinity)"""
        try:
            import math
            return math.isfinite(value)
        except (ImportError, AttributeError):
            # Fallback for older Python versions
            return isinstance(value, (int, float)) and str(value) not in ['nan', 'inf', '-inf']
    
    @staticmethod
    def get_complexity_info() -> Dict[str, str]:
        """Get algorithm complexity information"""
        return {
            'timeComplexity': 'O(log n)',
            'spaceComplexity': 'O(1)',
            'bestCase': 'O(1)',
            'worstCase': 'O(log n)',
            'averageCase': 'O(log n)',
            'description': 'Binary search divides the search space in half with each comparison, resulting in logarithmic time complexity.'
        }
    
    @staticmethod
    def generate_test_cases() -> List[Dict[str, Any]]:
        """Generate test cases for educational purposes"""
        return [
            # Basic cases
            {'data': [1, 3, 5, 7, 9], 'target': 5, 'expected': {'found': True, 'index': 2}},
            {'data': [1, 3, 5, 7, 9], 'target': 1, 'expected': {'found': True, 'index': 0}},
            {'data': [1, 3, 5, 7, 9], 'target': 9, 'expected': {'found': True, 'index': 4}},
            {'data': [1, 3, 5, 7, 9], 'target': 4, 'expected': {'found': False, 'index': -1}},
            
            # Edge cases
            {'data': [], 'target': 5, 'expected': {'found': False, 'index': -1}},
            {'data': [5], 'target': 5, 'expected': {'found': True, 'index': 0}},
            {'data': [5], 'target': 3, 'expected': {'found': False, 'index': -1}},
            
            # Larger arrays
            {'data': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'target': 7, 'expected': {'found': True, 'index': 6}},
            {'data': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'target': 11, 'expected': {'found': False, 'index': -1}},
            
            # Duplicate values
            {'data': [1, 2, 2, 2, 5], 'target': 2, 'expected': {'found': True, 'index': 1}},  # May find any occurrence
        ]


def binary_search(data: List[Union[int, float]], target: Union[int, float]) -> int:
    """
    Convenience function for simple binary search without step tracking
    
    Args:
        data: Sorted list of numbers to search in
        target: Target value to find
        
    Returns:
        Index of target if found, -1 otherwise
    """
    algorithm = BinarySearchAlgorithm()
    result = algorithm.execute(data, target, track_steps=False)
    return result.index


def binary_search_with_steps(data: List[Union[int, float]], target: Union[int, float]) -> BinarySearchResult:
    """
    Convenience function for binary search with full step tracking
    
    Args:
        data: Sorted list of numbers to search in
        target: Target value to find
        
    Returns:
        BinarySearchResult with full step tracking
    """
    algorithm = BinarySearchAlgorithm()
    return algorithm.execute(data, target, track_steps=True)


# Example usage and testing
if __name__ == '__main__':
    # Test the algorithm
    test_data = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
    target = 7
    
    algorithm = BinarySearchAlgorithm()
    result = algorithm.execute(test_data, target, track_steps=True)
    
    print(f"Binary Search Result:")
    print(f"Found: {result.found}")
    print(f"Index: {result.index}")
    print(f"Comparisons: {result.comparisons}")
    print(f"Steps: {len(result.steps)}")
    
    # Print steps for educational purposes
    for i, step in enumerate(result.steps):
        print(f"Step {i + 1}: {step['description']}")