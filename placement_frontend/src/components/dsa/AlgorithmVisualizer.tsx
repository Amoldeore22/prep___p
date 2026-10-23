"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Database,
  Code2,
} from "lucide-react";
import {
  generateTwoPointersSteps,
  generateSlidingWindowSteps,
  generateFastSlowPointersSteps,
  generateKadaneSteps,
  generateBinarySearchSteps,
  generateStackSteps,
  StepSnapshot,
} from "@/lib/visualizers/algorithms";

interface AlgorithmVisualizerProps {
  patternKey: string;
  patternName: string;
}

export default function AlgorithmVisualizer({
  patternKey,
  patternName,
}: AlgorithmVisualizerProps) {
  // Input states
  const [arrayInput, setArrayInput] = useState<string>("1, 2, 3, 4, 6, 8, 11");
  const [targetInput, setTargetInput] = useState<number>(10);
  const [kInput, setKInput] = useState<number>(3);
  const [stringInput, setStringInput] = useState<string>("({[]})");

  // Playback states
  const [steps, setSteps] = useState<StepSnapshot[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(1200);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Re-generate steps when inputs or pattern change
  const computeSteps = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const parsedArray = arrayInput
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    let newSteps: StepSnapshot[] = [];

    switch (patternKey) {
      case "two-pointers":
        newSteps = generateTwoPointersSteps(
          parsedArray.length ? parsedArray.sort((a, b) => a - b) : [1, 2, 4, 6, 8, 9, 14],
          targetInput
        );
        break;
      case "sliding-window":
        newSteps = generateSlidingWindowSteps(
          parsedArray.length ? parsedArray : [2, 1, 5, 1, 3, 2],
          kInput
        );
        break;
      case "fast-slow-pointers":
        newSteps = generateFastSlowPointersSteps(7, 2);
        break;
      case "kadane-pattern":
        newSteps = generateKadaneSteps(
          parsedArray.length ? parsedArray : [-2, 1, -3, 4, -1, 2, 1, -5, 4]
        );
        break;
      case "binary-search":
        newSteps = generateBinarySearchSteps(
          parsedArray.length ? parsedArray.sort((a, b) => a - b) : [1, 3, 5, 7, 9, 11, 13, 15],
          targetInput
        );
        break;
      case "stack":
        newSteps = generateStackSteps(stringInput || "()[]{}");
        break;
      default:
        newSteps = [];
    }

    setSteps(newSteps);
    setCurrentStepIndex(0);
  };

  useEffect(() => {
    computeSteps();
  }, [patternKey]);

  // Autoplay loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, speedMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speedMs, steps.length]);

  const currentStep = steps[currentStepIndex] || null;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  return (
    <div className="bg-[#1A1B1E] rounded-2xl p-6 border border-[#2C2E33] shadow-2xl space-y-6">
      {/* Header & Controls bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2C2E33]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20">
              Interactive Algorithm Visualizer
            </span>
            <span className="text-xs text-[#9CA3AF]">Step {currentStepIndex + 1} of {steps.length}</span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1">{patternName} Simulation</h3>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-[#202226] hover:bg-[#2C2E33] text-[#9CA3AF] hover:text-white transition"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="p-2 rounded-lg bg-[#202226] hover:bg-[#2C2E33] disabled:opacity-40 text-[#9CA3AF] hover:text-white transition"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#F15A24] hover:to-[#ea580c] text-white font-medium flex items-center gap-2 shadow-lg shadow-[#FF5722]/25 transition"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </button>
          <button
            onClick={handleNext}
            disabled={currentStepIndex >= steps.length - 1}
            className="p-2 rounded-lg bg-[#202226] hover:bg-[#2C2E33] disabled:opacity-40 text-[#9CA3AF] hover:text-white transition"
            title="Next Step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1.5 ml-2 bg-[#202226] px-2.5 py-1.5 rounded-lg border border-[#2C2E33] text-xs">
            <Sliders className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={speedMs}
              onChange={(e) => setSpeedMs(Number(e.target.value))}
              className="bg-transparent text-zinc-300 outline-none cursor-pointer"
            >
              <option value={1800} className="bg-[#202226]">0.5x</option>
              <option value={1200} className="bg-[#202226]">1.0x</option>
              <option value={700} className="bg-[#202226]">1.5x</option>
              <option value={400} className="bg-[#202226]">2.0x</option>
            </select>
          </div>
        </div>
      </div>

      {/* Editable Inputs Toolbar */}
      <div className="bg-[#1A1B1E] p-4 rounded-xl border border-[#2C2E33] flex flex-wrap items-center gap-4 text-sm">
        {patternKey !== "fast-slow-pointers" && patternKey !== "stack" && (
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <label className="text-zinc-400 text-xs font-medium">Array:</label>
            <input
              type="text"
              value={arrayInput}
              onChange={(e) => setArrayInput(e.target.value)}
              className="glass-input px-3 py-1.5 rounded-lg text-white text-xs w-full font-mono outline-none"
              placeholder="e.g. 1, 2, 4, 6, 8, 11"
            />
          </div>
        )}

        {(patternKey === "two-pointers" || patternKey === "binary-search") && (
          <div className="flex items-center gap-2">
            <label className="text-zinc-400 text-xs font-medium">Target:</label>
            <input
              type="number"
              value={targetInput}
              onChange={(e) => setTargetInput(Number(e.target.value))}
              className="glass-input px-3 py-1.5 rounded-lg text-white text-xs w-20 font-mono outline-none"
            />
          </div>
        )}

        {patternKey === "sliding-window" && (
          <div className="flex items-center gap-2">
            <label className="text-zinc-400 text-xs font-medium">Window Size K:</label>
            <input
              type="number"
              value={kInput}
              min={1}
              max={8}
              onChange={(e) => setKInput(Number(e.target.value))}
              className="glass-input px-3 py-1.5 rounded-lg text-white text-xs w-16 font-mono outline-none"
            />
          </div>
        )}

        {patternKey === "stack" && (
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <label className="text-zinc-400 text-xs font-medium">Brackets String:</label>
            <input
              type="text"
              value={stringInput}
              onChange={(e) => setStringInput(e.target.value)}
              className="glass-input px-3 py-1.5 rounded-lg text-white text-xs w-full font-mono outline-none"
              placeholder="e.g. ({[]})"
            />
          </div>
        )}

        <button
          onClick={computeSteps}
          className="px-3.5 py-1.5 rounded-lg bg-[#FF5722] hover:bg-[#F15A24] text-xs text-white font-medium transition"
        >
          Update & Re-run
        </button>
      </div>

      {/* Visualization Canvas Area */}
      <div className="min-h-[220px] bg-[#141518] rounded-xl p-6 border border-[#2C2E33] flex flex-col justify-center items-center relative overflow-hidden">
        {/* Background grid accent */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2C2E3315_1px,transparent_1px),linear-gradient(to_bottom,#2C2E3315_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* 1. Two Pointers Visualization */}
        {patternKey === "two-pointers" && currentStep && (
          <div className="w-full flex flex-col items-center gap-6 z-10">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {currentStep.state.array.map((val: number, idx: number) => {
                const isLeft = idx === currentStep.state.left;
                const isRight = idx === currentStep.state.right;
                const isFoundPair = currentStep.state.found && (isLeft || isRight);

                return (
                  <div key={idx} className="flex flex-col items-center">
                    {/* Top Pointer Badges */}
                    <div className="h-6 flex items-center justify-center mb-1">
                      {isLeft && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-black shadow-md animate-bounce">
                          LEFT (L)
                        </span>
                      )}
                      {isRight && !isLeft && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black shadow-md animate-bounce">
                          RIGHT (R)
                        </span>
                      )}
                    </div>

                    {/* Array Element Box */}
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-300 shadow-md ${
                        isFoundPair
                          ? "bg-emerald-500 text-black ring-4 ring-emerald-400/50 scale-110"
                          : isLeft
                          ? "bg-emerald-600/30 text-emerald-300 border-2 border-emerald-500"
                          : isRight
                          ? "bg-amber-600/30 text-amber-300 border-2 border-amber-500"
                          : "bg-[#202226] border border-[#2C2E33] text-zinc-300"
                      }`}
                    >
                      {val}
                    </div>

                    {/* Index Label */}
                    <span className="text-[11px] text-zinc-500 mt-1.5 font-mono">idx: {idx}</span>
                  </div>
                );
              })}
            </div>

            {/* Sum indicator badge */}
            <div className="flex items-center gap-4 bg-[#202226] px-4 py-2 rounded-xl border border-[#2C2E33] text-sm">
              <span className="text-zinc-400">
                Sum: <strong className="text-white font-mono">{currentStep.state.currentSum ?? "N/A"}</strong>
              </span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">
                Target: <strong className="text-[#FF5722] font-mono">{currentStep.state.target}</strong>
              </span>
              <span className="text-zinc-600">|</span>
              <span
                className={`font-semibold text-xs px-2.5 py-0.5 rounded-full ${
                  currentStep.state.found
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-[#1A1B1E] text-zinc-400 border border-[#2C2E33]"
                }`}
              >
                {currentStep.state.found ? "✓ Target Found!" : "Searching..."}
              </span>
            </div>
          </div>
        )}

        {/* 2. Sliding Window Visualization */}
        {patternKey === "sliding-window" && currentStep && (
          <div className="w-full flex flex-col items-center gap-6 z-10">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {currentStep.state.array.map((val: number, idx: number) => {
                const inWindow =
                  idx >= currentStep.state.windowStart && idx <= currentStep.state.windowEnd;
                const isStart = idx === currentStep.state.windowStart;
                const isEnd = idx === currentStep.state.windowEnd;

                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="h-5 text-[10px] text-[#FF5722] font-bold mb-1">
                      {isStart && isEnd ? "WINDOW" : isStart ? "START →" : isEnd ? "← END" : ""}
                    </div>
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                        inWindow
                          ? "bg-[#FF5722]/20 text-white border-2 border-[#FF5722] ring-2 ring-[#FF5722]/30 scale-105"
                          : "bg-[#202226] border border-[#2C2E33] text-zinc-400 opacity-60"
                      }`}
                    >
                      {val}
                    </div>
                    <span className="text-[11px] text-zinc-500 mt-1 font-mono">[{idx}]</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4 bg-[#202226] px-4 py-2 rounded-xl border border-[#2C2E33] text-sm">
              <span className="text-zinc-400">
                Window Sum: <strong className="text-[#FF5722] font-mono">{currentStep.state.currentSum}</strong>
              </span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">
                Max Sum So Far: <strong className="text-emerald-400 font-mono">{currentStep.state.maxSum}</strong>
              </span>
            </div>
          </div>
        )}

        {/* 3. Fast & Slow Pointers Visualization */}
        {patternKey === "fast-slow-pointers" && currentStep && (
          <div className="w-full flex flex-col items-center gap-6 z-10">
            <div className="flex items-center justify-center gap-2 overflow-x-auto max-w-full py-4">
              {Array.from({ length: currentStep.state.nodeCount }).map((_, idx) => {
                const isSlow = idx === currentStep.state.slow;
                const isFast = idx === currentStep.state.fast;
                const isCycleStart = idx === currentStep.state.cycleTarget;

                return (
                  <div key={idx} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className="h-6 flex items-center gap-1 mb-1">
                        {isSlow && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500 text-white">
                            Slow
                          </span>
                        )}
                        {isFast && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500 text-white">
                            Fast
                          </span>
                        )}
                      </div>
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                          currentStep.state.met && isSlow
                            ? "bg-emerald-500 text-black ring-4 ring-emerald-400/50 scale-110"
                            : isCycleStart
                            ? "bg-[#FF5722]/30 border-2 border-[#FF5722] text-white"
                            : "bg-[#202226] border border-[#2C2E33] text-zinc-300"
                        }`}
                      >
                        N{idx}
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-1">
                        {isCycleStart ? "Cycle Joint" : `Node ${idx}`}
                      </span>
                    </div>
                    {idx < currentStep.state.nodeCount - 1 && (
                      <span className="text-zinc-600 mx-1.5 font-bold">→</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-zinc-400 bg-[#202226] px-4 py-2 rounded-lg border border-[#2C2E33]">
              {currentStep.state.met ? (
                <span className="text-emerald-400 font-semibold">✓ Fast and Slow pointers met! Loop proven.</span>
              ) : (
                <span>Slow advances by 1 node; Fast advances by 2 nodes per cycle.</span>
              )}
            </div>
          </div>
        )}

        {/* 4. Kadane's Algorithm Visualization */}
        {patternKey === "kadane-pattern" && currentStep && (
          <div className="w-full flex flex-col items-center gap-6 z-10">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {currentStep.state.array.map((val: number, idx: number) => {
                const isCurrentIdx = idx === currentStep.state.idx;
                const inBest =
                  idx >= currentStep.state.bestStart && idx <= currentStep.state.bestEnd;

                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="h-5 text-[10px] font-bold mb-1">
                      {isCurrentIdx ? <span className="text-amber-400">CURRENT</span> : ""}
                    </div>
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                        isCurrentIdx
                          ? "bg-amber-600/30 text-amber-200 border-2 border-amber-500 ring-2 ring-amber-500/30 scale-105"
                          : inBest
                          ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/50"
                          : "bg-[#202226] border border-[#2C2E33] text-zinc-400"
                      }`}
                    >
                      {val}
                    </div>
                    <span className="text-[11px] text-zinc-500 mt-1 font-mono">[{idx}]</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4 bg-[#202226] px-4 py-2 rounded-xl border border-[#2C2E33] text-sm">
              <span className="text-zinc-400">
                Current Sum: <strong className="text-amber-400 font-mono">{currentStep.state.currentSum}</strong>
              </span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">
                Global Max Sum: <strong className="text-emerald-400 font-mono">{currentStep.state.maxSum}</strong>
              </span>
            </div>
          </div>
        )}

        {/* 5. Binary Search Visualization */}
        {patternKey === "binary-search" && currentStep && (
          <div className="w-full flex flex-col items-center gap-6 z-10">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {currentStep.state.array.map((val: number, idx: number) => {
                const isLow = idx === currentStep.state.low;
                const isMid = idx === currentStep.state.mid;
                const isHigh = idx === currentStep.state.high;
                const isFound = currentStep.state.found && isMid;
                const isEliminated =
                  idx < currentStep.state.low || idx > currentStep.state.high;

                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="h-6 flex items-center gap-1 mb-1">
                      {isMid && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FF5722] text-white">
                          MID
                        </span>
                      )}
                      {isLow && !isMid && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500 text-white">
                          LOW
                        </span>
                      )}
                      {isHigh && !isMid && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-black">
                          HIGH
                        </span>
                      )}
                    </div>
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                        isFound
                          ? "bg-emerald-500 text-black ring-4 ring-emerald-400/50 scale-110"
                          : isMid
                          ? "bg-[#FF5722]/20 text-[#FF5722] border-2 border-[#FF5722] scale-105"
                          : isEliminated
                          ? "bg-[#121316]/60 border border-[#2C2E33] text-zinc-600 opacity-30"
                          : "bg-[#202226] border border-[#2C2E33] text-zinc-300"
                      }`}
                    >
                      {val}
                    </div>
                    <span className="text-[11px] text-zinc-500 mt-1 font-mono">idx: {idx}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4 bg-[#202226] px-4 py-2 rounded-xl border border-[#2C2E33] text-sm">
              <span className="text-zinc-400">
                Target: <strong className="text-[#FF5722] font-mono">{currentStep.state.target}</strong>
              </span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">
                Low: <strong className="text-blue-400 font-mono">{currentStep.state.low}</strong>, High:{" "}
                <strong className="text-amber-400 font-mono">{currentStep.state.high}</strong>, Mid:{" "}
                <strong className="text-[#FF5722] font-mono">{currentStep.state.mid}</strong>
              </span>
            </div>
          </div>
        )}

        {/* 6. Stack Visualization */}
        {patternKey === "stack" && currentStep && (
          <div className="w-full flex flex-col items-center gap-6 z-10">
            {/* Input Characters Ribbon */}
            <div className="flex items-center gap-2">
              {currentStep.state.str.split("").map((c: string, idx: number) => (
                <div
                  key={idx}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base transition-all ${
                    idx === currentStep.state.idx
                      ? "bg-[#FF5722] text-white scale-110 ring-2 ring-[#FF5722]/40"
                      : idx < currentStep.state.idx
                      ? "bg-[#121316] text-zinc-500"
                      : "bg-[#202226] text-zinc-300"
                  }`}
                >
                  {c}
                </div>
              ))}
            </div>

            {/* Visual Stack Bucket */}
            <div className="flex flex-col items-center">
              <div className="w-36 min-h-[140px] border-b-4 border-l-4 border-r-4 border-[#FF5722]/60 rounded-b-2xl p-2 flex flex-col-reverse gap-1.5 bg-[#202226] items-center justify-start shadow-inner">
                {currentStep.state.stack.length === 0 ? (
                  <span className="text-xs text-zinc-500 my-auto italic">Stack Empty</span>
                ) : (
                  currentStep.state.stack.map((item: string, idx: number) => (
                    <div
                      key={idx}
                      className="w-full py-1.5 rounded-lg bg-[#FF5722]/20 border border-[#FF5722]/40 text-white font-bold text-center text-sm"
                    >
                      {item}
                    </div>
                  ))
                )}
              </div>
              <span className="text-xs text-zinc-400 mt-2 font-semibold">LIFO Stack</span>
            </div>
          </div>
        )}
      </div>

      {/* Step Explanation & Complexity Breakdown */}
      {currentStep && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-[#1A1B1E] p-4 rounded-xl border border-[#2C2E33] space-y-2">
            <div className="flex items-center gap-2 text-[#FF5722] font-semibold text-sm">
              <HelpCircle className="w-4 h-4" />
              <span>Step Explanation</span>
            </div>
            <p className="text-white text-sm leading-relaxed">{currentStep.description}</p>
            <p className="text-zinc-400 text-xs italic">{currentStep.explanation}</p>
          </div>

          <div className="bg-[#1A1B1E] p-4 rounded-xl border border-[#2C2E33] space-y-3">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Pattern Complexity
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" /> Time:
                </span>
                <span className="font-mono text-white font-semibold">
                  {patternKey === "binary-search" ? "O(log N)" : "O(N)"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-400" /> Space:
                </span>
                <span className="font-mono text-white font-semibold">
                  {patternKey === "stack" ? "O(N)" : "O(1)"}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-[#2C2E33] text-[11px] text-zinc-400">
              Educational visualization algorithmically synchronized with execution.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
