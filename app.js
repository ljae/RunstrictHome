/**
 * RunStrict Marketing Homepage — app.js
 * Hero hex field (canvas, no dependencies), scroll effects, season clock,
 * reveals and the small UI behaviours. No external map libraries.
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
// UI UTILITIES
// ═══════════════════════════════════════════════════════════════

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

  document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right, .reveal-stagger, .reveal-step, .reveal-tilt').forEach(el => observer.observe(el));
}

// ═══════════════════════════════════════════════════════════════
// LETTER-BY-LETTER HERO TITLE ANIMATION
// ═══════════════════════════════════════════════════════════════
function initCharReveal() {
  const title = document.getElementById('heroTitle');
  if (!title) return;

  // Process only direct text nodes, skip children like .title-gradient
  // which use background-clip:text and break when split into char spans
  const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT, {
    acceptNode: function(node) {
      // Skip text inside .title-gradient (gradient-clip breaks with char spans)
      if (node.parentElement.closest('.title-gradient')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  let charIdx = 0;
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach(node => {
    const text = node.textContent;
    if (!text.trim()) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === ' ' || ch === '\n') {
        frag.appendChild(document.createTextNode(ch));
        continue;
      }
      const span = document.createElement('span');
      span.className = 'char';
      span.style.setProperty('--d', (0.3 + charIdx * 0.04) + 's');
      span.textContent = ch;
      frag.appendChild(span);
      charIdx++;
    }
    node.parentNode.replaceChild(frag, node);
  });

  // Animate .title-gradient as a whole block instead
  const gradientSpan = title.querySelector('.title-gradient');
  if (gradientSpan) {
    const delay = 0.3 + charIdx * 0.04;
    gradientSpan.style.opacity = '0';
    gradientSpan.style.transform = 'translateY(40px)';
    gradientSpan.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    gradientSpan.style.transitionDelay = delay + 's';
    requestAnimationFrame(() => {
      gradientSpan.style.opacity = '1';
      gradientSpan.style.transform = 'translateY(0)';
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// SCROLL-DRIVEN HERO PARALLAX + NAV + PROGRESS BAR
// ═══════════════════════════════════════════════════════════════
function initScrollEffects() {
  const scrollFill = document.getElementById('scrollProgressFill');
  const mainNav = document.getElementById('mainNav');
  const proofBar = document.querySelector('.proof-bar');

  let lastScrollY = 0;
  let ticking = false;

  function onScroll() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight - vh;

    // ── Progress bar ──
    if (scrollFill) {
      const progress = Math.min(scrollY / docHeight, 1);
      scrollFill.style.width = (progress * 100) + '%';
    }

    // ── Nav hide/show + scroll state ──
    if (mainNav) {
      if (scrollY > 100) {
        mainNav.classList.add('nav-scrolled');
      } else {
        mainNav.classList.remove('nav-scrolled');
      }

      if (scrollY > 300 && scrollY > lastScrollY + 8) {
        mainNav.classList.add('nav-hidden');
      } else if (scrollY < lastScrollY - 8 || scrollY < 100) {
        mainNav.classList.remove('nav-hidden');
      }
    }

    // ── Proof bar animate ──
    if (proofBar) {
      const proofRect = proofBar.getBoundingClientRect();
      if (proofRect.top < vh * 0.9) {
        proofBar.classList.add('visible');
      }
    }

    // ── Section indicators ──
    updateSectionIndicators(scrollY, vh);

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  // Initial call
  requestAnimationFrame(onScroll);
}

// ═══════════════════════════════════════════════════════════════
// SECTION INDICATORS
// ═══════════════════════════════════════════════════════════════
function updateSectionIndicators(scrollY, vh) {
  const indicators = document.querySelectorAll('.sec-indicator');
  if (!indicators.length) return;

  const sections = ['hero', 'athlete', 'how-it-works', 'teams', 'season', 'download'];
  let activeIdx = 0;

  sections.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= vh * 0.5) {
      activeIdx = i;
    }
  });

  indicators.forEach((ind, i) => {
    ind.classList.toggle('active', i === activeIdx);
  });
}

function initSectionIndicators() {
  document.querySelectorAll('.sec-indicator').forEach(ind => {
    ind.addEventListener('click', () => {
      const targetId = ind.dataset.target;
      const el = document.getElementById(targetId);
      if (el) {
        const top = el.offsetTop - 60;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// ANIMATED NUMBER COUNT-UP ON SCROLL
// ═══════════════════════════════════════════════════════════════
function initCountUp() {
  const proofNums = document.querySelectorAll('.proof-num');
  let counted = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counted) {
        counted = true;
        proofNums.forEach(el => {
          const text = el.textContent.replace(/,/g, '');
          const target = parseInt(text);
          if (isNaN(target)) return; // skip non-numeric like "Season 2"
          animateNumber(el, 0, target, 1200);
        });
      }
    });
  }, { threshold: 0.3 });

  const proofBar = document.querySelector('.proof-bar');
  if (proofBar) observer.observe(proofBar);
}

function animateNumber(el, start, end, duration) {
  const startTime = performance.now();
  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(start + (end - start) * eased);
    el.textContent = value.toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ═══════════════════════════════════════════════════════════════
// MOUSE-TRACKING 3D TILT + SHINE FOR TEAM CARDS
// ═══════════════════════════════════════════════════════════════
function initTiltCards() {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * 16;  // ±8deg
      const rotateX = (0.5 - y) * 12;  // ±6deg
      card.style.transform = 'perspective(600px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(1.02)';
      card.style.setProperty('--mx', (x * 100) + '%');
      card.style.setProperty('--my', (y * 100) + '%');
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '50%');
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// HERO HEX FIELD
// A honeycomb fills the hero. One runner at a time crosses it, flipping
// hexes to their team colour; every flip scores from the live table
// (new / friendly / enemy) and pops the points. Painted hexes persist and
// age — the land remembers. Canvas only, no libraries. Static under
// prefers-reduced-motion; paused while off-screen or tab hidden.
// ═══════════════════════════════════════════════════════════════
function initHeroField() {
  const canvas = document.getElementById('heroField');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const TEAM = { red: '#FF3B30', blue: '#1E90FF', purple: '#C86BFF' };
  const TABLE = {
    red:    { new: 3, friendly: 1, enemy: 6 },
    blue:   { new: 3, friendly: 6, enemy: 1 },
    purple: { new: 6, friendly: 2, enemy: 2 },
  };
  const ORDER = ['red', 'blue', 'purple'];
  const CREAM = '#F2EEE5';
  const STEP_MS = 105;          // one hex per step — a runner's cadence
  const POP_MS = 420;           // flip pop duration
  const FLOAT_MS = 900;         // "+N" rise/fade duration
  const AGE_MS = 40000;         // fresh → aged colour over this long
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0, R = 16, hw = 0, cols = 0, rows = 0, bandRows = 0;
  let grid = null;              // offscreen: the empty honeycomb, drawn once
  const painted = new Map();    // key "c,r" → { team, t }
  const floats = [];            // { x, y, text, color, t }
  let trail = null;             // { team, path: [[c,r]...], i, nextAt }
  let teamIdx = 0;
  let running = false, rafId = 0, lastFrame = 0, nextTrailAt = 0;

  const key = (c, r) => c + ',' + r;
  // pointy-top, odd-r offset layout
  const cx = (c, r) => c * hw + (r & 1 ? hw / 2 : 0);
  const cy = (r) => r * 1.5 * R;
  const NEIGH_EVEN = [[1, 0], [-1, 0], [0, -1], [-1, -1], [0, 1], [-1, 1]];
  const NEIGH_ODD  = [[1, 0], [-1, 0], [1, -1], [0, -1], [1, 1], [0, 1]];
  const inBand = (c, r) => c >= 0 && c < cols && r >= 0 && r < bandRows;

  function hexPath(x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 180 * (60 * i - 30);
      const px = x + r * Math.cos(a), py = y + r * Math.sin(a);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function layout() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    if (!W || !H) return;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = W < 768 ? 13 : 16;
    hw = Math.sqrt(3) * R;
    cols = Math.ceil(W / hw) + 1;
    rows = Math.ceil(H / (1.5 * R)) + 1;
    // Trails stay above the headline, wherever it lands (locale, wrap, viewport).
    const hero = canvas.closest('.hero'), title = document.getElementById('heroTitle');
    let titleTop = H * 0.5;
    if (hero && title) titleTop = Math.max(H * 0.28, title.getBoundingClientRect().top - hero.getBoundingClientRect().top);
    hero && hero.style.setProperty('--veil-top', Math.round(titleTop - 60) + 'px');
    bandRows = Math.max(6, Math.floor((titleTop - 48) / (1.5 * R)));

    grid = document.createElement('canvas');
    grid.width = canvas.width; grid.height = canvas.height;
    const g = grid.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.strokeStyle = 'rgba(255,255,255,0.055)';
    g.lineWidth = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = cx(c, r), y = cy(r);
        g.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = Math.PI / 180 * (60 * i - 30);
          const px = x + (R - 1.5) * Math.cos(a), py = y + (R - 1.5) * Math.sin(a);
          if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
        }
        g.closePath(); g.stroke();
      }
    }
  }

  // Past seasons: a few aged clusters of held ground so the field never starts empty.
  function seed() {
    painted.clear();
    const now = performance.now();
    const clusters = Math.max(4, Math.round(cols * bandRows / 90));
    for (let i = 0; i < clusters; i++) {
      const team = ORDER[Math.floor(Math.random() * 3)];
      const t = now - AGE_MS * (0.7 + Math.random() * 0.8);
      let c = Math.floor(Math.random() * cols), r = Math.floor(Math.random() * bandRows);
      const size = 3 + Math.floor(Math.random() * 7);
      for (let n = 0; n < size; n++) {
        painted.set(key(c, r), { team, t });
        const nb = (r & 1 ? NEIGH_ODD : NEIGH_EVEN)[Math.floor(Math.random() * 6)];
        const nc = c + nb[0], nr = r + nb[1];
        if (inBand(nc, nr)) { c = nc; r = nr; }
      }
    }
  }

  // A run: crosses the band edge to edge, wandering up and down but never
  // doubling back — a line across the city, not a puddle.
  function makeTrail(team) {
    const dir = Math.random() < 0.5 ? 1 : -1;            // +1 east, -1 west
    let c = dir > 0 ? 0 : cols - 1;
    let r = 1 + Math.floor(Math.random() * Math.max(1, bandRows - 2));
    const base = dir > 0 ? 0 : Math.PI;
    let heading = base;
    const path = [[c, r]];
    const seen = new Set([key(c, r)]);
    for (let i = 0; i < cols * 1.6; i++) {
      heading += (Math.random() - 0.5) * 0.8;               // drift
      const rel = Math.atan2(Math.sin(heading - base), Math.cos(heading - base));
      heading = base + Math.max(-1.0, Math.min(1.0, rel));  // stay within ±57° of the crossing
      const x0 = cx(c, r), y0 = cy(r);
      const nb = (r & 1 ? NEIGH_ODD : NEIGH_EVEN)
        .map(([dc, dr]) => [c + dc, r + dr])
        .filter(([nc, nr]) => inBand(nc, nr) && !seen.has(key(nc, nr)) && (cx(nc, nr) - x0) * dir > 0.1);
      if (!nb.length) break;
      nb.sort((A, B) => {
        const sa = Math.cos(Math.atan2(cy(A[1]) - y0, cx(A[0], A[1]) - x0) - heading);
        const sb = Math.cos(Math.atan2(cy(B[1]) - y0, cx(B[0], B[1]) - x0) - heading);
        return sb - sa;
      });
      [c, r] = Math.random() < 0.85 || nb.length === 1 ? nb[0] : nb[1];
      path.push([c, r]); seen.add(key(c, r));
      if ((dir > 0 && c >= cols - 1) || (dir < 0 && c <= 0)) break;
    }
    return { team, path, i: 0, nextAt: 0 };
  }

  function flip(team, c, r, now, silent) {
    const k = key(c, r);
    const cur = painted.get(k);
    const kind = !cur ? 'new' : (cur.team === team ? 'friendly' : 'enemy');
    if (kind !== 'friendly') painted.set(k, { team, t: now });
    if (!silent) floats.push({ x: cx(c, r), y: cy(r) - R, text: '+' + TABLE[team][kind], color: kind === 'friendly' ? TEAM[team] : CREAM, t: now });
  }

  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    if (grid) ctx.drawImage(grid, 0, 0, W, H);

    // painted hexes: fresh pops bright, then settle and age
    for (const [k, cell] of painted) {
      const [c, r] = k.split(',').map(Number);
      const age = now - cell.t;
      const pop = age < POP_MS ? 1 - age / POP_MS : 0;
      const alpha = 0.34 + 0.58 * Math.max(0, 1 - Math.max(0, age - POP_MS) / AGE_MS);
      const rad = (R - 1.5) * (1 + 0.16 * pop * pop);
      ctx.globalAlpha = Math.min(1, alpha + pop * 0.2);
      ctx.fillStyle = TEAM[cell.team];
      hexPath(cx(c, r), cy(r), rad);
      ctx.fill();
      if (pop > 0) {
        ctx.globalAlpha = pop * 0.7;
        ctx.strokeStyle = CREAM; ctx.lineWidth = 1.2; ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    // the runner: a bright head with a soft team glow
    if (trail && trail.i > 0 && trail.i <= trail.path.length) {
      const [c, r] = trail.path[trail.i - 1];
      const x = cx(c, r), y = cy(r);
      const glow = ctx.createRadialGradient(x, y, 0, x, y, R * 1.6);
      glow.addColorStop(0, TEAM[trail.team] + 'AA'); glow.addColorStop(1, TEAM[trail.team] + '00');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, R * 1.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = CREAM; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill();
    }

    // score pops
    ctx.font = '600 11px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    for (let i = floats.length - 1; i >= 0; i--) {
      const f = floats[i];
      const p = (now - f.t) / FLOAT_MS;
      if (p >= 1) { floats.splice(i, 1); continue; }
      ctx.globalAlpha = p < 0.15 ? p / 0.15 : 1 - (p - 0.15) / 0.85;
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y - 18 * p);
    }
    ctx.globalAlpha = 1;
  }

  function tick(now) {
    if (!running) return;
    rafId = requestAnimationFrame(tick);
    if (now - lastFrame < 33) return;   // ~30fps is plenty for a field this calm
    lastFrame = now;

    if (!trail && now >= nextTrailAt) {
      trail = makeTrail(ORDER[teamIdx % ORDER.length]); teamIdx++;
      trail.nextAt = now;
    }
    if (trail) {
      while (trail.i < trail.path.length && now >= trail.nextAt) {
        const [c, r] = trail.path[trail.i++];
        flip(trail.team, c, r, now, false);
        trail.nextAt += STEP_MS;
      }
      if (trail.i >= trail.path.length && now - trail.nextAt > 900) {
        trail = null; nextTrailAt = now + 700;
      }
    }
    draw(now);
  }

  function start() { if (running || reduce) return; running = true; lastFrame = 0; rafId = requestAnimationFrame(tick); }
  function stop() { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = 0; }

  function reset() {
    layout();
    if (!W || !H) return;
    seed();
    trail = null; floats.length = 0;
    if (reduce) {
      // One still frame: three runs already on the map, no motion.
      const now = performance.now();
      ORDER.forEach((team, n) => makeTrail(team).path.forEach(([c, r]) => flip(team, c, r, now - AGE_MS * 0.3 * (3 - n), true)));
      draw(now);
    } else {
      nextTrailAt = performance.now() + 500;
      draw(performance.now());
    }
  }

  reset();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(reset);
  let resizeT = 0;
  window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(reset, 150); });

  if (!reduce) {
    const hero = canvas.closest('.hero') || canvas;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting && !document.hidden) start(); else stop(); });
    }, { threshold: 0.05 });
    io.observe(hero);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (hero.getBoundingClientRect().bottom > 0) start();
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// TEAM SCORING SPLIT — index each hex so the strip lands left→right
// ═══════════════════════════════════════════════════════════════
function initSplitStrips() {
  document.querySelectorAll('.split-strip').forEach(strip => {
    strip.querySelectorAll('i').forEach((hex, i) => hex.style.setProperty('--i', i));
  });
}

// ═══════════════════════════════════════════════════════════════
// COUNT-UP FOR [data-count] STAT ELEMENTS
// ═══════════════════════════════════════════════════════════════
function initStatCountUp() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        if (isNaN(target)) return;
        animateNumber(el, 0, target, 1000);
        // Append suffix after animation completes
        setTimeout(() => {
          el.textContent = target.toLocaleString() + suffix;
        }, 1050);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
}

/**
 * Canonical auto-renewing season clock — the SINGLE source of truth for every
 * season number / progress / "The Void" countdown on the site. Seasons last
 * 40 days and roll over automatically: the instant one ends the next begins,
 * forever, with zero manual edits. Anchored to Season 5 (Jun 11, 2026 GMT+2).
 * The inline season script in index.html also reads this.
 */
