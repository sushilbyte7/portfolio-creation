'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

function CodeMark({ side }: { side: 'open' | 'close' }) {
  if (side === 'open') {
    return (
      <span className="hero-code-open hero-code-mark" aria-hidden="true">
        <svg viewBox="20 0 110 160" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="square" strokeLinejoin="miter" focusable="false">
          <path className="hero-code-depth" opacity=".16" d="M105 30 48 80 105 130" transform="translate(5 6)" />
          <path d="M105 30 48 80 105 130" />
        </svg>
      </span>
    );
  }
  return (
    <span className="hero-code-close hero-code-mark" aria-hidden="true">
      <svg viewBox="0 0 180 160" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="square" strokeLinejoin="miter" focusable="false">
        <path className="hero-code-depth" opacity=".16" d="M65 30 25 130M100 30 157 80 100 130" transform="translate(5 6)" />
        <path d="M65 30 25 130M100 30 157 80 100 130" />
      </svg>
    </span>
  );
}

const WORDS = ['SOFTWARE', 'ENGINEER'];

export function HeroTitle() {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = headingRef.current;
    const hero = el?.closest('.hero') as HTMLElement | null;
    if (!el || !hero) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        animate: '(prefers-reduced-motion: no-preference)',
        reduce: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        if (context.conditions?.reduce) {
          hero.dataset.heroIntro = 'done';
          el.dataset.motion = 'settled';
          return;
        }

        const letters = el.querySelectorAll<HTMLElement>('.hero-letter');
        const marks = el.querySelectorAll<SVGElement>('.hero-code-mark svg');
        const allTargets = [...letters, ...marks];

        const tl = gsap.timeline({
          paused: true,
          onStart: () => {
            hero.dataset.heroIntro = 'pending';
            el.dataset.motion = 'entering';
            gsap.set(allTargets, { willChange: 'transform,opacity' });
          },
          onComplete: () => {
            hero.dataset.heroIntro = 'done';
            gsap.set(allTargets, { clearProps: 'transform,opacity,willChange' });
            el.dataset.motion = 'settled';
          },
        });

        tl.addLabel('tags', 0.06).addLabel('headline', 0);

        tl.fromTo(
          marks,
          {
            rotation: (i: number) => (i === 0 ? -45 : 45),
            scale: 0.96,
            opacity: 0,
            transformOrigin: '50% 50%',
          },
          {
            rotation: 0,
            scale: 1,
            opacity: 1,
            duration: 0.95,
            stagger: 0.08,
            ease: 'power3.out',
          },
          'tags'
        );

        el.querySelectorAll('.hero-word').forEach((wordEl, wordIdx) => {
          const dir = wordIdx === 0 ? 1 : -1;
          const wordLetters = wordEl.querySelectorAll('.hero-letter');
          tl.fromTo(
            wordLetters,
            {
              yPercent: 105 * dir,
              rotationX: -80 * dir,
              scaleY: 0.65,
              opacity: 0,
              transformOrigin: wordIdx === 0 ? '50% 100%' : '50% 0%',
            },
            {
              yPercent: 0,
              rotationX: 0,
              scaleY: 1,
              opacity: 1,
              duration: 0.82,
              stagger: {
                each: 0.035,
                from: wordIdx === 0 ? 'start' : 'end',
              },
              ease: 'power3.out',
            },
            `headline+=${0.1 * wordIdx}`
          );
        });

        const isVisibleEnough = () => {
          const rect = el.getBoundingClientRect();
          const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
          return visibleHeight >= 0.4 * rect.height;
        };

        let visible = isVisibleEnough();

        const resetToReady = () => {
          tl.pause(0);
          hero.dataset.heroIntro = 'pending';
          el.dataset.motion = 'ready';
          gsap.set(allTargets, { opacity: 0, clearProps: 'willChange' });
        };

        const playIntro = () => {
          resetToReady();
          hero.dataset.introPlays = String(Number(hero.dataset.introPlays || 0) + 1);
          tl.restart();
        };

        const checkVisibility = () => {
          resetToReady();
          visible = isVisibleEnough();
          if (visible) playIntro();
        };

        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              if (entry.intersectionRatio >= 0.4 && !visible) {
                visible = true;
                playIntro();
              }
            } else {
              resetToReady();
              visible = false;
            }
          },
          { threshold: [0, 0.4] }
        );

        observer.observe(el);
        if (visible) playIntro();
        else resetToReady();

        const handlePageShow = (e: PageTransitionEvent) => {
          if (e.persisted) checkVisibility();
        };

        window.addEventListener('pageshow', handlePageShow);

        return () => {
          observer.disconnect();
          window.removeEventListener('pageshow', handlePageShow);
          gsap.set(allTargets, { clearProps: 'transform,opacity,willChange' });
          hero.dataset.heroIntro = 'done';
          delete el.dataset.motion;
        };
      },
      el
    );

    return () => mm.revert();
  }, []);

  return (
    <h1 ref={headingRef} className="hero-title hero-display-title" aria-label="Software Engineer">
      {WORDS.map((word, wordIdx) => (
        <span key={word} className="title-line" aria-hidden="true">
          <span className="hero-word">
            <CodeMark side={wordIdx === 0 ? 'open' : 'close'} />
            {Array.from(word).map((char, charIdx) => (
              <span key={`${char}-${charIdx}`} className="hero-letter-window">
                <span className="hero-letter">{char}</span>
              </span>
            ))}
          </span>
        </span>
      ))}
    </h1>
  );
}
