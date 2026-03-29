/* js/technology.js */
'use strict';
let allSystems = [];

document.addEventListener('DOMContentLoaded', async () => {
  try {
    allSystems = await VFC.data.load('systems.json');
    renderStats();
    renderSystems('all');

    document.querySelectorAll('.tech-filters .tag').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tech-filters .tag').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderSystems(btn.dataset.filter);
      });
    });
  } catch(e) {
    const g = document.getElementById('systemsGrid');
    if (g) g.innerHTML = '<p style="color:var(--text-muted);">Could not load systems data.</p>';
  }
});

function renderStats() {
  const counts = {};
  allSystems.forEach(s => { counts[s.category] = (counts[s.category]||0) + 1; });
  const activeCount = allSystems.filter(s => s.status === 'Active').length;
  setText('statMobility', counts['Mobility'] || 0);
  setText('statSensing', counts['Sensing'] || 0);
  setText('statAI', counts['AI / Processing'] || 0);
  setText('statInfra', counts['Infrastructure'] || 0);
  setText('statActive', activeCount);
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function renderSystems(filter) {
  const grid = document.getElementById('systemsGrid');
  if (!grid) return;
  const list = filter === 'all' ? allSystems : allSystems.filter(s => s.category === filter || (filter === 'AI / Processing' && s.category === 'AI / Processing'));
  grid.innerHTML = list.map((s, i) => `
    <div class="card" data-animate data-delay="${i * 50}">
      <div class="journal-card__image" style="background:linear-gradient(135deg,#0E2218,#1A3828);">
        <span style="font-family:var(--font-mono);font-size:10px;color:rgba(78,191,94,0.3);letter-spacing:0.2em;">${s.category.toUpperCase()}</span>
      </div>
      <div class="system-card__header">
        <span class="system-card__name">${VFC.escapeHtml(s.name)}</span>
        <span class="tag-status tag-${s.status.toLowerCase()}">${s.status}</span>
      </div>
      <div class="system-card__body">
        <p class="system-card__desc">${VFC.escapeHtml(s.description.slice(0,180))}…</p>
        <div class="system-card__specs">
          ${Object.entries(s.specs).slice(0,4).map(([k,v]) => `
            <div class="spec-row">
              <span class="spec-label">${k.replace(/_/g,' ')}</span>
              <span class="spec-val">${VFC.escapeHtml(String(v))}</span>
            </div>`).join('')}
        </div>
      </div>
      ${s.lessons ? `<div class="system-card__lessons">${VFC.escapeHtml(s.lessons)}</div>` : ''}
    </div>
  `).join('');
  VFC.animate.init();
}
