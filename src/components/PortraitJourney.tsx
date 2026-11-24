'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';

export function PortraitJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const card = cardRef.current;
    const section = container?.closest('.about-section') as HTMLElement | null;
    const heroLink = section?.querySelector<HTMLElement>('.hero-portrait-link');
    const bioFigure = section?.querySelector<HTMLElement>('.bio-portrait');

    if (!container || !card || !section || !heroLink || !bioFigure) return;

    const motionAllowed = matchMedia('(prefers-reduced-motion: no-preference)');
    const isMobileCoarse = matchMedia('(max-width: 700px) and (pointer: coarse)');
    const stage = container.querySelector<HTMLElement>('.portrait-sticky-stage');

    let rafId = 0;
    let animProgress = 0;
    let targetProgress = 0;
    let startY = 0;
    let travelDist = 1;
    let scaleX = 0.5;
    let scaleY = 0.5;
    let translateY = 0;
    let translateX = 0;
    let heroRadius = 9;
    let bioRadius = 16;
    let lastTime = 0;
    let destroyed = false;

    const applyTransform = () => {
      const curScaleX = scaleX + (1 - scaleX) * animProgress;
      const curScaleY = scaleY + (1 - scaleY) * animProgress;
      const flipEase = animProgress * animProgress * (3 - 2 * animProgress);

      card.style.transform = `perspective(1200px) translate(${translateX * (1 - animProgress)}px, ${translateY * (1 - animProgress)}px) scale(${curScaleX}, ${curScaleY}) rotateY(${180 * flipEase}deg)`;
      card.style.borderRadius = `${heroRadius + (bioRadius - heroRadius) * animProgress}px`;
      card.style.willChange = animProgress > 0 && animProgress < 1 ? 'transform' : 'auto';
      section.classList.toggle('portrait-motion-active', targetProgress > 0 || animProgress > 0);
    };

    const tick = (now: number) => {
      const dt = lastTime ? Math.min(now - lastTime, 64) : 16.67;
      lastTime = now;
      animProgress += (targetProgress - animProgress) * (1 - Math.exp(-dt / (isMobileCoarse.matches ? 100 : 65)));
      const settled = Math.abs(targetProgress - animProgress) < 0.0001;
      if (settled) animProgress = targetProgress;
      applyTransform();
      rafId = settled ? 0 : requestAnimationFrame(tick);
      if (settled) lastTime = 0;
    };

    const onScroll = () => {
      if (!motionAllowed.matches) return;
      targetProgress = Math.max(0, Math.min(1, (window.scrollY - startY) / travelDist));
      section.classList.toggle('portrait-motion-active', targetProgress > 0 || animProgress > 0);
      if (!rafId && targetProgress !== animProgress) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const layout = () => {
      if (destroyed) return;
      cancelAnimationFrame(rafId);
      rafId = 0;
      lastTime = 0;

      if (!motionAllowed.matches) {
        section.classList.remove('portrait-motion-ready', 'portrait-motion-active');
        return;
      }

      section.classList.add('portrait-motion-ready');
      const sectionRect = section.getBoundingClientRect();
      const heroRect = heroLink.getBoundingClientRect();
      const bioRect = bioFigure.getBoundingClientRect();

      const stageHeight = isMobileCoarse.matches
        ? stage?.getBoundingClientRect().height || window.innerHeight
        : document.documentElement.clientHeight;
      const bioTopInStage = stageHeight - 20 - bioRect.height;

      startY = sectionRect.top + window.scrollY;
      travelDist = bioRect.top + window.scrollY - startY - bioTopInStage;

      if (travelDist <= 0 || !bioRect.width) {
        section.classList.remove('portrait-motion-ready', 'portrait-motion-active');
        return;
      }

      scaleX = heroRect.width / bioRect.width;
      scaleY = heroRect.height / bioRect.height;
      translateY = heroRect.top + window.scrollY - startY - bioTopInStage - (bioRect.height - heroRect.height) / 2;
      translateX = heroRect.left + heroRect.width / 2 - (bioRect.left + bioRect.width / 2);

      heroRadius = parseFloat(getComputedStyle(heroLink).borderTopLeftRadius || '9') / Math.min(scaleX, scaleY);
      bioRadius = parseFloat(getComputedStyle(bioFigure).borderTopLeftRadius || '16');

      container.style.height = `${travelDist + stageHeight}px`;
      card.style.width = `${bioRect.width}px`;
      card.style.height = `${bioRect.height}px`;
      card.style.left = `${bioRect.left - sectionRect.left}px`;
      card.style.top = `${bioTopInStage}px`;

      animProgress = targetProgress = Math.max(0, Math.min(1, (window.scrollY - startY) / travelDist));
      section.classList.toggle('portrait-motion-active', targetProgress > 0);
      applyTransform();
      section.classList.add('portrait-motion-ready');
    };

    const ro = new ResizeObserver(layout);
    ro.observe(heroLink);
    ro.observe(bioFigure);

    let prevWidth = window.innerWidth;
    const onResize = () => {
      if (isMobileCoarse.matches && window.innerWidth === prevWidth) return;
      prevWidth = window.innerWidth;
      layout();
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pageshow', layout);
    motionAllowed.addEventListener('change', layout);

    layout();
    if (document.fonts?.ready) {
      document.fonts.ready.then(layout);
    }

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pageshow', layout);
      motionAllowed.removeEventListener('change', layout);
      section.classList.remove('portrait-motion-ready', 'portrait-motion-active');
    };
  }, []);

  return (
    <div ref={containerRef} className="portrait-journey" aria-hidden="true">
      <div className="portrait-sticky-stage">
        <div ref={cardRef} className="portrait-card">
          <div className="portrait-face portrait-face-front">
            <Image src="/bg.jpg" alt="" width={1280} height={1280} priority unoptimized />
          </div>
          <div className="portrait-face portrait-face-back">
            <Image src="/bg.jpg" alt="" width={1280} height={1280} priority unoptimized />
          </div>
        </div>
      </div>
    </div>
  );
}
