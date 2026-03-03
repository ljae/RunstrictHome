/**
 * RunStrict Marketing Homepage — app.js
 * World map with H3 hex tiles colored by team season snapshots.
 * Uses MapLibre GL JS + h3-js (both loaded via CDN)
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════

// No token needed — MapLibre GL JS uses free tile providers
const H3_RESOLUTION = 3; // res 3 = ~180km edge, perfect for global world view

// Team colors (matches Flutter app theme exactly)
const TEAM_COLORS = {
  red:    '#FF3B30',
  blue:   '#007AFF',
  purple: '#BF5AF2',
};

// Major cities worldwide — used to seed hex IDs
// [name, lat, lng]
const CITY_SEEDS = [
  // East Asia
  ['Seoul',      37.5665,  126.9780],
  ['Tokyo',      35.6762,  139.6503],
  ['Beijing',    39.9042,  116.4074],
  ['Shanghai',   31.2304,  121.4737],
  ['Osaka',      34.6937,  135.5023],
  ['Taipei',     25.0330,  121.5654],
  ['Hong Kong',  22.3193,  114.1694],
  ['Busan',      35.1796,  129.0756],
  // Southeast Asia
  ['Bangkok',    13.7563,  100.5018],
  ['Singapore',   1.3521,  103.8198],
  ['Jakarta',    -6.2088,  106.8456],
  ['Hanoi',      21.0285,  105.8542],
  // South Asia
  ['Mumbai',     19.0760,   72.8777],
  ['Delhi',      28.7041,   77.1025],
  ['Dhaka',      23.8103,   90.4125],
  // Middle East
  ['Dubai',      25.2048,   55.2708],
  ['Istanbul',   41.0082,   28.9784],
  ['Tel Aviv',   32.0853,   34.7818],
  // Europe
  ['London',     51.5074,   -0.1278],
  ['Paris',      48.8566,    2.3522],
  ['Berlin',     52.5200,   13.4050],
  ['Amsterdam',  52.3676,    4.9041],
  ['Madrid',     40.4168,   -3.7038],
  ['Rome',       41.9028,   12.4964],
  ['Stockholm',  59.3293,   18.0686],
  ['Vienna',     48.2082,   16.3738],
  ['Warsaw',     52.2297,   21.0122],
  ['Zurich',     47.3769,    8.5417],
  // Africa
  ['Cairo',      30.0444,   31.2357],
  ['Nairobi',    -1.2921,   36.8219],
  ['Lagos',       6.5244,    3.3792],
  ['Cape Town', -33.9249,   18.4241],
  ['Casablanca', 33.5731,   -7.5898],
  // North America
  ['New York',   40.7128,  -74.0060],
  ['Los Angeles',34.0522, -118.2437],
  ['Chicago',    41.8781,  -87.6298],
  ['Toronto',    43.6532,  -79.3832],
  ['Vancouver',  49.2827, -123.1207],
  ['Mexico City',19.4326,  -99.1332],
  ['Miami',      25.7617,  -80.1918],
  ['Seattle',    47.6062, -122.3321],
  ['Boston',     42.3601,  -71.0589],
  ['San Francisco',37.7749,-122.4194],
  // South America
  ['São Paulo', -23.5505,  -46.6333],
  ['Buenos Aires',-34.6037,-58.3816],
  ['Rio de Janeiro',-22.9068,-43.1729],
  ['Bogotá',      4.7110,  -74.0721],
  ['Santiago',  -33.4489,  -70.6693],
  ['Lima',       -12.0464,  -77.0428],
  // Oceania
  ['Sydney',    -33.8688,  151.2093],
  ['Melbourne', -37.8136,  144.9631],
  ['Auckland',  -36.8485,  174.7633],
];

// ═══════════════════════════════════════════════════════════════
// MOCK SEASON DATA GENERATION
// Each season defines a different geopolitical "battle state"
// ═══════════════════════════════════════════════════════════════

function generateSeasonData() {
  // Wait for h3 to be loaded
  if (typeof h3 === 'undefined') {
    console.error('h3-js not loaded');
    return {};
  }

  // Get unique hex IDs for all cities at our resolution
  const cityHexMap = {};
  CITY_SEEDS.forEach(([name, lat, lng]) => {
    try {
      const hexId = h3.latLngToCell(lat, lng, H3_RESOLUTION);
      if (!cityHexMap[hexId]) {
        cityHexMap[hexId] = { name, hexId, lat, lng };
      }
    } catch (e) {
      // skip invalid coords
    }
  });

  const cityHexes = Object.values(cityHexMap);

  // Also add neighboring hexes for each city to make it richer
  const allHexes = new Map();
  cityHexes.forEach(({ hexId, name }) => {
    allHexes.set(hexId, { hexId, primaryCity: name });
    // Add k-ring neighbors (adjacent hexes)
    try {
      const neighbors = h3.gridDisk(hexId, 1);
      neighbors.forEach(nHex => {
        if (!allHexes.has(nHex)) {
          allHexes.set(nHex, { hexId: nHex, primaryCity: name + ' area' });
        }
      });
    } catch (e) { /* ignore */ }
  });

  const hexList = Array.from(allHexes.values());

  /**
   * Deterministic "random" based on seed + index
   * (So each season has consistent, predictable data)
   */
  function seededRandom(seed, index) {
    const x = Math.sin(seed * 9301 + index * 49297 + 233720) * 10000;
    return x - Math.floor(x);
  }

  function assignTeam(seed, index, redBias, blueBias) {
    const r = seededRandom(seed, index);
    if (r < redBias) return 'red';
    if (r < redBias + blueBias) return 'blue';
    return 'purple';
  }

  // Season configurations — different territorial dominance stories
  const seasons = {
    1: {
      label: 'Season 1 — The Dawn',
      story: 'First ever season. Red FLAME dominated Asia. Blue WAVE held Europe.',
      hexes: hexList.map((h, i) => ({
        ...h,
        team: assignTeam(1, i, 0.45, 0.40), // Red-leaning
      })),
    },
    2: {
      label: 'Season 2 — Blue Tide',
      story: 'WAVE surged globally. Purple CHAOS entered the fray.',
      hexes: hexList.map((h, i) => ({
        ...h,
        team: assignTeam(2, i, 0.25, 0.55), // Blue dominant
      })),
    },
    3: {
      label: 'Season 3 — CHAOS Rising',
      story: 'Purple CHAOS gained momentum. Three-way war across all continents.',
      hexes: hexList.map((h, i) => ({
        ...h,
        team: assignTeam(3, i, 0.35, 0.30), // Balanced, more purple
      })),
    },
    4: {
      label: 'Season 4 — Current War',
      story: 'The battle rages now. Who will survive The Void?',
      hexes: hexList.map((h, i) => ({
        ...h,
        team: assignTeam(4, i, 0.40, 0.38), // Current: slight Red edge
      })),
    },
  };

  return seasons;
}

