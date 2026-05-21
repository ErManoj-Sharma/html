// ========================
// CANVAS PARTICLE SYSTEM (OPTIMIZED - MINIMAL)
// ========================
const canvas = document.getElementById('cvs');
const ctx = canvas.getContext('2d');
let W, H;
let animFrameId;
let canvasVisible = true;

// Detect device capabilities
const isMobile = window.matchMedia('(pointer: coarse)').matches;
const isLowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
const PARTICLE_COUNT = isMobile || isLowPower ? 15 : 25;
const CONNECTION_DISTANCE = isMobile ? 80 : 120;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();

// Debounced resize
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    cancelAnimationFrame(animFrameId);
    resize();
    anim();
  }, 200);
});

class P {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.s = Math.random() * 2 + 0.5;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.o = Math.random() * 0.4 + 0.05;
    this.h = Math.random() > 0.5 ? 180 : 320;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.s, 0, Math.PI * 2);
    ctx.fillStyle = 'hsla(' + this.h + ',100%,50%,' + this.o + ')';
    ctx.fill();
  }
}

const pts = [];
for (let i = 0; i < PARTICLE_COUNT; i++) pts.push(new P());

function conns() {
  const maxDistSq = CONNECTION_DISTANCE * CONNECTION_DISTANCE;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x;
      const dy = pts[i].y - pts[j].y;
      const dSq = dx * dx + dy * dy;
      if (dSq < maxDistSq) {
        const d = Math.sqrt(dSq);
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[j].x, pts[j].y);
        ctx.strokeStyle = 'rgba(0,240,255,' + (0.025 * (1 - d / CONNECTION_DISTANCE)) + ')';
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }
    }
  }
}

function anim() {
  if (!canvasVisible) return;
  ctx.clearRect(0, 0, W, H);
  pts.forEach(p => { p.update(); p.draw(); });
  conns();
  animFrameId = requestAnimationFrame(anim);
}

// IntersectionObserver for canvas
const canvasObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    canvasVisible = entry.isIntersecting;
    if (canvasVisible && !animFrameId) {
      anim();
    } else if (!canvasVisible) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  });
}, { threshold: 0 });
canvasObserver.observe(document.getElementById('hero'));

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  } else if (canvasVisible) {
    anim();
  }
});

anim();

