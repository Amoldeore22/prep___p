"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import StudentSidebar from "@/components/layout/StudentSidebar";
import StudentNavbar from "@/components/layout/StudentNavbar";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  Brain,
  BarChart2,
} from "lucide-react";

export default function DailyQuizPage() {
  const [quizData, setQuizData] = useState<any>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(600); // 10 minutes timer
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDailyQuiz = () => {
    fetch("/api/aptitude/daily")
      .then((res) => res.json())
      .then((data) => {
        if (data.error === "INSUFFICIENT_QUESTIONS") {
          setErrorMsg(data.message);
        } else if (data.hasCompleted) {
          setSubmissionResult(data.attempt);
          setQuizData(data.quiz);
        } else if (data.quiz) {
          setQuizData(data.quiz);
          // Start 10-minute countdown timer
          timerRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
              if (prev <= 1) {
                if (timerRef.current) clearInterval(timerRef.current);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Daily quiz fetch error:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchDailyQuiz();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSelectOption = (questionId: string, option: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quizData) return;
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const timeTaken = 600 - timeRemaining;

    try {
      const res = await fetch("/api/aptitude/daily/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dailyQuizId: quizData.id,
          timeTakenSeconds: timeTaken,
          answers: selectedAnswers,
          isOfficial: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Submission failed");
        setIsSubmitting(false);
        return;
      }

      setSubmissionResult(data.result);
      setIsSubmitting(false);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    } catch {
      setErrorMsg("Failed to submit answers. Please check your connection.");
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#121316] text-zinc-100">
        <StudentSidebar />
        <div className="flex-1 flex flex-col">
          <StudentNavbar title="Daily Aptitude Quiz" />
          <div className="p-8 flex items-center justify-center flex-1 text-zinc-400">
            Loading today's official 10-question quiz...
          </div>
        </div>
      </div>
    );
  }

  // Error condition: e.g. insufficient questions in question bank
  if (errorMsg && !quizData) {
    return (
      <div className="flex min-h-screen bg-[#121316] text-zinc-100">
        <StudentSidebar />
        <div className="flex-1 flex flex-col">
          <StudentNavbar title="Daily Aptitude Quiz" />
          <main className="p-8 max-w-3xl mx-auto flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Daily Quiz Unavailable</h3>
            <p className="text-sm text-zinc-400 max-w-md">{errorMsg}</p>
            <Link
              href="/aptitude/practice"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#F15A24] hover:to-[#ea580c] text-white font-semibold text-xs transition shadow-lg shadow-orange-500/20"
            >
              Try Aptitude Practice Instead
            </Link>
          </main>
        </div>
      </div>
    );
  }

  // Already Completed View (Results & Detailed Explanations)
  if (submissionResult) {
    const score = submissionResult.score;
    const total = submissionResult.totalQuestions || 10;
    const accuracy = submissionResult.accuracy;

    return (
      <div className="flex min-h-screen bg-[#121316] text-zinc-100">
        <StudentSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <StudentNavbar title="Daily Aptitude Quiz Results" />

          <main className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto max-w-4xl w-full mx-auto">
            {/* Score Summary Card */}
            <div className="glass-panel p-8 rounded-3xl border border-[#2C2E33] text-center space-y-4 shadow-2xl relative overflow-hidden bg-[#1A1B1E]">
              <div className="w-16 h-16 rounded-2xl bg-[#FF5722]/10 border border-[#FF5722]/30 flex items-center justify-center text-[#FF5722] mx-auto">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF5722]">
                  Official Daily Attempt Recorded
                </span>
                <h2 className="text-4xl font-extrabold text-white mt-1">
                  You scored {score} / {total}
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Overall Accuracy: <strong className="text-emerald-400">{accuracy}%</strong> | Time Taken:{" "}
                  <strong className="text-zinc-200">
                    {Math.floor((submissionResult.timeTakenSeconds || 0) / 60)}m{" "}
                    {(submissionResult.timeTakenSeconds || 0) % 60}s
                  </strong>
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 pt-2">
                <Link
                  href="/progress"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#F15A24] hover:to-[#ea580c] text-white font-semibold text-xs shadow-lg shadow-orange-500/20 transition"
                >
                  View in Progress Dashboard &rarr;
                </Link>
                <Link
                  href="/aptitude/practice"
                  className="px-4 py-2 rounded-xl bg-[#202226] hover:bg-[#2C2E33] text-zinc-300 border border-[#2C2E33] font-semibold text-xs transition"
                >
                  Aptitude Practice
                </Link>
              </div>
            </div>

            {/* Answer Breakdown with Explanations */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#FF5722]" />
                <span>Question Breakdown & Explanations</span>
              </h3>

              <div className="space-y-4">
                {submissionResult.answers?.map((ans: any, idx: number) => {
                  const isCorrect = ans.isCorrect;

                  return (
                    <div
                      key={idx}
                      className={`glass-card p-6 rounded-2xl border transition-all space-y-3 ${
                        isCorrect
                          ? "border-emerald-500/30 bg-emerald-950/10"
                          : "border-rose-500/30 bg-rose-950/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-zinc-400">Q{idx + 1}.</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#202226] text-zinc-400 capitalize">
                            {ans.categorySlug?.replace("-", " ") || "Aptitude"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          {isCorrect ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Correct (+1)
                            </span>
                          ) : (
                            <span className="text-rose-400 flex items-center gap-1">
                              <XCircle className="w-4 h-4" /> Incorrect (0)
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-sm font-semibold text-white leading-relaxed">
                        {ans.questionText}
                      </p>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        {["A", "B", "C", "D"].map((optKey) => {
                          const isUserSelected = ans.selectedOption === optKey;
                          const isAnswerKey = ans.correctAnswer === optKey;

                          let badgeClass = "bg-[#202226] border-[#2C2E33] text-zinc-400";
                          if (isAnswerKey) {
                            badgeClass = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                          } else if (isUserSelected && !isCorrect) {
                            badgeClass = "bg-rose-500/20 border-rose-500 text-rose-300 font-bold line-through";
                          }

                          return (
                            <div
                              key={optKey}
                              className={`p-2.5 rounded-xl border flex items-center gap-2 ${badgeClass}`}
                            >
                              <span className="font-mono font-bold">{optKey}.</span>
                              <span>{ans[`option${optKey}`] || `Option ${optKey}`}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation Callout */}
                      <div className="p-3.5 rounded-xl bg-[#141518] border border-[#2C2E33] text-xs text-zinc-300 space-y-1 mt-2">
                        <strong className="text-[#FF5722] block font-semibold">Explanation:</strong>
                        <p className="leading-relaxed">{ans.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Active Quiz In-Progress View
  const questions = quizData?.questions || [];
  const currentQ = questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="flex min-h-screen bg-[#121316] text-zinc-100">
      <StudentSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentNavbar title="Daily Aptitude Quiz (10 Questions)" />

        <main className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto max-w-4xl w-full mx-auto">
          {/* Quiz Status Header */}
          <div className="glass-panel p-5 rounded-2xl border border-[#2C2E33] bg-[#1A1B1E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-zinc-400">
                Official Placement Quiz • {quizData?.quizDate}
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              {/* Countdown Timer */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FF5722]/10 border border-[#FF5722]/30 text-[#FF5722] text-xs font-mono font-bold">
                <Clock className="w-4 h-4 text-[#FF5722] animate-pulse" />
                <span>Time Remaining: {formatTimer(timeRemaining)}</span>
              </div>

              {/* Progress Count */}
              <div className="text-xs text-zinc-400">
                Answered: <strong className="text-white">{answeredCount}</strong> / {questions.length}
              </div>
            </div>
          </div>

          {/* Question Navigator Ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {questions.map((q: any, idx: number) => {
              const isAnswered = Boolean(selectedAnswers[q.id]);
              const isCurrent = idx === currentQuestionIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-9 h-9 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center shrink-0 ${
                    isCurrent
                      ? "bg-gradient-to-r from-[#FF5722] to-[#F15A24] text-white ring-2 ring-[#FF5722]/40 shadow-lg shadow-orange-500/20"
                      : isAnswered
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-[#202226] border border-[#2C2E33] text-zinc-400 hover:text-white"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Active Question Card */}
          {currentQ && (
            <div className="glass-panel p-8 rounded-3xl border border-[#2C2E33] bg-[#1A1B1E] space-y-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#202226] text-[#FF5722] font-semibold capitalize border border-[#2C2E33]">
                  {currentQ.categorySlug?.replace("-", " ") || "Aptitude"}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  Difficulty: {currentQ.difficulty || "Medium"}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white leading-relaxed">
                {currentQ.text}
              </h3>

              {/* 4 MCQ Options */}
              <div className="space-y-3 pt-2">
                {["A", "B", "C", "D"].map((optKey) => {
                  const optText = currentQ[`option${optKey}`];
                  const isSelected = selectedAnswers[currentQ.id] === optKey;

                  return (
                    <button
                      key={optKey}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, optKey)}
                      className={`w-full p-4 rounded-xl border text-left text-sm transition flex items-center gap-3.5 ${
                        isSelected
                          ? "bg-[#FF5722]/10 border-[#FF5722] text-white font-semibold ring-2 ring-[#FF5722]/20"
                          : "bg-[#202226] border-[#2C2E33] text-zinc-300 hover:bg-[#282a30] hover:border-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 transition ${
                          isSelected
                            ? "bg-[#FF5722] text-white"
                            : "bg-[#141518] text-zinc-400"
                        }`}
                      >
                        {optKey}
                      </div>
                      <span className="leading-relaxed flex-1">{optText}</span>
                    </button>
                  );
                })}
              </div>

              {/* Next/Prev and Submit Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-[#2C2E33]">
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-[#202226] disabled:opacity-40 transition"
                >
                  Previous
                </button>

                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="px-5 py-2.5 rounded-xl bg-[#202226] hover:bg-[#2C2E33] text-white text-xs font-bold transition flex items-center gap-1.5 border border-[#2C2E33]"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? "Submitting Answers..." : "Submit Official Attempt"}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
