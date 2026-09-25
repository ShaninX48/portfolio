// ---------- Terminal boot sequence (typed, falls back to instant) ----------
  document.documentElement.classList.remove('no-js');
  const lines = [
    { prompt: '$', text: 'whoami' },
    { prompt: '>', text: 'MD Tanveer Mahmood Shanin' },
    { prompt: '$', text: 'loading_profile.exe --status' },
    { prompt: '>', text: 'profile compiled successfully ✓' }
  ];
  const terminal = document.getElementById('terminal');
  function renderLine(l, withCursor) {
    const el = document.createElement('span');
    el.className = 'line';
    el.style.opacity = '1';
    el.style.animation = 'none';
    el.innerHTML = `<span class="prompt">${l.prompt}</span> <span class="typed"></span>` + (withCursor ? '<span class="cursor"></span>' : '');
    terminal.appendChild(el);
    return el.querySelector('.typed');
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    lines.forEach((l, i) => {
      renderLine(l, i === lines.length - 1).textContent = l.text;
    });
  } else {
    let li = 0;
    (function typeLine() {
      if (li >= lines.length) return;
      const l = lines[li];
      const t = renderLine(l, li === lines.length - 1);
      let ci = 0;
      const timer = setInterval(() => {
        t.textContent = l.text.slice(0, ++ci);
        if (ci >= l.text.length) {
          clearInterval(timer);
          li++;
          setTimeout(typeLine, 160);
        }
      }, 14);
    })();
  }

  // ---------- Scramble text hero title ----------
  const reduceMotionEarly = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ01!@#$%&*<>/\\';
  function scrambleInto(el, text, opts) {
    const { startDelay = 0, charDelay = 40, revealSpan = 26 } = opts || {};
    const chars = text.split('');
    const words = text.split(' ');
    let html = '';
    words.forEach((word, wi) => {
      html += '<span class="scramble-word">';
      html += word.split('').map(c => `<span class="scramble-char">${c}</span>`).join('');
      html += '</span>';
      if (wi < words.length - 1) html += '<span class="scramble-char">&nbsp;</span>';
    });
    el.innerHTML = html;
    const spans = el.querySelectorAll('.scramble-char');
    spans.forEach((span, i) => {
      const original = chars[i];
      if (original === ' ') return;
      const startAt = startDelay + i * charDelay;
      setTimeout(() => {
        let frame = 0;
        const runner = setInterval(() => {
          if (frame >= revealSpan) {
            span.textContent = original;
            span.classList.add('grad');
            clearInterval(runner);
            return;
          }
          span.textContent = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          frame++;
        }, 28);
      }, startAt);
    });
  }
  window.addEventListener('DOMContentLoaded', () => {
    const heroEl = document.getElementById('heroName');
    if (!heroEl) return;
    if (reduceMotionEarly) return; // keep static H1 for SEO + reduced motion
    scrambleInto(heroEl, 'MD Tanveer Mahmood Shanin', { startDelay: 400, charDelay: 26, revealSpan: 18 });
  });

  // ---------- Stats count-up (static numbers stay if JS/reduced-motion off) ----------
  // Restarts unfinished counters when the tab becomes visible again.
  function startCount() {
    document.querySelectorAll('.stat-num[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      if (!target || target <= 0 || parseInt(el.textContent, 10) === target) return;
      const dur = 1200;
      const t0 = performance.now();
      function tick(now) {
        if (document.hidden) { requestAnimationFrame(tick); return; }
        const p = Math.min(Math.max((now - t0) / dur, 0), 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  window.addEventListener('DOMContentLoaded', () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setTimeout(startCount, 1400); // wait until strip fades in
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) startCount();
    });
  });

  // ---------- Sidebar active link (position-based scroll spy) ----------
  // Ratio-based IntersectionObserver fails on tall sections (ratio is
  // relative to the section's own height), so the active link could stick
  // on hero.init forever. Marker-based spy works for any height.
  const navLinks = document.querySelectorAll('.nav-link');
  const spySections = ['top', 'about', 'skills', 'projects', 'hobbies', 'career', 'certificates', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  function setActiveLink(id) {
    navLinks.forEach(l => {
      const on = l.dataset.target === id;
      if (on && !l.classList.contains('active')) {
        l.classList.add('active');
        // Retrigger glow pulse on section change
        l.classList.remove('pulse');
        void l.offsetWidth;
        l.classList.add('pulse');
      } else if (!on) {
        l.classList.remove('active');
      }
    });
  }
  let spyTicking = false;
  function updateSpy() {
    spyTicking = false;
    const marker = window.scrollY + window.innerHeight * 0.35;
    let current = spySections[0];
    spySections.forEach(s => {
      if (s.getBoundingClientRect().top + window.scrollY <= marker) current = s;
    });
    if (current) setActiveLink(current.id);
  }
  window.addEventListener('scroll', () => {
    if (!spyTicking) { spyTicking = true; requestAnimationFrame(updateSpy); }
  }, { passive: true });
  window.addEventListener('resize', updateSpy);
  updateSpy();

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  // Fallback: never leave content invisible if observer fails
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.in-view)').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 1.2) el.classList.add('in-view');
    });
  }, 3000);

  // ---------- Mobile sidebar toggle ----------
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  function setSidebar(open) {
    sidebar.classList.toggle('open', open);
    toggleBtn.setAttribute('aria-expanded', String(open));
  }
  toggleBtn.addEventListener('click', () => setSidebar(!sidebar.classList.contains('open')));
  navLinks.forEach(l => l.addEventListener('click', () => setSidebar(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) setSidebar(false);
  });

  // ---------- Floating code symbols (replaces dust particles) ----------
  const field = document.getElementById('particles');
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const SYMBOLS = ['{', '}', '<', '/>', ';', '=', '#', '$', '()', '[]', '=>', '*', '_'];
  const sCount = window.innerWidth < 700 ? 10 : 18;
  for (let i = 0; i < sCount; i++) {
    const s = document.createElement('span');
    s.className = 'code-symbol';
    s.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    s.setAttribute('aria-hidden', 'true');
    s.style.left = Math.random() * 100 + 'vw';
    s.style.fontSize = (Math.random() * 12 + 10) + 'px';
    s.style.setProperty('--sym-o', (Math.random() * 0.3 + 0.15).toFixed(2));
    s.style.animationDuration = (Math.random() * 9 + 9) + 's';
    s.style.animationDelay = (Math.random() * 10) + 's';
    field.appendChild(s);
  }
  }

  // ---------- Interactive mesh gradient canvas ----------
  const canvas = document.getElementById('mesh');
  const ctx = canvas.getContext('2d');
  let W, H, DPR;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  let mouseX = W / 2, mouseY = H * 0.35;
  let targetX = mouseX, targetY = mouseY;
  window.addEventListener('mousemove', (e) => { targetX = e.clientX; targetY = e.clientY; });
  window.addEventListener('touchmove', (e) => {
    if (e.touches[0]) { targetX = e.touches[0].clientX; targetY = e.touches[0].clientY; }
  }, { passive: true });

  const blobs = [
    { baseX: 0.20, baseY: 0.10, r: 0.42, color: 'rgba(0,232,255,0.13)', lag: 0.035, dx: 0, dy: 0 },
    { baseX: 0.85, baseY: 0.20, r: 0.36, color: 'rgba(124,92,255,0.10)', lag: 0.02, dx: 0, dy: 0 },
    { baseX: 0.50, baseY: 0.95, r: 0.40, color: 'rgba(0,232,255,0.09)', lag: 0.015, dx: 0, dy: 0 }
  ];

  function draw() {
    if (document.hidden) { requestAnimationFrame(draw); return; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // static frame only
    mouseX += (targetX - mouseX) * 0.06;
    mouseY += (targetY - mouseY) * 0.06;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'transparent';
    blobs.forEach(b => {
      const offsetX = (mouseX - W / 2) * b.lag;
      const offsetY = (mouseY - H / 2) * b.lag;
      const cx = b.baseX * W + offsetX;
      const cy = b.baseY * H + offsetY;
      const radius = b.r * Math.max(W, H);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, b.color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    });
    // base fill
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = '#0a0e18';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(draw);
  }
  draw();

  // ---------- Neon flow trail (canvas ribbon, fine-pointer only) ----------
  // Thin luminous trail: soft blue base + cyan glow + ice core, drawn as
  // short tapered segments from a bounded, time-expiring point history.
  // Disabled on touch / small screens / reduced motion. Overlay is
  // pointer-events:none so clicks, scroll, selection and keyboard are untouched.
  (function initFlowTrail() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine) and (min-width: 881px)').matches) return;
    const cv = document.getElementById('flow');
    if (!cv) return;
    const fx = cv.getContext('2d');
    let FW = 0, FH = 0;
    function sizeFlow() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      FW = window.innerWidth; FH = window.innerHeight;
      cv.width = Math.floor(FW * dpr); cv.height = Math.floor(FH * dpr);
      cv.style.width = FW + 'px'; cv.style.height = FH + 'px';
      fx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fx.lineCap = 'round'; fx.lineJoin = 'round';
    }
    sizeFlow();
    const MAX_PTS = 30, FADE_MS = 550;
    const pts = [];
    function onMouseMove(e) {
      const now = performance.now();
      const x = e.clientX, y = e.clientY;
      const last = pts[pts.length - 1];
      if (last) {
        const dx = x - last.x, dy = y - last.y;
        if (dx * dx + dy * dy < 4 && now - last.t < 16) return;
      }
      pts.push({ x, y, t: now });
      if (pts.length > MAX_PTS) pts.splice(0, pts.length - MAX_PTS);
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize', sizeFlow);
    const PASSES = [
      { w: 11, c: '96,165,250', a: 0.10 },  // soft electric-blue base
      { w: 5, c: '34,211,238', a: 0.20 },   // cyan glow
      { w: 2, c: '224,242,254', a: 0.85 }   // ice-white core
    ];
    let raf = 0, running = true;
    function frame(now) {
      raf = 0;
      if (!running) return;
      if (document.hidden) { raf = requestAnimationFrame(frame); return; }
      while (pts.length && now - pts[0].t > FADE_MS) pts.shift();
      fx.clearRect(0, 0, FW, FH);
      const n = pts.length;
      if (n > 1) {
        for (const p of PASSES) {
          for (let i = 1; i < n; i++) {
            const age = (now - pts[i].t) / FADE_MS;
            fx.globalAlpha = Math.max(0, p.a * (1 - age * 0.7));
            fx.strokeStyle = 'rgb(' + p.c + ')';
            fx.lineWidth = Math.max(0.6, p.w * (1 - age * 0.75));
            fx.beginPath();
            fx.moveTo(pts[i - 1].x, pts[i - 1].y);
            fx.lineTo(pts[i].x, pts[i].y);
            fx.stroke();
          }
        }
        fx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(frame);
    }
    function onVis() {
      if (!document.hidden && !raf) raf = requestAnimationFrame(frame);
    }
    document.addEventListener('visibilitychange', onVis);
    raf = requestAnimationFrame(frame);
    function destroy() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', sizeFlow);
      document.removeEventListener('visibilitychange', onVis);
    }
    window.addEventListener('pagehide', destroy, { once: true });
    window.__flowTrail = { count: () => pts.length, destroy };
  })();

  // ---------- Case study modal (overlay is the single scroller) ----------
  const csOverlay = document.getElementById('csModalOverlay');
  const csContent = document.getElementById('csModalContent');
  const csClose = document.getElementById('csModalClose');
  let lastFocused = null;

  function openCaseStudy(key) {
    const tpl = document.getElementById('cs-' + key);
    if (!tpl || !csOverlay || !csContent) return;
    csContent.innerHTML = '';
    const clone = tpl.content.cloneNode(true);
    const fname = clone.querySelector('.code-filename');
    if (fname) fname.id = 'csModalTitle';
    csContent.appendChild(clone);
    lastFocused = document.activeElement;
    csOverlay.classList.add('open');
    csOverlay.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    document.querySelector('main').setAttribute('inert', '');
    csClose.focus();
  }
  function closeCaseStudy() {
    if (!csOverlay.classList.contains('open')) return;
    csOverlay.classList.remove('open');
    document.body.style.overflow = '';
    document.querySelector('main').removeAttribute('inert');
    if (lastFocused) lastFocused.focus();
  }
  // Certificates open in the same modal instead of a new tab
  document.querySelectorAll('.cert-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const img = card.querySelector('img');
      const title = card.querySelector('.cert-title');
      if (!img) return;
      csContent.innerHTML = '';
      const wrap = document.createElement('div');
      wrap.className = 'lightbox';
      const full = document.createElement('img');
      full.src = card.href;
      full.alt = img.alt;
      wrap.appendChild(full);
      if (title) {
        const cap = document.createElement('div');
        cap.className = 'lightbox-cap';
        cap.textContent = title.textContent.trim();
        wrap.appendChild(cap);
      }
      csContent.appendChild(wrap);
      lastFocused = document.activeElement;
      csOverlay.classList.add('open');
      csOverlay.scrollTop = 0;
      document.body.style.overflow = 'hidden';
      document.querySelector('main').setAttribute('inert', '');
      csClose.focus();
    });
  });
  // Whole project card opens its case study (key comes from the
  // card's own data-case-study); inner GitHub/Live links work normally.
  document.querySelectorAll('.project-card[data-case-study]').forEach(card => {
    const name = card.querySelector('.project-name');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', 'View details: ' + (name ? name.textContent.trim() : 'project'));
  });
  document.querySelectorAll('.project-card[data-case-study]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return; // let GitHub / Live links work
      openCaseStudy(card.dataset.caseStudy);
    });
    card.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('a')) {
        e.preventDefault();
        openCaseStudy(card.dataset.caseStudy);
      }
    });
  });
  if (csClose) csClose.addEventListener('click', closeCaseStudy);
  if (csOverlay) {
    csOverlay.addEventListener('click', (e) => {
      if (e.target === csOverlay) closeCaseStudy();
    });
    // Manual scroll drive: guarantees wheel/touch scroll the overlay
    // even where native nested-scroll chaining misbehaves.
    csOverlay.addEventListener('wheel', (e) => {
      if (!csOverlay.classList.contains('open')) return;
      e.preventDefault();
      csOverlay.scrollTop += (e.deltaY || 0);
    }, { passive: false });
    let touchY = null;
    csOverlay.addEventListener('touchstart', (e) => {
      touchY = e.touches[0].clientY;
    }, { passive: true });
    csOverlay.addEventListener('touchmove', (e) => {
      if (touchY === null || !csOverlay.classList.contains('open')) return;
      e.preventDefault();
      csOverlay.scrollTop += touchY - e.touches[0].clientY;
      touchY = e.touches[0].clientY;
    }, { passive: false });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && csOverlay && csOverlay.classList.contains('open')) closeCaseStudy();
    // Keep keyboard focus inside the open dialog
    if (e.key === 'Tab' && csOverlay && csOverlay.classList.contains('open')) {
      const focusables = csOverlay.querySelectorAll('button, a[href]');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // ---------- Back to top ----------
  const toTop = document.getElementById('toTop');
  if (toTop) {
    const toggleTop = () => toTop.classList.toggle('show', window.scrollY > 600);
    window.addEventListener('scroll', () => requestAnimationFrame(toggleTop), { passive: true });
    toggleTop();
    toTop.addEventListener('click', () => {
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
    });
  }

  // ---------- Reduced motion check ----------
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Scroll progress bar ----------
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // ---------- 3D tilt on project & hobby cards ----------
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.project-card, .hobby-card, .skill-icon-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        const rotX = (py - 0.5) * -8;
        const rotY = (px - 0.5) * 8;
        card.style.transform = `translateY(-6px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
