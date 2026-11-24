'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { Sun, Moon, Ellipsis, X } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

const platformLogos: Record<string, string> = {
  LinkedIn:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  GitHub:
    'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  Instagram:
    'M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.07M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077',
  Upwork:
    'M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.548-1.405-.002-2.543-1.143-2.545-2.548V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439z',
};

function NavMenuText({ children }: { children: string }) {
  return (
    <span className="nav-menu-text">
      <span className="sr-only">{children}</span>
      <span aria-hidden="true">
        {Array.from(children).map((char, index) => (
          <span key={index} className="nav-menu-piece">
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
    </span>
  );
}

export function SiteHeader() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('about');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wordmarkRef = useRef<HTMLSpanElement>(null);
  const animTimeline = useRef<gsap.core.Timeline | null>(null);
  const motionState = useRef<'closed' | 'open' | 'closing'>('closed');

  // Sync theme
  useEffect(() => {
    const saved = localStorage.getItem('portfolio-theme') as 'dark' | 'light' | null;
    const initial = saved || (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
    setTheme(initial);
    if (initial === 'dark') {
      document.documentElement.dataset.theme = 'dark';
    } else {
      delete document.documentElement.dataset.theme;
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'dark') {
      document.documentElement.dataset.theme = 'dark';
    } else {
      delete document.documentElement.dataset.theme;
    }
    try {
      localStorage.setItem('portfolio-theme', next);
    } catch {}
    window.dispatchEvent(new Event('portfolio-theme'));
  };

  // Authentic periodic rotating wordmark animation matching 21sr_t--ov9wk.js
  useEffect(() => {
    let timer: number | undefined;
    const target = wordmarkRef.current;
    const link = target?.closest('a');
    if (!target || !link) return;

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let state: {
      from: number;
      target: number;
      started: number;
      speed: number;
      fastFor: number;
      coastFor: number;
    } | null = null;
    let rafId = 0;
    let hovered = false;

    const getPhysics = (now: number) => {
      if (!state) return { angle: 0, speed: 0, finished: true };
      const elapsed = Math.max(0, now - state.started);
      if (elapsed < state.fastFor) {
        return { angle: state.from + state.speed * elapsed, speed: state.speed, finished: false };
      }
      const t = Math.min(1, (elapsed - state.fastFor) / state.coastFor);
      const coastDelta = (state.speed * state.coastFor) / 2;
      return {
        angle: state.from + state.speed * state.fastFor + coastDelta * (2 * t - t * t),
        speed: state.speed * (1 - t),
        finished: t === 1,
      };
    };

    const stop = () => {
      cancelAnimationFrame(rafId);
      rafId = 0;
      state = null;
      target.style.removeProperty('transform');
      target.style.removeProperty('will-change');
      target.dataset.spinning = 'false';
    };

    const step = (now: number) => {
      const res = getPhysics(now);
      if (res.finished) {
        stop();
      } else {
        target.style.transform = `rotate(${res.angle}deg)`;
        rafId = requestAnimationFrame(step);
      }
    };

    const startSpin = (newState: {
      from: number;
      target: number;
      started: number;
      speed: number;
      fastFor: number;
      coastFor: number;
    }) => {
      cancelAnimationFrame(rafId);
      state = newState;
      target.style.willChange = 'transform';
      target.dataset.spinning = 'true';
      rafId = requestAnimationFrame(step);
    };

    const triggerRotation = () => {
      if (reducedMotion.matches || document.hidden) return;
      const now = performance.now();
      const { angle } = getPhysics(now);
      let rem = 360 - (((angle % 360) + 360) % 360);
      if (rem < 180) rem += 360;
      startSpin({
        from: angle,
        target: angle + rem,
        started: now,
        speed: 1.05,
        fastFor: 120,
        coastFor: (2 * (rem - 126)) / 1.05,
      });
    };

    const coastToTarget = () => {
      if (!state) return;
      const now = performance.now();
      const res = getPhysics(now);
      if (res.finished || res.speed <= 0) {
        stop();
      } else {
        startSpin({
          from: res.angle,
          target: state.target,
          started: now,
          speed: res.speed,
          fastFor: 0,
          coastFor: (2 * (state.target - res.angle)) / res.speed,
        });
      }
    };

    const resetInterval = () => {
      if (timer) window.clearInterval(timer);
      if (reducedMotion.matches || document.hidden) {
        hovered = false;
        stop();
        return;
      }
      if (!hovered && document.activeElement !== link) {
        timer = window.setInterval(() => {
          if (!state && !hovered) triggerRotation();
        }, 3000);
      }
    };

    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || hovered) return;
      hovered = true;
      if (timer) window.clearInterval(timer);
      triggerRotation();
    };

    const onPointerLeave = () => {
      hovered = false;
      coastToTarget();
      resetInterval();
    };

    const onFocus = () => {
      if (timer) window.clearInterval(timer);
      if (!hovered && link.matches(':focus-visible')) triggerRotation();
    };

    const onBlur = () => {
      if (!hovered) coastToTarget();
      resetInterval();
    };

    link.addEventListener('pointerenter', onPointerEnter as EventListener);
    link.addEventListener('pointerleave', onPointerLeave as EventListener);
    link.addEventListener('focus', onFocus as EventListener);
    link.addEventListener('blur', onBlur as EventListener);
    reducedMotion.addEventListener('change', resetInterval);
    document.addEventListener('visibilitychange', resetInterval);

    resetInterval();

    return () => {
      if (timer) window.clearInterval(timer);
      stop();
      link.removeEventListener('pointerenter', onPointerEnter as EventListener);
      link.removeEventListener('pointerleave', onPointerLeave as EventListener);
      link.removeEventListener('focus', onFocus as EventListener);
      link.removeEventListener('blur', onBlur as EventListener);
      reducedMotion.removeEventListener('change', resetInterval);
      document.removeEventListener('visibilitychange', resetInterval);
    };
  }, []);

  // Section observer for active link
  useEffect(() => {
    const sections = ['about', 'skills', 'projects', 'experience', 'contact'];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-15% 0px -65% 0px', threshold: 0 }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  // Lock body scroll when modal open
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  // Clean up animations on unmount
  useEffect(() => {
    return () => {
      animTimeline.current?.kill();
    };
  }, []);

  const openMenu = () => {
    const dialog = dialogRef.current;
    if (!dialog || motionState.current !== 'closed') return;
    animTimeline.current?.kill();

    const pieces = Array.from(dialog.querySelectorAll<HTMLElement>('.nav-menu-piece'));
    gsap.set([dialog, ...pieces], { clearProps: 'transform,opacity,visibility,willChange' });
    gsap.set(dialog, { '--nav-backdrop-opacity': 1 });

    motionState.current = 'open';
    dialog.dataset.motion = 'open';
    dialog.showModal();
    setMenuOpen(true);
    dialog.querySelector('.nav-panel')?.scrollTo(0, 0);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const modalRect = dialog.getBoundingClientRect();
    const triggerRect = triggerRef.current?.getBoundingClientRect();

    animTimeline.current = gsap.timeline();
    // Modal expands from 3-dot trigger button
    animTimeline.current.fromTo(
      dialog,
      {
        scaleX: triggerRect ? triggerRect.width / modalRect.width : 0.06,
        scaleY: triggerRect ? triggerRect.height / modalRect.height : 0.04,
        x: triggerRect ? triggerRect.right - modalRect.right : 0,
        y: triggerRect ? triggerRect.top - modalRect.top - 16 : 0,
        transformOrigin: 'top right',
        autoAlpha: 0,
        '--nav-backdrop-opacity': 0,
      },
      {
        scaleX: 1,
        scaleY: 1,
        x: 0,
        y: 0,
        autoAlpha: 1,
        '--nav-backdrop-opacity': 1,
        duration: 0.42,
        ease: 'power3.out',
      }
    );

    // Staggered text pieces reveal
    animTimeline.current.fromTo(
      pieces,
      {
        y: 28,
        autoAlpha: 0,
        rotation: (i) => ((i * 17) % 31) - 15,
      },
      {
        y: 0,
        autoAlpha: 1,
        rotation: 0,
        duration: 0.45,
        stagger: { amount: 0.22, from: 'start' },
        ease: 'power2.out',
        onComplete: () => {
          gsap.set(pieces, { clearProps: 'transform,rotate,translate,scale' });
        },
      },
      '-=0.22'
    );
  };

  const closeMenu = useCallback((callback?: () => void) => {
    const dialog = dialogRef.current;
    if (!dialog?.open || motionState.current === 'closing') return;

    animTimeline.current?.kill();
    motionState.current = 'closing';
    dialog.dataset.motion = 'closing';

    const done = () => {
      dialog.close();
      animTimeline.current = null;
      motionState.current = 'closed';
      delete dialog.dataset.motion;
      setMenuOpen(false);
      triggerRef.current?.focus({ preventScroll: true });
      if (callback) callback();
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      done();
      return;
    }

    const pieces = Array.from(dialog.querySelectorAll<HTMLElement>('.nav-menu-piece'));
    const modalRect = dialog.getBoundingClientRect();
    const offsets = pieces.map((p) => modalRect.bottom - p.getBoundingClientRect().top + 80);
    const triggerRect = triggerRef.current?.getBoundingClientRect();

    animTimeline.current = gsap
      .timeline({ onComplete: done })
      .set(pieces, { willChange: 'transform,opacity' }, 0.22)
      .to(
        pieces,
        {
          y: (i) => `+=${offsets[i]}`,
          x: (i) => `+=${((29 * i) % 83) - 41}`,
          rotation: (i) => ((37 * i) % 97) - 48,
          duration: 0.7,
          stagger: { amount: 0.18, from: 'random' },
          ease: 'power2.in',
        },
        0.22
      )
      .to(
        pieces,
        {
          autoAlpha: 0,
          duration: 0.16,
          stagger: { amount: 0.18 },
          ease: 'power1.in',
        },
        0.76
      )
      .to(
        dialog,
        {
          scaleX: triggerRect ? triggerRect.width / modalRect.width : 0.06,
          scaleY: triggerRect ? triggerRect.height / modalRect.height : 0.04,
          x: triggerRect ? triggerRect.right - modalRect.right : 0,
          y: triggerRect ? triggerRect.top - modalRect.top - 16 : 0,
          transformOrigin: 'top right',
          autoAlpha: 0,
          '--nav-backdrop-opacity': 0,
          duration: 0.46,
          ease: 'power3.inOut',
        },
        '+=.12'
      );
  }, []);

  return (
    <>
      {/* Centered Floating Pill Navigation Header */}
      <header className="site-header" role="banner">
        <div className="header-inner">
          <a href="#about" className="wordmark" aria-label="Aswin Panengal, home">
            <span className="wordmark-text" ref={wordmarkRef}>
              {portfolioData.personal.firstName.charAt(0) + portfolioData.personal.firstName.slice(1).toLowerCase()}
            </span>
          </a>

          <div className="header-actions">
            <button
              type="button"
              className="icon-button theme-toggle wave-target"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              aria-pressed={theme === 'dark'}
            >
              <span className="wave-icon" aria-hidden="true" style={{ '--wave-icon-size': '20px' } as React.CSSProperties}>
                <span className="wave-icon-track">
                  <span>
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  </span>
                  <span>
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  </span>
                </span>
              </span>
            </button>

            <button
              ref={triggerRef}
              type="button"
              className="icon-button nav-menu-trigger wave-target"
              aria-label="Navigation menu"
              aria-expanded={menuOpen}
              aria-controls="navigation-panel"
              aria-haspopup="dialog"
              onClick={openMenu}
            >
              <span className="wave-icon" aria-hidden="true" style={{ '--wave-icon-size': '24px' } as React.CSSProperties}>
                <span className="wave-icon-track">
                  <span>
                    <Ellipsis size={24} />
                  </span>
                  <span>
                    <Ellipsis size={24} />
                  </span>
                </span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Modal / Drawer */}
      <dialog
        ref={dialogRef}
        id="navigation-panel"
        className="nav-dialog"
        aria-label="Navigation menu"
        onCancel={(e) => {
          e.preventDefault();
          closeMenu();
        }}
        onClose={() => {
          animTimeline.current?.kill();
          motionState.current = 'closed';
          delete dialogRef.current?.dataset.motion;
          setMenuOpen(false);
          triggerRef.current?.focus({ preventScroll: true });
        }}
        onKeyDown={(e) => {
          if (e.key !== 'Tab') return;
          const focusables = e.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          if (
            e.target === e.currentTarget &&
            (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom)
          ) {
            closeMenu();
            return;
          }
          const link = (e.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null;
          if (!link || link.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          closeMenu(() => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
              const target = document.querySelector(href);
              target?.scrollIntoView({ behavior: 'smooth' });
            } else if (href) {
              window.location.assign(href);
            }
          });
        }}
      >
        <div className="nav-panel">
          <div className="nav-panel-top">
            <button
              type="button"
              className="nav-panel-close wave-target"
              onClick={() => closeMenu()}
              aria-label="Close navigation menu"
            >
              <NavMenuText>close</NavMenuText>
              <span className="nav-close-circle nav-menu-piece">
                <X size={23} aria-hidden="true" />
              </span>
            </button>
          </div>

          <nav className="nav-panel-links" aria-label="Site navigation">
            <div className="nav-menu-primary">
              {[
                { id: 'projects', label: 'Projects' },
                { id: 'about', label: 'About' },
                { id: 'contact', label: 'Contact' },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  aria-current={activeSection === item.id ? 'location' : undefined}
                >
                  <NavMenuText>{item.label}</NavMenuText>
                </a>
              ))}
            </div>

            <div className="nav-menu-secondary">
              {[
                { id: 'skills', label: 'Skills', href: '#skills' },
                { id: 'experience', label: 'Experience', href: '#experience' },
                { id: 'freelance', label: 'Freelance', href: '#projects' },
                { id: 'world', label: 'World of Aswin', href: '#about' },
              ].map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  aria-current={activeSection === item.id ? 'page' : undefined}
                >
                  <NavMenuText>{item.label}</NavMenuText>
                </a>
              ))}
            </div>
          </nav>

          <div className="nav-panel-footer">
            <a
              href={`mailto:${portfolioData.personal.email}`}
              className="nav-panel-email"
            >
              <NavMenuText>{portfolioData.personal.email}</NavMenuText>
            </a>

            <div className="nav-panel-socials">
              {[
                ['Instagram', portfolioData.personal.social.instagram || 'https://www.instagram.com/aswinpanengal/'],
                ['GitHub', portfolioData.personal.social.github || 'https://github.com/aswin-panengal'],
                ['Upwork', portfolioData.personal.social.upwork || 'https://www.upwork.com/freelancers/~0168f500087a66cdcd'],
                ['LinkedIn', portfolioData.personal.social.linkedin || 'https://www.linkedin.com/in/aswinpanengal/'],
              ].map(([platform, url]) => (
                <a
                  key={platform}
                  className="nav-menu-piece"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={platform}
                >
                  {platformLogos[platform] ? (
                    <svg
                      className="platform-logo"
                      viewBox="0 0 24 24"
                      width={18}
                      height={18}
                      fill="currentColor"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d={platformLogos[platform]} />
                    </svg>
                  ) : (
                    <span className="text-xs font-bold uppercase">{platform.slice(0, 2)}</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
