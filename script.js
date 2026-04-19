/* ── THEME ── */
const html = document.documentElement;
const themeBtn = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

setTheme(localStorage.getItem('theme') || 'light');

themeBtn.addEventListener('click', () => {
  const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(next);
  localStorage.setItem('theme', next);
});

function setTheme(t) {
  html.dataset.theme = t;
  themeIcon.textContent = t === 'dark' ? '🌙' : '☀️';
}

/* ── NEON NAME SOUND ── */
let audioCtx = null;

function ctx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playNeonBuzz() {
  if (html.dataset.theme !== 'dark') return;
  const ac = ctx();

  const osc = ac.createOscillator();
  const gain = ac.createGain();
  const shaper = ac.createWaveShaper();

  // Waveshaper for electrical character
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i * 2) / 256 - 1;
    curve[i] = (Math.PI + 280) * x / (Math.PI + 280 * Math.abs(x));
  }
  shaper.curve = curve;

  // Subtle pitch wobble
  const wobble = ac.createOscillator();
  const wobbleGain = ac.createGain();
  wobble.frequency.value = 3 + Math.random() * 3;
  wobbleGain.gain.value = 1.5;
  wobble.connect(wobbleGain);
  wobbleGain.connect(osc.frequency);

  osc.type = 'sawtooth';
  osc.frequency.value = 100;

  gain.gain.setValueAtTime(0, ac.currentTime);
  gain.gain.linearRampToValueAtTime(0.07, ac.currentTime + 0.02);
  gain.gain.setValueAtTime(0.07, ac.currentTime + 0.10);
  gain.gain.linearRampToValueAtTime(0, ac.currentTime + 0.20);

  osc.connect(shaper);
  shaper.connect(gain);
  gain.connect(ac.destination);

  wobble.start(); osc.start();
  osc.stop(ac.currentTime + 0.22);
  wobble.stop(ac.currentTime + 0.22);
}

function startNeonHum() {
  if (html.dataset.theme !== 'dark') return null;
  const ac = ctx();

  const osc = ac.createOscillator();
  const gain = ac.createGain();
  const filter = ac.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.value = 180;
  filter.type = 'bandpass';
  filter.frequency.value = 180;
  filter.Q.value = 1;

  gain.gain.setValueAtTime(0, ac.currentTime);
  gain.gain.linearRampToValueAtTime(0.035, ac.currentTime + 0.06);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);
  osc.start();

  return { osc, gain, ac };
}

function stopNeonHum(nodes) {
  if (!nodes) return;
  const { osc, gain, ac } = nodes;
  gain.gain.linearRampToValueAtTime(0, ac.currentTime + 0.08);
  osc.stop(ac.currentTime + 0.1);
}

const heroName = document.getElementById('heroName');
let humNodes = null;

heroName.addEventListener('mouseenter', () => {
  heroName.classList.add('neon-buzz');
  setTimeout(() => heroName.classList.remove('neon-buzz'), 260);
  playNeonBuzz();
  humNodes = startNeonHum();
});

heroName.addEventListener('mouseleave', () => {
  stopNeonHum(humNodes);
  humNodes = null;
});

/* ── SMOOTH SCROLL (offset for fixed nav) ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
  });
});

/* ── SCROLL REVEAL ── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.card, .prose-block, .skills-col, .contact-link').forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});