/**
 * Convert H3 hex ID to GeoJSON polygon feature
 */
function hexToGeoJSON(hexId, team, cityName) {
  try {
    // h3.cellToBoundary returns [lat, lng] pairs — need to flip to [lng, lat] for GeoJSON
    const boundary = h3.cellToBoundary(hexId);
    const coords = boundary.map(([lat, lng]) => [lng, lat]);
    // Close the ring
    coords.push(coords[0]);

    return {
      type: 'Feature',
      properties: {
        hexId,
        team,
        city: cityName,
        color: TEAM_COLORS[team],
      },
      geometry: {
        type: 'Polygon',
        coordinates: [coords],
      },
    };
  } catch (e) {
    return null;
  }
}

/**
 * Build GeoJSON FeatureCollection for a given season's hex data
 */
function buildGeoJSON(hexes) {
  const features = hexes
    .map(({ hexId, team, primaryCity }) => hexToGeoJSON(hexId, team, primaryCity))
    .filter(Boolean);

  return {
    type: 'FeatureCollection',
    features,
  };
}

// ═══════════════════════════════════════════════════════════════
// MAP INITIALIZATION
// ═══════════════════════════════════════════════════════════════

let map = null;
let seasonData = null;
let currentSeason = 4;

function initMap() {
  map = new maplibregl.Map({
    container: 'map',
    style: {
      version: 8,
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      sources: {
        'carto-dark': {
          type: 'raster',
          tiles: ['https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap © CARTO',
        },
      },
      layers: [{
        id: 'background',
        type: 'raster',
        source: 'carto-dark',
        minzoom: 0,
        maxzoom: 22,
        paint: { 'raster-opacity': 0.85 },
      }],
    },
    center: [20, 25],
    zoom: 1.5,
    renderWorldCopies: false,
    attributionControl: false,
    antialias: true,
  });

  map.on('load', () => {
    // Generate all season data
    seasonData = generateSeasonData();

    // Add hex data source (empty initially)
    map.addSource('hexes', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });

    // Fill layer — colored by team
    map.addLayer({
      id: 'hex-fill',
      type: 'fill',
      source: 'hexes',
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': [
          'interpolate', ['linear'], ['zoom'],
          1, 0.55,
          4, 0.75,
        ],
      },
    });

    // Stroke layer — thin border between hexes
    map.addLayer({
      id: 'hex-stroke',
      type: 'line',
      source: 'hexes',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 0.6,
        'line-opacity': 0.8,
      },
    });

    // Hover highlight layer
    map.addLayer({
      id: 'hex-hover',
      type: 'fill',
      source: 'hexes',
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': 0,
      },
    });

    // Load current season — defer to next tick to ensure MapLibre style is fully settled
    setTimeout(() => { renderSeason(currentSeason); setupHoverInteraction(); }, 100);
  });

  // Slow auto-rotation for the globe (cinematic effect)
  let rotating = true;
  let rotationAngle = 20;

  function rotateGlobe() {
    if (!rotating) return;
    rotationAngle -= 0.015;
    map.setCenter([rotationAngle, 25]);
    requestAnimationFrame(rotateGlobe);
  }

  map.on('load', () => {
    setTimeout(rotateGlobe, 1000);
  });

  // Stop rotation on user interaction
  map.on('mousedown', () => { rotating = false; });
  map.on('touchstart', () => { rotating = false; });

  // Re-enable rotation after 8s of inactivity
  let rotateTimer;
  map.on('mouseup', () => {
    clearTimeout(rotateTimer);
    rotateTimer = setTimeout(() => { rotating = true; rotateGlobe(); }, 8000);
  });
}

