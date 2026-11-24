'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { portfolioData } from '../data/portfolioData';
import { WaveText } from './WaveText';
import {
  FileText,
  ArrowRight,
  ArrowUpRight,
  X,
  ExternalLink,
  GitBranch,
} from 'lucide-react';

export function ProjectsSection() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  const handleOpenFolder = (id: string) => {
    setSelectedFolderId((prev) => (prev === id ? null : id));
    if (selectedFolderId !== id) {
      setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  };

  const handleClose = () => {
    setSelectedFolderId(null);
  };

  return (
    <section id="projects" className="projects-section wrap section-pad measure-content" data-sc-act="flow">
      <noscript>
        <style>{`.project-folder-grid,.project-panel-toolbar{display:none!important}@layer base{#project-details-panel[hidden],.project-study[hidden]{display:block!important}}`}</style>
      </noscript>

      {/* Heading */}
      <div className="section-heading">
        <h2>
          Featured<br />Projects
        </h2>
        <a
          href={portfolioData.personal.social.github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link wave-target"
        >
          <WaveText>GitHub</WaveText>
          <ArrowUpRight size={18} aria-hidden="true" />
        </a>
      </div>

      <p className="projects-intro">
        Independent projects and professional work. Open a folder to explore a project or case study.
      </p>

      {/* 3D Manila Folder Grid */}
      <div className="project-folder-grid">
        {portfolioData.projects.map((proj) => {
          const isSelected = selectedFolderId === proj.id;
          return (
            <button
              key={proj.id}
              type="button"
              className="project-folder"
              data-folder-id={proj.id}
              aria-expanded={isSelected}
              aria-controls="project-details-panel"
              onClick={() => handleOpenFolder(proj.id)}
              onPointerMove={(e) => {
                if (e.pointerType !== 'mouse') return;
                const rect = e.currentTarget.getBoundingClientRect();
                const lean = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
                e.currentTarget.style.setProperty('--folder-lean', `${lean}deg`);
              }}
              onPointerLeave={(e) => {
                e.currentTarget.style.setProperty('--folder-lean', '0deg');
              }}
            >
              <span className="sr-only">{proj.title}</span>

              <span className="folder-scene" aria-hidden="true">
                <span className="folder-back" />

                {/* Back Paper */}
                <span className="folder-paper folder-paper-back">
                  <FileText size={18} />
                  <span>{proj.kind === 'case-study' ? 'Case study overview' : 'Project overview'}</span>
                  <span className="folder-paper-lines" />
                </span>

                {/* Preview Paper */}
                <span className="folder-paper folder-paper-preview">
                  {proj.image ? (
                    <Image
                      src={proj.image}
                      alt=""
                      width={600}
                      height={360}
                      sizes="(max-width:700px) 75vw, 300px"
                    />
                  ) : (
                    <span className="folder-case-preview">
                      <span>JAKS &amp; Associates</span>
                      <strong>
                        From requirements<br />to deployment.
                      </strong>
                      <span>An anonymized case study</span>
                    </span>
                  )}
                  <span>{proj.title}</span>
                </span>

                {/* Front Paper */}
                <span className="folder-paper folder-paper-front">
                  <FileText size={18} />
                  <span>{proj.kind === 'case-study' ? 'Role, process & impact' : 'Details & source'}</span>
                  <span className="folder-paper-lines" />
                </span>

                {/* Front Flap */}
                <span className="folder-front">
                  <span className="folder-front-title">{proj.title}</span>
                  <span className="folder-open-icon">
                    <ArrowUpRight size={20} />
                  </span>
                </span>
              </span>

              {/* Caption */}
              <span className="folder-caption">
                <span>{proj.category}</span>
                <span className="folder-caption-action">
                  {proj.kind === 'case-study' ? 'Read case study' : 'View project'}{' '}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Expandable Project Details Drawer */}
      <div
        ref={detailsRef}
        id="project-details-panel"
        className="project-details-panel"
        hidden={!selectedFolderId}
        tabIndex={-1}
        role="region"
      >
        <div className="project-panel-toolbar">
          <span>Project details</span>
          <button
            type="button"
            aria-label="Close project details"
            className="wave-target icon-button"
            onClick={handleClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="project-studies">
          {/* 1. Workflow Automation Case Study */}
          <article
            hidden={selectedFolderId !== 'jaks-case-study'}
            className="project-study jaks-case-study"
            aria-labelledby="jaks-case-study-title"
          >
            <div className="case-study-overview study-content">
              <h3 id="jaks-case-study-title">Workflow Automation</h3>
              <p className="project-category">JAKS &amp; Associates · Professional case study</p>
              <p className="case-study-summary">
                From a recurring manual task to a deployed web application. I handled the project end to end, from gathering requirements and finding a solution to implementation and deployment.
              </p>
              <dl className="case-study-facts">
                <div>
                  <dt>Role</dt>
                  <dd>Software Developer &amp; AI Intern</dd>
                </div>
                <div>
                  <dt>Ownership</dt>
                  <dd>Requirements to deployment</dd>
                </div>
                <div>
                  <dt>Stack</dt>
                  <dd>Python · Django · MySQL</dd>
                </div>
                <div>
                  <dt>Hosting</dt>
                  <dd>Hostinger VPS</dd>
                </div>
              </dl>
              <p className="case-study-privacy">
                An anonymized account of my work at JAKS &amp; Associates. The application name, client identity, and business-specific details are withheld.
              </p>
            </div>

            <div className="case-study-narrative">
              <section className="case-study-section" aria-labelledby="jaks-challenge-title">
                <h4 id="jaks-challenge-title">The challenge</h4>
                <p>
                  A recurring internal workflow required hours of repetitive manual work each month. The goal was to reduce that effort with a reliable web application while keeping people in control of the result.
                </p>
              </section>

              <section className="case-study-section" aria-labelledby="jaks-delivery-title">
                <h4 id="jaks-delivery-title">My approach</h4>
                <ol className="case-study-delivery">
                  <li>
                    <h5>Gather requirements</h5>
                    <p>Collected requirements and clarified the repetitive manual work the application needed to address.</p>
                  </li>
                  <li>
                    <h5>Design the solution</h5>
                    <p>Translated those requirements into a practical web application, with a clear approach to automating the recurring work.</p>
                  </li>
                  <li>
                    <h5>Build the application</h5>
                    <p>Implemented the application using Python and Django with a MySQL database, taking the requirements through to a working solution.</p>
                  </li>
                  <li>
                    <h5>Deploy</h5>
                    <p>Deployed the application on a Hostinger VPS so the team could use it in their everyday work.</p>
                  </li>
                </ol>
              </section>

              <section className="case-study-section" aria-labelledby="jaks-impact-title">
                <h4 id="jaks-impact-title">The impact</h4>
                <p>
                  The team moved from hours of manual processing to a workflow completed in minutes, freeing time for review and decisions.
                </p>
                <div className="case-study-impact" role="group" aria-label="Estimated monthly effort before and after automation">
                  <dl>
                    <dt>Before · per month</dt>
                    <dd>~60 hours</dd>
                  </dl>
                  <ArrowRight size={24} aria-hidden="true" />
                  <dl>
                    <dt>After · per month</dt>
                    <dd>~10 minutes</dd>
                  </dl>
                </div>
                <p className="case-study-estimate">Approximate times, based on the team's estimates.</p>
              </section>
            </div>
          </article>

          {/* 2. SmartOps */}
          <article
            hidden={selectedFolderId !== 'smartops'}
            className="smartops-act project-study"
            aria-labelledby="smartops-title"
          >
            <a
              className="project-image-link"
              href="https://smart-ops-eight.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open SmartOps live app"
            >
              <figure className="project-image image-smartops">
                <Image
                  src="/smartops-screenshot.png"
                  alt="SmartOps live application screenshot"
                  width={1440}
                  height={1000}
                />
              </figure>
            </a>
            <div className="study-content">
              <h3 id="smartops-title">SmartOps</h3>
              <p className="project-category">Multi-workspace AI, CSV + PDF</p>
              <p className="project-summary">
                A dual-engine AI workspace combining instant tabular analysis for structured CSV data and deep semantic retrieval for unstructured PDF documents.
              </p>
              <div className="project-actions">
                <a href="https://smart-ops-eight.vercel.app/" target="_blank" rel="noopener noreferrer" className="btn-primary wave-target">
                  <WaveText>Live Application</WaveText> <ExternalLink size={16} />
                </a>
                <a href="https://github.com/aswin-panengal/SmartOps" target="_blank" rel="noopener noreferrer" className="btn-secondary wave-target">
                  <WaveText>Source Code</WaveText> <GitBranch size={16} />
                </a>
              </div>
            </div>
          </article>

          {/* 3. ResumeLens */}
          <article
            hidden={selectedFolderId !== 'resumelens'}
            className="project-study study-resumelens"
            aria-labelledby="resumelens-title"
          >
            <a
              className="project-image-link"
              href="https://resumelens-ai.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open ResumeLens live app"
            >
              <figure className="project-image image-resumelens">
                <Image
                  src="/resumelens-screenshot.png"
                  alt="ResumeLens live application screenshot"
                  width={1440}
                  height={1000}
                />
              </figure>
            </a>
            <div className="study-content">
              <h3 id="resumelens-title">ResumeLens</h3>
              <p className="project-category">Semantic recruitment &amp; resume coaching</p>
              <p className="project-summary">
                AI platform providing semantic recruitment candidate matching and interactive resume coaching using dense vector embeddings.
              </p>
              <div className="project-actions">
                <a href="https://resumelens-ai.vercel.app/" target="_blank" rel="noopener noreferrer" className="btn-primary wave-target">
                  <WaveText>Live Application</WaveText> <ExternalLink size={16} />
                </a>
                <a href="https://github.com/aswin-panengal/ResumeLens" target="_blank" rel="noopener noreferrer" className="btn-secondary wave-target">
                  <WaveText>Source Code</WaveText> <GitBranch size={16} />
                </a>
              </div>
            </div>
          </article>

          {/* 4. CRIS */}
          <article
            hidden={selectedFolderId !== 'cris'}
            className="project-study study-cris"
            aria-labelledby="cris-title"
          >
            <a
              className="project-image-link"
              href="https://cris-churn.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open CRIS live app"
            >
              <figure className="project-image image-cris">
                <Image
                  src="/cris-screenshot.png"
                  alt="CRIS live application screenshot"
                  width={1440}
                  height={1000}
                />
              </figure>
            </a>
            <div className="study-content">
              <h3 id="cris-title">CRIS</h3>
              <p className="project-category">Customer Retention Intelligence System</p>
              <p className="project-summary">
                Predictive customer retention system that forecasts customer churn risk and recommends targeted retention playbooks using machine learning.
              </p>
              <div className="project-actions">
                <a href="https://cris-churn.vercel.app/" target="_blank" rel="noopener noreferrer" className="btn-primary wave-target">
                  <WaveText>Live Application</WaveText> <ExternalLink size={16} />
                </a>
                <a href="https://github.com/aswin-panengal/CRIS" target="_blank" rel="noopener noreferrer" className="btn-secondary wave-target">
                  <WaveText>Source Code</WaveText> <GitBranch size={16} />
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
