// ---------- Terminal boot sequence ----------
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
    scrambleInto(document.getElementById('heroName'), 'MD Tanveer Mahmood Shanin', { startDelay: 550, charDelay: 34 });
  });

  // ---------- Sidebar active link + scroll reveal ----------
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = ['top', 'about', 'projects', 'hobbies', 'career', 'contact'].map(id => document.getElementById(id));
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`.nav-link[data-target="${entry.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { threshold: 0.4, rootMargin: '-10% 0px -60% 0px' });
  sections.forEach(s => s && sectionObserver.observe(s));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ---------- Mobile sidebar toggle ----------
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  toggleBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  navLinks.forEach(l => l.addEventListener('click', () => sidebar.classList.remove('open')));

  // ---------- Ambient dust particles ----------
  const field = document.getElementById('particles');
  const pCount = window.innerWidth < 700 ? 12 : 22;
  for (let i = 0; i < pCount; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 3 + 1.5;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.bottom = (Math.random() * -20 - 5) + 'vh';
    p.style.animationDuration = (Math.random() * 12 + 10) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    field.appendChild(p);
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
    { baseX: 0.20, baseY: 0.10, r: 0.42, color: 'rgba(0,232,255,0.20)', lag: 0.035, dx: 0, dy: 0 },
    { baseX: 0.85, baseY: 0.20, r: 0.36, color: 'rgba(124,92,255,0.16)', lag: 0.02, dx: 0, dy: 0 },
    { baseX: 0.50, baseY: 0.95, r: 0.40, color: 'rgba(0,232,255,0.14)', lag: 0.015, dx: 0, dy: 0 }
  ];

  function draw() {
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
