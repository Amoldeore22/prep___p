"use client";

import React, { Suspense } from "react";
import EligibilityStepView from "@/components/pipeline/EligibilityStepView";

export default function PipelineEligibilityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#121316] text-white p-8">Loading eligibility check...</div>}>
      <EligibilityStepView />
    </Suspense>
  );
}
