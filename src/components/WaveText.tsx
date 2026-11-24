'use client';

import React from 'react';

interface WaveTextProps {
  children: string;
  className?: string;
}

export function WaveText({ children, className = '' }: WaveTextProps) {
  if (typeof children !== 'string') return <span>{children}</span>;

  const words = children.split(/(\s+)/);

  return (
    <span className={`wave-text ${className}`}>
      <span className="sr-only">{children}</span>
      <span className="wave-words" aria-hidden="true">
        {words.map((word, i) =>
          word.trim() ? (
            <span key={i} className="wave-window">
              <span className="wave-glyph" data-char={word}>
                {word}
              </span>
            </span>
          ) : (
            <React.Fragment key={i}>{word}</React.Fragment>
          )
        )}
      </span>
    </span>
  );
}

interface WaveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  iconOnly?: boolean;
}

export function WaveButton({ children, className = '', iconOnly = false, ...props }: WaveButtonProps) {
  return (
    <button {...props} className={`wave-target ${className}`}>
      {iconOnly ? (
        children
      ) : typeof children === 'string' ? (
        <WaveText>{children}</WaveText>
      ) : (
        children
      )}
    </button>
  );
}
