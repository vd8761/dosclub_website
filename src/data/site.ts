/**
 * Central content source for the Descience Open Source Club site.
 * Edit copy, events, team and partners here - components read from this file.
 */

export const site = {
  name: "Descience Open Source Club",
  shortName: "Descience OS",
  tagline: "Open source. Open minds.",
  url: "https://descienceosclub.com",
  email: "hello@descienceosclub.com",
};

export const nav = [
  { label: "About", href: "#about" },
  { label: "Domains", href: "#domains" },
  { label: "Journey", href: "#journey" },
  { label: "Events", href: "#events" },
  { label: "Team", href: "#team" },
  { label: "FAQ", href: "#faq" },
];

/** Big rotating words in the hero / marquee */
export const keywords = [
  "Open Source",
  "React",
  "Cloud",
  "Workshops",
  "Mentorship",
  "Community",
  "Build in public",
  "Ship together",
];

/** What the club does - the four pillars */
export const pillars = [
  {
    no: "01",
    title: "Learning Resources",
    body: "Curated tutorials, online courses and books that take you from first commit to confident contributor.",
  },
  {
    no: "02",
    title: "Projects & Workshops",
    body: "Hands-on, build-along sessions where you ship real things alongside peers and mentors.",
  },
  {
    no: "03",
    title: "Feedback & Evaluation",
    body: "Personalized reviews and skill evaluations so every member keeps levelling up.",
  },
  {
    no: "04",
    title: "Networking",
    body: "Connect with industry experts and collaborators, and grow a network that lasts.",
  },
];

/** Focus areas - horizontal scroll section */
export const domains = [
  {
    no: "01",
    title: "Web Development",
    accent: "var(--color-green)",
    body: "React, Next.js and the modern frontend stack. Craft interfaces that feel alive.",
    tags: ["React", "Next.js", "TypeScript", "UI/UX"],
  },
  {
    no: "02",
    title: "Cloud Computing",
    accent: "var(--color-moss)",
    body: "Deploy, scale and automate. Learn the cloud and DevOps tooling teams use in production.",
    tags: ["AWS", "Docker", "CI/CD", "Serverless"],
  },
  {
    no: "03",
    title: "Open Source",
    accent: "var(--color-leaf)",
    body: "Contribute to real projects, read real code, and learn the craft of building in the open.",
    tags: ["Git", "GitHub", "OSS", "Collaboration"],
  },
  {
    no: "04",
    title: "Digital Skills",
    accent: "var(--color-forest)",
    body: "Career-ready training, problem solving and communication for everyone who wants to grow.",
    tags: ["Career", "Soft skills", "Mentorship"],
  },
];

/** Member journey - numbered process */
export const journey = [
  {
    no: "01",
    title: "Join",
    body: "Become part of a community that wants you to win. No gatekeeping, no prerequisites.",
  },
  {
    no: "02",
    title: "Learn",
    body: "Follow guided tracks, attend workshops and webinars led by working engineers.",
  },
  {
    no: "03",
    title: "Build",
    body: "Apply what you learn on real projects with feedback at every step.",
  },
  {
    no: "04",
    title: "Contribute",
    body: "Push your work to the open source world and let your commits speak for you.",
  },
];

/** Stats band - update with real numbers when available */
export const stats = [
  { value: 500, suffix: "+", label: "Community members" },
  { value: 20, suffix: "+", label: "Workshops & webinars" },
  { value: 5, suffix: "", label: "Partner institutions" },
  { value: 4, suffix: "", label: "Core domains" },
];

export const events = [
  {
    title: "React JS Workshop",
    date: "07 May 2024",
    time: "10:00 - 16:00 IST",
    location: "PERI Institute of Technology",
    host: "Sivaraj Saminathan",
    tag: "Frontend",
  },
  {
    title: "Cloud Computing Workshop",
    date: "07 May 2024",
    time: "10:00 - 16:00 IST",
    location: "Online",
    host: "G Pavithren",
    tag: "Cloud",
  },
  {
    title: "Community Webinars",
    date: "Ongoing",
    time: "Monthly",
    location: "Online",
    host: "Industry experts",
    tag: "Community",
  },
];

export const team = [
  {
    name: "G Pavithren",
    role: "Cloud & Mentorship Lead",
    title: "Senior Programmer Analyst",
  },
  {
    name: "Sivaraj Saminathan",
    role: "Frontend & Workshops Lead",
    title: "Programmer Analyst",
  },
];

export const faqs = [
  {
    q: "Why should I contribute to Descience open-source projects?",
    a: "Contributing gives you the chance to learn and grow, work alongside professionals, build a solid portfolio and make real-world impact - all while using open source to create a better future.",
  },
  {
    q: "I'm new to coding or open source. Can I still contribute?",
    a: "Absolutely. The club is built for beginners and pros alike. We pair you with mentors and starter-friendly tasks so you learn by doing, at your own pace.",
  },
  {
    q: "How do I get started with Descience open-source contribution?",
    a: "Join the community, pick a domain that excites you, and jump into a guided workshop or a starter project. We'll point you to good first issues.",
  },
  {
    q: "How do I find projects to contribute to?",
    a: "We curate beginner-friendly projects and issues across our domains, and mentors help you choose ones that match your goals and skill level.",
  },
  {
    q: "What if I need help while contributing?",
    a: "Our community and mentors are one message away. Ask anytime - no question is too small, and someone will always help you move forward.",
  },
  {
    q: "Can I use my contributions in my portfolio or resume?",
    a: "Yes! Public contributions are verifiable, real-world proof of your skills. Your commits and projects make a portfolio that speaks for itself.",
  },
  {
    q: "Is contributing only about writing code?",
    a: "Not at all. Design, documentation, testing, community and content all matter. There's a meaningful way to contribute for everyone.",
  },
];

export const socials = [
  { label: "LinkedIn", href: "#" },
  { label: "Facebook", href: "#" },
  { label: "Twitter / X", href: "#" },
  { label: "YouTube", href: "#" },
];
