import React, { useState } from 'react';
import './Support.css';

const UPI_ID = 'dasshamik6-3@okhdfcbank';
const PAYEE_NAME = 'RIGOR';

const upiUrl =
  `upi://pay?pa=${encodeURIComponent(UPI_ID)}` +
  `&pn=${encodeURIComponent(PAYEE_NAME)}` +
  `&cu=INR` +
  `&tn=${encodeURIComponent('Support RIGOR')}`;

export default function Support() {
  const [copied, setCopied] = useState(false);

  const isMobile = /Android|iPhone|iPad|iPod/i.test(
    navigator.userAgent
  );

  const handleSupport = async () => {
    if (isMobile) {
      window.location.href = upiUrl;
      return;
    }

    try {
      await navigator.clipboard.writeText(UPI_ID);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      window.prompt('Copy this UPI ID:', UPI_ID);
    }
  };

  return (
    <main className="support-page">
      <div className="support-container">

        <span className="support-eyebrow">
          SUPPORT RIGOR
        </span>

        <h1>
          HELP US
          <br />
          <span>KEEP BUILDING.</span>
        </h1>

        <p className="support-description">
          If you find RIGOR useful, you can support its continued
          development with any amount through UPI.
        </p>

        <div className="support-card">

          <div className="support-qr">
            <img
              src="/rigor-upi-qr.png"
              alt="RIGOR UPI payment QR code"
            />
          </div>

          <div className="support-info">

            <span className="support-label">
              UPI ID
            </span>

            <div className="upi-id">
              {UPI_ID}
            </div>

            <button
              className="support-button"
              onClick={handleSupport}
            >
              {isMobile
                ? 'OPEN UPI APP'
                : copied
                  ? 'UPI ID COPIED'
                  : 'COPY UPI ID'}
            </button>

            <p className="support-note">
              {isMobile
                ? 'Your UPI app will open. Choose any amount and complete the payment.'
                : 'Scan the QR code using your phone to make a contribution.'}
            </p>

          </div>
        </div>

        <p className="support-footer">
          Every contribution helps us continue improving RIGOR.
        </p>

      </div>
    </main>
  );
}