// Independent Algorithm Step Generators for Interactive Visualizers
// Pure functions separating algorithm logic from visual presentation

export interface StepSnapshot {
  stepIndex: number;
  description: string;
  codeSnippet?: string;
  explanation: string;
  state: Record<string, any>;
}

// 1. Two Pointers (Target Sum in Sorted Array)
export function generateTwoPointersSteps(array: number[], target: number): StepSnapshot[] {
  const steps: StepSnapshot[] = [];
  let left = 0;
  let right = array.length - 1;
  let step = 0;

  steps.push({
    stepIndex: step++,
    description: `Initialize two pointers: Left at index 0 (${array[left]}), Right at index ${right} (${array[right]}). Target is ${target}.`,
    explanation: "Two Pointers works because the array is sorted. If sum < target, increment left. If sum > target, decrement right.",
    state: { left, right, currentSum: array[left] + array[right], target, found: false, array: [...array] },
  });

  while (left < right) {
    const sum = array[left] + array[right];
    if (sum === target) {
      steps.push({
        stepIndex: step++,
        description: `Sum ${sum} matches target ${target}! Pair found at indices [${left}, ${right}] with values [${array[left]}, ${array[right]}].`,
        explanation: "Pair found! We can return indices left + 1, right + 1 (1-indexed) or current pair.",
        state: { left, right, currentSum: sum, target, found: true, array: [...array] },
      });
      return steps;
    } else if (sum < target) {
      steps.push({
        stepIndex: step++,
        description: `Current sum ${sum} < target ${target}. Since array is sorted, we need a larger sum. Move Left pointer forward from ${left} to ${left + 1}.`,
        explanation: "Increasing the left index increases the next pair sum.",
        state: { left, right, currentSum: sum, target, found: false, array: [...array] },
      });
      left++;
    } else {
      steps.push({
        stepIndex: step++,
        description: `Current sum ${sum} > target ${target}. We need a smaller sum. Move Right pointer backward from ${right} to ${right - 1}.`,
        explanation: "Decreasing the right index decreases the next pair sum.",
        state: { left, right, currentSum: sum, target, found: false, array: [...array] },
      });
      right--;
    }
  }

  steps.push({
    stepIndex: step++,
    description: `Pointers met at index ${left}. No pair found that sums to ${target}.`,
    explanation: "Entire array examined without finding target pair.",
    state: { left, right, currentSum: null, target, found: false, array: [...array] },
  });

  return steps;
}

// 2. Sliding Window (Maximum Sum Subarray of Size K)
export function generateSlidingWindowSteps(array: number[], k: number): StepSnapshot[] {
  const steps: StepSnapshot[] = [];
  let step = 0;

  if (array.length < k || k <= 0) {
    return [{
      stepIndex: 0,
      description: "Array length is less than window size K.",
      explanation: "Edge case: cannot form a window of size K.",
      state: { array, k, windowStart: 0, windowEnd: 0, currentSum: 0, maxSum: 0 },
    }];
  }

  let windowSum = 0;
  for (let i = 0; i < k; i++) {
    windowSum += array[i];
  }

  let maxSum = windowSum;
  let bestStart = 0;

  steps.push({
    stepIndex: step++,
    description: `Form first window [0 to ${k - 1}]: Sum = ${windowSum}. Initial Max Sum = ${maxSum}.`,
    explanation: "Precompute the sum of the first K elements. This establishes our baseline window.",
    state: { array: [...array], k, windowStart: 0, windowEnd: k - 1, currentSum: windowSum, maxSum, bestStart },
  });

  for (let i = k; i < array.length; i++) {
    const outgoing = array[i - k];
    const incoming = array[i];
    windowSum = windowSum - outgoing + incoming;
    const isNewMax = windowSum > maxSum;
    if (isNewMax) {
      maxSum = windowSum;
      bestStart = i - k + 1;
    }

    steps.push({
      stepIndex: step++,
      description: `Slide window to [${i - k + 1} to ${i}]: Subtract outgoing ${outgoing} (idx ${i - k}), add incoming ${incoming} (idx ${i}). Window sum = ${windowSum}. ${isNewMax ? "✨ New Max Sum Found!" : `Max remains ${maxSum}.`}`,
      explanation: `O(1) transition: instead of recomputing all ${k} numbers, subtract array[i - k] and add array[i].`,
      state: { array: [...array], k, windowStart: i - k + 1, windowEnd: i, currentSum: windowSum, maxSum, bestStart },
    });
  }

  steps.push({
    stepIndex: step++,
    description: `Sliding window complete! Maximum sum of subarray of size ${k} is ${maxSum} starting at index ${bestStart}.`,
    explanation: "Time Complexity: O(N) linear time with O(1) auxiliary space.",
    state: { array: [...array], k, windowStart: bestStart, windowEnd: bestStart + k - 1, currentSum: maxSum, maxSum, bestStart, completed: true },
  });

  return steps;
}

