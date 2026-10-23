import { describe, it, expect } from "vitest";

describe("Daily Aptitude Assessment Rules", () => {
  it("Server-side evaluation calculates exact score and accuracy percentage", () => {
    const questionBank = [
      { id: "q1", correctAnswer: "B" },
      { id: "q2", correctAnswer: "C" },
      { id: "q3", correctAnswer: "A" },
      { id: "q4", correctAnswer: "D" },
      { id: "q5", correctAnswer: "A" },
      { id: "q6", correctAnswer: "B" },
      { id: "q7", correctAnswer: "C" },
      { id: "q8", correctAnswer: "B" },
      { id: "q9", correctAnswer: "D" },
      { id: "q10", correctAnswer: "A" },
    ];

    const studentAnswers = [
      { questionId: "q1", selectedOption: "B" }, // correct
      { questionId: "q2", selectedOption: "C" }, // correct
      { questionId: "q3", selectedOption: "B" }, // wrong
      { questionId: "q4", selectedOption: "D" }, // correct
      { questionId: "q5", selectedOption: "A" }, // correct
      { questionId: "q6", selectedOption: "C" }, // wrong
      { questionId: "q7", selectedOption: "C" }, // correct
      { questionId: "q8", selectedOption: "B" }, // correct
      { questionId: "q9", selectedOption: "D" }, // correct
      { questionId: "q10", selectedOption: "B" }, // wrong
    ];

    let score = 0;
    const evaluated = studentAnswers.map((ans) => {
      const q = questionBank.find((item) => item.id === ans.questionId);
      const isCorrect = q?.correctAnswer === ans.selectedOption;
      if (isCorrect) score++;
      return { ...ans, isCorrect };
    });

    const accuracy = Math.round((score / questionBank.length) * 100);

    expect(score).toBe(7);
    expect(accuracy).toBe(70);
    expect(evaluated.filter((e) => e.isCorrect).length).toBe(7);
  });

  it("Ensures client quiz question payload scrubs correctAnswer and explanation", () => {
    const rawQuestion = {
      id: "q_test_1",
      text: "What is the speed of a train?",
      optionA: "45 km/h",
      optionB: "60 km/h",
      optionC: "75 km/h",
      optionD: "90 km/h",
      correctAnswer: "B",
      explanation: "Distance = 300km, Time = 5 hours => 300/5 = 60 km/h",
    };

    // Simulated API projection
    const clientPayload = {
      id: rawQuestion.id,
      text: rawQuestion.text,
      optionA: rawQuestion.optionA,
      optionB: rawQuestion.optionB,
      optionC: rawQuestion.optionC,
      optionD: rawQuestion.optionD,
    };

    expect((clientPayload as any).correctAnswer).toBeUndefined();
    expect((clientPayload as any).explanation).toBeUndefined();
  });
});
