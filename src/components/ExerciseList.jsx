import React from 'react';
import { exerciseCategories } from '../data/exercises';
import './ExerciseList.css';

export default function ExerciseList() {
  return (
    <div className="exercise-grid">
      {exerciseCategories.map((cat) => (
        <div key={cat.category} className="exercise-category">
          <h3 className="category-title">{cat.category}</h3>
          <ul className="category-items">
            {cat.items.map((item, idx) => (
              <li key={item} className="exercise-item">
                <span className="exercise-index">{String(idx + 1).padStart(2, '0')}</span>
                <span className="exercise-name">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}