import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { formatTime } from '../utils/formatTime';
import Button from './Button';
import './SessionSummary.css';

export default function SessionSummary({ data, onRestart }) {
  const navigate = useNavigate();

  return (
    <div className="summary-overlay">
      <div className="summary-card">
        <div className="summary-header">
          <CheckCircle2 size={48} className="success-icon" />
          <h2 className="summary-title">SESSION COMPLETE</h2>
          <p className="summary-exercise">{data.exercise.toUpperCase()}</p>
        </div>

        <div className="summary-stats">
          <div className="stat-block">
            <span className="stat-val">{data.reps}</span>
            <span className="stat-label">REPS</span>
          </div>

          <div className="stat-divider" />

          <div className="stat-block">
            <span className="stat-val mono">{formatTime(data.time)}</span>
            <span className="stat-label">DURATION</span>
          </div>
        </div>

        <div className="summary-feedback">
          <span className="feedback-label">FEEDBACK</span>
          <p className="feedback-text">
            Strong consistency throughout the session. Focus on maintaining peak form during fatigue.
          </p>
        </div>

        <div className="summary-actions">
          <Button variant="primary" size="lg" onClick={onRestart}>
            TRAIN AGAIN
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/')}>
            BACK HOME
          </Button>
        </div>
      </div>
    </div>
  );
}
