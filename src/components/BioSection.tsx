'use client';

import React from 'react';
import Image from 'next/image';
import { portfolioData } from '../data/portfolioData';
import { WaveText } from './WaveText';
import { MapPin, Briefcase } from 'lucide-react';

export function BioSection() {
  return (
    <section id="about" className="wrap section-pad">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Bio Portrait Target */}
        <div className="lg:col-span-5 flex justify-center lg:justify-start">
          <div className="bio-portrait">
            <Image
              src="/bg.jpg"
              alt="Aswin Panengal"
              width={600}
              height={600}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </div>

        {/* Bio Description */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex items-center gap-3 text-sm text-[var(--sc-ink-soft)]">
            <span className="flex items-center gap-1.5 bg-[var(--sc-surface)] px-3 py-1 rounded-full border border-[var(--sc-hairline)]">
              <MapPin size={14} />
              {portfolioData.personal.location}
            </span>
            <span className="flex items-center gap-1.5 bg-[var(--sc-surface)] px-3 py-1 rounded-full border border-[var(--sc-hairline)]">
              <Briefcase size={14} />
              Available for work
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--sc-ink)]">
            Hi, I'm <WaveText>{portfolioData.personal.name.split(' ')[0]}</WaveText>.
          </h2>

          <p className="text-lg md:text-xl text-[var(--sc-ink-soft)] leading-relaxed">
            {portfolioData.personal.bio}
          </p>

          <p className="text-base md:text-lg text-[var(--sc-ink-soft)] leading-relaxed">
            {portfolioData.personal.bioSecondary}
          </p>

          {/* Quick Terminal Code Box */}
          <div className="mt-4 p-4 rounded-xl bg-[var(--sc-surface)] border border-[var(--sc-hairline-strong)] font-mono text-sm">
            <span className="text-[var(--sc-ink-soft)] select-none">{'{'}{'{'} </span>
            <span className="text-[var(--sc-ink)] font-semibold">focus: </span>
            <span className="text-emerald-400">"{portfolioData.personal.focus.join(', ')}"</span>
            <span className="terminal-caret" />
            <span className="text-[var(--sc-ink-soft)] select-none"> {'}'}{'}'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
