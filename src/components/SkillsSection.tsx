'use client';

import React from 'react';
import { portfolioData } from '../data/portfolioData';

export function SkillsSection() {
  return (
    <section id="skills" className="skills-section section-pad" data-sc-act="flow">
      <div className="wrap">
        <div className="skills-heading">
          <h2>Tech Stack</h2>
          <p>
            The tools behind<br /> my work.
          </p>
        </div>

        <div className="skills-specimens">
          {portfolioData.skills.map((specimen) => {
            const id = `skills-${specimen.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
            return (
              <article key={specimen.label} className="skills-specimen" aria-labelledby={id}>
                <h3 id={id}>{specimen.label}</h3>
                <p className="skills-specimen-note">{specimen.note}</p>
                <ul className="skills-type-mosaic">
                  {specimen.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
