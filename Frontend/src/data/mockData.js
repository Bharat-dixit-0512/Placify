export const stats = [
  { label: "Active learners", value: "2,450" },
  { label: "Verified mentors", value: "68" },
  { label: "Interview stories", value: "312" },
  { label: "Chats closed with success", value: "1,120" }
]

export const features = [
  {
    title: "Verified knowledge hub",
    body: "Centralize curated placement guidance, tagged by company, role, and difficulty."
  },
  {
    title: "Mentorship workflows",
    body: "Structured request, approval, and 30‑day chat cycles with seniors and mentors."
  },
  {
    title: "Placement cell control",
    body: "Faculty moderation, notices, and analytics for accountability and compliance."
  },
  {
    title: "Role-based access",
    body: "Keep the right content in the right hands with branch and role controls."
  }
]

export const roles = [
  {
    name: "Students",
    description: "Discover preparation pathways, request chat approvals, join group sessions.",
    pill: "Student",
    tone: "primary"
  },
  {
    name: "Placed Seniors",
    description: "Share verified experiences, review requests, and mentor the next batch.",
    pill: "Senior",
    tone: "success"
  },
  {
    name: "External Mentors",
    description: "Deliver scheduled group mentorship sessions with faculty visibility.",
    pill: "Mentor",
    tone: "accent"
  },
  {
    name: "T&P Faculty",
    description: "Approve mentors, manage notices, and track outcomes from one dashboard.",
    pill: "Admin",
    tone: "primary"
  }
]

export const blogs = [
  {
    id: 1,
    title: "Flipkart SDE-1 interview: from aptitude to HM round",
    author: "Aarav Mehta",
    company: "Flipkart",
    role: "SDE-1",
    difficulty: "medium",
    tags: ["DSA", "System Design", "Behavioral"],
    excerpt:
      "What actually mattered was crisp story telling and a tight revision schedule in the final two weeks."
  },
  {
    id: 2,
    title: "Goldman Sachs quant prep: 6-week sprint",
    author: "Riya Kapoor",
    company: "Goldman Sachs",
    role: "Quant Analyst",
    difficulty: "hard",
    tags: ["Probability", "Math", "Finance"],
    excerpt:
      "We mapped each topic to likely interview rounds and locked revision milestones."
  },
  {
    id: 3,
    title: "TCS Digital: how I optimized my project story",
    author: "Devansh Rao",
    company: "TCS",
    role: "Digital",
    difficulty: "easy",
    tags: ["Projects", "Communication"],
    excerpt:
      "Structured STAR responses were enough to make the project narrative clear and confident."
  }
]

export const notices = [
  {
    id: 1,
    title: "Infosys drive eligibility released",
    body: "Students with 7.0+ CGPA and no active backlogs are eligible. Register by Friday.",
    tags: ["Drive", "Eligibility"],
    pinned: true
  },
  {
    id: 2,
    title: "Resume review desk",
    body: "Faculty will review resumes in Lab 2 between 2–5 PM on Wednesday.",
    tags: ["Resume", "Support"],
    pinned: false
  }
]

export const sessions = [
  {
    id: 1,
    title: "Mock interview: product rounds",
    mentor: "Priya Narang",
    time: "Feb 10, 4:00 PM",
    capacity: "80",
    status: "Scheduled"
  },
  {
    id: 2,
    title: "DSA rapid revision clinic",
    mentor: "Arjun Singh",
    time: "Feb 12, 6:30 PM",
    capacity: "120",
    status: "Scheduled"
  }
]

export const chats = [
  {
    id: 1,
    name: "Aarav Mehta",
    role: "Placed Senior",
    lastMessage: "Send me your resume draft and I’ll review."
  },
  {
    id: 2,
    name: "Priya Narang",
    role: "External Mentor",
    lastMessage: "We’ll cover product case frameworks in the next session."
  }
]

export const messages = [
  { id: 1, from: "them", text: "Hey! Happy to help with your prep plan." },
  { id: 2, from: "me", text: "Thanks! I’m focusing on system design this week." },
  { id: 3, from: "them", text: "Great. I’ll share a checklist and you can send updates." }
]

export const analytics = [
  { label: "Blogs published", value: 312 },
  { label: "Active chats", value: 86 },
  { label: "Sessions hosted", value: 42 },
  { label: "Students verified", value: 2180 }
]
