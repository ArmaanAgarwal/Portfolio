/* ============================================================
   Shared behavior for every page
   ============================================================ */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- custom cursor ---------- */
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  if (dot) { dot.style.left = mx + 'px'; dot.style.top = my + 'px'; }
});
(function ringLoop() {
  rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
  if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
  requestAnimationFrame(ringLoop);
})();
function bindHover(scope) {
  (scope || document).querySelectorAll('[data-hover]').forEach(el => {
    el.addEventListener('mouseenter', () => ring && ring.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => ring && ring.classList.remove('is-hover'));
  });
}
bindHover();

/* ---------- magnetic buttons ---------- */
if (!reduced) document.querySelectorAll('[data-magnet]').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px,${(e.clientY - r.top - r.height / 2) * 0.28}px)`;
  });
  btn.addEventListener('mouseleave', () => btn.style.transform = '');
});

/* ---------- progress bar + nav state ---------- */
const bar = document.querySelector('.progress'), nav = document.querySelector('nav');
addEventListener('scroll', () => {
  const h = document.documentElement;
  if (bar) bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
  if (nav) nav.classList.toggle('scrolled', h.scrollTop > 60);
}, { passive: true });

/* ---------- scroll reveals ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ---------- marquee ---------- */
const mtrack = document.getElementById('marqueeTrack');
if (mtrack) {
  const items = ['CUDA KERNELS', 'KV CACHE', 'CUDA GRAPHS', 'PYTORCH', 'QUANTIZATION', 'XGBOOST',
    'PACKAGE QUERIES', 'GUROBI', 'POSTGRESQL', 'ILP', 'MONTE CARLO', 'FEDERATED LEARNING'];
  mtrack.innerHTML = (items.map(i => `<span>${i}<b>·</b></span>`).join('')).repeat(2);
}

/* ---------- stage accordions (HoopIQ page) ---------- */
document.querySelectorAll('.stage').forEach(stage => {
  const btn = stage.querySelector('.stage-btn'), body = stage.querySelector('.stage-body');
  if (!btn || !body) return;
  btn.addEventListener('click', () => {
    const open = stage.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    body.style.maxHeight = open ? body.scrollHeight + 'px' : 0;
  });
});
const nowStage = document.querySelector('.stage-status.now');
if (nowStage) {
  const s = nowStage.closest('.stage'), b = s.querySelector('.stage-body');
  s.classList.add('open');
  requestAnimationFrame(() => b.style.maxHeight = b.scrollHeight + 'px');
  s.querySelector('.stage-btn').setAttribute('aria-expanded', 'true');
}

/* ---------- flip cards (hackathons page) ---------- */
document.querySelectorAll('.flip').forEach(card => {
  const toggle = () => card.classList.toggle('flipped');
  card.addEventListener('click', e => {
    if (e.target.closest('a')) return; /* let links work */
    toggle();
  });
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
});

/* ---------- copy email + toast ---------- */
const toast = document.createElement('div');
toast.className = 'toast'; toast.setAttribute('role', 'status');
document.body.appendChild(toast);
let toastTimer = null;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}
document.querySelectorAll('[data-copy]').forEach(el => {
  el.addEventListener('click', () => {
    const text = el.dataset.copy;
    const done = () => {
      el.classList.add('copied');
      const tag = el.querySelector('.copy-tag');
      if (tag) tag.textContent = 'COPIED ✓';
      showToast('Email copied — paste it anywhere');
      setTimeout(() => {
        el.classList.remove('copied');
        if (tag) tag.textContent = 'COPY';
      }, 2400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else fallbackCopy(text, done);
  });
});
function fallbackCopy(text, done) {
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); done(); } catch (e) { showToast(text); }
  document.body.removeChild(ta);
}

/* ---------- build meter (HoopIQ page) ---------- */
const bmFill = document.querySelector('.bm-fill');
if (bmFill) {
  const bmIO = new IntersectionObserver(es => {
    if (es[0].isIntersecting) { bmFill.style.width = bmFill.dataset.width; bmIO.disconnect(); }
  }, { threshold: 0.5 });
  bmIO.observe(bmFill.parentElement);
}

/* ---------- hero constellation (home only) ---------- */
const canvas = document.getElementById('constellation');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [];
  function sizeCanvas() {
    W = canvas.width = canvas.offsetWidth * devicePixelRatio;
    H = canvas.height = canvas.offsetHeight * devicePixelRatio;
  }
  sizeCanvas(); addEventListener('resize', sizeCanvas);
  const N = innerWidth < 700 ? 42 : 86;
  for (let i = 0; i < N; i++) nodes.push({
    x: Math.random(), y: Math.random(),
    vx: (Math.random() - .5) * 0.0006, vy: (Math.random() - .5) * 0.0006,
    r: Math.random() * 1.6 + 0.6
  });
  let hm = { x: -1, y: -1 };
  canvas.parentElement.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    hm = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  });
  (function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const n of nodes) {
      if (hm.x >= 0) {
        const dx = hm.x - n.x, dy = hm.y - n.y, d = Math.hypot(dx, dy);
        if (d < 0.18 && d > 0.001) { n.vx += dx / d * 0.0000225; n.vy += dy / d * 0.0000225; }
      }
      n.x += n.vx; n.y += n.vy; n.vx *= 0.995; n.vy *= 0.995;
      if (n.x < 0 || n.x > 1) n.vx *= -1;
      if (n.y < 0 || n.y > 1) n.vy *= -1;
      n.x = Math.min(1, Math.max(0, n.x)); n.y = Math.min(1, Math.max(0, n.y));
    }
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 0.11) {
        ctx.strokeStyle = `rgba(127,180,255,${(1 - d / 0.11) * 0.13})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x * W, a.y * H); ctx.lineTo(b.x * W, b.y * H); ctx.stroke();
      }
    }
    for (const n of nodes) {
      ctx.fillStyle = 'rgba(232,163,61,0.5)';
      ctx.beginPath(); ctx.arc(n.x * W, n.y * H, n.r * devicePixelRatio, 0, 7); ctx.fill();
    }
    if (!reduced) requestAnimationFrame(draw);
  })();
}

