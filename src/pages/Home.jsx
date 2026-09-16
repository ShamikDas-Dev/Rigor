import React from 'react';
import { ArrowRight, Linkedin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import SectionHeading from '../components/SectionHeading';
import FeatureList from '../components/FeatureList';
import Footer from '../components/Footer';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <Navbar />
      
      {/* HERO SECTION */}
      <section id="home" className="hero-section">
        {/* Background effects */}
        <div className="hero-glow" />
        
        <div className="container hero-container">
          <div className="hero-content">
            <span className="hero-eyebrow">REAL-TIME MOVEMENT INTELLIGENCE</span>
            <h1 className="hero-title">
              TRAIN WITH<br />
              <span className="text-accent">PRECISION.</span>
            </h1>
            <p className="hero-desc">
              RIGOR uses computer vision to analyze your movement, count your reps, and give real-time form feedback.
            </p>
            <div className="hero-actions">
              <Button 
                variant="primary" 
                size="lg" 
                icon={<ArrowRight size={18} />}
                onClick={() => navigate('/workout')}
              >
                START WORKOUT
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
              >
                HOW IT WORKS
              </Button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="mock-cv-interface">
              <div className="mock-header">
                <span className="mock-status"><span className="dot" /> SQUAT DETECTED</span>
                <span className="mock-fps">60 FPS</span>
              </div>
              
              <div className="mock-body">
                {/* Abstract CSS Athlete Silhouette */}
                <div className="silhouette-container">
                  <div className="silhouette-joint j-head" />
                  <div className="silhouette-joint j-sl" />
                  <div className="silhouette-joint j-sr" />
                  <div className="silhouette-joint j-el" />
                  <div className="silhouette-joint j-er" />
                  <div className="silhouette-joint j-hl" />
                  <div className="silhouette-joint j-hr" />
                  <div className="silhouette-joint j-kl" />
                  <div className="silhouette-joint j-kr" />
                  
                  <svg className="skeleton-lines" viewBox="0 0 200 300">
                    <line x1="100" y1="30" x2="100" y2="70" stroke="#B7FF00" strokeWidth="2" opacity="0.6"/>
                    <line x1="60" y1="70" x2="140" y2="70" stroke="#B7FF00" strokeWidth="2" opacity="0.6"/>
                    <line x1="100" y1="70" x2="100" y2="160" stroke="#B7FF00" strokeWidth="2" opacity="0.6"/>
                    <line x1="60" y1="70" x2="40" y2="130" stroke="#B7FF00" strokeWidth="2" opacity="0.6"/>
                    <line x1="140" y1="70" x2="160" y2="130" stroke="#B7FF00" strokeWidth="2" opacity="0.6"/>
                    <line x1="80" y1="160" x2="120" y2="160" stroke="#B7FF00" strokeWidth="2" opacity="0.6"/>
                    <line x1="80" y1="160" x2="60" y2="230" stroke="#B7FF00" strokeWidth="2" opacity="0.6"/>
                    <line x1="120" y1="160" x2="140" y2="230" stroke="#B7FF00" strokeWidth="2" opacity="0.6"/>
                  </svg>
                </div>
              </div>

              <div className="mock-metrics">
                <div className="m-block">
                  <span className="m-label">FORM SCORE</span>
                  <span className="m-val accent">94%</span>
                </div>
                <div className="m-block">
                  <span className="m-label">REPS</span>
                  <span className="m-val">12</span>
                </div>
                <div className="m-block">
                  <span className="m-label">STATUS</span>
                  <span className="m-val success">GOOD DEPTH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="section features-section">
        <div className="container">
          <SectionHeading 
            title={"BUILT AROUND\nYOUR MOVEMENT."} 
            highlight="MOVEMENT." 
          />
          <FeatureList />
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="section how-section">
        <div className="container">
          <SectionHeading 
            title={"THE\nPROCESS."} 
            highlight="PROCESS." 
          />
          <div className="process-timeline">
            {[
              { id: '01', title: 'SET UP', desc: 'Allow camera access and position yourself in frame.' },
              { id: '02', title: 'MOVE', desc: 'Start your selected exercise.' },
              { id: '03', title: 'ANALYZE', desc: 'RIGOR tracks your movement and identifies your exercise.' },
              { id: '04', title: 'IMPROVE', desc: 'Receive real-time form feedback and rep tracking.' }
            ].map((step, i) => (
              <div key={step.id} className="process-step">
                <div className="step-marker">
                  <span className="step-id">{step.id}</span>
                  {i < 3 && <div className="step-line" />}
                </div>
                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

<section id="exercises" className="section exercises-section">
  <div className="container">
    <SectionHeading
      title={"TRAIN WITH\nCONTROL."}
      highlight="CONTROL."
    />

    <div className="exercise-intro">
      <span className="exercise-count">05 EXERCISES</span>
      <p>
        Each movement is analyzed in real time using pose tracking,
        movement-specific logic, and live feedback.
      </p>
    </div>

    <div className="exercise-showcase">
      {[
        {
          id: "01",
          name: "SQUAT",
          metric: "KNEE ANALYSIS",
          description: "Lower. Hold. Drive.",
        },
        {
          id: "02",
          name: "PUSH UP",
          metric: "ELBOW ANALYSIS",
          description: "Control every repetition.",
        },
        {
          id: "03",
          name: "PLANK",
          metric: "BODY ANALYSIS",
          description: "Hold your position.",
        },
        {
          id: "04",
          name: "LEG RAISES",
          metric: "HIP ANALYSIS",
          description: "Move with control.",
        },
        {
          id: "05",
          name: "DEADLIFT",
          metric: "HIP ANALYSIS",
          description: "Hinge. Drive. Repeat.",
        },
      ].map((exercise) => (
        <div className="exercise-row" key={exercise.id}>
          <span className="exercise-number">{exercise.id}</span>

          <div className="exercise-main">
            <h3>{exercise.name}</h3>
            <p>{exercise.description}</p>
          </div>

          <span className="exercise-metric">
            {exercise.metric}
          </span>

          <span className="exercise-arrow">↗</span>
        </div>
      ))}
    </div>
  </div>
</section>
      {/* TEAM SECTION */}
      <section id="developers" className="section team-section">
        <div className="container">
          <SectionHeading 
            title={"BUILT WITH\nDISCIPLINE."} 
            highlight="DISCIPLINE." 
          />
<div className="team-grid">
  <div className="team-member">
    <img
      className="member-avatar"
      src="/shamik-das.jpg"
      alt="Shamik Das"
    />

    <div className="member-info">
      <span className="member-id">SHAMIK DAS</span>

      <span className="member-role">
        Founder / Developer
      </span>

      <a
        className="member-linkedin"
        href="https://www.linkedin.com/in/shamik-das-tech/"
        target="_blank"
        rel="noreferrer"
        aria-label="Shamik Das on LinkedIn"
      >
        <Linkedin size={16} />
        <span></span>
      </a>
    </div>
  </div>
</div>
        </div>
      </section>

      <Footer />
    </div>
  );
}