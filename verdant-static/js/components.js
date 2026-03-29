/* ═══════════════════════════════════════════════════════
   VERDANT FORGE COLLECTIVE — SHARED HTML COMPONENTS
   js/components.js
═══════════════════════════════════════════════════════ */

'use strict';

/* Inject site nav */
function injectNav() {
  const nav = document.createElement('nav');
  nav.className = 'site-nav';
  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', 'Main navigation');
  nav.innerHTML = `
    <div class="nav-strip" id="navStrip">
      <span>VFC-SYS</span>
      <span class="strip-sep">·</span>
      <span>LOADING...</span>
    </div>
    <div class="nav-main">
      <a href="index.html" class="nav-logo">THE VERDANT FORGE <em>collective</em></a>
      <div class="nav-links">
        <a href="index.html"       class="nav-link">Home</a>
        <a href="community.html"   class="nav-link">Community</a>
        <a href="technology.html"  class="nav-link">Technology</a>
        <a href="farm-map.html"    class="nav-link">Farm Map</a>
        <a href="dashboard.html"   class="nav-link">Dashboard</a>
        <a href="journal.html"     class="nav-link">Journal</a>
        <a href="contact.html"     class="nav-link">Contact</a>
      </div>
      <div class="nav-right">
        <div class="nav-status">
          <span class="dot"></span>
          <span>LIVE</span>
        </div>
        <button class="theme-toggle" aria-label="Toggle light/dark theme" title="Toggle theme"></button>
        <button class="nav-hamburger" aria-label="Open menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
    <div class="nav-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <a href="index.html"       class="nav-link">Home</a>
      <a href="community.html"   class="nav-link">Community</a>
      <a href="technology.html"  class="nav-link">Technology</a>
      <a href="farm-map.html"    class="nav-link">Farm Map</a>
      <a href="dashboard.html"   class="nav-link">Dashboard</a>
      <a href="journal.html"     class="nav-link">Journal</a>
      <a href="contact.html"     class="nav-link">Contact</a>
    </div>
  `;
  document.body.insertAdjacentElement('afterbegin', nav);
}

/* Inject site footer */
function injectFooter() {
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="container">
      <div class="footer-main">
        <div>
          <span class="footer-logo">VERDANT FORGE</span>
          <p class="footer-desc">A community of 40 people on a regenerative robotics homestead, documenting our experiments with automation, AI farming systems, and autonomous agriculture.</p>
          <span class="footer-coords">38.0293° N · 78.4767° W</span>
        </div>
        <div>
          <div class="footer-col-title">Navigate</div>
          <div class="footer-links">
            <a href="index.html"       class="footer-link">Home</a>
            <a href="community.html"   class="footer-link">Community</a>
            <a href="technology.html"  class="footer-link">Technology</a>
            <a href="farm-map.html"    class="footer-link">Farm Map</a>
            <a href="dashboard.html"   class="footer-link">Dashboard</a>
            <a href="journal.html"     class="footer-link">Journal</a>
          </div>
        </div>
        <div>
          <div class="footer-col-title">Resources</div>
          <div class="footer-links">
            <a href="https://github.com/verdant-forge-collective" class="footer-link" target="_blank">GitHub Org</a>
            <a href="technology.html"  class="footer-link">Build Docs</a>
            <a href="journal.html"     class="footer-link">Data Archive</a>
            <a href="contact.html"     class="footer-link">Press Kit</a>
          </div>
        </div>
        <div>
          <div class="footer-col-title">Community</div>
          <div class="footer-links">
            <a href="community.html"  class="footer-link">About Us</a>
            <a href="contact.html"    class="footer-link">Visit Request</a>
            <a href="contact.html"    class="footer-link">Apply to Join</a>
            <a href="contact.html"    class="footer-link">Contact</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2024 The Verdant Forge Collective · Creative Commons BY-SA 4.0</span>
        <a href="https://github.com/verdant-forge-collective" class="footer-oss" target="_blank">
          ⬡ Open Source · All code on GitHub
        </a>
      </div>
    </div>
  `;
  document.body.appendChild(footer);
}

/* Init on load */
document.addEventListener('DOMContentLoaded', () => {
  injectNav();
  injectFooter();
});
