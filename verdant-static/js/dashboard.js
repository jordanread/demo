/* js/dashboard.js */
'use strict';

let paused = false;
let telemetry = null;
const sparkHistories = {};
const sparkCharts = {};

const METRICS = [
  { id: 'soil',    valId: 'val-soil',    key: 'soil_moisture_avg',    chartId: 'chart-soil',    color: '#4EBF5E', unit: '%',  drift: 0.4 },
  { id: 'solar',   valId: 'val-solar',   key: 'solar_output_kw',       chartId: 'chart-solar',   color: '#C8913A', unit: 'kW', drift: 0.8 },
  { id: 'battery', valId: 'val-battery', key: 'battery_soc',           chartId: 'chart-battery', color: '#5EAFDF', unit: '%',  drift: 0.15 },
  { id: 'bots',    valId: 'val-bots',    key: 'active_bots',           chartId: 'chart-bots',    color: '#4EBF5E', unit: '',   drift: 0 },
  { id: 'harvest', valId: 'val-harvest', key: 'harvest_today_kg',      chartId: 'chart-harvest', color: '#7ABF5E', unit: 'kg', drift: 0.3 },
  { id: 'water',   valId: 'val-water',   key: 'water_used_liters',     chartId: 'chart-water',   color: '#5E9FBF', unit: 'L',  drift: 15 },
  { id: 'temp',    valId: 'val-temp',    key: 'ambient_temp_c',        chartId: 'chart-temp',    color: '#BFAF5E', unit: '°C', drift: 0.2 },
  { id: 'compost', valId: 'val-compost', key: 'compost_temp_c',        chartId: 'chart-compost', color: '#C8913A', unit: '°C', drift: 0.5 },
];

// Current simulated values
const currentValues = {};

document.addEventListener('DOMContentLoaded', async () => {
  try {
    telemetry = await VFC.data.load('telemetry.json');
    initValues();
    initCharts();
    renderTaskQueue();
    renderEventLog();
    renderWeather();
    renderZoneOverview();
    updateTimestamp();
    startSimulation();
  } catch(e) {
    console.error('Dashboard init failed:', e);
  }

  // Pause button
  document.getElementById('pauseBtn')?.addEventListener('click', () => {
    paused = !paused;
    const btn = document.getElementById('pauseBtn');
    if (btn) btn.textContent = paused ? '▶ Resume' : '⏸ Pause';
  });

  // Clear log
  document.getElementById('clearLog')?.addEventListener('click', () => {
    const log = document.getElementById('eventLog');
    if (log) log.innerHTML = '<div class="event-entry"><span class="event-time">--:--:--</span><span class="event-source">SYSTEM</span><span class="event-msg">Event log cleared</span></div>';
  });
});

function initValues() {
  METRICS.forEach(m => {
    const seed = telemetry.metrics[m.key];
    currentValues[m.id] = seed ? seed.value : 0;
    const hist = telemetry.sparkline_history;
    const histKey = m.key.split('_').slice(0,2).join('_');
    // Try to find matching sparkline
    const match = Object.entries(hist).find(([k]) => m.id.includes(k.split('_')[0]));
    sparkHistories[m.id] = match ? [...match[1]] : Array(9).fill(currentValues[m.id]);
  });
}

function initCharts() {
  if (typeof Chart === 'undefined') return;

  Chart.defaults.animation = { duration: 300 };

  METRICS.forEach(m => {
    const canvas = document.getElementById(m.chartId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const labels = sparkHistories[m.id].map((_, i) => i);

    sparkCharts[m.id] = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: [...sparkHistories[m.id]],
          borderColor: m.color,
          borderWidth: 1.5,
          backgroundColor: m.color + '18',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { display: false },
          y: { display: false, grace: '10%' },
        },
        elements: { line: { borderCapStyle: 'round' } },
      }
    });
  });
}

function startSimulation() {
  setInterval(() => {
    if (paused) return;
    tick();
  }, 2500);
}

function tick() {
  METRICS.forEach(m => {
    if (m.drift === 0) return;
    const delta = (Math.random() - 0.48) * m.drift * 2;
    const seed = telemetry.metrics[m.key];
    const minV = seed ? seed.value * 0.7 : 0;
    const maxV = seed ? seed.value * 1.3 : 100;
    currentValues[m.id] = Math.max(minV, Math.min(maxV, currentValues[m.id] + delta));

    // Update display
    const el = document.getElementById(m.valId);
    if (el) {
      const num = m.unit === 'L' || m.unit === ''
        ? Math.round(currentValues[m.id])
        : currentValues[m.id].toFixed(1);
      el.innerHTML = `${num}<span class="tw-unit">${m.unit}</span>`;
    }

    // Update sparkline history
    sparkHistories[m.id].push(currentValues[m.id]);
    if (sparkHistories[m.id].length > 20) sparkHistories[m.id].shift();

    // Update chart
    const chart = sparkCharts[m.id];
    if (chart) {
      chart.data.labels = sparkHistories[m.id].map((_, i) => i);
      chart.data.datasets[0].data = [...sparkHistories[m.id]];
      chart.update('none');
    }
  });

  updateTimestamp();
  maybeAddEvent();
}