/* ---------- role ticker (home only) ---------- */
const ticker = document.getElementById('roleTicker');
if (ticker && !reduced) {
  const phrases = ['an LLM inference engine I built from scratch — 1,929 tok/s on a T4',
    'a fused RMSNorm CUDA kernel, 5.8\u00d7 faster than PyTorch',
    'CUDA-graph decode that made batch-1 generation 3.3\u00d7 faster',
    'measuring when LP relaxations fail (82% match rate)',
    'HoopIQ — a 0.70-AUC NBA prediction engine',
    'teaching SQL and transactions to a room of students'];
  let pi = 0;
  ticker.style.transition = 'opacity .26s ease';
  setInterval(() => {
    pi = (pi + 1) % phrases.length;
    ticker.style.opacity = 0;
    setTimeout(() => { ticker.textContent = phrases[pi]; ticker.style.opacity = 1; }, 260);
  }, 2600);
}

/* ---------- hero name letters (home only) ---------- */
document.querySelectorAll('.hero-name .word').forEach((word, wi) => {
  const text = word.dataset.word;
  [...text].forEach((c, i) => {
    const s = document.createElement('span');
    s.className = 'ch'; s.textContent = c;
    s.style.animationDelay = (wi * 0.28 + i * 0.045) + 's';
    word.appendChild(s);
  });
});

/* ---------- Monte Carlo widget (HoopIQ page only) ---------- */
const mcCanvas = document.getElementById('mcCanvas');
if (mcCanvas) {
  const mctx = mcCanvas.getContext('2d');
  const slider = document.getElementById('mcSlider'), probLbl = document.getElementById('mcProb');
  const meanEl = document.getElementById('mcMean'), rangeEl = document.getElementById('mcRange'),
    fiftyEl = document.getElementById('mcFifty'), countEl = document.getElementById('mcCount');
  let mcAnim = null;
  slider.addEventListener('input', () => probLbl.textContent = (slider.value / 100).toFixed(2));
  function sizeMC() {
    mcCanvas.width = mcCanvas.offsetWidth * devicePixelRatio;
    mcCanvas.height = 240 * devicePixelRatio;
  }
  sizeMC(); addEventListener('resize', sizeMC);
  function drawHist(hist) {
    const w = mcCanvas.width, h = mcCanvas.height, pad = 30 * devicePixelRatio;
    mctx.clearRect(0, 0, w, h);
    const maxCount = Math.max(...hist, 1), bw = (w - pad * 2) / 83;
    for (let wins = 0; wins <= 82; wins++) {
      const bh = hist[wins] / maxCount * (h - pad * 2);
      const t = Math.abs(wins - 41) / 41;
      mctx.fillStyle = `rgba(${232 - t * 105},${163 + t * 17},${61 + t * 194},0.9)`;
      mctx.fillRect(pad + wins * bw, h - pad - bh, Math.max(bw - 1.5, 1), bh);
    }
    mctx.fillStyle = 'rgba(139,148,166,0.9)';
    mctx.font = `${11 * devicePixelRatio}px "IBM Plex Mono", monospace`;
    [0, 20, 41, 60, 82].forEach(v => mctx.fillText(v, pad + v * bw - 6, h - 8 * devicePixelRatio));
    mctx.fillText('wins per 82-game season →', pad, 16 * devicePixelRatio);
  }
  document.getElementById('mcRun').addEventListener('click', () => {
    if (mcAnim) cancelAnimationFrame(mcAnim);
    const p = slider.value / 100, SIMS = 3000, GAMES = 82;
    const hist = new Array(83).fill(0), wins = [];
    let done = 0;
    function chunk() {
      const step = reduced ? SIMS : 60;
      for (let s = 0; s < step && done < SIMS; s++, done++) {
        const pj = Math.min(.95, Math.max(.05, p + (Math.random() + Math.random() + Math.random() - 1.5) * 0.045));
        let w = 0;
        for (let g = 0; g < GAMES; g++) if (Math.random() < pj) w++;
        hist[w]++; wins.push(w);
      }
      drawHist(hist);
      countEl.textContent = done.toLocaleString();
      if (done < SIMS) { mcAnim = requestAnimationFrame(chunk); }
      else {
        wins.sort((a, b) => a - b);
        meanEl.textContent = (wins.reduce((a, b) => a + b, 0) / SIMS).toFixed(1);
        rangeEl.textContent = `${wins[Math.floor(SIMS * 0.1)]} – ${wins[Math.floor(SIMS * 0.9)]}`;
        fiftyEl.textContent = ((wins.filter(w => w >= 50).length / SIMS) * 100).toFixed(1) + '%';
      }
    }
    chunk();
  });
  const mcIO = new IntersectionObserver(es => {
    if (es[0].isIntersecting) { document.getElementById('mcRun').click(); mcIO.disconnect(); }
  }, { threshold: 0.4 });
  mcIO.observe(mcCanvas);
}

