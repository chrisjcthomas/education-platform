// Demo script to test the binary search implementation
// Run with: node demo-binary-search.js

const { BinarySearchAlgorithm, binarySearch, binarySearchWithSteps } = require('./src/lib/algorithms/binary-search.ts');

async function demonstrateBinarySearch() {
  console.log('🔍 Binary Search Algorithm Demonstration\n');

  // Test data
  const testData = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const target = 7;

  console.log(`Array: [${testData.join(', ')}]`);
  console.log(`Target: ${target}\n`);

  try {
    // Test 1: Simple binary search
    console.log('1. Simple Binary Search:');
    const simpleResult = await binarySearch(testData, target);
    console.log(`   Found at index: ${simpleResult}\n`);

    // Test 2: Binary search with step tracking
    console.log('2. Binary Search with Step Tracking:');
    const detailedResult = await binarySearchWithSteps(testData, target);
    console.log(`   Found: ${detailedResult.found}`);
    console.log(`   Index: ${detailedResult.index}`);
    console.log(`   Comparisons: ${detailedResult.comparisons}`);
    console.log(`   Steps: ${detailedResult.steps.length}\n`);

    // Test 3: Show algorithm steps
    console.log('3. Algorithm Steps:');
    detailedResult.steps.forEach((step, index) => {
      console.log(`   Step ${index + 1}: ${step.description}`);
    });

    // Test 4: Algorithm complexity info
    console.log('\n4. Algorithm Complexity:');
    const complexityInfo = BinarySearchAlgorithm.getComplexityInfo();
    console.log(`   Time Complexity: ${complexityInfo.timeComplexity}`);
    console.log(`   Space Complexity: ${complexityInfo.spaceComplexity}`);
    console.log(`   Best Case: ${complexityInfo.bestCase}`);
    console.log(`   Worst Case: ${complexityInfo.worstCase}`);
    console.log(`   Average Case: ${complexityInfo.averageCase}\n`);

    // Test 5: Edge cases
    console.log('5. Edge Cases:');
    
    // Empty array
    const emptyResult = await binarySearch([], 5);
    console.log(`   Empty array search: ${emptyResult}`);
    
    // Single element - found
    const singleFoundResult = await binarySearch([5], 5);
    console.log(`   Single element (found): ${singleFoundResult}`);
    
    // Single element - not found
    const singleNotFoundResult = await binarySearch([5], 3);
    console.log(`   Single element (not found): ${singleNotFoundResult}`);
    
    // Target not in array
    const notFoundResult = await binarySearch(testData, 4);
    console.log(`   Target not in array: ${notFoundResult}\n`);

    // Test 6: Performance comparison
    console.log('6. Performance Comparison:');
    const largeArray = Array.from({ length: 1000 }, (_, i) => i * 2);
    const largeTarget = 500;
    
    const algorithm = new BinarySearchAlgorithm();
    const performanceResult = await algorithm.execute({ 
      data: largeArray, 
      target: largeTarget, 
      trackSteps: false 
    });
    
    // Simulate linear search for comparison
    let linearComparisons = 0;
    for (let i = 0; i < largeArray.length; i++) {
      linearComparisons++;
      if (largeArray[i] === largeTarget) break;
    }
    
    console.log(`   Array size: ${largeArray.length}`);
    console.log(`   Binary search comparisons: ${performanceResult.comparisons}`);
    console.log(`   Linear search comparisons: ${linearComparisons}`);
    console.log(`   Binary search efficiency: ${((linearComparisons - performanceResult.comparisons) / linearComparisons * 100).toFixed(1)}% better\n`);

    console.log('✅ Binary Search Implementation Complete!');
    console.log('   - JavaScript implementation with comprehensive step tracking');
    console.log('   - Python implementation for dual-language support');
    console.log('   - Input validation and edge case handling');
    console.log('   - Educational explanations and complexity analysis');
    console.log('   - Ready for visualization synchronization');

  } catch (error) {
    console.error('❌ Error during demonstration:', error.message);
  }
}

// Run the demonstration
demonstrateBinarySearch().catch(console.error);