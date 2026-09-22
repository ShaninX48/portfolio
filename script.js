// ---------- Terminal boot sequence ----------
  document.documentElement.classList.remove('no-js');
  const lines = [
    { prompt: '$', text: 'whoami' },
    { prompt: '>', text: 'MD Tanveer Mahmood Shanin' },
    { prompt: '$', text: 'loading_profile.exe --status' },
    { prompt: '>', text: 'profile compiled successfully ✓' }
  ];
  const terminal = document.getElementById('terminal');
  let tDelay = 0.1;
  lines.forEach((l, i) => {
    const el = document.createElement('span');
    el.className = 'line';
    el.style.animationDelay = tDelay + 's';
    el.innerHTML = `<span class="prompt">${l.prompt}</span> ${l.text}` + (i === lines.length - 1 ? '<span class="cursor"></span>' : '');
    terminal.appendChild(el);
    tDelay += 0.32;
  });

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
    scrambleInto(heroEl, 'MD Tanveer Mahmood', { startDelay: 200, charDelay: 22 });
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
    csClose.focus();
  }
  function closeCaseStudy() {
    if (!csOverlay.classList.contains('open')) return;
    csOverlay.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }
  document.querySelectorAll('.details-btn').forEach(btn => {
    if (btn.textContent.trim() !== 'Details') btn.textContent = 'Details';
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      openCaseStudy(btn.dataset.caseStudy);
      btn.setAttribute('aria-expanded', 'true');
    });
  });
  if (csClose) csClose.addEventListener('click', closeCaseStudy);
  if (csOverlay) {
    csOverlay.addEventListener('click', (e) => {
      if (e.target === csOverlay) closeCaseStudy();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && csOverlay && csOverlay.classList.contains('open')) closeCaseStudy();
  });

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

  // ---------- Cursor glow dot (fine-pointer devices only) ----------
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);
    let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    let tx = cx, ty = cy;
    window.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      dot.classList.add('visible');
    });
    document.querySelectorAll('a, button, .project-card, .hobby-card, .skill-icon-card, .contact-card').forEach(el => {
      el.addEventListener('mouseenter', () => dot.classList.add('hover'));
      el.addEventListener('mouseleave', () => dot.classList.remove('hover'));
    });
    function cursorLoop() {
      cx += (tx - cx) * 0.2;
      cy += (ty - cy) * 0.2;
      dot.style.left = cx + 'px';
      dot.style.top = cy + 'px';
      requestAnimationFrame(cursorLoop);
    }
    cursorLoop();
  }

  // ---------- 3D tilt on project & hobby cards ----------
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.project-card, .hobby-card, .skill-icon-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rotX = (py - 0.5) * -8;
        const rotY = (px - 0.5) * 8;
        card.style.transform = `translateY(-6px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
