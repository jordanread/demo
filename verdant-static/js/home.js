/* ═══════════════════════════════════════════════════════
   HOME PAGE LOGIC
   js/home.js
═══════════════════════════════════════════════════════ */

'use strict';

document.addEventListener('DOMContentLoaded', async () => {

  // ── FEATURED SYSTEMS ─────────────────────────────────
  const systemsContainer = document.getElementById('featuredSystems');
  try {
    const systems = await VFC.data.load('systems.json');
    const featured = systems.filter(s => s.status === 'Active').slice(0, 3);
    systemsContainer.innerHTML = featured.map(s => `
      <div class="card" data-animate>
        <div class="journal-card__image">
          <span>${s.category.toUpperCase()} · ${s.version}</span>
        </div>
        <div class="system-card__header">
          <span class="system-card__name">${VFC.escapeHtml(s.name)}</span>
          <span class="tag-status tag-${s.status.toLowerCase()}">${s.status}</span>
        </div>
        <div class="system-card__body">
          <p class="system-card__desc">${VFC.escapeHtml(s.description.slice(0, 150))}…</p>
          <div class="system-card__specs">
            ${Object.entries(s.specs).slice(0,3).map(([k,v]) => `
              <div class="spec-row">
                <span class="spec-label">${k.replace(/_/g,' ')}</span>
                <span class="spec-val">${VFC.escapeHtml(String(v))}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `).join('');
    VFC.animate.init();
  } catch (e) {
    systemsContainer.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:2rem;">Could not load systems data.</p>';
  }

  // ── RECENT JOURNAL ────────────────────────────────────
  const journalContainer = document.getElementById('recentJournal');
  try {
    const data = await VFC.data.load('journal.json');
    const recent = data.journal_index.slice(0, 3);
    journalContainer.innerHTML = recent.map(entry => `
      <a href="journal/${entry.slug}.html" class="card journal-card" data-animate style="text-decoration:none;color:inherit;">
        <div class="journal-card__image">
          <span>${entry.category}</span>
        </div>
        <div class="journal-card__body">
          <div class="journal-card__tag">
            <span class="tag">${entry.category}</span>
          </div>
          <h3 class="journal-card__title">${VFC.escapeHtml(entry.title)}</h3>
          <p class="journal-card__excerpt">${VFC.escapeHtml(entry.excerpt)}</p>
          <div class="journal-card__footer">
            <span>${VFC.formatDateShort(entry.date)}</span>
            <span class="journal-card__link">Read entry <span>→</span></span>
          </div>
        </div>
      </a>
    `).join('');
    VFC.animate.init();
  } catch (e) {
    journalContainer.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:2rem;">Could not load journal data.</p>';
  }

  // ── COUNT-UP ANIMATION for stats ─────────────────────
  const statValues = document.querySelectorAll('.stat-value[data-count]');
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      const duration = 1200;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.firstChild.textContent = Math.round(ease * target);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      countObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  statValues.forEach(el => countObs.observe(el));
});
