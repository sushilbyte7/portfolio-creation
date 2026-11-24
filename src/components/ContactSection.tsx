'use client';

import React, { useState, useRef, useEffect } from 'react';
import { portfolioData } from '../data/portfolioData';
import { WaveText } from './WaveText';
import { Copy, Check, ArrowUpRight } from 'lucide-react';

export function ContactSection() {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [draftUrl, setDraftUrl] = useState<string>('');
  const formRef = useRef<HTMLFormElement>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(portfolioData.personal.email);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopyStatus('idle'), 3000);
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form || !form.reportValidity()) return;

    const data = new FormData(form);
    const bodyText = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('project')}`;
    const mailto = `mailto:${portfolioData.personal.email}?subject=${encodeURIComponent(
      'Portfolio inquiry'
    )}&body=${encodeURIComponent(bodyText)}`;

    setDraftUrl(mailto);
    window.location.href = mailto;
  };

  return (
    <section id="contact" className="contact-section section-pad" data-sc-act="flow">
      <div className="wrap">
        <div className="contact-layout">
          {/* Left Column: Opening & Links */}
          <div className="contact-opening">
            <h2>Let's talk.</h2>
            <p>Whether it's a full-time role or a freelance project, my inbox is open.</p>

            <div className="contact-details">
              <div className="email-block">
                <a className="email-link wave-target" href={`mailto:${portfolioData.personal.email}`}>
                  <WaveText>{portfolioData.personal.email}</WaveText>
                  <ArrowUpRight size={20} aria-hidden="true" />
                </a>

                <button
                  type="button"
                  className="icon-button copy-email"
                  onClick={handleCopyEmail}
                  aria-label={copyStatus === 'copied' ? 'Email copied' : 'Copy email address'}
                >
                  {copyStatus === 'copied' ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>

              <span className="copy-status" role="status">
                {copyStatus === 'copied'
                  ? 'Email copied'
                  : copyStatus === 'failed'
                  ? 'Please use the email link'
                  : ''}
              </span>
            </div>

            <div className="social-links">
              {Object.entries(portfolioData.personal.social).map(([name, url]) => (
                <a
                  key={name}
                  className="wave-target"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WaveText>{name.charAt(0).toUpperCase() + name.slice(1)}</WaveText>
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Right Column: Form */}
          <form
            ref={formRef}
            className="contact-form"
            action={`mailto:${portfolioData.personal.email}`}
            method="post"
            encType="text/plain"
            onSubmit={handleSubmit}
            onChange={() => setDraftUrl('')}
          >
            <div className="contact-field">
              <label htmlFor="inquiry-name">Your name</label>
              <input
                id="inquiry-name"
                name="name"
                placeholder="What should I call you?"
                autoComplete="name"
                required
              />
            </div>

            <div className="contact-field">
              <label htmlFor="inquiry-email">Email address</label>
              <input
                id="inquiry-email"
                name="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="contact-field">
              <label htmlFor="inquiry-project">What's on your mind?</label>
              <textarea
                id="inquiry-project"
                name="project"
                placeholder="Tell me about your project, timeline, or what you're building..."
                rows={4}
                required
              />
            </div>

            <button type="submit" className="contact-submit wave-target">
              <WaveText>Send message</WaveText>
              <ArrowUpRight size={18} aria-hidden="true" />
            </button>

            {draftUrl && (
              <p className="contact-draft-note">
                If your email client didn't open automatically,{' '}
                <a href={draftUrl} className="underline">
                  click here to send
                </a>
                .
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
