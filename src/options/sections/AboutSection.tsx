import React from "react";

export type AboutSectionProps = {
  lang: "id" | "en";
};

export function AboutSection(props: AboutSectionProps) {
  const { lang } = props;
  return (
    
                <section className="section active">
                  <div className="section-header">
                    <h2>{lang === "en" ? "About" : "Tentang"}</h2>
                  </div>
                  <div className="card about-card">
                    <h3>MeTime - Video Enhancer</h3>
                    <p className="about-version">
                      Version 2.0.0 Â· Mady by Ril. 
                    </p>
                    <div className="social-links" aria-label="Social media links">
                      <a className="social-link" href="https://web.facebook.com/ClasherPensiun24" target="_blank" rel="noreferrer" aria-label="Facebook" title="Facebook">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path fill="currentColor" d="M13.5 22v-8h2.7l.4-3H13.5V9.2c0-.9.3-1.6 1.7-1.6H16.6V5c-.7-.1-1.7-.2-2.8-.2-2.8 0-4.7 1.7-4.7 4.8V11H6.6v3h2.5v8h4.4Z" />
                        </svg>
                      </a>
                      <a className="social-link" href="https://www.instagram.com/muhammad_fchrl" target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm-5 4.3A3.7 3.7 0 1 1 8.3 12 3.7 3.7 0 0 1 12 8.3Zm0 2A1.7 1.7 0 1 0 13.7 12 1.7 1.7 0 0 0 12 10.3ZM17.8 7.7a.9.9 0 1 1-.9-.9.9.9 0 0 1 .9.9Z" />
                        </svg>
                      </a>
                      <a className="social-link" href="https://github.com/fahril33" target="_blank" rel="noreferrer" aria-label="GitHub" title="GitHub">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path fill="currentColor" d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5a3.9 3.9 0 0 1 1-2.7 3.6 3.6 0 0 1 .1-2.6s.8-.3 2.7 1a9.2 9.2 0 0 1 4.9 0c1.9-1.3 2.7-1 2.7-1a3.6 3.6 0 0 1 .1 2.6 3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.7 5 .4.3.7 1 .7 2v3c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" />
                        </svg>
                      </a>
                      <a className="social-link" href="https://www.linkedin.com/in/mfahril" target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path fill="currentColor" d="M6.7 6.5A2.2 2.2 0 1 1 6.7 2a2.2 2.2 0 0 1 0 4.5ZM3 22V8h3.5v14H3Zm6.5 0V8h3.4v1.9h.1c.5-1 1.7-2.1 3.6-2.1 3.8 0 4.5 2.5 4.5 5.7V22h-3.5v-6.1c0-1.5 0-3.4-2.1-3.4s-2.4 1.6-2.4 3.3V22H9.5Z" />
                        </svg>
                      </a>
                      <a className="social-link" href="https://portofolio-fahreal.vercel.app/" target="_blank" rel="noreferrer" aria-label="Portfolio" title="Portfolio">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm7.9 9h-3.1a15.7 15.7 0 0 0-1.4-6.2A8 8 0 0 1 19.9 11ZM12 4.1c.9 1.2 1.7 3.6 2 6.9H10c.3-3.3 1.1-5.7 2-6.9ZM4.1 13h3.1a15.7 15.7 0 0 0 1.4 6.2A8 8 0 0 1 4.1 13Zm3.1-2H4.1a8 8 0 0 1 4.5-6.2A15.7 15.7 0 0 0 7.2 11Zm2.8 2h4a19 19 0 0 1-2 6.9c-.9-1.2-1.7-3.6-2-6.9Zm0-2a19 19 0 0 1 2-6.9c.9 1.2 1.7 3.6 2 6.9h-4Zm5.4 8.2a15.7 15.7 0 0 0 1.4-6.2h3.1a8 8 0 0 1-4.5 6.2ZM16.8 13a15.7 15.7 0 0 0-1.4 6.2A8 8 0 0 1 19.9 13Z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </section>
  );
}

