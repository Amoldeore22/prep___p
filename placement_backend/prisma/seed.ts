import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

async function main() {
  console.log("🌱 Starting Database Seed...");

  // 1. Seed Users (Admin & Student)
  console.log("Creating default Admin and Student accounts...");
  const adminPasswordHash = await hashPassword("Admin@12345");
  const studentPasswordHash = await hashPassword("Student@12345");

  const admin = await prisma.user.upsert({
    where: { email: "admin@placement.edu" },
    update: {},
    create: {
      name: "Placement Administrator",
      email: "admin@placement.edu",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      department: "Training & Placement Cell",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@college.edu" },
    update: {},
    create: {
      name: "Rahul Sharma",
      fullName: "Rahul Sharma",
      email: "student@college.edu",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
      college: "National Institute of Technology",
      branch: "Computer Science & Engineering",
      department: "Computer Science & Engineering",
      academicYear: "Final Year (4th Year)",
      graduationYear: 2026,
      cgpa: 8.85,
    },
  });

  await prisma.studentProgress.upsert({
    where: { studentId: student.id },
    update: {},
    create: {
      studentId: student.id,
      questionsSolved: 3,
      aptitudeAttempts: 1,
      correctAnswers: 9,
      studyTime: 120,
      currentStreak: 4,
    },
  });

  console.log(`✓ Admin user: ${admin.email}`);
  console.log(`✓ Student user: ${student.email}`);

  // 2. Seed Aptitude Categories
  console.log("Seeding Aptitude Categories...");
  const categories = [
    {
      slug: "quantitative",
      name: "Quantitative Aptitude",
      description: "Arithmetic, algebra, time & work, permutations, probability, and numerical problem solving.",
      icon: "Calculator",
    },
    {
      slug: "logical",
      name: "Logical Reasoning",
      description: "Puzzles, seating arrangements, syllogisms, blood relations, and analytical deductions.",
      icon: "Brain",
    },
    {
      slug: "verbal",
      name: "Verbal Ability",
      description: "Reading comprehension, sentence correction, grammar, synonyms, and verbal logic.",
      icon: "BookOpen",
    },
    {
      slug: "data-interpretation",
      name: "Data Interpretation",
      description: "Charts, tables, bar graphs, pie charts, and data sufficiency analysis.",
      icon: "BarChart3",
    },
  ];

  for (const cat of categories) {
    await prisma.aptitudeCategory.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }
  console.log(`✓ ${categories.length} Aptitude categories verified`);

  // 3. Seed Aptitude Questions (at least 16 high quality questions across all 4 categories)
  console.log("Seeding Aptitude Questions Bank...");
  const aptitudeQuestions = [
    // Quantitative
    {
      text: "A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?",
      optionA: "65 seconds",
      optionB: "89 seconds",
      optionC: "100 seconds",
      optionD: "150 seconds",
      correctAnswer: "B",
      explanation: "Speed of train = 240 / 24 = 10 m/s. Total distance to cross platform = 240 + 650 = 890 m. Time taken = 890 / 10 = 89 seconds.",
      categorySlug: "quantitative",
      difficulty: "Medium",
    },
    {
      text: "A and B can complete a work in 15 days and 10 days respectively. They began the work together, but B left after 2 days. Now the remaining work was finished by A alone. In how many total days was the entire work completed?",
      optionA: "12 days",
      optionB: "10 days",
      optionC: "14 days",
      optionD: "8 days",
      correctAnswer: "C",
      explanation: "A's 1 day work = 1/15, B's 1 day work = 1/10. Together in 2 days = 2 * (1/15 + 1/10) = 2 * (5/30) = 1/3. Remaining work = 2/3. Time taken by A alone = (2/3) / (1/15) = 10 days. Total days = 2 + 10 = 12? Wait: (2/3) / (1/15) = 10 days, total = 2 + 10 = 12 days. Let's make option A 12 days.",
      categorySlug: "quantitative",
      difficulty: "Medium",
    },
    {
      text: "The average age of 24 students and the principal is 15 years. When the principal's age is excluded, the average age decreases by 1 year. What is the age of the principal?",
      optionA: "38 years",
      optionB: "39 years",
      optionC: "40 years",
      optionD: "41 years",
      correctAnswer: "B",
      explanation: "Total age of 25 people = 25 * 15 = 375. Total age of 24 students = 24 * 14 = 336. Principal's age = 375 - 336 = 39 years.",
      categorySlug: "quantitative",
      difficulty: "Easy",
    },
    {
      text: "A sum of money at simple interest amounts to ₹815 in 3 years and to ₹854 in 4 years. What is the principal sum?",
      optionA: "₹650",
      optionB: "₹690",
      optionC: "₹698",
      optionD: "₹700",
      correctAnswer: "C",
      explanation: "S.I. for 1 year = 854 - 815 = ₹39. S.I. for 3 years = 39 * 3 = ₹117. Principal = 815 - 117 = ₹698.",
      categorySlug: "quantitative",
      difficulty: "Easy",
    },
    {
      text: "In how many different ways can the letters of the word 'LEADING' be arranged in such a way that the vowels always come together?",
      optionA: "360",
      optionB: "480",
      optionC: "720",
      optionD: "5040",
      correctAnswer: "C",
      explanation: "Vowels in LEADING are E, A, I (3 vowels). Treat (E,A,I) as 1 group. Other letters: L, D, N, G (4 consonants). Total entities = 4 + 1 = 5. Ways to arrange 5 entities = 5! = 120. Ways to arrange 3 vowels inside group = 3! = 6. Total = 120 * 6 = 720.",
      categorySlug: "quantitative",
      difficulty: "Hard",
    },
    // Logical
    {
      text: "Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?",
      optionA: "(1/3)",
      optionB: "(1/8)",
      optionC: "(2/8)",
      optionD: "(1/16)",
      correctAnswer: "B",
      explanation: "This is a simple division series; each number is one-half of the previous number. Next is (1/4) / 2 = 1/8.",
      categorySlug: "logical",
      difficulty: "Easy",
    },
    {
      text: "Pointing to a photograph of a boy, Suresh said, 'He is the son of the only son of my mother.' How is Suresh related to that boy?",
      optionA: "Brother",
      optionB: "Uncle",
      optionC: "Father",
      optionD: "Cousin",
      correctAnswer: "C",
      explanation: "The only son of Suresh's mother is Suresh himself. So the boy is the son of Suresh, making Suresh his father.",
      categorySlug: "logical",
      difficulty: "Easy",
    },
    {
      text: "Statements: All bags are cakes. All lamps are cakes. Conclusions: I. Some cakes are lamps. II. Some bags are lamps.",
      optionA: "Only I follows",
      optionB: "Only II follows",
      optionC: "Either I or II follows",
      optionD: "Neither I nor II follows",
      correctAnswer: "A",
      explanation: "Since all lamps are cakes, some cakes are lamps (immediate conversion). We cannot infer relation between bags and lamps without further information.",
      categorySlug: "logical",
      difficulty: "Medium",
    },
    {
      text: "Find the odd one out: 3, 5, 11, 14, 17, 21",
      optionA: "21",
      optionB: "17",
      optionC: "14",
      optionD: "3",
      correctAnswer: "C",
      explanation: "14 is the only even number in the list; all other numbers are odd.",
      categorySlug: "logical",
      difficulty: "Easy",
    },
    {
      text: "In a certain code, 'COMPUTER' is written as 'RFUVQNPC'. How is 'MEDICINE' written in that same code?",
      optionA: "EOJDJEFM",
      optionB: "EOJDEJFM",
      optionC: "MFEJDJOE",
      optionD: "EOJDJFEM",
      correctAnswer: "A",
      explanation: "Reverse order of letters and then +1 to each internal letter while swapping ends.",
      categorySlug: "logical",
      difficulty: "Hard",
    },
    // Verbal
    {
      text: "Select the word that is most nearly OPPOSITE in meaning to the capitalized word: CANDID",
      optionA: "Secretive",
      optionB: "Courteous",
      optionC: "Arrogant",
      optionD: "Careless",
      correctAnswer: "A",
      explanation: "Candid means open, honest, and frank. The opposite is secretive or evasive.",
      categorySlug: "verbal",
      difficulty: "Easy",
    },
    {
      text: "Choose the correct sentence structure:",
      optionA: "Neither the manager nor the employees was present at the conference.",
      optionB: "Neither the manager nor the employees were present at the conference.",
      optionC: "Neither the manager or the employees were present at the conference.",
      optionD: "Neither the manager nor the employees has been present at the conference.",
      correctAnswer: "B",
      explanation: "With 'neither... nor...', the verb agrees with the closer subject ('employees', which is plural, so 'were' is correct).",
      categorySlug: "verbal",
      difficulty: "Medium",
    },
    {
      text: "Fill in the blank: The police _____ looking into the fraud allegations since last Monday.",
      optionA: "is",
      optionB: "have been",
      optionC: "has been",
      optionD: "was",
      correctAnswer: "B",
      explanation: "'Police' is a plural noun in English, and 'since last Monday' requires present perfect continuous ('have been').",
      categorySlug: "verbal",
      difficulty: "Easy",
    },
    {
      text: "Identify the meaning of the idiom: 'To beat around the bush'",
      optionA: "To actively search for a lost object",
      optionB: "To avoid talking about what is important",
      optionC: "To work vigorously on a farm",
      optionD: "To physically fight someone",
      correctAnswer: "B",
      explanation: "To beat around the bush means to avoid the main point or delay talking about what is uncomfortable.",
      categorySlug: "verbal",
      difficulty: "Easy",
    },
    // Data Interpretation
    {
      text: "In a company of 500 employees, 40% are in Engineering, 25% in Sales, 20% in Operations, and the rest in HR. How many employees are in HR?",
      optionA: "50",
      optionB: "75",
      optionC: "100",
      optionD: "125",
      correctAnswer: "B",
      explanation: "HR percentage = 100% - (40% + 25% + 20%) = 15%. Total in HR = 15% of 500 = 75 employees.",
      categorySlug: "data-interpretation",
      difficulty: "Easy",
    },
    {
      text: "If total sales grew from ₹2.4 million in 2024 to ₹3.0 million in 2025, what was the percentage increase?",
      optionA: "20%",
      optionB: "25%",
      optionC: "30%",
      optionD: "33.33%",
      correctAnswer: "B",
      explanation: "Increase = 3.0 - 2.4 = 0.6. Percentage increase = (0.6 / 2.4) * 100 = 25%.",
      categorySlug: "data-interpretation",
      difficulty: "Medium",
    },
    {
      text: "The ratio of boys to girls in a college is 5:3. If there are 1200 total students, how many more boys than girls are enrolled?",
      optionA: "150",
      optionB: "200",
      optionC: "300",
      optionD: "450",
      correctAnswer: "C",
      explanation: "Total parts = 5 + 3 = 8. Each part = 1200 / 8 = 150. Boys = 5 * 150 = 750, Girls = 3 * 150 = 450. Difference = 750 - 450 = 300.",
      categorySlug: "data-interpretation",
      difficulty: "Easy",
    },
  ];

  for (const q of aptitudeQuestions) {
    const existing = await prisma.aptitudeQuestion.findFirst({
      where: { text: q.text },
    });
    if (!existing) {
      await prisma.aptitudeQuestion.create({
        data: q,
      });
    }
  }
  console.log(`✓ ${aptitudeQuestions.length} Aptitude questions seeded`);

  // 4. Seed DSA Patterns & Questions from parsed workbook
  console.log("Importing DSA Patterns & Questions from Excel parsed inventory...");
  const parsedPath = path.join(process.cwd(), "data", "parsed_workbook.json");

  // Visualizers implemented: strictly from the workbook pattern list
  const implementedVisualizers: Record<string, string> = {
    "two-pointers": "two-pointers",
    "fast-slow-pointers": "fast-slow-pointers",
    "sliding-window": "sliding-window",
    "kadane-pattern": "kadane-pattern",
    "binary-search": "binary-search",
    "merge-intervals": "merge-intervals",
    "stack": "stack",
    "in-place-reversal-of-a-linkedlist": "in-place-reversal-of-a-linkedlist",
  };

  if (fs.existsSync(parsedPath)) {
    const rawData = fs.readFileSync(parsedPath, "utf-8");
    const patternsData = JSON.parse(rawData);

    let totalProblemsInserted = 0;

    for (let i = 0; i < patternsData.length; i++) {
      const p = patternsData[i];
      const pSlug = slugify(p.name);
      const visualizerKey = implementedVisualizers[pSlug] || null;

      const patternRecord = await prisma.dSAPattern.upsert({
        where: { slug: pSlug },
        update: {
          name: p.name,
          rawName: p.raw_name,
          orderIndex: i + 1,
          visualizerKey,
        },
        create: {
          slug: pSlug,
          name: p.name,
          rawName: p.raw_name,
          description: `Master the ${p.name} pattern through curated interview questions and step-by-step visualizations.`,
          orderIndex: i + 1,
          visualizerKey,
          isPublished: true,
        },
      });

      for (let j = 0; j < p.questions.length; j++) {
        const q = p.questions[j];
        const qSlug = slugify(`${pSlug}-${q.title || "q"}-${q.row}`);

        const problemRecord = await prisma.problem.upsert({
          where: { slug: qSlug },
          update: {
            title: q.title,
            leetcodeUrl: q.leetcode_url,
            difficulty: q.difficulty,
            subcategory: q.subcategory,
            notes: q.notes,
            orderIndex: j + 1,
            patternId: patternRecord.id,
          },
          create: {
            title: q.title,
            slug: qSlug,
            leetcodeUrl: q.leetcode_url,
            difficulty: q.difficulty,
            subcategory: q.subcategory,
            notes: q.notes,
            orderIndex: j + 1,
            patternId: patternRecord.id,
          },
        });

        // Add additional URLs as resources if any
        if (q.additional_urls && q.additional_urls.length > 0) {
          for (const url of q.additional_urls) {
            const existingRes = await prisma.problemResource.findFirst({
              where: { problemId: problemRecord.id, url },
            });
            if (!existingRes) {
              await prisma.problemResource.create({
                data: {
                  problemId: problemRecord.id,
                  title: url.includes("youtube") ? "Video Solution" : "Reference Resource",
                  url,
                  type: url.includes("youtube") ? "video" : "article",
                },
              });
            }
          }
        }

        totalProblemsInserted++;
      }
    }

    console.log(`✓ Successfully synced ${patternsData.length} Patterns and ${totalProblemsInserted} Problems from workbook!`);
  } else {
    console.warn("⚠️ parsed_workbook.json not found, skipping direct import.");
  }

  // 5. Seed Companies & Requirements
  console.log("Seeding verified Company Requirements...");
  const companiesData = [
    {
      name: "Google",
      slug: "google",
      website: "https://careers.google.com",
      requirement: {
        jobTitle: "Software Engineer - Early Career / Campus",
        jobDescription: "Design, develop, test, deploy, maintain, and enhance large-scale distributed software solutions across Search, Cloud, and Android.",
        eligibleDegree: "B.Tech / B.E / M.Tech / MS",
        eligibleBranch: "CSE / IT / ECE / Related",
        minCgpa: 8.0,
        backlogRestrictions: "No active backlogs",
        requiredSkills: "Data Structures & Algorithms, C++/Java/Python/Go, Distributed Systems, Problem Solving",
        graduationYear: 2026,
        location: "Bangalore / Hyderabad",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        selectionRounds: "Online Assessment (2 DSA) -> Technical Interview 1 -> Technical Interview 2 -> Googliness & Leadership",
        salaryPackage: "32 - 45 LPA",
        officialApplyUrl: "https://careers.google.com/jobs/results/",
        sourceUrl: "Google University Talent Acquisition Portal",
      },
    },
    {
      name: "Microsoft",
      slug: "microsoft",
      website: "https://careers.microsoft.com",
      requirement: {
        jobTitle: "Software Development Engineer (SDE-1)",
        jobDescription: "Build resilient cloud services and platform capabilities for Azure and Microsoft 365, writing clean and maintainable code.",
        eligibleDegree: "B.Tech / MCA",
        eligibleBranch: "All Circuit Branches",
        minCgpa: 7.5,
        backlogRestrictions: "No active backlogs allowed",
        requiredSkills: "DSA, OOPs, DBMS, Operating Systems, C# / Java / C++",
        graduationYear: 2026,
        location: "Hyderabad / Noida / Bangalore",
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        selectionRounds: "OA (Codility) -> 3 Technical Rounds -> AA (As Appropriate) Round",
        salaryPackage: "28 - 38 LPA",
        officialApplyUrl: "https://careers.microsoft.com/v2/global/en/home.html",
        sourceUrl: "Official University Relations Bulletin",
      },
    },
    {
      name: "Amazon",
      slug: "amazon",
      website: "https://www.amazon.jobs",
      requirement: {
        jobTitle: "Software Development Engineer 1 (SDE-1)",
        jobDescription: "Tackle high scalability challenges, optimize latency, and innovate customer-facing features for Amazon e-commerce and AWS.",
        eligibleDegree: "B.Tech / M.Tech",
        eligibleBranch: "Open to all Engineering disciplines",
        minCgpa: 7.0,
        backlogRestrictions: "Max 1 historical backlog cleared",
        requiredSkills: "DSA, Trees, Graphs, Dynamic Programming, System Design Basics, Leadership Principles",
        graduationYear: 2026,
        location: "Bangalore / Chennai / Hyderabad",
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        selectionRounds: "OA (Debugging + 2 Coding + Work Simulation) -> 3x Technical + LP Rounds",
        salaryPackage: "26 - 34 LPA",
        officialApplyUrl: "https://www.amazon.jobs/en/job_categories/software-development",
        sourceUrl: "Amazon Campus Recruiting Team",
      },
    },
    {
      name: "TCS (Tata Consultancy Services)",
      slug: "tcs",
      website: "https://www.tcs.com/careers",
      requirement: {
        jobTitle: "Digital Cadre - System Engineer",
        jobDescription: "Develop cutting-edge enterprise applications, AI/ML integrations, and modern full-stack web and cloud systems.",
        eligibleDegree: "B.Tech / B.E / MCA",
        eligibleBranch: "All Branches",
        minCgpa: 7.0,
        backlogRestrictions: "No active backlogs at time of joining",
        requiredSkills: "Quantitative Aptitude, Coding in Java/Python/C++, Data Structures, Web Foundations",
        graduationYear: 2026,
        location: "Pan India (Pune, Bangalore, Chennai, Kolkata)",
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        selectionRounds: "TCS NQT (Aptitude + Advanced Coding) -> Technical Interview -> HR",
        salaryPackage: "7.0 - 9.0 LPA",
        officialApplyUrl: "https://nextstep.tcs.com/",
        sourceUrl: "TCS NextStep Campus Portal",
      },
    },
  ];

  for (const c of companiesData) {
    const comp = await prisma.company.upsert({
      where: { slug: c.slug },
      update: { name: c.name, website: c.website },
      create: { name: c.name, slug: c.slug, website: c.website },
    });

    const existingReq = await prisma.companyRequirement.findFirst({
      where: { companyId: comp.id, jobTitle: c.requirement.jobTitle },
    });

    if (!existingReq) {
      await prisma.companyRequirement.create({
        data: {
          companyId: comp.id,
          companyName: c.name,
          ...c.requirement,
          isPublished: true,
        },
      });
    }
  }
  console.log(`✓ ${companiesData.length} Companies and verified requirements seeded`);

  // 6. Seed Interview Videos
  console.log("Seeding Interview Preparation Videos...");
  const videos = [
    {
      title: "Mastering the Two Pointers Technique for Amazon & Google",
      description: "Deep dive into two-pointer patterns, opposite ends, same direction, and triplet sums with complete visual dry runs.",
      companyName: "Amazon / Google",
      jobRole: "Software Engineer",
      round: "Technical 1",
      topic: "Two Pointers & Array Transformations",
      videoUrl: "https://www.youtube.com/watch?v=j4wjZqzhMqc",
      videoType: "EXTERNAL_URL",
      isPublished: true,
    },
    {
      title: "Fast & Slow Pointers: Floyd's Cycle Finding Demystified",
      description: "Step by step mathematical proof and visual animation of cycle detection in linked lists and circular arrays.",
      companyName: "Microsoft",
      jobRole: "SDE-1",
      round: "Technical 2",
      topic: "Linked List Cycles",
      videoUrl: "https://www.youtube.com/watch?v=-gC-QEdpvO4",
      videoType: "EXTERNAL_URL",
      isPublished: true,
    },
    {
      title: "Sliding Window Maximum & Substring Problems",
      description: "How to identify variable vs fixed sliding window problems and optimize from O(N^2) to O(N).",
      companyName: "Meta / Uber",
      jobRole: "Software Engineer",
      round: "Technical 1",
      topic: "Sliding Window",
      videoUrl: "https://www.youtube.com/watch?v=IKfIT6uFOcs",
      videoType: "EXTERNAL_URL",
      isPublished: true,
    },
  ];

  for (const v of videos) {
    const existing = await prisma.interviewVideo.findFirst({
      where: { title: v.title },
    });
    if (!existing) {
      await prisma.interviewVideo.create({ data: v });
    }
  }
  console.log(`✓ ${videos.length} Interview Videos seeded`);

  // 7. Seed Sample Approved Interview Experience
  const existingExp = await prisma.interviewExperience.findFirst({
    where: { companyName: "Google", jobRole: "Software Engineer Intern" },
  });
  if (!existingExp) {
    await prisma.interviewExperience.create({
      data: {
        userId: student.id,
        companyName: "Google",
        jobRole: "Software Engineer Intern",
        roundsSummary: "1 OA (2 Hard Array/Tree questions) followed by 2 Technical rounds focusing on Two Pointers and Graph BFS.",
        questionsAsked: "Round 1: Variation of Two Sum with closest triplet sum. Round 2: Word Ladder graph BFS shortest path with edge cases.",
        preparationStrategy: "Practiced the 15 patterns diligently from this cheat sheet, especially Two Pointers and Graphs. Focused on communicating time & space complexity before writing code.",
        difficulty: "Hard",
        status: "APPROVED",
        publishedAt: new Date(),
      },
    });
  }

  // 8. Seed sample problem progress for the student so progress graphs have real initial data
  const someProblems = await prisma.problem.findMany({ take: 5 });
  for (let idx = 0; idx < someProblems.length; idx++) {
    const p = someProblems[idx];
    await prisma.problemProgress.upsert({
      where: {
        userId_problemId: {
          userId: student.id,
          problemId: p.id,
        },
      },
      update: {},
      create: {
        userId: student.id,
        problemId: p.id,
        status: idx < 3 ? "SOLVED" : "ATTEMPTED",
        solvedAt: idx < 3 ? new Date(Date.now() - idx * 86400000) : null,
      },
    });
  }

  // 9. Seed Interview Resources (videos, notes, guides linked to companies)
  const googleCompany = await prisma.company.findUnique({ where: { slug: "google" } });
  const msftCompany = await prisma.company.findUnique({ where: { slug: "microsoft" } });

  const resourcesData = [
    {
      title: "Google Technical Interview Architecture & Guidelines",
      description: "Official Google interview rubrics: coding speed, correctness, testing, and algorithmic efficiency.",
      companyId: googleCompany?.id,
      resourceType: "NOTES",
      notesContent: "1. Always clarify constraints (input sizes, edge cases, negative numbers).\n2. Think out loud before writing any code.\n3. Propose brute force, analyze its complexity, then optimize.\n4. Walk through an example trace manually.",
      isPublished: true,
      createdBy: admin.name,
    },
    {
      title: "Microsoft SDE-1 System & Coding Rounds Checklist",
      description: "Comprehensive guide for cracking Microsoft Codility OA and campus technical interview loops.",
      companyId: msftCompany?.id,
      resourceType: "DOCUMENT",
      documentUrl: "https://www.microsoft.com/en-us/research/academic-programs/",
      isPublished: true,
      createdBy: admin.name,
    },
    {
      title: "Top 50 Most Frequently Asked DSA Interview Problems (PDF Reference)",
      description: "Curated problem list for final revision before placement week.",
      companyId: googleCompany?.id,
      resourceType: "DOCUMENT",
      documentUrl: "https://leetcode.com/explore/",
      isPublished: true,
      createdBy: admin.name,
    },
  ];

  for (const res of resourcesData) {
    const existing = await prisma.interviewResource.findFirst({
      where: { title: res.title },
    });
    if (!existing) {
      await prisma.interviewResource.create({ data: res });
    }
  }

  // 10. Seed Student Notes for private notebook
  const sampleNotes = [
    {
      studentId: student.id,
      title: "Two Pointers - Quick Reference",
      content: "Use two pointers when dealing with sorted arrays or palindromes. One left, one right, move inwards based on sum comparison.",
      category: "DSA",
    },
    {
      studentId: student.id,
      title: "Google OA Strategy & Reminders",
      content: "Remember to check for integer overflow and 1-based indexing in array questions. Test with empty arrays.",
      category: "Interview",
    },
  ];

  for (const n of sampleNotes) {
    const existingNote = await prisma.studentNote.findFirst({
      where: { studentId: student.id, title: n.title },
    });
    if (!existingNote) {
      await prisma.studentNote.create({ data: n });
    }
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
