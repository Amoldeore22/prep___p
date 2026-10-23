import React, { Suspense } from "react";
import EligibilityStepView from "@/components/pipeline/EligibilityStepView";

export default function StudentEligibilityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#121316] text-white p-8">Loading eligibility check...</div>}>
      <EligibilityStepView />
    </Suspense>
  );
}