// ═══════════════════════════════════════════════════════════════
// SEASON SWITCHING
// ═══════════════════════════════════════════════════════════════

function renderSeason(season) {
  if (!map || !map.isStyleLoaded() || !seasonData) return;

  const data = seasonData[season];
  if (!data) return;

  const geojson = buildGeoJSON(data.hexes);

  // Update source
  const source = map.getSource('hexes');
  if (source) {
    source.setData(geojson);
  }

  // Update stats counter
  const counts = { red: 0, blue: 0, purple: 0 };
  data.hexes.forEach(h => { counts[h.team] = (counts[h.team] || 0) + 1; });

  animateCounter('statRed', counts.red);
  animateCounter('statBlue', counts.blue);
  animateCounter('statPurple', counts.purple);
}

window.switchSeason = function(season) {
  currentSeason = season;

  // Update button states
  document.querySelectorAll('.season-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.season) === season);
  });

  // Fade map out, update, fade in
  const mapEl = document.getElementById('map');
  mapEl.style.opacity = '0.4';
  mapEl.style.transition = 'opacity 0.3s ease';

  setTimeout(() => {
    renderSeason(season);
    mapEl.style.opacity = '1';
  }, 300);
};

// ═══════════════════════════════════════════════════════════════
// HOVER INTERACTION
// ═══════════════════════════════════════════════════════════════

