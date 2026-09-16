import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from './Button';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => {
    setMobileOpen(false);
  };

  const goHome = () => {
    closeMenu();

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById('home')?.scrollIntoView({
          behavior: 'smooth',
        });
      }, 250);
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const goToSection = (id) => {
    closeMenu();

    if (location.pathname !== '/') {
      navigate('/');

      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: 'smooth',
        });
      }, 250);

      return;
    }

    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  const goToWorkout = () => {
    closeMenu();
    navigate('/workout');
  };

  const goToSupport = () => {
    closeMenu();
    navigate('/support');
  };
  const FEEDBACK_URL = "https://forms.gle/DY9BdAtsKCi8eyBB8";

  const goToFeedback = () => {
    window.open(FEEDBACK_URL, "_blank", "noopener,noreferrer");
  };
  return (
    <nav
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container navbar-inner">

        {/* BRAND */}
        <button
          type="button"
          className="logo"
          onClick={goHome}
          aria-label="Go to RIGOR home"
        >
          <img
            src="/rigor-logo.png"
            alt=""
            className="brand-logo"
          />
          <span>RIGOR</span>
        </button>

        {/* NAVIGATION */}
        <div className={`nav-links ${mobileOpen ? 'open' : ''}`}>

          <button type="button" onClick={goHome}>
            Home
          </button>

          <button
            type="button"
            onClick={() => goToSection('features')}
          >
            Features
          </button>

          <button
            type="button"
            onClick={() => goToSection('how-it-works')}
          >
            How It Works
          </button>

          <button
            type="button"
            onClick={() => goToSection('developers')}
          >
            Team
          </button>

          {/* Support Us belongs inside the menu */}
          <button
            type="button"
            className="mobile-support-link"
            onClick={goToSupport}
          >
            Support Us
          </button>
          <button
            type="button"
            onClick={goToFeedback}
          >
            Feedback
          </button>
        </div>
        {/* DESKTOP ACTIONS + MOBILE MENU */}
        <div className="nav-actions">

          <button
            type="button"
            className="desktop-support"
            onClick={goToSupport}
          >
            Support Us
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={goToWorkout}
          >
            START WORKOUT
          </Button>

          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setMobileOpen((current) => !current)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>

        </div>
      </div>
    </nav>
  );
}