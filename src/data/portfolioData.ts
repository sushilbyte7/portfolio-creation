// ============================================================================
// PORTFOLIO CENTRAL CONFIGURATION & EDITABLE DATA PLACEHOLDERS
// All personal information, projects, experience, skills, and links are here.
// You can edit any value in this file to customize the site for yourself.
// ============================================================================

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  shortDesc: string;
  longDesc?: string;
  kind?: 'project' | 'case-study';
  stack: string[];
  github?: string;
  demo?: string;
  image?: string;
  width?: number;
  height?: number;
  metric?: string;
  outcome?: string;
}

export interface SkillCategory {
  label: string;
  short: string;
  note: string;
  skills: string[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  city?: string;
  date: string;
  status?: string;
  description: string;
}

export interface PortfolioData {
  personal: {
    name: string;
    firstName: string;
    role: string;
    focus: string[];
    email: string;
    bio: string;
    bioSecondary: string;
    location: string;
    social: {
      github: string;
      linkedin: string;
      instagram: string;
      upwork: string;
    };
  };
  skills: SkillCategory[];
  projects: ProjectItem[];
  caseStudySteps: { title: string; description: string }[];
  experience: ExperienceItem[];
  footer: {
    catchphrase: string;
    caption: string;
    castSize: number;
    giantName: string;
  };
}

export const portfolioData: PortfolioData = {
  personal: {
    name: "Aswin Panengal",
    firstName: "Aswin",
    role: "AI Engineer & Full-Stack Developer",
    focus: ["RAG pipelines", "LLM agents", "AI apps"],
    email: "aswinpanengal@gmail.com",
    bio: "I build software with a focus on AI systems, RAG pipelines, and full-stack web applications. Currently working in software development and AI in Kochi, turning ideas into reliable products.",
    bioSecondary: "Passionate about building fast, accessible web applications and practical agentic workflows that solve real problems.",
    location: "Kochi, India",
    social: {
      github: "https://github.com/aswin-panengal",
      linkedin: "https://www.linkedin.com/in/aswinpanengal/",
      instagram: "https://www.instagram.com/aswinpanengal/",
      upwork: "https://www.upwork.com/freelancers/~0168f500087a66cdcd"
    }
  },
  skills: [
    {
      label: "AI & Machine Learning",
      short: "AI and ML",
      note: "Prompt engineering, evaluation, and LLM applications",
      skills: [
        "LLMs",
        "Generative AI",
        "RAG",
        "Agentic Workflows",
        "LangChain",
        "LangGraph",
        "Prompt Engineering",
        "Sentence Transformers",
        "RAGAS"
      ]
    },
    {
      label: "Languages & Frameworks",
      short: "Languages",
      note: "Core engineering and backend development",
      skills: [
        "Python",
        "TypeScript",
        "FastAPI",
        "Django",
        "React",
        "Next.js",
        "Tailwind CSS",
        "RESTful APIs"
      ]
    },
    {
      label: "Tools, Databases & Cloud",
      short: "Tools and Cloud",
      note: "Infrastructure, data storage, and deployment",
      skills: [
        "PostgreSQL",
        "SQL",
        "Qdrant",
        "ChromaDB",
        "Pandas",
        "NumPy",
        "Scikit-learn",
        "Docker",
        "Git & GitHub",
        "Playwright",
        "Cloudflare",
        "Vercel"
      ]
    }
  ],
  projects: [
    {
      id: "jaks-case-study",
      title: "Workflow Automation",
      category: "JAKS & Associates · Case study",
      kind: "case-study",
      shortDesc: "From recurring manual task to a deployed web application.",
      longDesc: "From a recurring manual task to a deployed web application. I handled the project end to end, from gathering requirements and finding a solution to implementation and deployment.",
      stack: ["Python", "Django", "MySQL", "Hostinger VPS"],
      metric: "~60 hours/month to ~10 minutes",
      outcome: "Freed team time for critical reviews and higher-value client work."
    },
    {
      id: "smartops",
      title: "SmartOps",
      category: "Dual-engine AI workspace",
      kind: "project",
      shortDesc: "A multi-workspace AI platform using LangGraph state routing for deterministic CSV analysis and semantic PDF retrieval.",
      longDesc: "A multi-workspace AI platform using LangGraph state routing for deterministic CSV analysis and semantic PDF retrieval. Combines high-precision analytical calculations on tabular datasets with dense vector semantic search over document collections.",
      stack: ["FastAPI", "Next.js 14", "TypeScript", "LangGraph", "Qdrant", "Pandas", "Gemini API", "Docker"],
      github: "https://github.com/aswin-panengal/SmartOps",
      demo: "https://smart-ops-eight.vercel.app/",
      image: "/smartops-screenshot.png",
      width: 1440,
      height: 1000,
      metric: "Sub-second state-routed responses",
      outcome: "Seamless dual-engine handling of both structured and unstructured business intelligence."
    },
    {
      id: "resumelens",
      title: "ResumeLens",
      category: "Semantic recruitment",
      kind: "project",
      shortDesc: "An AI-powered placement platform for automated resume coaching and smart candidate matching",
      longDesc: "ResumeLens is an AI-powered recruitment platform that revolutionizes university placements using semantic vector matching and generative AI coaching. Built with Django, ChromaDB, and Google Gemini, it provides students with actionable resume feedback while equipping recruiters with a powerful 'Chat with Resume' RAG interface to instantly discover top talent.",
      stack: ["Python", "Django", "Gemini API", "RAG", "Sentence Transformers", "ChromaDB"],
      github: "https://github.com/aswin-panengal/ResumeLens",
      demo: "https://www.loom.com/share/edaf4624a1364f6f98a20c7f1ce7cb69",
      image: "/resumelens-screenshot.png",
      width: 1916,
      height: 903,
      metric: "40% reduction in token usage",
      outcome: "Screening time reduced from hours to under 30 seconds."
    },
    {
      id: "cris",
      title: "CRIS",
      category: "Predictive analytics",
      kind: "project",
      shortDesc: "Customer Retention Intelligence System for predicting churn.",
      longDesc: "An end-to-end predictive analytics engine that identifies at-risk customers using Random Forest classification. By implementing SMOTE to handle class imbalance and fine-tuning decision thresholds, the system delivers a 94% accuracy rate, allowing businesses to execute proactive retention strategies before churn occurs.",
      stack: ["Python", "Pandas", "Scikit-learn", "Random Forest", "SMOTE", "Streamlit"],
      github: "https://github.com/aswin-panengal/Customer-Retention-Intelligence-System",
      image: "/cris-screenshot.png",
      width: 1872,
      height: 857,
      metric: "79% recall for high-risk customer detection",
      outcome: "Supports proactive customer retention strategies."
    }
  ],
  caseStudySteps: [
    {
      title: "Gather requirements",
      description: "Collected requirements and clarified the repetitive manual work the application needed to address."
    },
    {
      title: "Design the solution",
      description: "Translated those requirements into a practical web application, with a clear approach to automating the recurring work."
    },
    {
      title: "Build the application",
      description: "Implemented the application using Python and Django with a MySQL database, taking the requirements through to a working solution."
    },
    {
      title: "Deploy",
      description: "Deployed the application on a Hostinger VPS so the team could use it in their everyday work."
    }
  ],
  experience: [
    {
      id: "jaks",
      role: "Software Developer & AI Intern",
      company: "JAKS & Associates",
      city: "Kochi",
      date: "August 2026 – Present",
      status: "Current role",
      description: "Working in software development and AI as an intern at JAKS & Associates in Kochi."
    },
    {
      id: "freelance",
      role: "Freelance Web Developer",
      company: "Client projects",
      date: "Ongoing",
      status: "Ongoing",
      description: "Built and delivered websites for clients. Currently working on freelance projects."
    },
    {
      id: "masters",
      role: "Master of Computer Applications",
      company: "Pondicherry University",
      date: "2024 – 2026",
      description: "Graduated April 2026 / GPA 7.3"
    },
    {
      id: "internship",
      role: "Data Science Intern",
      company: "AI Variant",
      city: "Remote",
      date: "September 2023 – March 2024",
      description: "Completed a six-month data science internship."
    },
    {
      id: "bachelors",
      role: "Bachelor of Computer Applications",
      company: "Calicut University",
      date: "2020 – 2023",
      description: "Graduated April 2023 / GPA 6.5"
    }
  ],
  footer: {
    catchphrase: "See you around.",
    caption: "Finally, some traffic on my website.",
    castSize: 105,
    giantName: "ASWIN."
  }
};