// 3. Fast & Slow Pointers (LinkedList Cycle Detection)
export function generateFastSlowPointersSteps(nodeCount: number = 7, cycleTarget: number = 3): StepSnapshot[] {
  const steps: StepSnapshot[] = [];
  let step = 0;

  let slow = 0;
  let fast = 0;

  steps.push({
    stepIndex: step++,
    description: `Initialize Slow and Fast pointers at Head node (0). Cycle loops back to node ${cycleTarget}.`,
    explanation: "Floyd's Cycle Finding: Slow moves 1 step, Fast moves 2 steps. If a cycle exists, Fast will lap Slow and they must meet.",
    state: { slow, fast, nodeCount, cycleTarget, met: false },
  });

  const getNext = (curr: number) => {
    if (curr >= nodeCount - 1) return cycleTarget;
    return curr + 1;
  };

  for (let iter = 1; iter <= 15; iter++) {
    slow = getNext(slow);
    fast = getNext(getNext(fast));

    const met = slow === fast;

    steps.push({
      stepIndex: step++,
      description: `Step ${iter}: Slow advanced to Node ${slow}. Fast advanced 2 hops to Node ${fast}. ${met ? "🎯 Slow and Fast met at Node " + slow + "! Cycle detected!" : "Not met yet."}`,
      explanation: met
        ? "Fast caught up to Slow within the cycle loop! Cycle presence proven in O(N) time and O(1) space."
        : "Fast pointer continues ahead around the loop.",
      state: { slow, fast, nodeCount, cycleTarget, met, iteration: iter },
    });

    if (met) break;
  }

  return steps;
}

// 4. Kadane's Algorithm (Maximum Subarray Sum)
export function generateKadaneSteps(array: number[]): StepSnapshot[] {
  const steps: StepSnapshot[] = [];
  let step = 0;

  let currentSum = array[0];
  let maxSum = array[0];
  let curStart = 0;
  let bestStart = 0;
  let bestEnd = 0;

  steps.push({
    stepIndex: step++,
    description: `Initialize at index 0 (${array[0]}): Current Sum = ${currentSum}, Global Max = ${maxSum}.`,
    explanation: "Kadane's algorithm maintains the maximum subarray sum ending at each index.",
    state: { array: [...array], idx: 0, currentSum, maxSum, curStart: 0, curEnd: 0, bestStart: 0, bestEnd: 0 },
  });

  for (let i = 1; i < array.length; i++) {
    const val = array[i];
    if (val > currentSum + val) {
      currentSum = val;
      curStart = i;
    } else {
      currentSum = currentSum + val;
    }

    const isNewMax = currentSum > maxSum;
    if (isNewMax) {
      maxSum = currentSum;
      bestStart = curStart;
      bestEnd = i;
    }

    steps.push({
      stepIndex: step++,
      description: `Index ${i} (${val}): Decide whether to extend (${currentSum - val} + ${val} = ${currentSum}) or restart fresh (${val}). Current Sum = ${currentSum}. ${isNewMax ? "🔥 New Global Max: " + maxSum : "Global Max remains: " + maxSum}.`,
      explanation: "If previous sum is negative, starting fresh at current index is always better.",
      state: { array: [...array], idx: i, currentSum, maxSum, curStart, curEnd: i, bestStart, bestEnd },
    });
  }

  steps.push({
    stepIndex: step++,
    description: `Completed! Maximum subarray sum is ${maxSum} between indices [${bestStart} to ${bestEnd}].`,
    explanation: "Time Complexity: O(N) single pass. Space Complexity: O(1).",
    state: { array: [...array], idx: array.length - 1, currentSum, maxSum, curStart: bestStart, curEnd: bestEnd, bestStart, bestEnd, completed: true },
  });

  return steps;
}