window.RunStrictSeason = function computeSeason() {
  const DAY_MS = 86400000;
  const SEASON_DAYS = 40;
  const SEASON_MS = SEASON_DAYS * DAY_MS;
  const ANCHOR_START = new Date('2026-06-11T00:00:00+02:00').getTime();
  const ANCHOR_NUMBER = 5;

  const now = Date.now();
  let cycles = Math.floor((now - ANCHOR_START) / SEASON_MS);
  if (cycles < 0) cycles = 0; // before the anchor → still Season 5, day 1
  const startMs = ANCHOR_START + cycles * SEASON_MS;
  const endMs = startMs + SEASON_MS;            // The Void moment
  const msToVoid = Math.max(0, endMs - now);

  return {
    number: ANCHOR_NUMBER + cycles,
    start: new Date(startMs),
    end: new Date(endMs),
    seasonDays: SEASON_DAYS,
    dayNum: Math.min(SEASON_DAYS, Math.floor((now - startMs) / DAY_MS) + 1),
    daysLeft: Math.floor(msToVoid / DAY_MS),
    hoursLeft: Math.floor((msToVoid % DAY_MS) / 3600000),
    minsLeft: Math.floor((msToVoid % 3600000) / 60000),
    pct: Math.min(100, Math.max(0, Math.round(((now - startMs) / SEASON_MS) * 100)))
  };
};

