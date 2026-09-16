import React from 'react';
import './FeatureList.css';

const features = [
  { id: '01', title: 'REAL-TIME ANALYSIS', desc: 'Your movement is analyzed while you train. No delays, no post-processing.' },
  { id: '02', title: 'FORM FEEDBACK', desc: 'Get immediate feedback when your technique needs adjustment.' },
  { id: '03', title: 'REP TRACKING', desc: 'Automatically track movement phases and completed repetitions.' },
  { id: '04', title: 'POSE INTELLIGENCE', desc: 'Track key body landmarks to understand your movement mechanics.' },
  { id: '05', title: 'MULTIPLE EXERCISES', desc: 'Analyze a growing library of strength and conditioning movements.' },
  { id: '06', title: 'PRIVATE BY DESIGN', desc: 'Workout analysis runs locally without requiring an account.' }
];

export default function FeatureList() {
  return (
    <div className="feature-list">
      {features.map((f, i) => (
        <article key={f.id} className="feature-item">
          <div className="feature-header">
            <span className="feature-id">{f.id}</span>
            <h3 className="feature-title">{f.title}</h3>
          </div>
          <div className="feature-divider" />
          <p className="feature-desc">{f.desc}</p>
        </article>
      ))}
    </div>
  );
}