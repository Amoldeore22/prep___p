import { describe, it, expect } from "vitest";
import {
  generateTwoPointersSteps,
  generateSlidingWindowSteps,
  generateFastSlowPointersSteps,
  generateKadaneSteps,
  generateBinarySearchSteps,
  generateStackSteps,
} from "@/lib/visualizers/algorithms";

describe("Educational DSA Algorithm Step Generators", () => {
  it("Two Pointers (Two Sum Sorted) generates correct step sequences", () => {
    const arr = [1, 2, 3, 4, 6];
    const target = 6;
    const steps = generateTwoPointersSteps(arr, target);

    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].description).toContain("Initialize two pointers");

    // Check that pointers converge or find match
    const finalStep = steps[steps.length - 1];
    expect(finalStep.state.found).toBe(true);
    expect(finalStep.state.left).toBe(1); // 2
    expect(finalStep.state.right).toBe(3); // 4 (2 + 4 = 6)
  });

  it("Two Pointers returns false found when target is not possible", () => {
    const arr = [1, 2, 4];
    const target = 100;
    const steps = generateTwoPointersSteps(arr, target);
    const finalStep = steps[steps.length - 1];
    expect(finalStep.state.found).toBe(false);
  });

  it("Sliding Window (Max Sum Subarray) generates correct window boundaries", () => {
    const arr = [2, 1, 5, 1, 3, 2];
    const k = 3;
    const steps = generateSlidingWindowSteps(arr, k);

    expect(steps.length).toBeGreaterThan(0);
    const finalStep = steps[steps.length - 1];
    // Window sums: [2,1,5]=8, [1,5,1]=7, [5,1,3]=9, [1,3,2]=6 -> max is 9
    expect(finalStep.state.maxSum).toBe(9);
  });

  it("Fast & Slow Pointers (Floyd Cycle) detects cycle accurately", () => {
    const nodeCount = 7;
    const cycleTarget = 3;
    const steps = generateFastSlowPointersSteps(nodeCount, cycleTarget);

    expect(steps.length).toBeGreaterThan(0);
    const finalStep = steps[steps.length - 1];
    expect(finalStep.state.met).toBe(true);
  });

  it("Kadane's Algorithm calculates maximum subarray sum correctly", () => {
    const arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
    const steps = generateKadaneSteps(arr);

    expect(steps.length).toBeGreaterThan(arr.length);
    const finalStep = steps[steps.length - 1];
    // Subarray [4, -1, 2, 1] sums to 6
    expect(finalStep.state.maxSum).toBe(6);
  });

  it("Binary Search identifies index of target with correct midpoint calculations", () => {
    const arr = [2, 4, 6, 8, 10, 12, 14, 16];
    const target = 10;
    const steps = generateBinarySearchSteps(arr, target);

    expect(steps.length).toBeGreaterThan(0);
    const finalStep = steps[steps.length - 1];
    expect(finalStep.state.found).toBe(true);
    expect(finalStep.state.mid).toBe(4);
  });

  it("Stack (Valid Parentheses) validates balanced brackets", () => {
    const valid = "{[()]}";
    const validSteps = generateStackSteps(valid);
    expect(validSteps[validSteps.length - 1].state.valid).toBe(true);

    const invalid = "{[(])}";
    const invalidSteps = generateStackSteps(invalid);
    expect(invalidSteps[invalidSteps.length - 1].state.valid).toBe(false);
  });
});
