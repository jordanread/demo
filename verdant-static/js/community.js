/* js/community.js */
'use strict';
document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('membersGrid');
  if (!grid) return;
  try {
    const members = await VFC.data.load('members.json');
    grid.innerHTML = members.map((m, i) => `
      <div class="card member-card" data-animate data-delay="${i * 40}">
        <div class="member-card__body">
          <div class="member-card__avatar">${VFC.initials(m.name)}</div>
          <div class="member-card__name">${VFC.escapeHtml(m.name)}</div>
          <div class="member-card__role">${VFC.escapeHtml(m.role)}</div>
          <p class="member-card__bio">${VFC.escapeHtml(m.background)}</p>
          <div class="member-card__tags">
            ${m.tags.map(t => `<span class="tag">${VFC.escapeHtml(t)}</span>`).join('')}
          </div>
          ${m.fun_fact ? `<div style="margin-top:var(--sp-4);padding-top:var(--sp-4);border-top:1px solid var(--border);font-size:12px;color:var(--text-muted);font-family:var(--font-mono);">${VFC.escapeHtml(m.fun_fact)}</div>` : ''}
        </div>
      </div>
    `).join('');
    VFC.animate.init();
  } catch(e) {
    grid.innerHTML = '<p style="color:var(--text-muted);">Could not load members.</p>';
  }
});
