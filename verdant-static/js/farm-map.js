/* js/farm-map.js */
'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  // Force dark theme for map page
  document.documentElement.setAttribute('data-theme', 'dark');

  // ── ZONE GEOMETRY (approximate lat/lng polygons for a ~18-acre property) ──
  // We'll use a custom CRS-free coordinate system scaled to fit the property
  // Center point: 38.0293° N, 78.4767° W — but we simulate with a local grid

  // We use Leaflet in simple CRS mode with pixel coordinates
  const bounds = [[0, 0], [1000, 1400]];

  const map = L.map('farmMap', {
    crs: L.CRS.Simple,
    minZoom: -1,
    maxZoom: 2,
    zoomControl: true,
    attributionControl: true,
  });

  map.fitBounds(bounds);
  map.attributionControl.setPrefix('VFC · Leaflet');

  // Background grid overlay (canvas)
  const gridLayer = L.canvas();

  // ── ZONE DEFINITIONS (polygon coordinates in the simple CRS) ──
  const zoneGeometry = [
    { id: 'zone-01', name: 'North Field', coords: [[820,100],[980,100],[980,340],[820,340]], color: '#4EBF5E' },
    { id: 'zone-02', name: 'East Field',  coords: [[820,360],[980,360],[980,580],[820,580]], color: '#4EBF5E' },
    { id: 'zone-03', name: 'Greenhouse A',coords: [[560,100],[700,100],[700,220],[560,220]], color: '#4EBF5E' },
    { id: 'zone-04', name: 'Greenhouse B', coords: [[560,240],[700,240],[700,360],[560,360]], color: '#C8913A' },
    { id: 'zone-05', name: 'Orchard',     coords: [[560,400],[780,400],[780,700],[560,700]], color: '#4EBF5E' },
    { id: 'zone-06', name: 'Compost Yard',coords: [[300,100],[520,100],[520,300],[300,300]], color: '#4EBF5E' },
    { id: 'zone-07', name: 'Aquaponics Bay',coords: [[100,100],[280,100],[280,260],[100,260]], color: '#4EBF5E' },
    { id: 'zone-08', name: 'Energy Grove',coords: [[100,280],[380,280],[380,480],[100,480]], color: '#4EBF5E' },
    { id: 'zone-09', name: 'Poultry Pasture',coords: [[100,520],[500,520],[500,800],[100,800]], color: '#4EBF5E' },
    { id: 'zone-10', name: 'Tool Barn',   coords: [[560,760],[700,760],[700,900],[560,900]], color: '#4A6B50' },
    { id: 'zone-11', name: 'Seed Library',coords: [[720,760],[820,760],[820,860],[720,860]], color: '#4A6B50' },
    { id: 'zone-12', name: 'Commons',     coords: [[300,820],[520,820],[520,980],[300,980]], color: '#4EBF5E' },
  ];

  // Status color map
  const statusColors = {
    nominal:   { fill: '#4EBF5E', fillOpacity: 0.06, stroke: '#4EBF5E', weight: 1.5 },
    attention: { fill: '#C8913A', fillOpacity: 0.1,  stroke: '#C8913A', weight: 2 },
    alert:     { fill: '#E87A3A', fillOpacity: 0.14, stroke: '#E87A3A', weight: 2.5 },
    fallow:    { fill: '#4A6B50', fillOpacity: 0.05, stroke: '#4A6B50', weight: 1 },
  };

  // Load zone data
  let zoneData = {};
  try {
    const zones = await VFC.data.load('zones.json');
    zones.forEach(z => { zoneData[z.id] = z; });
  } catch(e) {}

  const polygons = {};

  zoneGeometry.forEach(zg => {
    const zd = zoneData[zg.id] || {};
    const status = zd.status || 'nominal';
    const style = statusColors[status] || statusColors.nominal;

    const poly = L.polygon(zg.coords, {
      fillColor: style.fill,
      fillOpacity: style.fillOpacity,
      color: style.stroke,
      weight: style.weight,
      opacity: 0.6,
    }).addTo(map);

    // Zone label as tooltip
    poly.bindTooltip(`<strong>${zg.name}</strong><br>${zd.type || ''}<br><span style="color:${style.stroke}">${status.toUpperCase()}</span>`, {
      permanent: false,
      direction: 'top',
      className: 'vfc-tooltip',
    });

    // Hover effects
    poly.on('mouseover', () => {
      poly.setStyle({ fillOpacity: style.fillOpacity * 2.5, weight: 2.5, opacity: 1 });
    });
    poly.on('mouseout', () => {
      if (activeZone !== zg.id) {
        poly.setStyle({ fillOpacity: style.fillOpacity, weight: style.weight, opacity: 0.6 });
      }
    });

    // Click: open panel
    poly.on('click', () => openPanel(zg.id, zg.name, zd, style));

    // Permanent zone label
    const center = poly.getBounds().getCenter();
    L.marker(center, {
      icon: L.divIcon({
        className: 'zone-label',
        html: `<div class="zone-label-inner">${zg.name.toUpperCase()}</div>`,
        iconSize: [120, 20],
        iconAnchor: [60, 10],
      })
    }).addTo(map);

    polygons[zg.id] = { poly, style, zg };
  });

  // ── ROBOT POSITION MARKERS ────────────────────────
  const robotPositions = [
    { label: 'BRAMBLE-01', pos: [200, 900], color: '#4EBF5E' },
    { label: 'WREN-01',    pos: [300, 650], color: '#4EBF5E' },
    { label: 'RIDGE-01',   pos: [500, 500], color: '#C8913A' },
    { label: 'WANDERER',   pos: [300, 600], color: '#4EBF5E' },
  ];

  robotPositions.forEach(r => {
    const icon = L.divIcon({
      className: 'robot-marker',
      html: `<div class="robot-marker-inner" style="border-color:${r.color};" title="${r.label}">
        <div class="robot-marker-dot" style="background:${r.color};"></div>
      </div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
    L.marker(r.pos, { icon })
      .bindPopup(`<strong>${r.label}</strong><br>Active · Zone patrol`)
      .addTo(map);
  });

  // Status text
  const activeCount = Object.values(zoneData).filter(z => z.status === 'nominal').length;
  const attCount = Object.values(zoneData).filter(z => z.status === 'attention').length;
  const el = document.getElementById('mapStatusText');
  if (el) el.textContent = `${Object.keys(zoneGeometry).length} ZONES · ${robotPositions.length} BOTS ACTIVE${attCount > 0 ? ` · ${attCount} NEED ATTENTION` : ''}`;

  // ── PANEL ────────────────────────────────────────
  let activeZone = null;
  const panel = document.getElementById('zonePanel');
  const panelName = document.getElementById('panelName');
  const panelBody = document.getElementById('panelBody');

  function openPanel(zoneId, zoneName, zd, style) {
    activeZone = zoneId;
    panel.setAttribute('aria-hidden', 'false');
    if (panelName) panelName.textContent = zoneName;

    const bots = (zd.active_bots || []).join(', ') || 'None';
    const statusStr = (zd.status || 'nominal').toUpperCase();

    let metricsHtml = '';
    if (zd.soil_moisture_pct !== undefined) metricsHtml += metric('Soil moisture', zd.soil_moisture_pct + '%');
    if (zd.soil_temp_c !== undefined)       metricsHtml += metric('Soil temp', zd.soil_temp_c + '°C');
    if (zd.air_temp_c !== undefined)        metricsHtml += metric('Air temp', zd.air_temp_c + '°C');
    if (zd.humidity_pct !== undefined)      metricsHtml += metric('Humidity', zd.humidity_pct + '%');
    if (zd.co2_ppm !== undefined)           metricsHtml += metric('CO₂', zd.co2_ppm + ' ppm');
    if (zd.water_temp_c !== undefined)      metricsHtml += metric('Water temp', zd.water_temp_c + '°C');
    if (zd.ph !== undefined)                metricsHtml += metric('pH', zd.ph);
    if (zd.do_ppm !== undefined)            metricsHtml += metric('Dissolved O₂', zd.do_ppm + ' ppm');
    if (zd.battery_soc_pct !== undefined)   metricsHtml += metric('Battery SOC', zd.battery_soc_pct + '%');
    if (zd.today_generation_kwh !== undefined) metricsHtml += metric('Generation today', zd.today_generation_kwh + ' kWh');

    const botsHtml = (zd.active_bots || []).map(b =>
      `<div class="panel-bot">${b}</div>`
    ).join('') || '<div style="font-size:12px;color:var(--text-muted);">No active bots in this zone</div>';

    panelBody.innerHTML = `
      <div class="panel-section">
        <div class="panel-section-label">Status</div>
        <span class="tag-status tag-${(zd.status||'nominal')}">${statusStr}</span>
        ${zd.type ? `<div style="margin-top:var(--sp-3);font-family:var(--font-mono);font-size:10px;color:var(--text-muted);">${zd.type}</div>` : ''}
      </div>
      ${zd.current_crop ? `<div class="panel-section"><div class="panel-section-label">Current Crop / Use</div><div style="font-size:13px;color:var(--text-secondary);">${zd.current_crop}</div></div>` : ''}
      ${metricsHtml ? `<div class="panel-section"><div class="panel-section-label">Live Readings</div>${metricsHtml}</div>` : ''}
      <div class="panel-section"><div class="panel-section-label">Active Systems</div>${botsHtml}</div>
      ${zd.notes ? `<div class="panel-note">${zd.notes}</div>` : ''}
    `;

    // Highlight polygon
    Object.entries(polygons).forEach(([id, { poly, style: s }]) => {
      if (id === zoneId) {
        poly.setStyle({ fillOpacity: s.fillOpacity * 3, weight: 3, opacity: 1 });
      } else {
        poly.setStyle({ fillOpacity: s.fillOpacity, weight: s.weight, opacity: 0.6 });
      }
    });
  }

  function metric(label, value) {
    return `<div class="panel-metric"><span class="panel-metric__label">${label}</span><span class="panel-metric__value">${value}</span></div>`;
  }

  // Close panel
  document.getElementById('panelClose')?.addEventListener('click', () => {
    panel.setAttribute('aria-hidden', 'true');
    activeZone = null;
    Object.values(polygons).forEach(({ poly, style: s }) => {
      poly.setStyle({ fillOpacity: s.fillOpacity, weight: s.weight, opacity: 0.6 });
    });
  });

  // ── OVERLAY MODE TOGGLE ────────────────────────────
  document.querySelectorAll('.overlay-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.overlay-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const overlay = btn.dataset.overlay;
      updateOverlay(overlay);
    });
  });

  function updateOverlay(mode) {
    zoneGeometry.forEach(zg => {
      const { poly } = polygons[zg.id] || {};
      if (!poly) return;
      const zd = zoneData[zg.id] || {};

      if (mode === 'status') {
        const status = zd.status || 'nominal';
        const s = statusColors[status];
        poly.setStyle({ fillColor: s.fill, color: s.stroke, fillOpacity: s.fillOpacity });
      } else if (mode === 'crop') {
        const hasCrop = zd.current_crop || zd.fish_species;
        poly.setStyle({
          fillColor: hasCrop ? '#5A9B4A' : '#3A3A3A',
          color: hasCrop ? '#6ABA5A' : '#555',
          fillOpacity: hasCrop ? 0.18 : 0.04,
        });
      } else if (mode === 'bots') {
        const botCount = (zd.active_bots || []).length;
        const intensity = Math.min(botCount * 0.08, 0.25);
        poly.setStyle({
          fillColor: botCount > 0 ? '#4E8FBF' : '#2A2A2A',
          color: botCount > 0 ? '#5EAFDF' : '#444',
          fillOpacity: botCount > 0 ? 0.08 + intensity : 0.03,
        });
      }
    });
  }

  // ── SIMULATE LIVE TICKS ───────────────────────────
  setInterval(() => {
    // Pulse robots
    document.querySelectorAll('.robot-marker-dot').forEach(d => {
      d.style.transform = 'scale(1.4)';
      setTimeout(() => { d.style.transform = 'scale(1)'; }, 300);
    });
  }, 3000);
});