// ========================
// TEXT SCRAMBLE EFFECT
// ========================
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\/[]{}—=+*^?#________';
    this.originalText = el.dataset.text || el.textContent;
    this.update = this.update.bind(this);
    this.hasPlayed = false;
  }

  setText(newText) {
    const oldText = this.el.textContent;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => this.resolve = resolve);
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 20);
      const end = start + Math.floor(Math.random() * 20);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end } = this.queue[i];
      let char = this.chars[Math.floor(Math.random() * this.chars.length)];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (char === ' ' || !char) char = this.chars[Math.floor(Math.random() * this.chars.length)];
        output += `<span class="scramble-char">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }

  trigger() {
    if (this.hasPlayed) return;
    this.hasPlayed = true;
    this.setText(this.originalText);
  }
}

const scrambleElements = document.querySelectorAll('.scramble-text');
const scramblers = [];

scrambleElements.forEach(el => {
  const fx = new TextScramble(el);
  scramblers.push({ el, fx });
});

const scrambleObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const scrambler = scramblers.find(s => s.el === el);
      if (scrambler) {
        setTimeout(() => scrambler.fx.trigger(), Math.random() * 300);
      }
    }
  });
}, { threshold: 0.2 });

scrambleElements.forEach(el => scrambleObserver.observe(el));

// ========================
// LOADING
// ========================
const loader = document.getElementById('loader');
const lf = document.querySelector('.l-fill');
const ls = document.querySelector('.l-status');
const ll = document.querySelector('.l-logo');
const msgs = ['INITIALIZING', 'LOADING ASSETS', 'BUILDING UI', 'RENDERING EFFECTS', 'READY'];
let prog = 0;
let videoReady = false;

function finishLoading() {
  if (prog >= 100 && videoReady) {
    setTimeout(() => {
      loader.classList.add('done');
      gsap.to(ll, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' });
      initAll();
    }, 300);
  }
}

function loadStep() {
  prog += Math.random() * 10 + 8;
  if (prog > 100) prog = 100;
  lf.style.width = prog + '%';
  ls.textContent = msgs[Math.min(Math.floor(prog / 20), 4)];
  if (prog < 100) setTimeout(loadStep, 200);
  else finishLoading();
}
loadStep();

// Wait for hero video to be playable before dismissing loader
const heroVideo = document.getElementById('heroVideo') || document.getElementById('heroVideoMobile');
if (heroVideo) {
  if (heroVideo.readyState >= 3) {
    videoReady = true;
    finishLoading();
  } else {
    heroVideo.addEventListener('canplay', () => {
      videoReady = true;
      finishLoading();
    }, { once: true });
  }
} else {
  videoReady = true;
}

// ========================
// NAV
// ========================
const nav = document.getElementById('nav');
let lastScrollY = 0;
let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      nav.classList.toggle('vis', window.scrollY > 120);
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

document.querySelectorAll('.n-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(link.getAttribute('href'));
    if (t) gsap.to(window, { duration: 1.2, scrollTo: { y: t, offsetY: 80 }, ease: 'power3.inOut' });
  });
});

// ========================
// MOBILE MENU
// ========================
const navHam = document.getElementById('navHam');
const mobMenu = document.getElementById('mobMenu');
const mobClose = document.getElementById('mobClose');

function openMobMenu() {
  mobMenu.classList.add('open');
  navHam.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMobMenu() {
  mobMenu.classList.remove('open');
  navHam.classList.remove('open');
  document.body.style.overflow = '';
}

if (navHam) navHam.addEventListener('click', openMobMenu);
if (mobClose) mobClose.addEventListener('click', closeMobMenu);

// Mobile nav links — close menu + smooth scroll
document.querySelectorAll('.mob-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    closeMobMenu();
    const t = document.querySelector(link.getAttribute('href'));
    if (t) setTimeout(() => gsap.to(window, { duration: 1.2, scrollTo: { y: t, offsetY: 70 }, ease: 'power3.inOut' }), 400);
  });
});

// Mobile menu scramble on hover
const NAV_CHARS = '!<>-_\\/[]{}—=+*^?#@$%';
function attachScramble(el) {
  const original = el.dataset.text || el.textContent.trim();
  let frame = 0, raf = null;
  function step() {
    let out = '';
    for (let i = 0; i < original.length; i++) {
      if (original[i] === ' ') { out += ' '; continue; }
      if (frame > i * 1.5) out += original[i];
      else out += `<span class="mob-scramble-char">${NAV_CHARS[Math.floor(Math.random() * NAV_CHARS.length)]}</span>`;
    }
    el.innerHTML = out;
    frame++;
    if (frame < original.length * 2) raf = requestAnimationFrame(step);
    else el.textContent = original;
  }
  el.addEventListener('mouseenter', () => { cancelAnimationFrame(raf); frame = 0; step(); });
  el.addEventListener('mouseleave', () => { cancelAnimationFrame(raf); el.textContent = original; });
}
document.querySelectorAll('.mob-link').forEach(attachScramble);

// ========================
// HERO VIDEO - NO SCROLL SCRUB
// ========================
const hv = document.getElementById('heroVideo');
const hvm = document.getElementById('heroVideoMobile');

function playHeroVideo(v) {
  if (v) {
    v.playbackRate = 0.8;
    v.play().catch(() => {});
  }
}
playHeroVideo(hv);
playHeroVideo(hvm);

// ========================
// ROLE ROTATION ANIMATION
// ========================
const roles = ['Graphic Designer', 'Software Engineer', 'Video Editor', 'AI Creator', 'Digital Strategist'];
let rIdx = 0;
let rChar = 0;
let rDeleting = false;
let rPause = false;
const rEl = document.getElementById('roleText');

function roleLoop() {
  const curRole = roles[rIdx];

  if (rPause) {
    rPause = false;
    setTimeout(roleLoop, 1500);
    return;
  }

  if (rDeleting) {
    rEl.textContent = curRole.substring(0, rChar - 1);
    rChar--;
  } else {
    rEl.textContent = curRole.substring(0, rChar + 1);
    rChar++;
  }

  let speed = rDeleting ? 30 : 70;

  if (!rDeleting && rChar === curRole.length) {
    rPause = true;
    speed = 1800;
    rDeleting = true;
  } else if (rDeleting && rChar === 0) {
    rDeleting = false;
    rIdx = (rIdx + 1) % roles.length;
    speed = 400;
  }

  setTimeout(roleLoop, speed);
}

// ========================
// GSAP ANIMATIONS - CLEAN & SIMPLE
// ========================
function initAll() {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  // Hero
  gsap.to('.h-name', { opacity: 1, y: 0, duration: 1.4, delay: 0.2, ease: 'power3.out' });
  gsap.to('.h-roles-wrap', { opacity: 1, duration: 1, delay: 0.7, ease: 'power3.out', onComplete: roleLoop });
  gsap.to('.h-tagline', { opacity: 1, duration: 1, delay: 1.1, ease: 'power3.out' });
  gsap.to('.h-scroll', { opacity: 1, duration: 1, delay: 1.8, ease: 'power3.out' });

  // Section headers
  gsap.utils.toArray('.sh').forEach(h => {
    gsap.to(h, {
      scrollTrigger: { trigger: h, start: 'top 85%', toggleActions: 'play none none none' },
      opacity: 1, y: 0, duration: 1, ease: 'power3.out'
    });
  });

  // About
  gsap.to('.aiw', {
    scrollTrigger: { trigger: '.aiw', start: 'top 80%' },
    opacity: 1, x: 0, duration: 1.2, ease: 'power3.out'
  });
  gsap.to('.atw', {
    scrollTrigger: { trigger: '.atw', start: 'top 80%' },
    opacity: 1, x: 0, duration: 1.2, delay: 0.2, ease: 'power3.out'
  });

  // Stats counter
  gsap.utils.toArray('.sn[data-c]').forEach(stat => {
    const target = parseInt(stat.dataset.c);
    const obj = { v: 0 };
    gsap.to(obj, {
      scrollTrigger: { trigger: stat, start: 'top 85%' },
      v: target, duration: 2.5, ease: 'power2.out',
      onUpdate: () => { stat.textContent = Math.round(obj.v) + '+'; }
    });
  });

  // Timeline
  gsap.utils.toArray('.tli').forEach((item, i) => {
    gsap.to(item, {
      scrollTrigger: { trigger: item, start: 'top 85%' },
      opacity: 1, x: 0, duration: 1, delay: i * 0.12, ease: 'power3.out'
    });
  });

  // Skills
  gsap.utils.toArray('.sk').forEach((card, i) => {
    gsap.to(card, {
      scrollTrigger: { trigger: card, start: 'top 85%' },
      opacity: 1, y: 0, duration: 0.8, delay: i * 0.08, ease: 'power3.out'
    });
  });

  // Work cards
  gsap.utils.toArray('.wca').forEach((card, i) => {
    gsap.to(card, {
      scrollTrigger: { trigger: card, start: 'top 85%' },
      opacity: 1, y: 0, scale: 1, duration: 1, delay: i * 0.1, ease: 'power3.out'
    });
  });

  // Education
  gsap.to('.ec', {
    scrollTrigger: { trigger: '.ec', start: 'top 85%' },
    opacity: 1, y: 0, duration: 1.2, ease: 'power3.out'
  });

  // Contact
  gsap.to('.ci', {
    scrollTrigger: { trigger: '.ci', start: 'top 85%' },
    opacity: 1, x: 0, duration: 1.1, ease: 'power3.out'
  });
  gsap.to('.cf', {
    scrollTrigger: { trigger: '.cf', start: 'top 85%' },
    opacity: 1, x: 0, duration: 1.1, delay: 0.2, ease: 'power3.out'
  });
}

// ========================
// WORK FILTERS
// ========================
document.querySelectorAll('.wcb').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.wcb').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    const c = btn.dataset.c;
    document.querySelectorAll('.wca').forEach(card => {
      const show = c === 'all' || card.dataset.c === c;
      gsap.to(card, {
        opacity: show ? 1 : 0,
        scale: show ? 1 : 0.9,
        y: show ? 0 : 50,
        duration: 0.6,
        display: show ? 'block' : 'none',
        ease: 'power3.out'
      });
    });
  });
});

// ========================
// VIDEO MODAL
// ========================
const vm = document.getElementById('vm');
const mv = document.getElementById('mv');
const vc = document.querySelector('.vc');
document.querySelectorAll('.wca').forEach(card => {
  card.addEventListener('click', () => { vm.classList.add('on'); mv.play(); });
});
vc.addEventListener('click', () => { vm.classList.remove('on'); mv.pause(); mv.currentTime = 0; });
vm.addEventListener('click', e => { if (e.target === vm) { vm.classList.remove('on'); mv.pause(); mv.currentTime = 0; } });

// ========================
// CONTACT FORM
// ========================
document.getElementById('cForm').addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('.fs');
  const orig = btn.textContent;
  btn.textContent = 'Message Sent!';
  btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
  setTimeout(() => { btn.textContent = orig; btn.style.background = ''; e.target.reset(); }, 3000);
});

// ========================
// HERO CTA SCROLL
// ========================
document.querySelectorAll('.h-cta a').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(btn.getAttribute('href'));
    if (t) gsap.to(window, { duration: 1.5, scrollTo: { y: t, offsetY: 80 }, ease: 'power3.inOut' });
  });
});
document.querySelector('.h-scroll').addEventListener('click', () => {
  gsap.to(window, { duration: 1.5, scrollTo: { y: '#about', offsetY: 80 }, ease: 'power3.inOut' });
});

// ========================
// SCROLL PROGRESS BAR
// ========================
const scrollProgress = document.getElementById('scrollProgress');
let progressTicking = false;

window.addEventListener('scroll', () => {
  if (!progressTicking) {
    requestAnimationFrame(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      if (scrollProgress) scrollProgress.style.width = progress + '%';
      progressTicking = false;
    });
    progressTicking = true;
  }
}, { passive: true });

// ========================
// BACK TO TOP BUTTON
// ========================
const backToTop = document.getElementById('backToTop');
let bttTicking = false;

window.addEventListener('scroll', () => {
  if (!bttTicking) {
    requestAnimationFrame(() => {
      if (backToTop) backToTop.classList.toggle('vis', window.scrollY > 600);
      bttTicking = false;
    });
    bttTicking = true;
  }
}, { passive: true });

if (backToTop) {
  backToTop.addEventListener('click', () => {
    gsap.to(window, { duration: 1.5, scrollTo: { y: 0 }, ease: 'power3.inOut' });
  });
}

// ========================
// FLOATING SOCIAL SIDEBAR
// ========================
const socialSidebar = document.getElementById('socialSidebar');
let sbTicking = false;

window.addEventListener('scroll', () => {
  if (!sbTicking) {
    requestAnimationFrame(() => {
      if (socialSidebar) socialSidebar.classList.toggle('vis', window.scrollY > 400);
      sbTicking = false;
    });
    sbTicking = true;
  }
}, { passive: true });

// ========================
// VIDEO CARD CONTROLS
// ========================
document.querySelectorAll('.wca').forEach(card => {
  const video = card.querySelector('.wca-video');
  const playBtn = card.querySelector('.wca-play-btn');
  const playIcon = card.querySelector('.play-icon');
  const pauseIcon = card.querySelector('.pause-icon');
  const progressBar = card.querySelector('.wca-progress-bar');
  const timeDisplay = card.querySelector('.wca-time');

  if (!video || !playBtn) return;

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  video.addEventListener('timeupdate', () => {
    if (video.duration) {
      const pct = (video.currentTime / video.duration) * 100;
      progressBar.style.width = pct + '%';
      timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
    }
  });

  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (video.paused) {
      document.querySelectorAll('.wca-video').forEach(v => {
        if (v !== video) {
          v.pause();
          v.closest('.wca').classList.remove('playing');
          const otherPlay = v.closest('.wca').querySelector('.play-icon');
          const otherPause = v.closest('.wca').querySelector('.pause-icon');
          if (otherPlay) otherPlay.style.display = 'block';
          if (otherPause) otherPause.style.display = 'none';
        }
      });
      video.play();
      card.classList.add('playing');
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
    } else {
      video.pause();
      card.classList.remove('playing');
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
    }
  });

  card.addEventListener('click', (e) => {
    if (e.target.closest('.wca-play-btn')) return;
    if (video.paused) {
      playBtn.click();
    }
  });

  card.addEventListener('mouseenter', () => {
    if (video.paused && video.readyState >= 2) {
      video.play().catch(() => { });
      card.classList.add('playing');
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
    }
  });

  card.addEventListener('mouseleave', () => {
    video.pause();
    video.currentTime = 0;
    card.classList.remove('playing');
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    progressBar.style.width = '0%';
    timeDisplay.textContent = '00:00 / 00:00';
  });
});