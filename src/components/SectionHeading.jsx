import React from 'react';
import './SectionHeading.css';

export default function SectionHeading({ eyebrow, title, highlight }) {
  return (
    <header className="section-heading">
      {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
      <h2 className="section-title">
        {title.split('\n').map((line, i) => (
          <span key={i} className="title-line">
            {line.replace(highlight, '')}
            {line.includes(highlight) && <span className="text-accent">{highlight}</span>}
            <br />
          </span>
        ))}
      </h2>
    </header>
  );
}