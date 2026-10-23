import { describe, it, expect } from "vitest";
import { PIPELINE_COMPANIES, CompanyRole } from "../src/data/pipeline-data";

function evaluateEligibility(
  student: {
    cgpa: number;
    backlogs: number;
    branch: string;
    graduationYear: number;
    tenthPercent: number;
    twelfthPercent: number;
  },
  role: CompanyRole
) {
  const cgpaPass = student.cgpa >= role.criteria.minCgpa;
  const backlogsPass = student.backlogs <= role.criteria.maxBacklogs;

  const branchNorm = student.branch.toLowerCase();
  const branchPass =
    role.criteria.allowedBranches.includes("All Disciplines") ||
    role.criteria.allowedBranches.some(
      (b) => branchNorm.includes(b.toLowerCase()) || b.toLowerCase().includes(branchNorm)
    );

  const batchPass = role.criteria.eligibleBatches.includes(student.graduationYear);
  const tenthPass = student.tenthPercent >= role.criteria.min10thPercent;
  const twelfthPass = student.twelfthPercent >= role.criteria.min12thPercent;

  return {
    cgpaPass,
    backlogsPass,
    branchPass,
    batchPass,
    tenthPass,
    twelfthPass,
    allPass: cgpaPass && backlogsPass && branchPass && batchPass && tenthPass && twelfthPass,
  };
}

describe("Company Placement Pipeline - Eligibility Evaluation Engine", () => {
  it("should have comprehensive mock recruiters with structured roles and criteria", () => {
    expect(PIPELINE_COMPANIES.length).toBeGreaterThanOrEqual(6);
    const tcs = PIPELINE_COMPANIES.find((c) => c.id === "tcs");
    expect(tcs).toBeDefined();
    expect(tcs?.roles.length).toBe(3);
  });

  it("should mark a qualified student as ELIGIBLE for TCS Digital", () => {
    const tcs = PIPELINE_COMPANIES.find((c) => c.id === "tcs")!;
    const digital = tcs.roles.find((r) => r.id === "tcs-digital")!;

    const qualifiedStudent = {
      cgpa: 8.85,
      backlogs: 0,
      branch: "Computer Science & Engineering",
      graduationYear: 2026,
      tenthPercent: 91.5,
      twelfthPercent: 88.0,
    };

    const result = evaluateEligibility(qualifiedStudent, digital);
    expect(result.allPass).toBe(true);
    expect(result.cgpaPass).toBe(true);
    expect(result.backlogsPass).toBe(true);
    expect(result.branchPass).toBe(true);
  });

  it("should mark a student with CGPA below cutoff as DISQUALIFIED", () => {
    const tcs = PIPELINE_COMPANIES.find((c) => c.id === "tcs")!;
    const digital = tcs.roles.find((r) => r.id === "tcs-digital")!;

    const lowCgpaStudent = {
      cgpa: 6.4,
      backlogs: 0,
      branch: "Computer Science & Engineering",
      graduationYear: 2026,
      tenthPercent: 90.0,
      twelfthPercent: 85.0,
    };

    const result = evaluateEligibility(lowCgpaStudent, digital);
    expect(result.allPass).toBe(false);
    expect(result.cgpaPass).toBe(false);
  });

  it("should mark a student with active backlogs as DISQUALIFIED when 0 are permitted", () => {
    const amazon = PIPELINE_COMPANIES.find((c) => c.id === "amazon")!;
    const sde = amazon.roles.find((r) => r.id === "amazon-sde")!;

    const studentWithBacklogs = {
      cgpa: 8.5,
      backlogs: 2,
      branch: "Computer Science & Engineering",
      graduationYear: 2026,
      tenthPercent: 88.0,
      twelfthPercent: 86.0,
    };

    const result = evaluateEligibility(studentWithBacklogs, sde);
    expect(result.allPass).toBe(false);
    expect(result.backlogsPass).toBe(false);
  });

  it("should flag student when their engineering branch is not eligible", () => {
    const goldman = PIPELINE_COMPANIES.find((c) => c.id === "goldman-sachs")!;
    const quant = goldman.roles.find((r) => r.id === "gs-quant")!;

    const civilStudent = {
      cgpa: 8.9,
      backlogs: 0,
      branch: "Civil Engineering",
      graduationYear: 2026,
      tenthPercent: 92.0,
      twelfthPercent: 90.0,
    };

    const result = evaluateEligibility(civilStudent, quant);
    expect(result.allPass).toBe(false);
    expect(result.branchPass).toBe(false);
  });

  it("should allow multi-discipline branches when All Disciplines is supported", () => {
    const tcs = PIPELINE_COMPANIES.find((c) => c.id === "tcs")!;
    const ninja = tcs.roles.find((r) => r.id === "tcs-ninja")!;

    const mechStudent = {
      cgpa: 7.2,
      backlogs: 1,
      branch: "Mechanical Engineering",
      graduationYear: 2026,
      tenthPercent: 75.0,
      twelfthPercent: 72.0,
    };

    const result = evaluateEligibility(mechStudent, ninja);
    expect(result.allPass).toBe(true);
  });

  it("should configure official Clearbit logo URLs for all target companies", () => {
    const expectedLogos: Record<string, string> = {
      tcs: "https://logo.clearbit.com/tcs.com",
      infosys: "https://logo.clearbit.com/infosys.com",
      amazon: "https://logo.clearbit.com/amazon.com",
      accenture: "https://logo.clearbit.com/accenture.com",
      cognizant: "https://logo.clearbit.com/cognizant.com",
      "goldman-sachs": "https://logo.clearbit.com/goldmansachs.com",
    };

    for (const company of PIPELINE_COMPANIES) {
      expect(company.logo).toMatch(/^https:\/\/logo\.clearbit\.com\/.+/);
      if (expectedLogos[company.id]) {
        expect(company.logo).toBe(expectedLogos[company.id]);
      }
    }
  });
});

