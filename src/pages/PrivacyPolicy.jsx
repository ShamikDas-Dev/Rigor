import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./PrivacyPolicy.css";

const EFFECTIVE_DATE = "29 September 2026";
const FEEDBACK_URL = "https://forms.gle/DY9BdAtsKCi8eyBB8";

export default function PrivacyPolicy() {
  return (
    <div className="privacy-page">
      <Navbar />

      <main className="privacy-main">
        <section className="privacy-hero">
          <div className="privacy-container">
            <span className="privacy-eyebrow">
              RIGOR / PRIVACY
            </span>

            <h1>
              PRIVACY
              <br />
              <span>POLICY.</span>
            </h1>

            <p className="privacy-intro">
              This Privacy Policy explains how RIGOR handles information
              when you visit the website or use its workout analysis
              features.
            </p>

            <div className="privacy-meta">
              <span>LAST UPDATED</span>
              <strong>{EFFECTIVE_DATE}</strong>
            </div>
          </div>
        </section>

        <section className="privacy-content">
          <div className="privacy-container privacy-layout">

            <aside className="privacy-sidebar">
              <span>CONTENTS</span>

              <a href="#overview">01 — Overview</a>
              <a href="#information">02 — Information We Collect</a>
              <a href="#camera">03 — Camera & Movement Data</a>
              <a href="#usage">04 — How We Use Information</a>
              <a href="#storage">05 — Storage & Retention</a>
              <a href="#sharing">06 — Sharing & Third Parties</a>
              <a href="#cookies">07 — Cookies & Local Storage</a>
              <a href="#security">08 — Security</a>
              <a href="#rights">09 — Your Rights</a>
              <a href="#children">10 — Children</a>
              <a href="#changes">11 — Policy Changes</a>
              <a href="#contact">12 — Contact</a>
            </aside>

            <article className="privacy-article">

              <section id="overview">
                <div className="privacy-section-number">
                  01
                </div>

                <h2>Overview</h2>

                <p>
                  RIGOR is a computer-vision-based workout platform that
                  provides exercise identification, movement analysis,
                  repetition counting and form feedback.
                </p>

                <p>
                  We aim to collect and use only information reasonably
                  necessary to operate, maintain and improve the service.
                  RIGOR does not provide a feature for publishing or
                  creating permanent recordings of your workout camera feed.
                </p>
              </section>

              <section id="information">
                <div className="privacy-section-number">
                  02
                </div>

                <h2>Information We Collect</h2>

                <h3>Information you provide</h3>

                <p>
                  RIGOR does not currently require you to create an account
                  or provide your name, phone number or email address to use
                  the core workout experience.
                </p>

                <p>
                  If you voluntarily submit feedback, support information or
                  other information through a form or communication channel,
                  we may receive the information you choose to provide.
                </p>

                <h3>Camera access</h3>

                <p>
                  When you start a workout, your browser may request access
                  to your camera. Camera access is used to analyse your
                  movement and display the workout interface.
                </p>

                <h3>Movement and pose information</h3>

                <p>
                  During workout analysis, the application may process
                  detected body landmarks, joint positions, joint angles,
                  exercise phases, repetitions and form-related measurements.
                </p>

                <h3>Technical information</h3>

                <p>
                  Like most websites, technical information may be processed
                  by the browser, hosting infrastructure or network systems
                  required to deliver the website. Depending on the service
                  configuration, this may include information such as IP
                  address, browser type, device type, operating system,
                  request timestamps and error information.
                </p>
              </section>

              <section id="camera">
                <div className="privacy-section-number">
                  03
                </div>

                <h2>Camera & Movement Data</h2>

                <p>
                  Camera permission is controlled by your browser. RIGOR
                  cannot access your camera unless the browser grants the
                  requested permission.
                </p>

                <div className="privacy-callout">
                  <strong>CAMERA PRIVACY</strong>
                  <p>
                    RIGOR does not use camera access as permission to
                    publicly share your video or provide a social feed of
                    workout recordings.
                  </p>
                </div>

                <p>
                  The workout interface uses computer-vision processing to
                  estimate body position and movement. These measurements
                  are used to drive features such as repetition counting,
                  exercise-specific metrics and form feedback.
                </p>

                <p>
                  You can revoke camera permission at any time through your
                  browser settings. Closing or leaving the workout ends the
                  camera stream used by the application.
                </p>
              </section>

              <section id="usage">
                <div className="privacy-section-number">
                  04
                </div>

                <h2>How We Use Information</h2>

                <p>
                  Information processed by RIGOR may be used for the
                  following purposes:
                </p>

                <div className="privacy-list">
                  <div>
                    <span>01</span>
                    <p>
                      Providing exercise detection and workout analysis.
                    </p>
                  </div>

                  <div>
                    <span>02</span>
                    <p>
                      Counting repetitions and calculating exercise metrics.
                    </p>
                  </div>

                  <div>
                    <span>03</span>
                    <p>
                      Providing real-time visual and voice feedback.
                    </p>
                  </div>

                  <div>
                    <span>04</span>
                    <p>
                      Maintaining security, reliability and functionality of
                      the website.
                    </p>
                  </div>

                  <div>
                    <span>05</span>
                    <p>
                      Understanding and responding to feedback voluntarily
                      submitted by users.
                    </p>
                  </div>
                </div>

                <p>
                  RIGOR does not intentionally sell personal information to
                  third parties.
                </p>
              </section>

              <section id="storage">
                <div className="privacy-section-number">
                  05
                </div>

                <h2>Storage & Retention</h2>

                <h3>Workout data</h3>

                <p>
                  RIGOR is designed around a session-based workout experience.
                  The website does not currently provide a persistent user
                  account for storing a personal workout history.
                </p>

                <h3>Camera data</h3>

                <p>
                  RIGOR does not provide a permanent camera-recording
                  feature. Camera access is used while the workout session
                  is active.
                </p>

                <h3>Feedback data</h3>

                <p>
                  Information submitted through the RIGOR feedback form may
                  be stored and processed by the third-party form provider
                  according to that provider's own policies.
                </p>
              </section>

              <section id="sharing">
                <div className="privacy-section-number">
                  06
                </div>

                <h2>Sharing & Third Parties</h2>

                <p>
                  RIGOR may rely on third-party services to host the website,
                  deliver application resources, provide infrastructure or
                  support model-related functionality.
                </p>

                <p>
                  Third-party providers may process technical information
                  necessary to provide their services. Their processing is
                  subject to their own terms and privacy policies.
                </p>

                <h3>External feedback form</h3>

                <p>
                  RIGOR currently uses a Google Form for user feedback. When
                  you open or submit that form, you are interacting with
                  Google's services directly.
                </p>

                <a
                  className="privacy-external-link"
                  href={FEEDBACK_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  OPEN RIGOR FEEDBACK FORM ↗
                </a>

                <p>
                  Please review the relevant third-party privacy terms before
                  submitting information through an external service.
                </p>
              </section>

              <section id="cookies">
                <div className="privacy-section-number">
                  07
                </div>

                <h2>Cookies & Local Storage</h2>

                <p>
                  RIGOR currently uses browser local storage for certain
                  preferences. In particular, the privacy/consent banner
                  stores the user's consent choice so the banner does not
                  appear repeatedly.
                </p>

                <div className="privacy-table-wrap">
                  <table className="privacy-table">
                    <thead>
                      <tr>
                        <th>Storage</th>
                        <th>Purpose</th>
                        <th>Current use</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        <td>Local Storage</td>
                        <td>Remember privacy consent</td>
                        <td>Yes</td>
                      </tr>

                      <tr>
                        <td>Analytics Cookies</td>
                        <td>Optional usage analytics</td>
                        <td>Not currently enabled</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p>
                  The current consent system uses local storage rather than
                  requiring a browser cookie to remember your choice.
                </p>

                <p>
                  Your browser settings allow you to clear local storage and
                  manage cookies and other site data.
                </p>
              </section>

              <section id="security">
                <div className="privacy-section-number">
                  08
                </div>

                <h2>Security</h2>

                <p>
                  We use reasonable technical and organisational measures
                  intended to protect information handled through RIGOR.
                </p>

                <p>
                  However, no website, network connection or storage system
                  can be guaranteed to be completely secure. You should use
                  RIGOR only on devices and networks that you consider
                  trustworthy.
                </p>
              </section>

              <section id="rights">
                <div className="privacy-section-number">
                  09
                </div>

                <h2>Your Rights</h2>

                <p>
                  Subject to applicable law, you may have rights concerning
                  personal data processed by RIGOR, including rights to:
                </p>

                <div className="privacy-list">
                  <div>
                    <span>01</span>
                    <p>
                      Request information about personal data being
                      processed.
                    </p>
                  </div>

                  <div>
                    <span>02</span>
                    <p>
                      Request correction, completion or updating of
                      inaccurate information.
                    </p>
                  </div>

                  <div>
                    <span>03</span>
                    <p>
                      Request erasure of personal data where applicable.
                    </p>
                  </div>

                  <div>
                    <span>04</span>
                    <p>
                      Withdraw consent where processing is based on consent,
                      subject to applicable law.
                    </p>
                  </div>

                  <div>
                    <span>05</span>
                    <p>
                      Raise a privacy or data-processing grievance.
                    </p>
                  </div>
                </div>

                <p>
                  These rights are subject to applicable legal requirements,
                  exceptions and the way in which RIGOR processes the
                  relevant information.
                </p>
              </section>

              <section id="children">
                <div className="privacy-section-number">
                  10
                </div>

                <h2>Children's Privacy</h2>

                <p>
                  RIGOR does not intentionally request personal information
                  from children for the purpose of creating user profiles or
                  accounts.
                </p>

                <p>
                  If you are a parent or legal guardian and believe that a
                  child has provided personal information to RIGOR, please
                  contact us so that the situation can be reviewed.
                </p>
              </section>

              <section id="changes">
                <div className="privacy-section-number">
                  11
                </div>

                <h2>Changes to This Policy</h2>

                <p>
                  We may update this Privacy Policy when the website,
                  features, data practices or applicable legal requirements
                  change.
                </p>

                <p>
                  The latest version will be published on this page together
                  with an updated "Last Updated" date.
                </p>
              </section>

              <section id="contact">
                <div className="privacy-section-number">
                  12
                </div>

                <h2>Contact</h2>

                <p>
                  For questions, privacy concerns or requests relating to
                  information handled by RIGOR, please use the RIGOR feedback
                  channel.
                </p>

                <a
                  className="privacy-contact-card"
                  href={FEEDBACK_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>PRIVACY / SUPPORT REQUEST</span>
                  <strong>CONTACT RIGOR ↗</strong>
                </a>

                <p className="privacy-note">
                  This Privacy Policy describes the current RIGOR
                  implementation. It is not a substitute for professional
                  legal advice and should be reviewed when the application
                  begins collecting additional personal information or using
                  additional third-party services.
                </p>
              </section>

              <div className="privacy-footer-actions">
                <Link to="/">
                  ← BACK TO RIGOR
                </Link>

                <Link to="/workout">
                  START WORKOUT →
                </Link>
              </div>

            </article>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}