/** Localized "Jun 11, 2026" using the page's <html lang>. */
function fmtSeasonDate(d) {
  try {
    return d.toLocaleDateString(document.documentElement.lang || 'en', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return d.toISOString().slice(0, 10);
  }
}

/** Season countdown to "The Void" — reads the auto-renewing clock. */
function initCountdown() {
  function set(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }
  function update() {
    const s = window.RunStrictSeason();
    set('countDays', String(s.daysLeft).padStart(2, '0'));
    set('countHours', String(s.hoursLeft).padStart(2, '0'));
    set('countMins', String(s.minsLeft).padStart(2, '0'));
    set('daysLeft', s.daysLeft);
  }
  update();
  setInterval(update, 30000); // refresh every 30s; rolls into the next season automatically
}

/** Season progress timeline — reads the auto-renewing clock. */
function initTimeline() {
  const s = window.RunStrictSeason();
  const fill = document.getElementById('timelineFill');
  const marker = document.getElementById('timelineMarker');
  if (fill && marker) {
    setTimeout(() => {
      fill.style.width = s.pct + '%';
      marker.style.left = s.pct + '%';
    }, 500);
  }
  // Keep the season period in sync (locale-formatted; language-neutral).
  const dates = document.querySelector('.timeline-dates');
  if (dates) dates.textContent = fmtSeasonDate(s.start) + ' → ' + fmtSeasonDate(s.end);
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
    // Use the thumbnail's own image (the assets/screen_<name>.png files don't exist)
    const thumbImg = clicked && clicked.querySelector('img');
    img.src = (thumbImg && (thumbImg.currentSrc || thumbImg.src)) || `assets/screen_${name}.png`;
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
  initCharReveal();
  initReveal();
  initScrollEffects();
  initSectionIndicators();
  initCountUp();
  initTiltCards();
  initSplitStrips();
  initStatCountUp();
  initCountdown();
  initTimeline();
  initRunnerEffects();

  initHeroField();

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