function updateTimestamp() {
  const el = document.getElementById('lastSync');
  if (el) {
    const now = new Date();
    el.textContent = `SYNC ${now.toTimeString().slice(0,8)}`;
  }
}

function renderTaskQueue() {
  const container = document.getElementById('taskQueue');
  if (!container || !telemetry) return;
  container.innerHTML = telemetry.robot_tasks.map(task => `
    <div class="task-item">
      <span class="task-bot">${VFC.escapeHtml(task.bot)}</span>
      <span class="task-desc">${VFC.escapeHtml(task.task)}</span>
      <span class="task-status task-${task.status}">${task.status.toUpperCase()}</span>
    </div>
  `).join('');
  const countEl = document.getElementById('taskCount');
  if (countEl) countEl.textContent = `${telemetry.robot_tasks.length} tasks`;
}

function renderEventLog() {
  const container = document.getElementById('eventLog');
  if (!container || !telemetry) return;
  container.innerHTML = [...telemetry.event_log].reverse().map(ev => `
    <div class="event-entry ${ev.level}">
      <span class="event-time">${VFC.escapeHtml(ev.timestamp)}</span>
      <span class="event-source">${VFC.escapeHtml(ev.source)}</span>
      <span class="event-msg">${VFC.escapeHtml(ev.message)}</span>
    </div>
  `).join('');
}

let eventMsgIdx = 0;
const syntheticEvents = [
  { source: 'RHIZOME', msg: 'Zone 02 soil moisture below threshold — irrigation triggered' },
  { source: 'WREN-01', msg: 'Afternoon survey completed — flock count 180/180' },
  { source: 'DRIP-01', msg: 'Zone 05 Orchard: irrigation cycle complete (18 min)' },
  { source: 'GH-A', msg: 'CO₂ supplementation cycle started — target 800ppm' },
  { source: 'BRAMBLE-01', msg: 'Basket full — returning to collection point' },
  { source: 'TIDE-01', msg: 'pH trending — current 7.2, within range' },
  { source: 'HEAP-01', msg: 'Batch 41 temp 58.8°C — active thermophilic phase' },
  { source: 'SOLAR', msg: 'Peak irradiance detected — output 15.1kW' },
  { source: 'RIDGE-01', msg: 'Perimeter patrol sector 3 complete' },
];

function maybeAddEvent() {
  if (Math.random() > 0.3) return;
  const container = document.getElementById('eventLog');
  if (!container) return;
  const ev = syntheticEvents[eventMsgIdx % syntheticEvents.length];
  eventMsgIdx++;
  const now = new Date().toTimeString().slice(0,8);
  const el = document.createElement('div');
  el.className = 'event-entry';
  el.innerHTML = `
    <span class="event-time">${now}</span>
    <span class="event-source">${ev.source}</span>
    <span class="event-msg">${ev.msg}</span>
  `;
  container.insertBefore(el, container.firstChild);
  // Keep max 20 entries
  while (container.children.length > 20) container.removeChild(container.lastChild);
}

function renderWeather() {
  const container = document.getElementById('weatherPanel');
  if (!container || !telemetry) return;
  const w = telemetry.weather;
  container.innerHTML = `
    <div class="weather-current">
      <div class="weather-temp">${w.current.temp_c}°</div>
      <div class="weather-details">
        ${w.current.condition}<br>
        Humidity: ${w.current.humidity_pct}%<br>
        Wind: ${w.current.wind_kmh} km/h ${w.current.wind_dir}<br>
        Irradiance: ${w.current.solar_irradiance} W/m²
      </div>
    </div>
    <div class="weather-forecast">
      ${w.forecast.map(d => `
        <div class="forecast-day">
          <div class="forecast-day__name">${d.day.toUpperCase()}</div>
          <div class="forecast-day__high">${d.high_c}°</div>
          <div class="forecast-day__low">${d.low_c}°</div>
          <div class="forecast-day__cond">${d.condition}</div>
          <div class="forecast-day__cond">${d.precip_pct}% rain</div>
        </div>
      `).join('')}
    </div>
  `;
}

async function renderZoneOverview() {
  const container = document.getElementById('zoneOverview');
  if (!container) return;
  try {
    const zones = await VFC.data.load('zones.json');
    container.innerHTML = `<div class="zone-grid-overview">${zones.map(z => `
      <a href="farm-map.html" class="zone-overview-item ${z.status === 'attention' ? 'attention' : ''}" title="${VFC.escapeHtml(z.name)}">
        <div class="zone-ov-name">${VFC.escapeHtml(z.name)}</div>
        <div class="zone-ov-status">${(z.status||'nominal').toUpperCase()}</div>
      </a>
    `).join('')}</div>`;
  } catch(e) {}
}
