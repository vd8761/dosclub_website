import type { ClubEvent } from "@/lib/events";

const DEFAULT_TZ = "Asia/Kolkata";

/** IST is UTC+5:30 */
const IST_OFFSET_MS = 5.5 * 3600_000;

/** Returns the next Friday at 18:00 IST */
function getNextFriday(now: number, weeksAhead = 0): { start: string; end: string } {
  const ist = new Date(now + IST_OFFSET_MS);
  const FRIDAY = 5;
  const daysAhead = (FRIDAY - ist.getUTCDay() + 7) % 7;

  const startUtc =
    Date.UTC(
      ist.getUTCFullYear(),
      ist.getUTCMonth(),
      ist.getUTCDate() + (daysAhead === 0 && ist.getUTCHours() >= 20 ? 7 : daysAhead) + weeksAhead * 7,
      18,
      0,
    ) - IST_OFFSET_MS;

  const endUtc = startUtc + 2 * 3600_000; // 2 hour duration

  return {
    start: new Date(startUtc).toISOString(),
    end: new Date(endUtc).toISOString(),
  };
}

/** Generates dynamic upcoming and past dates relative to current time */
function getDateOffset(daysFromNow: number, hour = 10, durationHours = 3): { start: string; end: string } {
  const ist = new Date(Date.now() + IST_OFFSET_MS);
  const startUtc =
    Date.UTC(
      ist.getUTCFullYear(),
      ist.getUTCMonth(),
      ist.getUTCDate() + daysFromNow,
      hour,
      0,
    ) - IST_OFFSET_MS;

  return {
    start: new Date(startUtc).toISOString(),
    end: new Date(startUtc + durationHours * 3600_000).toISOString(),
  };
}

const friday1 = getNextFriday(Date.now(), 0);
const friday2 = getNextFriday(Date.now(), 1);
const upcomingWorkshop = getDateOffset(12, 10, 6);
const nextMonthWebinar = getDateOffset(24, 14, 2);

