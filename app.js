/* ════════════════════════════════════════════════════════════
   DSPIN ADVISORY — le moteur
   Zéro dépendance, zéro build. Canvas 2D + IntersectionObserver.

   Le motif : un champ de points en orbite. En haut de page il tourne
   en désordre (la donnée brute) ; à mesure qu'on descend, il se range
   en anneaux concentriques cohérents (la décision). Think → Transform.
   ════════════════════════════════════════════════════════════ */
'use strict';

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;

/* ════════════ couleurs ════════════ */
function hex2rgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const rgb2css = c => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;

/* ════════════ progression de scroll ════════════ */
let scrollP = 0;          // 0 → 1 sur toute la page
function readScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  scrollP = max > 0 ? clamp(scrollY / max, 0, 1) : 0;
}

/* ════════════ fond : couleur pilotée par les sections ════════════ */
const bed = document.getElementById('bed');
const bedSections = [...document.querySelectorAll('[data-bed]')];
let bedTarget = hex2rgb(bedSections[0] ? bedSections[0].dataset.bed : '#0a1a17');
let bedNow = bedTarget.slice();

const bedIO = new IntersectionObserver(entries => {
  for (const e of entries) if (e.isIntersecting) bedTarget = hex2rgb(e.target.dataset.bed);
}, { rootMargin: '-45% 0px -45% 0px' });
bedSections.forEach(s => bedIO.observe(s));

function tickBed() {
  let moved = false;
  for (let i = 0; i < 3; i++) {
    const d = bedTarget[i] - bedNow[i];
    if (Math.abs(d) > 0.4) { bedNow[i] += d * 0.055; moved = true; }
    else bedNow[i] = bedTarget[i];
  }
  if (moved) bed.style.backgroundColor = rgb2css(bedNow);
}

/* ════════════ canvas — le spin ════════════ */
const cv = document.getElementById('spin');
const ctx = cv.getContext('2d');
const SPIN = hex2rgb('#2dc997');
const SAND = hex2rgb('#e8c39e');

const RINGS = 7;
let W = 0, H = 0, DPR = 1;
let dots = [];

function fit() {
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  cv.width = W * DPR; cv.height = H * DPR;
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  build();
}

function build() {
  dots = [];
  const maxR = Math.hypot(W, H) * 0.42;
  // densité proportionnelle à la surface, bornée pour les petites machines
  const budget = clamp(Math.round((W * H) / 7600), 90, 340);
  let placed = 0;
  for (let ring = 0; ring < RINGS && placed < budget; ring++) {
    const rr = ((ring + 1) / RINGS) * maxR;
    const n = Math.min(Math.round(9 + ring * 7), budget - placed);
    for (let i = 0; i < n; i++) {
      dots.push({
        ring,
        rr,
        slot: (i / n) * TAU,                       // place rangée, à l'arrivée
        free: Math.random() * TAU,                 // angle libre, au départ
        spd: (0.05 + Math.random() * 0.2) * (Math.random() < .5 ? -1 : 1),
        wob: 0.35 + Math.random() * 0.8,           // amplitude du désordre
        ph: Math.random() * TAU,
        size: 0.8 + Math.random() * 1.5,
        warm: Math.random() < 0.1                  // quelques points sable
      });
      placed++;
    }
  }
}

let last = 0, paused = false;

function draw(t) {
  const dt = Math.min((t - last) / 1000 || 0, 0.05);
  last = t;

  ctx.clearRect(0, 0, W, H);

  // o = degré d'ordre : 0 en haut de page, 1 en bas
  const o = REDUCED ? 0.7 : clamp(scrollP * 1.25, 0, 1);
  const eased = o * o * (3 - 2 * o);
  const cx = W * 0.5 + Math.sin(t * 0.00006) * W * 0.04;
  const cy = H * 0.5 - (scrollP - 0.5) * H * 0.12;
  const rot = REDUCED ? 0.6 : t * 0.000045;

  // anneaux fantômes — n'apparaissent qu'une fois l'ordre installé
  if (eased > 0.12) {
    ctx.lineWidth = 1;
    for (let ring = 0; ring < RINGS; ring++) {
      const rr = ((ring + 1) / RINGS) * Math.hypot(W, H) * 0.42;
      ctx.strokeStyle = `rgba(45,201,151,${(eased - 0.12) * 0.07})`;
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, TAU);
      ctx.stroke();
    }
  }

  const time = t * 0.001;
  for (const d of dots) {
    if (!REDUCED) d.free += d.spd * dt;
    const dir = d.ring % 2 ? -1 : 1;

    // position désordonnée
    const rChaos = d.rr + Math.sin(time * 0.35 + d.ph) * d.wob * d.rr * 0.42;
    const xC = cx + Math.cos(d.free) * rChaos;
    const yC = cy + Math.sin(d.free) * rChaos * 0.78;

    // position rangée
    const aOrd = d.slot + rot * dir * (1 + d.ring * 0.14);
    const xO = cx + Math.cos(aOrd) * d.rr;
    const yO = cy + Math.sin(aOrd) * d.rr * 0.78;

    d.x = lerp(xC, xO, eased);
    d.y = lerp(yC, yO, eased);

    const base = d.warm ? SAND : SPIN;
    const a = (0.16 + eased * 0.46) * (d.warm ? 1.25 : 1);
    ctx.fillStyle = `rgba(${base[0]},${base[1]},${base[2]},${clamp(a, 0, 1)})`;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.size * (1 + eased * 0.45), 0, TAU);
    ctx.fill();
  }

  // liens entre voisins d'un même anneau — la structure qui se révèle
  if (eased > 0.45) {
    ctx.strokeStyle = `rgba(45,201,151,${(eased - 0.45) * 0.3})`;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    for (let i = 1; i < dots.length; i++) {
      const a = dots[i - 1], b = dots[i];
      if (a.ring !== b.ring) continue;
      const dx = a.x - b.x, dy = a.y - b.y;
      if (dx * dx + dy * dy > 26000) continue;
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();
  }
}

