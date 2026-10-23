import { describe, it, expect } from "vitest";
import { cleanQuestionText } from "../src/lib/question-utils";

describe("Question Text Cleaning & Sequential Indexing", () => {
  it("Strips leading numbers followed by dot (e.g., '11. ', '1. ')", () => {
    expect(cleanQuestionText("11. If the ratio of two numbers is 3:4")).toBe(
      "If the ratio of two numbers is 3:4"
    );
    expect(cleanQuestionText("1. What is the sum of integers?")).toBe(
      "What is the sum of integers?"
    );
    expect(cleanQuestionText("11.  The average of numbers")).toBe(
      "The average of numbers"
    );
  });

  it("Strips leading numbers followed by colon (e.g., '2: ')", () => {
    expect(cleanQuestionText("2: A train 240 m long passes a platform")).toBe(
      "A train 240 m long passes a platform"
    );
    expect(cleanQuestionText("3: Ratio-Based DI - Easy")).toBe(
      "Ratio-Based DI - Easy"
    );
  });

  it("Strips leading numbers with 'Question:' or 'Q' (e.g., '1. Question: ', 'Q1. ')", () => {
    expect(
      cleanQuestionText(
        "1. Question: What was the percentage increase in Development employees?"
      )
    ).toBe("What was the percentage increase in Development employees?");
    expect(
      cleanQuestionText("11. Question: What is the ratio of sales in 2021 to 2025?")
    ).toBe("What is the ratio of sales in 2021 to 2025?");
    expect(cleanQuestionText("Q1: Solve for x")).toBe("Solve for x");
    expect(cleanQuestionText("Question 5. Determine the probability")).toBe(
      "Determine the probability"
    );
  });

  it("Strips parentheses, brackets, or dashes format (e.g., '1) ', '1 - ')", () => {
    expect(cleanQuestionText("1) Pointing to a photograph of a boy")).toBe(
      "Pointing to a photograph of a boy"
    );
    expect(cleanQuestionText("1 - Look at the alternating series")).toBe(
      "Look at the alternating series"
    );
    expect(cleanQuestionText("(3) In a survey of 400 students")).toBe(
      "In a survey of 400 students"
    );
  });

  it("Strips double or nested numbers cleanly without double counting", () => {
    expect(cleanQuestionText("1. 11. The average score of a batsman")).toBe(
      "The average score of a batsman"
    );
    expect(cleanQuestionText("2: 1. Question: In a race of 100 meters")).toBe(
      "In a race of 100 meters"
    );
  });

  it("Preserves numbers that are part of the actual question text", () => {
    expect(cleanQuestionText("Choose the word most opposite to TRANSPARENT.")).toBe(
      "Choose the word most opposite to TRANSPARENT."
    );
    expect(cleanQuestionText("If the ratio of two numbers is 3:4 and sum is 84")).toBe(
      "If the ratio of two numbers is 3:4 and sum is 84"
    );
    expect(cleanQuestionText("2024 was an important year for recruitment")).toBe(
      "2024 was an important year for recruitment"
    );
    expect(cleanQuestionText("In 2025, how many students graduated?")).toBe(
      "In 2025, how many students graduated?"
    );
  });

  it("Applies sequential frontend indexing correctly to cleaned questions", () => {
    const rawQuestions = [
      { text: "11. Question: What is ratio?" },
      { text: "2: Find speed of train" },
      { text: "1. Question: Calculate percentage" },
      { text: "Point to a photograph" },
    ];

    const renderedQuestions = rawQuestions.map((q, idx) => ({
      displayIndex: idx + 1,
      renderedHeading: `${idx + 1}. ${cleanQuestionText(q.text)}`,
    }));

    expect(renderedQuestions[0].renderedHeading).toBe("1. What is ratio?");
    expect(renderedQuestions[1].renderedHeading).toBe("2. Find speed of train");
    expect(renderedQuestions[2].renderedHeading).toBe("3. Calculate percentage");
    expect(renderedQuestions[3].renderedHeading).toBe("4. Point to a photograph");
  });
});
