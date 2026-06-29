// Ambient Sound Toggle — plays gentle mystical background sounds
const AUDIO_CONTEXT = window.AudioContext || window.webkitAudioContext;
let ctx = null;
let isPlaying = false;
let masterGain = null;
let oscillators = [];

function initAudio() {
  if (ctx) return;
  ctx = new AUDIO_CONTEXT();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0;
  masterGain.connect(ctx.destination);
}

function createTone(freq, type, vol, detune) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune || 0;
  gain.gain.value = vol;
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
  oscillators.push({ osc, gain });
  return { osc, gain };
}

function startAmbient() {
  initAudio();
  if (isPlaying) return;
  isPlaying = true;

  // Deep pad drone — mystical atmosphere
  createTone(65.41, 'sine', 0.12, 0);      // C2
  createTone(98.00, 'sine', 0.08, 3);      // G2 slight detune
  createTone(130.81, 'sine', 0.06, -2);    // C3
  createTone(196.00, 'triangle', 0.03, 5); // G3

  // Slow LFO modulation for breathing feel
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = 0.08; // Very slow
  lfoGain.gain.value = 0.03;
  lfo.connect(lfoGain);
  lfoGain.connect(masterGain.gain);
  lfo.start();
  oscillators.push({ osc: lfo, gain: lfoGain });

  // Fade in
  masterGain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 3);
}

function stopAmbient() {
  if (!isPlaying || !ctx) return;
  isPlaying = false;
  masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
  setTimeout(() => {
    oscillators.forEach(({ osc }) => { try { osc.stop(); } catch(e) {} });
    oscillators = [];
  }, 2500);
}

function toggle() {
  if (isPlaying) { stopAmbient(); } else { startAmbient(); }
  return isPlaying;
}

export function initAmbientToggle(btnEl) {
  if (!btnEl) return;
  btnEl.addEventListener('click', () => {
    const playing = toggle();
    btnEl.textContent = playing ? '♫' : '♪';
    btnEl.title = playing ? '关闭环境音' : '开启环境音';
    btnEl.classList.toggle('active', playing);
  });
}