/* ════════════ HUD — think / teach / transform ════════════ */
const hudRead = document.getElementById('hudRead');
const PHASES = ['think', 'teach', 'transform'];
let hudPhase = -1;
function tickHud() {
  const i = Math.min(Math.floor(scrollP * 3), 2);
  if (i !== hudPhase) { hudPhase = i; hudRead.textContent = PHASES[i]; }
}

/* ════════════ boucle ════════════ */
function frame(t) {
  if (!paused) { tickBed(); draw(t); tickHud(); }
  requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange', () => {
  paused = document.hidden;
  last = performance.now();
});

/* ════════════ apparitions au scroll ════════════ */
const revealIO = new IntersectionObserver(es => {
  for (const e of es) {
    if (!e.isIntersecting) continue;
    revealIO.unobserve(e.target);
    e.target.classList.add('revealed');
    const n = e.target.matches('[data-count]') ? e.target : e.target.querySelector('[data-count]');
    if (n) countUp(n);
  }
}, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
document.querySelectorAll('[data-reveal]').forEach(el => revealIO.observe(el));

function countUp(el) {
  const to = parseFloat(el.dataset.count);
  if (!isFinite(to)) return;
  const pre = el.dataset.prefix || '';
  const suf = el.dataset.suffix || '';
  const dur = 1300;
  const t0 = performance.now();
  (function step(t) {
    const p = clamp((t - t0) / dur, 0, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = pre + Math.round(to * e).toLocaleString('fr-FR') + suf;
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}

/* ════════════ découpe des citations en mots ════════════ */
document.querySelectorAll('[data-split]').forEach(el => {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = '';
  words.forEach((w, i) => {
    const s = document.createElement('span');
    s.className = 'w';
    s.style.setProperty('--d', (0.3 + i * 0.055).toFixed(3) + 's');
    s.textContent = w;
    el.append(s, document.createTextNode(' '));
  });
});

/* ════════════ nav ════════════ */
const nav = document.getElementById('nav');
const burger = document.getElementById('navBurger');
const menu = document.getElementById('mobileMenu');

function onScroll() {
  readScroll();
  nav.classList.toggle('scrolled', scrollY > 40);
}
addEventListener('scroll', onScroll, { passive: true });

function setMenu(open) {
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  document.body.classList.toggle('menu-open', open);
  if (open) {
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('open'));
  } else {
    menu.classList.remove('open');
    setTimeout(() => { if (!menu.classList.contains('open')) menu.hidden = true; }, 420);
  }
}
burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', e => {
  if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); burger.focus(); }
});

/* ════════════ e-mail assemblé côté client (anti-moisson) ════════════ */
const mail = document.getElementById('mail');
if (mail) {
  const addr = mail.dataset.user + '@' + mail.dataset.host;
  const a = document.createElement('a');
  a.href = 'mailto:' + addr;
  a.textContent = addr;
  mail.replaceWith(a);
}

/* ════════════ divers ════════════ */
document.getElementById('year').textContent = new Date().getFullYear();

/* le marquee doit défiler exactement d'une moitié : on duplique le contenu */
const mt = document.getElementById('marqueeTrack');
if (mt) mt.innerHTML += mt.innerHTML;

/* ════════════ démarrage ════════════ */
addEventListener('resize', fit, { passive: true });
fit();
onScroll();
requestAnimationFrame(frame);
