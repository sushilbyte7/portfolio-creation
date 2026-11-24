'use client';

import React, { useEffect, useRef, useState } from 'react';
import { portfolioData } from '../data/portfolioData';

export function ExperienceSection() {
  const roadmapRef = useRef<HTMLDivElement>(null);
  const [roadGeometry, setRoadGeometry] = useState({ d: '', width: 1000, height: 800 });

  useEffect(() => {
    const container = roadmapRef.current;
    if (!container) return;

    let destroyed = false;

    const computeRoad = () => {
      if (destroyed) return;
      const containerRect = container.getBoundingClientRect();
      const markers = Array.from(container.querySelectorAll<HTMLElement>('.journey-stop-marker'));
      if (markers.length < 2) return;

      const points = markers.map((m) => {
        const rect = m.getBoundingClientRect();
        return {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2,
        };
      });

      const isMobile = window.matchMedia('(max-width: 1000px)').matches;
      let pathD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const cur = points[i];
        if (isMobile) {
          const midY = (prev.y + cur.y) / 2;
          pathD += ` C ${prev.x + 28} ${midY}, ${cur.x - 20} ${midY}, ${cur.x} ${cur.y}`;
        } else {
          const midX = (prev.x + cur.x) / 2;
          pathD += ` C ${midX} ${prev.y}, ${midX} ${cur.y}, ${cur.x} ${cur.y}`;
        }
      }

      setRoadGeometry({
        d: pathD,
        width: containerRect.width,
        height: containerRect.height,
      });
    };

    const ro = new ResizeObserver(computeRoad);
    ro.observe(container);
    container.querySelectorAll('.journey-stop').forEach((s) => ro.observe(s));

    const io = new IntersectionObserver(
      ([entry]) => {
        container.dataset.drawn = String(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );
    io.observe(container);

    computeRoad();
    if (document.fonts?.ready) {
      document.fonts.ready.then(computeRoad);
    }

    return () => {
      destroyed = true;
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <section id="experience" className="experience-section section-pad" data-sc-act="flow">
      <div className="wrap">
        <div className="experience-heading">
          <h2>Experience.</h2>
          <p>
            Current work.<br /> Back to the foundations.
          </p>
        </div>

        <div ref={roadmapRef} className="journey-roadmap" data-drawn="false">
          {/* Dynamic SVG Road Overlay */}
          {roadGeometry.d && (
            <svg
              className="journey-road"
              viewBox={`0 0 ${roadGeometry.width} ${roadGeometry.height}`}
              preserveAspectRatio="none"
              aria-hidden="true"
              style={{ fill: 'none' }}
            >
              <path className="journey-road-base" d={roadGeometry.d} fill="none" />
              <path className="journey-road-ink" d={roadGeometry.d} pathLength={1} fill="none" />
            </svg>
          )}

          {/* Milestone Stops */}
          {portfolioData.experience.map((item, idx) => {
            const isNow = idx === 0;
            return (
              <article
                key={item.id}
                className={`journey-stop ${isNow ? 'journey-now' : ''} journey-${item.id}`}
                aria-labelledby={`exp-${item.id}-title`}
              >
                <span className="journey-stop-marker" aria-hidden="true">
                  <span />
                </span>

                <div className="journey-stop-content">
                  <p className="journey-date">
                    {isNow && <span className="journey-current">Current role</span>}
                    {item.date}
                  </p>
                  <h3 id={`exp-${item.id}-title`}>
                    {item.role.includes('&') ? (
                      <>
                        {item.role.split('&')[0]}
                        <br />
                        &amp; {item.role.split('&')[1]?.trim()}
                      </>
                    ) : (
                      item.role
                    )}
                  </h3>
                  <p className="journey-place">
                    {item.company} <span>{item.city}</span>
                  </p>
                  <p className="journey-description">{item.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
