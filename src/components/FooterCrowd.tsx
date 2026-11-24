'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { portfolioData } from '../data/portfolioData';
import { WaveText } from './WaveText';
import { ArrowUp, ArrowUpRight } from 'lucide-react';

interface Walker {
  phase: number;
  speed: number;
  cell: number;
  sheetIndex: number;
  layer: 0 | 1; // 0 = back, 1 = front
  direction: 1 | -1; // 1 = right, -1 = left
  w: number;
  h: number;
  scale: number;
  baseline: number;
}

export function FooterCrowd() {
  const containerRef = useRef<HTMLButtonElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);
  const frontCanvasRef = useRef<HTMLCanvasElement>(null);

  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [ready, setReady] = useState(false);

  const stateRef = useRef({
    paused: false,
    reduced: false,
    sync: () => {},
  });

  useEffect(() => {
    stateRef.current.paused = paused;
    stateRef.current.reduced = reducedMotion;
    stateRef.current.sync();
  }, [paused, reducedMotion]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(mq.matches);
    updateMotion();
    mq.addEventListener('change', updateMotion);
    return () => mq.removeEventListener('change', updateMotion);
  }, []);

  const handleBackToTop = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (reducedMotion) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [reducedMotion]);

  useEffect(() => {
    const button = containerRef.current;
    const backCanvas = backCanvasRef.current;
    const frontCanvas = frontCanvasRef.current;
    if (!button || !backCanvas || !frontCanvas) return;

    const backCtx = backCanvas.getContext('2d');
    const frontCtx = frontCanvas.getContext('2d');
    if (!backCtx || !frontCtx) return;

    const contexts = [backCtx, frontCtx];

    const sheetPaths = Array.from({ length: 7 }, (_, i) => `/footer/bengaluru/crowd-${String(i + 1).padStart(2, '0')}.webp`);
    const images: HTMLImageElement[] = sheetPaths.map((src) => {
      const img = new window.Image();
      img.src = src;
      return img;
    });

    let isOffscreen = false;
    let isTabHidden = false;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let virtualElapsed = 0;
    let lastTime = 0;
    let rafId = 0;
    let walkers: Walker[] = [];
    const totalCast = 105;

    const pseudoRandom = (seed: number) => {
      const val = 43758.5453 * Math.sin(127.1 * seed + 311.7);
      return val - Math.floor(val);
    };

    const initWalkers = () => {
      const isMobile = window.innerWidth < 600;
      const rearCount = isMobile ? 7 : 25;
      const foreCount = isMobile ? 3 : 16;
      const list: Walker[] = [];

      // Rear row (smaller, left to right, direction = 1)
      for (let i = 0; i < rearCount; i++) {
        const seed = i * 1.618;
        const cell = Math.floor(pseudoRandom(seed) * totalCast);
        const sheetIndex = Math.floor(cell / 15);
        list.push({
          phase: pseudoRandom(seed + 1),
          speed: 0.65 + pseudoRandom(seed + 2) * 0.45,
          cell: cell % 15,
          sheetIndex: sheetIndex % images.length,
          layer: 0,
          direction: 1,
          w: isMobile ? 95 : 135,
          h: isMobile ? 190 : 270,
          scale: 0.8 + pseudoRandom(seed + 3) * 0.15,
          baseline: height - 12,
        });
      }

      // Foreground row (larger, cropped at bottom, right to left, direction = -1)
      for (let i = 0; i < foreCount; i++) {
        const seed = 50 + i * 2.718;
        const cell = Math.floor(pseudoRandom(seed) * totalCast);
        const sheetIndex = Math.floor(cell / 15);
        list.push({
          phase: pseudoRandom(seed + 1),
          speed: 0.7 + pseudoRandom(seed + 2) * 0.5,
          cell: cell % 15,
          sheetIndex: sheetIndex % images.length,
          layer: 1,
          direction: -1,
          w: isMobile ? 140 : 210,
          h: isMobile ? 260 : 380,
          scale: 1.05 + pseudoRandom(seed + 3) * 0.2,
          baseline: height + 35, // bodies naturally cropped at bottom
        });
      }

      walkers = list;
    };

    const resize = () => {
      const rect = button.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      [backCanvas, frontCanvas].forEach((c) => {
        c.width = width * dpr;
        c.height = height * dpr;
        c.style.width = `${width}px`;
        c.style.height = `${height}px`;
      });

      initWalkers();
    };

    const render = () => {
      contexts.forEach((ctx) => {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);
      });

      const wrapPadding = 200;
      const travelWidth = width + wrapPadding * 2;

      walkers.forEach((w) => {
        const img = images[w.sheetIndex] || images[0];
        if (!img.complete || img.naturalWidth === 0) return;

        const cols = 5;
        const rows = 3;
        const cellW = img.naturalWidth / cols;
        const cellH = img.naturalHeight / rows;
        const col = w.cell % cols;
        const row = Math.floor(w.cell / cols);

        const progress = (w.phase + (virtualElapsed * w.speed) / 12) % 1;
        const currentX = (w.direction === 1 ? progress : 1 - progress) * travelWidth - wrapPadding;

        // Subtle vertical bobbing ~2 Hz
        const bob = (1 - Math.cos((virtualElapsed * w.speed * 2.2 + w.phase * 10) * Math.PI * 2)) * 4.5;

        const ctx = contexts[w.layer];
        ctx.save();
        ctx.translate(currentX, w.baseline - bob);
        ctx.scale(w.direction, 1);

        const drawW = w.w * w.scale;
        const drawH = w.h * w.scale;

        ctx.drawImage(
          img,
          col * cellW,
          row * cellH,
          cellW,
          cellH,
          -drawW / 2,
          -drawH,
          drawW,
          drawH
        );

        ctx.restore();
      });
    };

    const loop = (now: number) => {
      if (lastTime) {
        const delta = Math.min((now - lastTime) / 1000, 0.05);
        if (!stateRef.current.paused && !stateRef.current.reduced && !isOffscreen && !isTabHidden) {
          virtualElapsed += delta;
        }
      }
      lastTime = now;
      render();
      rafId = requestAnimationFrame(loop);
    };

    const handleVisibility = () => {
      isTabHidden = document.hidden;
    };

    const observer = new IntersectionObserver(([entry]) => {
      isOffscreen = !entry.isIntersecting;
    });

    observer.observe(button);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('resize', resize);

    resize();
    setReady(true);
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const togglePause = () => {
    setPaused((prev) => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      togglePause();
    }
  };

  return (
    <footer className="site-footer">
      {/* Footer Top Content */}
      <div className="footer-top wrap">
        {/* Column 1: Identity */}
        <div className="footer-identity">
          <h2>{portfolioData.personal.firstName.charAt(0) + portfolioData.personal.firstName.slice(1).toLowerCase()}.</h2>
          <p>
            {portfolioData.personal.role.split('&')[0]}&amp;
            <br />
            {portfolioData.personal.role.split('&')[1]?.trim() || 'Full-Stack Developer'}.
          </p>
        </div>

        {/* Column 2: Explore Navigation (Wrapped 2-row layout) */}
        <nav aria-label="Footer navigation">
          <p>Explore</p>
          <div>
            <a href="#about" className="wave-target">
              <WaveText>About</WaveText>
            </a>
            <a href="#skills" className="wave-target">
              <WaveText>Skills</WaveText>
            </a>
            <a href="#projects" className="wave-target">
              <WaveText>Projects</WaveText>
            </a>
            <a href="#experience" className="wave-target">
              <WaveText>Experience</WaveText>
            </a>
            <a href="#about" className="wave-target">
              <WaveText>Freelance</WaveText>
            </a>
            <a href="#about" className="wave-target">
              <WaveText>World of Aswin</WaveText>
            </a>
            <a href="#contact" className="wave-target">
              <WaveText>Contact</WaveText>
            </a>
          </div>
        </nav>

        {/* Column 3: Get In Touch */}
        <div className="footer-contact">
          <p>Get in touch</p>
          <a href={`mailto:${portfolioData.personal.email}`} className="wave-target flex items-center gap-1 font-semibold">
            <WaveText>{portfolioData.personal.email}</WaveText>
            <ArrowUpRight size={16} />
          </a>
          <span>
            © {new Date().getFullYear()} {portfolioData.personal.name} ·{' '}
            <a href="#about">Privacy</a>
          </span>
        </div>
      </div>

      {/* Finale Heading */}
      <div className="footer-finale">
        <div className="footer-finale-heading wrap">
          <p>{portfolioData.footer.catchphrase}</p>
          <a href="#about" onClick={handleBackToTop} className="wave-target">
            Back to top <ArrowUp size={16} />
          </a>
        </div>

        {/* Accessible Crowd Scene Button */}
        <button
          ref={containerRef}
          type="button"
          className="footer-crowd-scene"
          onClick={togglePause}
          onKeyDown={handleKeyDown}
          aria-label={`${portfolioData.footer.giantName} ${paused ? 'Resume' : 'Pause'} crowd animation`}
          aria-pressed={paused}
          data-cast-size={portfolioData.footer.castSize}
          data-ready={ready}
        >
          {/* Giant Pale Gray Background Name */}
          <span className="footer-crowd-name" aria-hidden="true">
            {portfolioData.footer.giantName}
          </span>

          {/* Layer 1: Rear Walkers Canvas */}
          <canvas ref={backCanvasRef} className="footer-crowd-layer footer-crowd-back" aria-hidden="true" />

          {/* Layer 2: Stationary Personal Character Artwork */}
          <img
            src="/footer/character.png"
            alt={`${portfolioData.personal.name} standing`}
            className="footer-crowd-portrait"
            width={375}
            height={1400}
            loading="lazy"
          />

          {/* Layer 3: Foreground Walkers Canvas */}
          <canvas ref={frontCanvasRef} className="footer-crowd-layer footer-crowd-front" aria-hidden="true" />
        </button>

        {/* Bottom Strip with Muted Caption */}
        <div className="footer-scene-bottom wrap">
          <small>{portfolioData.footer.caption}</small>
        </div>
      </div>
    </footer>
  );
}