// 5. Binary Search Basic
export function generateBinarySearchSteps(array: number[], target: number): StepSnapshot[] {
  const steps: StepSnapshot[] = [];
  let step = 0;
  let low = 0;
  let high = array.length - 1;

  steps.push({
    stepIndex: step++,
    description: `Initialize Low = 0 (${array[low]}), High = ${high} (${array[high]}). Target = ${target}.`,
    explanation: "Binary Search requires sorted array. At each step, compare target with middle element and eliminate half.",
    state: { array: [...array], low, high, mid: Math.floor((low + high) / 2), target, found: false },
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midVal = array[mid];

    if (midVal === target) {
      steps.push({
        stepIndex: step++,
        description: `Middle element array[${mid}] = ${midVal} matches target ${target}! Target found at index ${mid}.`,
        explanation: "Search successful in O(log N) comparisons.",
        state: { array: [...array], low, high, mid, target, found: true },
      });
      return steps;
    } else if (midVal < target) {
      steps.push({
        stepIndex: step++,
        description: `array[${mid}] = ${midVal} < target ${target}. Target must be in the right half. Move Low to ${mid + 1}.`,
        explanation: "Eliminate left half [low..mid]. Search space is halved.",
        state: { array: [...array], low, high, mid, target, found: false },
      });
      low = mid + 1;
    } else {
      steps.push({
        stepIndex: step++,
        description: `array[${mid}] = ${midVal} > target ${target}. Target must be in the left half. Move High to ${mid - 1}.`,
        explanation: "Eliminate right half [mid..high]. Search space is halved.",
        state: { array: [...array], low, high, mid, target, found: false },
      });
      high = mid - 1;
    }
  }

  steps.push({
    stepIndex: step++,
    description: `Low (${low}) exceeded High (${high}). Target ${target} does not exist in the array.`,
    explanation: "Return -1 (not found).",
    state: { array: [...array], low, high, mid: -1, target, found: false, completed: true },
  });

  return steps;
}

// 6. Stack (Valid Parentheses)
export function generateStackSteps(str: string): StepSnapshot[] {
  const steps: StepSnapshot[] = [];
  let step = 0;
  const stack: string[] = [];
  const map: Record<string, string> = { ")": "(", "}": "{", "]": "[" };

  steps.push({
    stepIndex: step++,
    description: `Analyze string "${str}". Stack is initially empty.`,
    explanation: "Push opening brackets onto stack. For closing brackets, pop and check if matching.",
    state: { str, idx: -1, char: null, stack: [], valid: true },
  });

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === "(" || char === "{" || char === "[") {
      stack.push(char);
      steps.push({
        stepIndex: step++,
        description: `Character '${char}' at index ${i} is an opening bracket. Push onto Stack. Stack: [${stack.join(", ")}].`,
        explanation: "Opening bracket awaits its matching closing counterpart.",
        state: { str, idx: i, char, stack: [...stack], valid: true },
      });
    } else if (char === ")" || char === "}" || char === "]") {
      const top = stack.pop();
      const expected = map[char];
      const matches = top === expected;

      if (!matches) {
        steps.push({
          stepIndex: step++,
          description: `Mismatch! Character '${char}' expected '${expected}' on top of stack, but got '${top || "empty"}'. Invalid!`,
          explanation: "Unmatched bracket violates LIFO parenthesis nesting rules.",
          state: { str, idx: i, char, stack: [...stack], valid: false },
        });
        return steps;
      } else {
        steps.push({
          stepIndex: step++,
          description: `Closing '${char}' matches popped '${top}'. Stack now: [${stack.join(", ")}].`,
          explanation: "Inner balanced pair successfully resolved.",
          state: { str, idx: i, char, stack: [...stack], valid: true },
        });
      }
    }
  }

  const isValid = stack.length === 0;
  steps.push({
    stepIndex: step++,
    description: isValid
      ? `Finished reading string. Stack is empty! String is perfectly VALID.`
      : `Finished reading string, but Stack has unmatched open brackets: [${stack.join(", ")}]. INVALID!`,
    explanation: isValid
      ? "All opening brackets had matching closing brackets in correct order."
      : "Some opening brackets were never closed.",
    state: { str, idx: str.length, char: null, stack: [...stack], valid: isValid, completed: true },
  });

  return steps;
}