function setupHoverInteraction() {
  const tooltip = document.getElementById('mapTooltip');
  const mapContainer = document.querySelector('.map-container');
  let hoveredHexId = null;

  const teamLabels = {
    red: '🔥 FLAME — Red Team',
    blue: '🌊 WAVE — Blue Team',
    purple: '☄️ CHAOS — Purple Team',
  };

  map.on('mousemove', 'hex-fill', (e) => {
    if (!e.features || e.features.length === 0) return;

    const feature = e.features[0];
    const { team, city } = feature.properties;

    // Highlight on hover
    if (hoveredHexId !== feature.id) {
      if (hoveredHexId !== null) {
        map.setPaintProperty('hex-hover', 'fill-opacity', 0);
      }
      hoveredHexId = feature.id;
      map.setPaintProperty('hex-hover', 'fill-opacity', 0.2);
    }

    // Show tooltip
    const rect = mapContainer.getBoundingClientRect();
    const x = e.originalEvent.clientX - rect.left;
    const y = e.originalEvent.clientY - rect.top;

    tooltip.style.display = 'block';
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
    tooltip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${TEAM_COLORS[team]};box-shadow:0 0 6px ${TEAM_COLORS[team]};flex-shrink:0;"></span>
        <strong style="color:${TEAM_COLORS[team]}">${teamLabels[team] || team}</strong>
      </div>
      <div style="font-size:0.75rem;color:rgba(232,232,240,0.5);margin-top:4px;">${city || 'Territory'}</div>
    `;

    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'hex-fill', () => {
    map.getCanvas().style.cursor = '';
    tooltip.style.display = 'none';
    hoveredHexId = null;
    map.setPaintProperty('hex-hover', 'fill-opacity', 0);
  });
}

// ═══════════════════════════════════════════════════════════════
// UI UTILITIES
// ═══════════════════════════════════════════════════════════════

/** Animated number counter */
function animateCounter(elementId, target) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const start = parseInt(el.textContent.replace(/[^0-9]/g, '')) || 0;
  const duration = 600;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(start + (target - start) * eased);
    el.textContent = value;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

/** Scroll-reveal animation observer */
function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/** Season countdown to "The Void" */
function initCountdown() {
  // Season 4: Feb 21 → Apr 1 (40 days)
  const voidDate = new Date('2026-04-02T00:00:00+02:00'); // GMT+2

  function update() {
    const now = new Date();
    const diff = voidDate - now;

    if (diff <= 0) {
      document.getElementById('countDays').textContent = '00';
      document.getElementById('countHours').textContent = '00';
      document.getElementById('countMins').textContent = '00';
      document.getElementById('daysLeft').textContent = '0';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    document.getElementById('countDays').textContent = String(days).padStart(2, '0');
    document.getElementById('countHours').textContent = String(hours).padStart(2, '0');
    document.getElementById('countMins').textContent = String(mins).padStart(2, '0');
    document.getElementById('daysLeft').textContent = days;
  }

  update();
  setInterval(update, 30000); // update every 30s
}

/** Season progress timeline */
function initTimeline() {
  const start = new Date('2026-02-21T00:00:00+02:00');
  const end   = new Date('2026-04-02T00:00:00+02:00');
  const now   = new Date();

  const total = end - start;
  const elapsed = Math.max(0, Math.min(now - start, total));
  const pct = (elapsed / total) * 100;

  const fill = document.getElementById('timelineFill');
  const marker = document.getElementById('timelineMarker');

  if (fill && marker) {
    setTimeout(() => {
      fill.style.width = pct + '%';
      marker.style.left = pct + '%';
    }, 500);
  }
}

/** Mobile nav toggle */
window.toggleNav = function() {
  const nav = document.getElementById('navMobile');
  nav.classList.toggle('open');
};

/** Showcase: highlight active screenshot thumbnail */
window.highlightScreen = function(name) {
  // Update active class on thumbnails
  document.querySelectorAll('.phone-thumb').forEach(el => el.classList.remove('active'));
  const clicked = document.querySelector(`.phone-thumb[onclick*="'${name}'"]`);
  if (clicked) clicked.classList.add('active');

  // Swap main phone display to show the static screenshot
  const video = document.querySelector('.phone-video');
  const screen = document.querySelector('.phone-screen');
  if (!screen) return;

  // Remove existing static image if any
  const existing = screen.querySelector('.phone-static-img');
  if (existing) existing.remove();

  if (name === 'live') {
    // Restore video
    if (video) video.style.display = '';
  } else {
    // Show screenshot over video
    if (video) video.style.display = 'none';
    const img = document.createElement('img');
    img.src = `assets/screen_${name}.png`;
    img.className = 'phone-static-img';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;object-position:top;position:absolute;inset:0;';
    screen.appendChild(img);

    // Auto-restore video after 3s
    setTimeout(() => {
      img.remove();
      if (video) video.style.display = '';
      document.querySelectorAll('.phone-thumb').forEach(el => el.classList.remove('active'));
    }, 3000);
  }
};

// ═══════════════════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initCountdown();
  initTimeline();
  initRunnerEffects();

  // Wait for MapLibre + H3 to be fully loaded
  function tryInitMap() {
    if (typeof maplibregl !== 'undefined' && typeof h3 !== 'undefined') {
      try {
        initMap();
      } catch (err) {
        console.error('Map init error:', err);
        // Show fallback static hex pattern if map fails
        const mapEl = document.getElementById('map');
        if (mapEl) {
          mapEl.innerHTML = `
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#12121C;flex-direction:column;gap:16px;">
              <div style="font-size:3rem;opacity:0.4;">⬡ ⬡ ⬡</div>
              <p style="color:rgba(232,232,240,0.4);font-size:0.85rem;">Map loading...</p>
            </div>
          `;
        }
      }
    } else {
      setTimeout(tryInitMap, 100);
    }
  }

  tryInitMap();

  function initRunnerEffects() {
    const footstep = document.getElementById('hudFootstep');
    const paceEl   = document.getElementById('hudPace');
    if (!footstep || !paceEl) return;

    // Footstep ripple fires on each stride (0.55s matches runner-stride animation)
    function fireFootstep() {
      footstep.classList.remove('impact');
      void footstep.offsetWidth; // reflow to restart animation
      footstep.classList.add('impact');
    }
    // Alternate feet: left foot slightly offset
    setInterval(fireFootstep, 550);
    setTimeout(() => setInterval(fireFootstep, 550), 275); // right foot offset

    // Pace flicker: randomly tweak pace by ±1s to simulate live GPS
    const basePaces = ['5\'26"/km', '5\'27"/km', '5\'28"/km', '5\'29"/km', '5\'28"/km'];
    let paceIdx = 2;
    setInterval(() => {
      paceIdx = Math.max(0, Math.min(basePaces.length - 1, paceIdx + (Math.random() > 0.5 ? 1 : -1)));
      paceEl.textContent = basePaces[paceIdx];
    }, 3200 + Math.random() * 2000);
  }
});

// ═══════════════════════════════════════════════
// FAQ ACCORDION
// ═══════════════════════════════════════════════
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  // Collapse all open items
  document.querySelectorAll('.faq-item.open').forEach(el => {
    el.classList.remove('open');
    el.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
  });
  // Open the clicked item if it was closed
  if (!isOpen) {
    item.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}


// ── Waitlist form tracking ────────────────────────────────────────────────────
function trackWaitlist(e) {
  if (typeof gtag === 'function') {
    gtag('event', 'waitlist_signup', {
      event_category: 'engagement',
      event_label: 'download_section',
    });
  }
  // Let the native form submission continue to Formspree
}


// ── Daily Circuit: midnight countdown + zone-transition trigger ────────────────
(function initDailyCycle() {
  const hEl = document.getElementById('dcH');
  const mEl = document.getElementById('dcM');
  const sEl = document.getElementById('dcS');
  const barEl = document.getElementById('dcBar');
  const stage = document.querySelector('.dc-iso-stage');
  if (!hEl) return;

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now  = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;              // ms until midnight
    const total = 24 * 3600 * 1000;
    const elapsed = total - diff;

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    hEl.textContent = pad(h);
    mEl.textContent = pad(m);
    sEl.textContent = pad(s);

    // Progress bar: how much of the day has elapsed
    if (barEl) barEl.style.width = ((elapsed / total) * 100).toFixed(2) + '%';

    // Flicker effect when < 1 hour remains
    if (stage) {
      if (h < 1) stage.classList.add('dc-reset-near');
      else        stage.classList.remove('dc-reset-near');
    }
  }

  tick();
  setInterval(tick, 1000);
}());