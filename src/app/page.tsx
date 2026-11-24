'use client';

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { AboutSection } from '../components/AboutSection';
import { SkillsSection } from '../components/SkillsSection';
import { ProjectsSection } from '../components/ProjectsSection';
import { ExperienceSection } from '../components/ExperienceSection';
import { ContactSection } from '../components/ContactSection';
import { FooterCrowd } from '../components/FooterCrowd';
import { SectionObserver } from '../components/SectionObserver';

declare global {
  interface Window {
    ScrollCraft?: {
      mount: (el: HTMLElement) => { layout: () => void; destroy: () => void };
    };
  }
}

export default function HomePage() {
  const [scrollCraftReady, setScrollCraftReady] = useState(false);
  const portfolioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollCraftReady || !portfolioRef.current || !window.ScrollCraft) return;

    const instance = window.ScrollCraft.mount(portfolioRef.current);
    const ro = new ResizeObserver(() => instance.layout());
    portfolioRef.current.querySelectorAll('.measure-content').forEach((el) => ro.observe(el));

    const mediaQuery = matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = () => instance.layout();
    mediaQuery.addEventListener('change', handleMotionChange);

    return () => {
      ro.disconnect();
      mediaQuery.removeEventListener('change', handleMotionChange);
      instance.destroy();
    };
  }, [scrollCraftReady]);

  return (
    <div ref={portfolioRef} className="portfolio">
      <Script
        src="/scrollcraft.js"
        strategy="afterInteractive"
        onReady={() => setScrollCraftReady(true)}
      />

      {/* Global Section Fade Animation Engine */}
      <SectionObserver />

      {/* 1. About Section (Hero + 3D Flying Portrait + Biography) */}
      <AboutSection />

      {/* 2. Skills / Tech Stack */}
      <SkillsSection />

      {/* 3. Featured Projects & 3D Manila Folders */}
      <ProjectsSection />

      {/* 4. Experience & Animated SVG Roadmap */}
      <ExperienceSection />

      {/* 5. Contact Section */}
      <ContactSection />

      {/* 6. Dual-Canvas Animated Crowd Footer */}
      <FooterCrowd />
    </div>
  );
}
