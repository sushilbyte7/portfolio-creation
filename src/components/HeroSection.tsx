'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { portfolioData } from '../data/portfolioData';

const backgroundCode = `const aswin = {
  name: "Aswin Panengal",
  role: "AI Engineer & Full-Stack Developer",
  focus: ["RAG pipelines", "LLM agents", "AI apps"],
  experience: [
    { role: "Software Developer & AI Intern", company: "JAKS & Associates", city: "Kochi", since: "August 2026", status: "Current" },
    { role: "Freelance Web Developer", delivered: "Client websites", status: "Ongoing" }
  ],
  education: [
    { degree: "Master of Computer Applications", university: "Pondicherry University", graduated: "April 2026", gpa: 7.3 },
    { degree: "Bachelor of Computer Applications", university: "Calicut University", graduated: "April 2023", gpa: 6.5 }
  ],
  projects: {
    SmartOps: "Multi-workspace AI, CSV + PDF",
    ResumeLens: "Semantic recruitment & resume coaching",
    CRIS: "Customer Retention Intelligence System"
  },
  skills: {
    "AI & Machine Learning": ["LLMs", "Generative AI", "RAG", "Agentic Workflows", "LangChain", "LangGraph", "Prompt Engineering"],
    "Languages & Frameworks": ["Python", "TypeScript", "FastAPI", "Django", "React", "Next.js", "Tailwind CSS", "RESTful APIs"],
    "Tools, Databases & Cloud": ["PostgreSQL", "SQL", "Qdrant", "ChromaDB", "Pandas", "NumPy", "Scikit-learn", "Docker", "Git"]
  },
  email: "aswinpanengal@gmail.com",
  github: "https://github.com/aswin-panengal",
  linkedin: "https://www.linkedin.com/in/aswinpanengal/"
};`;

function TerminalTagline({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let isIntersecting = true;
    const update = () => {
      el.dataset.running = String(isIntersecting && !media.matches);
    };
    const io = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      update();
    });
    io.observe(el);
    media.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    update();
    return () => {
      io.disconnect();
      media.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  return (
    <span className="terminal-text" ref={ref} data-running="true">
      <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: '{{&nbsp;' }} />
      <span>{text}</span>
      <span className="terminal-caret" aria-hidden="true" />
      <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: '&nbsp;}}' }} />
    </span>
  );
}

export function HeroSection() {
  return (
    <div className="hero wrap" data-sc-act="flow">
      {/* Background Code Fallback / Watermark */}
      <div className="glyph-background" aria-hidden="true">
        <pre className="glyph-code-fallback">{backgroundCode}</pre>
      </div>

      {/* Main Hero Visual Title & Portrait */}
      <div className="hero-main">
        <div className="hero-heading-composition">
          <h1 className="hero-title">
            <span className="flex items-center">
              <span className="hero-bracket font-light text-black opacity-80 select-none">&lt;&nbsp;</span>
              <span>SOFTWARE</span>
            </span>
            <span className="flex items-center">
              <span>ENGINEER</span>
              <span className="hero-bracket font-light text-black opacity-80 select-none">&nbsp;/&gt;</span>
            </span>
          </h1>

          {/* Centered Portrait */}
          <div className="hero-portrait-wrapper">
            <a href="#about" className="hero-portrait-link" aria-label="Aswin Panengal portrait">
              <Image
                src="/bg.jpg"
                alt="Aswin Panengal"
                width={400}
                height={400}
                className="w-full h-full object-cover"
                priority
              />
            </a>
          </div>
        </div>
      </div>

      {/* Hero Footer */}
      <div className="hero-footer">
        <span className="hero-year font-bold">
          &copy;2026
        </span>

        <span className="hero-focus">
          <TerminalTagline text="/AI & FULL-STACK DEVELOPMENT" />
        </span>
      </div>
    </div>
  );
}
