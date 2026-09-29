import React, { useEffect, useState } from "react";
import "./CookieConsent.css";

const CONSENT_KEY =
  "rigor_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] =
    useState(false);

  useEffect(() => {
    try {
      const stored =
        localStorage.getItem(
          CONSENT_KEY
        );

      if (!stored) {
        setVisible(true);
      }
    } catch (error) {
      console.warn(
        "Unable to read cookie consent:",
        error
      );

      setVisible(true);
    }
  }, []);

  const saveConsent = (choice) => {
    const consent = {
      choice,
      timestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        CONSENT_KEY,
        JSON.stringify(consent)
      );
    } catch (error) {
      console.warn(
        "Unable to save cookie consent:",
        error
      );
    }

    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      className="cookie-consent"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
    >
      <div className="cookie-consent__content">

        <div className="cookie-consent__copy">
          <span
            className="cookie-consent__eyebrow"
          >
            PRIVACY & COOKIES
          </span>

          <h2 id="cookie-title">
            Your privacy matters.
          </h2>

          <p>
            RIGOR uses essential browser storage
            to keep the website working and
            remember your preferences. Optional
            analytics are not enabled unless you
            choose to allow them.
          </p>

          <p className="cookie-consent__small">
            By continuing with RIGOR, you can
            choose whether to allow optional
            analytics storage.
          </p>
        </div>

        <div className="cookie-consent__actions">

          <button
            type="button"
            className="cookie-btn cookie-btn--secondary"
            onClick={() =>
              saveConsent("essential")
            }
          >
            ESSENTIAL ONLY
          </button>

          <button
            type="button"
            className="cookie-btn cookie-btn--primary"
            onClick={() =>
              saveConsent("all")
            }
          >
            ACCEPT ALL
          </button>

        </div>
      </div>
    </div>
  );
}