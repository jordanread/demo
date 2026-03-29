/* js/journal.js */
'use strict';

const ENTRIES_PER_PAGE = 6;
let allEntries = [];
let filtered = [];
let currentPage = 1;
let activeCategory = 'all';
let searchQuery = '';
let sortOrder = 'newest';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const data = await VFC.data.load('journal.json');
    allEntries = data.journal_index;
    buildCategoryFilters(data.all_categories);
    applyFilters();
  } catch(e) {
    document.getElementById('journalGrid').innerHTML =
      '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:3rem;">Could not load journal entries.</p>';
  }

  // Search
  const searchInput = document.getElementById('journalSearch');
  if (searchInput) {
    searchInput.addEventListener('input', VFC.debounce(e => {
      searchQuery = e.target.value.toLowerCase().trim();
      currentPage = 1;
      applyFilters();
    }, 250));
  }

  // Sort
  const sortSelect = document.getElementById('journalSort');
  if (sortSelect) {
    sortSelect.addEventListener('change', e => {
      sortOrder = e.target.value;
      currentPage = 1;
      applyFilters();
    });
  }
});

function buildCategoryFilters(categories) {
  const container = document.getElementById('filterTags');
  if (!container) return;
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'tag';
    btn.dataset.category = cat;
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      activeCategory = cat;
      currentPage = 1;
      container.querySelectorAll('.tag').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
    container.appendChild(btn);
  });

  // All button
  const allBtn = container.querySelector('[data-category="all"]');
  if (allBtn) {
    allBtn.addEventListener('click', () => {
      activeCategory = 'all';
      currentPage = 1;
      container.querySelectorAll('.tag').forEach(b => b.classList.remove('active'));
      allBtn.classList.add('active');
      applyFilters();
    });
  }
}

function applyFilters() {
  let entries = [...allEntries];

  // Category
  if (activeCategory !== 'all') {
    entries = entries.filter(e => e.category === activeCategory);
  }

  // Search
  if (searchQuery) {
    entries = entries.filter(e =>
      e.title.toLowerCase().includes(searchQuery) ||
      e.excerpt.toLowerCase().includes(searchQuery) ||
      e.tags.some(t => t.toLowerCase().includes(searchQuery)) ||
      e.author_name.toLowerCase().includes(searchQuery)
    );
  }

  // Sort
  entries.sort((a, b) => {
    const da = new Date(a.date), db = new Date(b.date);
    return sortOrder === 'newest' ? db - da : da - db;
  });

  filtered = entries;
  renderJournal();
}

function renderJournal() {
  // Pinned entry (first pinned, only on page 1 with no filters)
  const pinnedContainer = document.getElementById('pinnedEntry');
  const pinnedEntry = allEntries.find(e => e.pinned);
  if (pinnedContainer) {
    if (pinnedEntry && currentPage === 1 && activeCategory === 'all' && !searchQuery) {
      pinnedContainer.innerHTML = renderPinnedCard(pinnedEntry);
    } else {
      pinnedContainer.innerHTML = '';
    }
  }

  // Non-pinned entries for pagination
  const pageable = filtered.filter(e => !(e.pinned && currentPage === 1 && activeCategory === 'all' && !searchQuery));
  const totalPages = Math.ceil(pageable.length / ENTRIES_PER_PAGE);
  const start = (currentPage - 1) * ENTRIES_PER_PAGE;
  const pageEntries = pageable.slice(start, start + ENTRIES_PER_PAGE);

  // Meta
  const meta = document.getElementById('resultsMeta');
  if (meta) {
    meta.textContent = `Showing ${start + 1}–${Math.min(start + pageEntries.length, pageable.length)} of ${pageable.length} entries${activeCategory !== 'all' ? ` in ${activeCategory}` : ''}${searchQuery ? ` matching "${searchQuery}"` : ''}`;
  }

  // Grid
  const grid = document.getElementById('journalGrid');
  if (!grid) return;
  if (pageEntries.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted);font-family:var(--font-mono);font-size:13px;">No entries match your search.</div>';
  } else {
    grid.innerHTML = pageEntries.map((e, i) => renderJournalCard(e, i)).join('');
    VFC.animate.init();
  }

  // Pagination
  renderPagination(totalPages);
}

function renderPinnedCard(e) {
  return `
    <a href="journal/${e.slug}.html" class="pinned-entry" data-animate>
      <div>
        <div class="pinned-label">Featured Entry</div>
        <h2 class="pinned-title">${VFC.escapeHtml(e.title)}</h2>
        <p class="pinned-excerpt">${VFC.escapeHtml(e.excerpt)}</p>
        <div style="margin-top:var(--sp-4);display:flex;gap:var(--sp-2);flex-wrap:wrap;">
          ${e.tags.slice(0,3).map(t => `<span class="tag">${VFC.escapeHtml(t)}</span>`).join('')}
        </div>
      </div>
      <div class="pinned-meta">
        <span class="tag">${VFC.escapeHtml(e.category)}</span>
        <span class="pinned-author">${VFC.escapeHtml(e.author_name)}</span>
        <span class="pinned-date">${VFC.formatDateShort(e.date)}</span>
        <span class="pinned-read">${e.read_time_min} min read</span>
      </div>
    </a>
  `;
}

function renderJournalCard(e, i) {
  return `
    <a href="journal/${e.slug}.html" class="card journal-card" data-animate data-delay="${i * 60}" style="text-decoration:none;color:inherit;">
      <div class="journal-card__image"><span>${VFC.escapeHtml(e.category)}</span></div>
      <div class="journal-card__body">
        <div class="journal-card__tag"><span class="tag">${VFC.escapeHtml(e.category)}</span></div>
        <h3 class="journal-card__title">${VFC.escapeHtml(e.title)}</h3>
        <p class="journal-card__excerpt">${VFC.escapeHtml(e.excerpt)}</p>
        <div class="journal-card__footer">
          <span>${VFC.formatDateShort(e.date)} · ${e.read_time_min}m</span>
          <span class="journal-card__link">Read <span>→</span></span>
        </div>
      </div>
    </a>
  `;
}

function renderPagination(totalPages) {
  const container = document.getElementById('journalPagination');
  if (!container || totalPages <= 1) { if(container) container.innerHTML = ''; return; }
  let html = '';
  if (currentPage > 1) html += `<button class="page-btn" data-page="${currentPage-1}">← Prev</button>`;
  for (let p = 1; p <= totalPages; p++) {
    html += `<button class="page-btn${p === currentPage ? ' active' : ''}" data-page="${p}">${p}</button>`;
  }
  if (currentPage < totalPages) html += `<button class="page-btn" data-page="${currentPage+1}">Next →</button>`;
  container.innerHTML = html;
  container.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      renderJournal();
    });
  });
}
