import React, { Suspense } from "react";
import JobRolesStepView from "@/components/pipeline/JobRolesStepView";

export default function StudentJobRolesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#121316] text-white p-8">Loading roles...</div>}>
      <JobRolesStepView />
    </Suspense>
  );
}