/* ---------- LLM engine throughput chart ---------- */
const tp = document.getElementById('tpChart');
if (tp) {
  const batches = [1, 8, 32];
  const series = [
    { name: 'Hugging Face (fp16)', color: '#525b6c', v: [28.6, 240, 919] },
    { name: 'Ours: no cache', color: '#3a4458', v: [34.2, 114, 131] },
    { name: 'Ours: KV cache', color: '#7fb4ff', v: [36.0, 282, 1076] },
    { name: 'Ours: + CUDA graph', color: '#e8a33d', v: [120, 806, 1929], hi: true },
    { name: 'Ours: + INT8', color: '#5a7fb8', v: [29.5, 228, 879] },
    { name: 'Ours: + fused RMSNorm', color: '#a3c4ff', v: [31.2, 265, 990] },
  ];
  const W = 900, H = 380, padL = 56, padR = 16, padT = 20, padB = 44;
  const lo = Math.log10(20), hi = Math.log10(2500);
  const y = v => padT + (1 - (Math.log10(v) - lo) / (hi - lo)) * (H - padT - padB);
  const gw = (W - padL - padR) / batches.length, bw = (gw * 0.78) / series.length;
  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  for (const g of [20, 50, 100, 200, 500, 1000, 2000]) {
    s += `<line class="grid" x1="${padL}" x2="${W - padR}" y1="${y(g)}" y2="${y(g)}"/>`;
    s += `<text class="axis" x="${padL - 8}" y="${y(g) + 4}" text-anchor="end">${g}</text>`;
  }
  s += `<text class="axis" x="${padL - 8}" y="${padT - 6}" text-anchor="end">tok/s</text>`;
  batches.forEach((b, bi) => {
    const x0 = padL + bi * gw + gw * 0.11;
    s += `<text class="axis" x="${padL + bi * gw + gw / 2}" y="${H - 14}" text-anchor="middle">batch ${b}</text>`;
    series.forEach((se, si) => {
      const v = se.v[bi], x = x0 + si * bw, top = y(v), base = H - padB;
      s += `<rect class="bar" x="${x + 1}" y="${top}" width="${bw - 2}" height="${base - top}" rx="3" fill="${se.color}"><title>${se.name} · batch ${b}: ${v.toLocaleString()} tok/s</title></rect>`;
      s += `<text class="val${se.hi ? ' always' : ''}" x="${x + bw / 2}" y="${top - 6}" text-anchor="middle">${v >= 100 ? Math.round(v).toLocaleString() : v}</text>`;
    });
  });
  s += '</svg>';
  tp.outerHTML = s.replace('<svg ', '<svg id="tpChart" role="img" aria-label="Decode throughput by configuration and batch size" ');
  const svg = document.getElementById('tpChart');
  document.getElementById('chartLegend').innerHTML = series.map(se => `<span><i style="background:${se.color}"></i>${se.name}</span>`).join('');
  if (reduced) svg.classList.add('in');
  else new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { svg.classList.add('in'); o.disconnect(); } }, { threshold: 0.3 }).observe(svg);
}
