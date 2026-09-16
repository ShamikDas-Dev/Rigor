import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const FEEDBACK_URL = 'https://forms.gle/DY9BdAtsKCi8eyBB8';

export default function Footer() {
  const handleNavClick = (e, targetId) => {
    e.preventDefault();

    const element = document.getElementById(targetId);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  return (
    <footer className="site-footer">
      <div className="container footer-inner">

        {/* BRAND */}
        <div className="footer-brand">
          <span className="logo">RIGOR</span>
          <p className="footer-tagline">
            TRAIN WITH PRECISION.
          </p>
        </div>

        {/* FOOTER NAVIGATION */}
        <nav
          className="footer-nav"
          aria-label="Footer navigation"
        >
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, 'home')}
          >
            Home
          </a>

          <a
            href="#features"
            onClick={(e) => handleNavClick(e, 'features')}
          >
            Features
          </a>

          <a
            href="#how-it-works"
            onClick={(e) => handleNavClick(e, 'how-it-works')}
          >
            How It Works
          </a>

          <a
            href="#developers"
            onClick={(e) => handleNavClick(e, 'developers')}
          >
            Team
          </a>

          {/* EXTERNAL GOOGLE FORM */}
          <a
            href={FEEDBACK_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Feedback
          </a>

          {/* INTERNAL SUPPORT PAGE */}
          <Link to="/support">
            Support Us
          </Link>
        </nav>

        {/* COPYRIGHT */}
        <div className="footer-bottom">
          <p>
            &copy; 2026 RIGOR. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}