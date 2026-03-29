/* ═══════════════════════════════════════════════════════
   VERDANT FORGE COLLECTIVE — UTILITIES
   js/utils.js
═══════════════════════════════════════════════════════ */

'use strict';

const VFC = {

  /* ── THEME ─────────────────────────────────────── */
  theme: {
    init() {
      const saved = localStorage.getItem('vfc-theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = saved || (prefersDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
    },
    toggle() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('vfc-theme', next);
    },
    get isDark() {
      return document.documentElement.getAttribute('data-theme') === 'dark';
    }
  },

  /* ── NAV ───────────────────────────────────────── */
  nav: {
    init() {
      // Theme toggle
      document.querySelectorAll('.theme-toggle').forEach(btn => {
        btn.addEventListener('click', () => VFC.theme.toggle());
      });

      // Active link
      const path = location.pathname.split('/').pop() || 'index.html';
      document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href')?.split('/').pop();
        if (href === path || (path === '' && href === 'index.html')) {
          link.classList.add('active');
        }
      });

      // Mobile drawer
      const hamburger = document.querySelector('.nav-hamburger');
      const drawer = document.querySelector('.nav-drawer');
      if (hamburger && drawer) {
        hamburger.addEventListener('click', () => {
          drawer.classList.toggle('open');
          hamburger.classList.toggle('open');
          document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
        });
        drawer.querySelectorAll('.nav-link').forEach(link => {
          link.addEventListener('click', () => {
            drawer.classList.remove('open');
            hamburger.classList.remove('open');
            document.body.style.overflow = '';
          });
        });
        document.addEventListener('keydown', e => {
          if (e.key === 'Escape' && drawer.classList.contains('open')) {
            drawer.classList.remove('open');
            hamburger.classList.remove('open');
            document.body.style.overflow = '';
          }
        });
      }

      // Scroll: hide/show telemetry strip
      let lastScroll = 0;
      const strip = document.querySelector('.nav-strip');
      window.addEventListener('scroll', () => {
        const current = window.scrollY;
        if (strip) {
          strip.classList.toggle('hidden', current > 100 && current > lastScroll);
        }
        lastScroll = current;
      }, { passive: true });
    }
  },

  /* ── SCROLL ANIMATIONS ─────────────────────────── */
  animate: {
    init() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.dataset.delay || (i * 80);
            setTimeout(() => el.classList.add('visible'), parseInt(delay));
            observer.unobserve(el);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

      document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
    }
  },

  /* ── ACCORDION ─────────────────────────────────── */
  accordion: {
    init(container) {
      const items = (container || document).querySelectorAll('.accordion-item');
      items.forEach(item => {
        const trigger = item.querySelector('.accordion-trigger');
        const body = item.querySelector('.accordion-body');
        if (!trigger || !body) return;

        trigger.addEventListener('click', () => {
          const isOpen = item.classList.contains('open');
          // Close all
          items.forEach(i => {
            i.classList.remove('open');
            const b = i.querySelector('.accordion-body');
            if (b) b.style.maxHeight = '0';
          });
          // Open clicked if was closed
          if (!isOpen) {
            item.classList.add('open');
            body.style.maxHeight = body.scrollHeight + 'px';
          }
        });
      });
    }
  },

  /* ── DATA LOADING ──────────────────────────────── */
  data: {
    cache: {},
    async load(file) {
      if (this.cache[file]) return this.cache[file];
      const res = await fetch(`data/${file}`);
      if (!res.ok) throw new Error(`Failed to load ${file}`);
      const data = await res.json();
      this.cache[file] = data;
      return data;
    }
  },

  /* ── HELPERS ───────────────────────────────────── */
  formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  },
  formatDateShort(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  },
  debounce(fn, ms = 300) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
  },
  escapeHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  },
  initials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  },

  /* ── TELEMETRY STRIP ───────────────────────────── */
  async initStrip() {
    const strip = document.querySelector('.nav-strip');
    if (!strip) return;
    try {
      const t = await VFC.data.load('telemetry.json');
      const m = t.metrics;
      strip.innerHTML = `
        <span>VFC-SYS</span>
        <span class="strip-sep">·</span>
        <span>SOIL <span class="strip-val">${m.soil_moisture_avg.value}%</span></span>
        <span class="strip-sep">·</span>
        <span>SOLAR <span class="strip-val">${m.solar_output_kw.value}kW</span></span>
        <span class="strip-sep">·</span>
        <span>BOTS <span class="strip-val">${m.active_bots.value} ACTIVE</span></span>
        <span class="strip-sep">·</span>
        <span>BATTERY <span class="strip-val">${m.battery_soc.value}%</span></span>
        <span class="strip-sep">·</span>
        <span>SYNC <span class="strip-val">${t.snapshot_timestamp.split('T')[1]}</span></span>
      `;
    } catch(e) { /* silent */ }
  }
};

/* ── GLOBAL INIT ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  VFC.theme.init();
  VFC.nav.init();
  VFC.animate.init();
  VFC.accordion.init();
  VFC.initStrip();
});
