'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import { GlyphBackground } from './GlyphBackground';
import { HeroTitle } from './HeroTitle';
import { PortraitJourney } from './PortraitJourney';
import { WaveText } from './WaveText';

const backgroundCode = `const aswin = {
  name: "Aswin Panengal",
  role: "AI Engineer & Full-Stack Developer",
  focus: ["RAG pipelines", "LLM agents", "AI apps"],
  experience: [
    { role: "Software Developer & AI Intern",
      company: "JAKS & Associates", city: "Kochi",
      since: "August 2026", status: "Current" },
    { role: "Freelance Web Developer",
      delivered: "Client websites", status: "Ongoing" }
  ],
  education: [
    { degree: "Master of Computer Applications",
      university: "Pondicherry University",
      graduated: "April 2026", gpa: 7.3 },
    { degree: "Bachelor of Computer Applications",
      university: "Calicut University",
      graduated: "April 2023", gpa: 6.5 }
  ],
  projects: {
    SmartOps: "Multi-workspace AI, CSV + PDF",
    ResumeLens: "Semantic recruitment & resume coaching",
    CRIS: "Customer Retention Intelligence System"
  },
  skills: {
    "AI & Machine Learning": ["LLMs", "Generative AI",
      "RAG", "Agentic Workflows", "LangChain", "LangGraph",
      "Prompt Engineering", "Sentence Transformers", "RAGAS"],
    "Languages & Frameworks": ["Python", "TypeScript",
      "FastAPI", "Django", "React", "Next.js",
      "Tailwind CSS", "RESTful APIs"],
    "Tools, Databases & Cloud": ["PostgreSQL", "SQL",
      "Qdrant", "ChromaDB", "Pandas", "NumPy",
      "Scikit-learn", "Docker", "Git & GitHub",
      "Playwright", "Cloudflare", "Vercel"]
  },
  services: ["Landing pages", "Portfolios",
    "Automation", "AI-powered web apps"],
  email: "aswinpanengal@gmail.com",
  github: "https://github.com/aswin-panengal",
  linkedin: "https://www.linkedin.com/in/aswinpanengal/",
  instagram: "https://www.instagram.com/aswinpanengal/",
  world: { name: "World of Aswin", status: "Playable foundation at /world",
    concept: "A future game or 3D walkthrough" }
};

export default function Portfolio() {
  return <main>
    <header><h1>{aswin.name}</h1><p>{aswin.role}</p></header>
    <section><h2>Experience</h2>
      {aswin.experience.map(job => <article key={job.role}>
        <h3>{job.role}</h3><p>{job.company || job.delivered}</p>
        <small>{job.status}</small>
      </article>)}
    </section>
    <section><h2>Education</h2>
      {aswin.education.map(study => <article key={study.degree}>
        <h3>{study.degree}</h3><p>{study.university}</p>
        <small>{study.graduated} / GPA {study.gpa}</small>
      </article>)}
    </section>
    <section><h2>Projects</h2>
      {Object.entries(aswin.projects).map(([name, detail]) =>
        <article key={name}><h3>{name}</h3><p>{detail}</p></article>)}
    </section>
    <section><h2>Tech Stack</h2>
      {Object.entries(aswin.skills).map(([category, tools]) =>
        <div key={category}><h3>{category}</h3><p>{tools.join(", ")}</p></div>)}
    </section>
    <section><h2>Freelance with Aswin</h2>
      <p>{aswin.services.join(" / ")}</p>
    </section>
    <footer><a href={"mailto:" + aswin.email}>Let's talk.</a></footer>
  </main>;
}`;

export function AboutSection() {
  return (
    <section id="about" className="about-section">
      {/* 3D Flying Portrait Card */}
      <PortraitJourney />

      {/* Hero Section */}
      <div className="hero wrap" data-sc-act="flow" data-hero-intro="pending">
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: '.hero[data-hero-intro="pending"] .hero-letter, .hero[data-hero-intro="pending"] .hero-code-mark svg { opacity: 1 !important; }' }} />
        </noscript>

        {/* WebGL Code Background */}
        <GlyphBackground code={backgroundCode} className="hero-code-background" />

        {/* Hero Portrait Link Target */}
        <a href="#biography" className="hero-portrait-link" aria-label={`About ${portfolioData.personal.name}`}>
          <Image
            src="/bg.jpg"
            alt={`${portfolioData.personal.name} in black and white`}
            width={1280}
            height={1280}
            priority
            unoptimized
          />
        </a>

        {/* Authentic Hero Title with GSAP 3D Entrance */}
        <div className="hero-heading-composition">
          <HeroTitle />
        </div>

        {/* Hero Footer */}
        <div className="hero-footer">
          <span className="hero-year">©2026</span>
          <span className="hero-focus">
            <span className="terminal-text">
              <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: '{{&nbsp;' }} />
              <span>/AI &amp; FULL-STACK DEVELOPMENT</span>
              <span className="terminal-caret" aria-hidden="true" />
              <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: '&nbsp;}}' }} />
            </span>
          </span>
        </div>
      </div>

      {/* Biography Section */}
      <div id="biography" className="biography wrap measure-content" data-sc-act="flow">
        <div className="bio-introduction">
          <h2>
            Hi, I'm<br /> {portfolioData.personal.firstName.charAt(0).toUpperCase() + portfolioData.personal.firstName.slice(1).toLowerCase()}.
          </h2>
          <p className="bio-role">
            AI Engineer <span>&amp; Full-Stack Developer.</span>
          </p>
          <div className="bio-current">
            <span>Currently at</span>
            <p>
              <strong>JAKS &amp; Associates</strong>
              <br />
              Software Developer &amp; AI Intern
              <br />
              <span>Kochi, India</span>
            </p>
          </div>
        </div>

        <figure className="bio-portrait">
          <Image
            src="/bg.jpg"
            alt={`Portrait of ${portfolioData.personal.name}`}
            loading="lazy"
            width={1280}
            height={1280}
            unoptimized
          />
        </figure>

        <div className="bio-description">
          <p className="bio-lead">
            I build <strong>RAG pipelines</strong> and <strong>automate repetitive workflows</strong>, saving hours of manual work.
          </p>
          <div className="bio-actions">
            <a className="bio-projects wave-target" href="#projects">
              <WaveText>Explore projects</WaveText>
              <ArrowUpRight size={20} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
