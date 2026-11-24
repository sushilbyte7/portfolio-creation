'use client';

import React, { useEffect } from 'react';

export function SectionObserver() {
  useEffect(() => {
    const portfolio = (document.querySelector('.portfolio') || document.body) as HTMLElement;
    if (!portfolio) return;

    const sections = Array.from(
      portfolio.querySelectorAll<HTMLElement>(
        '.bio-introduction, .bio-description, #skills, #projects, #experience, #contact, .footer-top'
      )
    );

    const animatedSet = new WeakSet<HTMLElement>();
    const activeAnimations = new Map<HTMLElement, Animation>();
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let io: IntersectionObserver | null = null;
    let destroyed = false;

    const init = () => {
      io?.disconnect();
      activeAnimations.forEach((anim) => anim.cancel());
      activeAnimations.clear();
      sections.forEach((el) => el.style.removeProperty('opacity'));

      portfolio.dataset.textMotion = reducedMotion.matches ? 'static' : 'section-fade';
      if (reducedMotion.matches) return;

      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const target = entry.target as HTMLElement;
            if (!entry.isIntersecting || animatedSet.has(target)) return;

            animatedSet.add(target);
            io?.unobserve(target);

            if (target.contains(document.activeElement)) {
              target.style.removeProperty('opacity');
              target.dataset.textReveal = 'done';
              return;
            }

            target.dataset.textReveal = 'playing';
            const anim = target.animate([{ opacity: 0 }, { opacity: 1 }], {
              duration: 1400,
              easing: 'cubic-bezier(.33,0,.2,1)',
              fill: 'both',
            });
            activeAnimations.set(target, anim);

            anim.onfinish = () => {
              activeAnimations.delete(target);
              target.style.removeProperty('opacity');
              if (!destroyed) target.dataset.textReveal = 'done';
              anim.cancel();
            };
          });
        },
        { threshold: 0, rootMargin: '0px 0px 48px 0px' }
      );

      sections.forEach((el) => {
        if (!animatedSet.has(el)) {
          if (el.getBoundingClientRect().top < window.innerHeight) {
            animatedSet.add(el);
            el.dataset.textReveal = 'done';
            return;
          }
          el.style.opacity = '0';
          io?.observe(el);
        }
      });
    };

    const handleFocusIn = (e: FocusEvent) => {
      activeAnimations.forEach((anim, el) => {
        if (e.target instanceof Node && el.contains(e.target)) anim.finish();
      });
      sections.forEach((el) => {
        if (e.target instanceof Node && el.contains(e.target)) {
          el.style.removeProperty('opacity');
          animatedSet.add(el);
          io?.unobserve(el);
        }
      });
    };

    init();
    reducedMotion.addEventListener('change', init);
    portfolio.addEventListener('focusin', handleFocusIn);

    return () => {
      destroyed = true;
      io?.disconnect();
      activeAnimations.forEach((anim) => anim.cancel());
      reducedMotion.removeEventListener('change', init);
      portfolio.removeEventListener('focusin', handleFocusIn);
      sections.forEach((el) => {
        el.style.removeProperty('opacity');
        delete el.dataset.textReveal;
      });
      delete portfolio.dataset.textMotion;
    };
  }, []);

  return null;
}
