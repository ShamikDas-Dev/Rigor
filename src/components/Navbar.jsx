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

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const handleHomeClick = () => {
    closeMobileMenu();

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

  const handleSectionClick = (targetId) => {
    closeMobileMenu();

    if (location.pathname !== '/') {
      navigate('/');

      setTimeout(() => {
        document.getElementById(targetId)?.scrollIntoView({
          behavior: 'smooth',
        });
      }, 250);

      return;
    }

    document.getElementById(targetId)?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  const handleWorkoutClick = () => {
    closeMobileMenu();
    navigate('/workout');
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
          onClick={handleHomeClick}
          aria-label="Go to RIGOR home"
        >
          <img
            src="/rigor-logo.png"
            alt=""
            className="brand-logo"
          />

          <span>RIGOR</span>
        </button>

        {/* DESKTOP / MOBILE NAV */}
        <div className={`nav-links ${mobileOpen ? 'open' : ''}`}>
          <button
            type="button"
            onClick={handleHomeClick}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => handleSectionClick('features')}
          >
            Features
          </button>

          <button
            type="button"
            onClick={() => handleSectionClick('how-it-works')}
          >
            How It Works
          </button>

          <button
            type="button"
            onClick={() => handleSectionClick('developers')}
          >
            Team
          </button>
        </div>

        {/* ACTIONS */}
        <div className="nav-actions">
          <Button
            variant="primary"
            size="sm"
            onClick={handleWorkoutClick}
          >
            START WORKOUT
          </Button>

          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setMobileOpen((current) => !current)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="main-navigation"
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