export const sampleClubEvents: ClubEvent[] = [
  {
    id: "first-pr-clinic",
    slug: "first-pr-clinic",
    title: "First PR Clinic — Open Source Friday",
    summary:
      "A hands-on build clinic where beginners are guided through their very first open source pull request with 1-on-1 mentor guidance.",
    description:
      "Pick up beginner-friendly issues on active community repositories. Mentors walk you through repository cloning, git branching, drafting clean commits, and submitting review-ready PRs.",
    startAt: friday1.start,
    endAt: friday1.end,
    timezone: DEFAULT_TZ,
    mode: "online",
    domain: "Open Source",
    level: "Beginner",
    tags: ["Open Source", "Git", "GitHub"],
    hosts: [
      {
        name: "Sivaraj Saminathan",
        title: "Staff Engineer & Open Source Lead",
        org: "Descience Club",
      },
    ],
    agenda: [
      { time: "18:00 - 18:20", title: "Setup & Repo Walkthrough", detail: "Forking and configuring local environment" },
      { time: "18:20 - 19:30", title: "Issue Solving Sprint", detail: "Pairing on tagged beginner issues" },
      { time: "19:30 - 20:00", title: "PR Reviews & Merges", detail: "Live code review and celebration" },
    ],
    prerequisites: ["Laptop with Git installed", "GitHub account", "Basic command line comfort"],
    takeaways: [
      "Merge your first verifiable open-source pull request",
      "Understand Git rebase, squash, and PR etiquette",
      "Connect with maintainers and fellow student contributors",
    ],
    project: "good-first-issue",
    repoUrl: "https://github.com/descience-club",
    registerUrl: "https://membership.descienceosclub.com",
    status: "scheduled",
    featured: true,
  },
  {
    id: "ai-agents-rag-workshop",
    slug: "ai-agents-rag-workshop",
    title: "Building Production AI Agents with RAG",
    summary:
      "Master retrieval augmented generation, embeddings, vector stores, and multi-agent workflows using modern TypeScript and Python tooling.",
    description:
      "Move beyond simple prompt engineering. In this comprehensive session, we build an agentic research assistant that searches, synthesizes, and executes actions with verifiable citation grounding.",
    startAt: upcomingWorkshop.start,
    endAt: upcomingWorkshop.end,
    timezone: DEFAULT_TZ,
    mode: "in_person",
    venue: "PERI Institute of Technology — Hall B",
    address: "PERI IT Campus, West Tambaram, Chennai",
    domain: "AI Engineering",
    level: "Intermediate",
    tags: ["AI", "RAG", "LLMs", "Python"],
    hosts: [
      {
        name: "G Pavithren",
        title: "Cloud & AI Solutions Architect",
        org: "Touchmark Descience",
      },
    ],
    agenda: [
      { time: "10:00 - 11:30", title: "Vector Embeddings & Storage Architecture" },
      { time: "11:30 - 13:00", title: "RAG Pipeline Implementation" },
      { time: "14:00 - 16:00", title: "Building Autonomous Tool-Calling Agents" },
    ],
    prerequisites: ["Basic familiarity with Python or TypeScript", "Understanding of REST APIs"],
    takeaways: [
      "Working code for an end-to-end vector search pipeline",
      "Autonomous agent implementation with tool execution",
      "Production deployment strategies for AI microservices",
    ],
    seats: 80,
    seatsLeft: 18,
    registerUrl: "https://membership.descienceosclub.com",
    status: "scheduled",
    featured: true,
  },
  {
    id: "docs-sprint-friday",
    slug: "docs-sprint-friday",
    title: "Docs & Developer Experience Sprint",
    summary:
      "Improving open-source documentation, writing interactive examples, and creating tutorials for community projects.",
    startAt: friday2.start,
    endAt: friday2.end,
    timezone: DEFAULT_TZ,
    mode: "online",
    domain: "Open Source",
    level: "All levels",
    tags: ["Documentation", "Markdown", "DevRel"],
    hosts: [
      {
        name: "G Pavithren",
        title: "Community Mentor",
      },
    ],
    agenda: [
      { time: "18:00 - 18:30", title: "Documentation Standards & Style Guide" },
      { time: "18:30 - 19:45", title: "Live Docs Writing & Review" },
      { time: "19:45 - 20:00", title: "Deploying Previews" },
    ],
    prerequisites: ["Curiosity to write clear developer guides"],
    takeaways: ["Published technical documentation PRs", "Understanding of Docs-as-Code workflows"],
    project: "descience-docs",
    registerUrl: "https://membership.descienceosclub.com",
    status: "scheduled",
    featured: true,
  },
  {
    id: "cloud-devops-masterclass",
    slug: "cloud-devops-masterclass",
    title: "Cloud Native Architecture & CI/CD Pipelines",
    summary:
      "Learn to containerize applications, configure automated GitHub Actions pipelines, and deploy on modern cloud infrastructure.",
    startAt: nextMonthWebinar.start,
    endAt: nextMonthWebinar.end,
    timezone: DEFAULT_TZ,
    mode: "online",
    domain: "Cloud Computing",
    level: "Intermediate",
    tags: ["DevOps", "Docker", "AWS", "CI/CD"],
    hosts: [
      {
        name: "Karthikeyan Loganathan",
        title: "Programming Analyst",
        org: "Cognizant",
      },
    ],
    agenda: [
      { time: "14:00 - 14:45", title: "Containerizing with Docker best practices" },
      { time: "14:45 - 15:30", title: "GitHub Actions CI/CD pipeline automation" },
      { time: "15:30 - 16:00", title: "Zero-downtime deployment patterns" },
    ],
    prerequisites: ["Basic command line", "Git repository setup"],
    takeaways: ["Production-ready Dockerfile", "Complete CI/CD workflow file"],
    status: "scheduled",
    featured: false,
  },
  {
    id: "react-js-workshop-peri",
    slug: "react-js-workshop-peri",
    title: "React JS Hands-On Workshop",
    summary:
      "Comprehensive full-day workshop covering modern React architecture, hooks, state management, and component design.",
    startAt: "2024-05-07T04:30:00.000Z", // 10:00 IST
    endAt: "2024-05-07T10:30:00.000Z", // 16:00 IST
    timezone: DEFAULT_TZ,
    mode: "in_person",
    venue: "PERI Institute of Technology",
    address: "West Tambaram, Chennai",
    domain: "Frontend",
    level: "Beginner to Intermediate",
    tags: ["React", "Frontend", "JavaScript"],
    hosts: [
      {
        name: "Sivaraj Saminathan",
        title: "Open Source Lead",
      },
    ],
    agenda: [
      { time: "10:00 - 12:00", title: "React Fundamentals & JSX" },
      { time: "12:00 - 13:00", title: "Component Composition" },
      { time: "14:00 - 16:00", title: "State Management & Shipping a Real App" },
    ],
    prerequisites: ["HTML, CSS & basic JavaScript"],
    takeaways: ["Built and deployed an interactive web application"],
    status: "completed",
    featured: false,
  },
  {
    id: "cloud-computing-workshop-peri",
    slug: "cloud-computing-workshop-peri",
    title: "Cloud Computing Fundamentals Workshop",
    summary:
      "Deep dive into cloud fundamentals, compute, serverless functions, and storage architectures.",
    startAt: "2024-05-07T04:30:00.000Z",
    endAt: "2024-05-07T10:30:00.000Z",
    timezone: DEFAULT_TZ,
    mode: "in_person",
    venue: "PERI Institute of Technology",
    domain: "Cloud",
    level: "Beginner",
    tags: ["Cloud", "AWS", "Serverless"],
    hosts: [
      {
        name: "G Pavithren",
        title: "Cloud Solutions Architect",
      },
    ],
    agenda: [
      { time: "10:00 - 12:30", title: "Cloud Architecture Principles" },
      { time: "13:30 - 16:00", title: "Hands-on Serverless Deployment" },
    ],
    prerequisites: ["Basic networking and terminal usage"],
    takeaways: ["Deployed first serverless API on the cloud"],
    status: "completed",
    featured: false,
  },
];
