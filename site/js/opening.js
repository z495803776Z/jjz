const FLYING_COUNT = 20;

function shuffleArray(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function pickDeckImages() {
  if (typeof TAROT_DECK !== 'undefined' && TAROT_DECK.length > 0) {
    return shuffleArray(TAROT_DECK).slice(0, FLYING_COUNT).map(c => c.img);
  }
  // fallback to old hero cards
  return [
    'assets/images/hero_card_01.png',
    'assets/images/hero_card_02.png',
    'assets/images/hero_card_03.png',
    'assets/images/hero_card_04.png',
    'assets/images/hero_card_05.png'
  ];
}

function generatePositions(count, width, height) {
  const starts = [];
  const ends = [];
  const targets = [];
  const edges = [
    { x: -0.18, y: -0.22, rotBase: -35 },
    { x: 1.18,  y: -0.15, rotBase: 30 },
    { x: -0.12, y: 1.18,  rotBase: 25 },
    { x: 1.15,  y: 1.12,  rotBase: -30 },
    { x: -0.2,  y: 0.5,   rotBase: -20 },
    { x: 1.2,   y: 0.45,  rotBase: 22 },
    { x: 0.3,   y: -0.25, rotBase: 12 },
    { x: 0.7,   y: -0.2,  rotBase: -18 },
    { x: 0.25,  y: 1.22,  rotBase: 15 },
    { x: 0.75,  y: 1.18,  rotBase: -12 }
  ];

  for (let i = 0; i < count; i++) {
    // Start: fly in from edges
    const edge = edges[i % edges.length];
    const sx = edge.x * width + (Math.random() - 0.5) * 120;
    const sy = edge.y * height + (Math.random() - 0.5) * 120;
    const sr = edge.rotBase + (Math.random() - 0.5) * 20;
    starts.push({ x: sx, y: sy, rot: sr });

    // End: fly out to opposite edges
    const outEdge = edges[(i + 5) % edges.length];
    const ex = outEdge.x * width + (Math.random() - 0.5) * 150;
    const ey = outEdge.y * height + (Math.random() - 0.5) * 150;
    const er = outEdge.rotBase + (Math.random() - 0.5) * 25;
    ends.push({ x: ex, y: ey, rot: er });

    // Target: arrange in a loose circle/ellipse around center
    const angle = ((i + 0.5) / count) * Math.PI * 2 - Math.PI / 2;
    const radiusX = Math.min(width, height) * (0.22 + Math.random() * 0.08);
    const radiusY = radiusX * (0.65 + Math.random() * 0.15);
    targets.push({
      x: width / 2 + Math.cos(angle) * radiusX + (Math.random() - 0.5) * 30,
      y: height / 2 + Math.sin(angle) * radiusY + (Math.random() - 0.5) * 20,
      rot: ((i - count / 2) / count) * 14 + (Math.random() - 0.5) * 4
    });
  }
  return { starts, ends, targets };
}

export function initOpening(sceneEl) {
  const canvas = sceneEl.querySelector('#opening-canvas');
  const content = sceneEl.querySelector('.opening-content');
  if (!canvas || !content) return;
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let frameId = null;

  const FLY_IN_DURATION = 3800;
  const FLOAT_DURATION = 4500;
  const FLY_OUT_DURATION = 2200;

  const images = [];
  const trails = [];
  let burstAlpha = 0, burstR = 0, burstX = 0, burstY = 0;
  let contentShown = false;

  function resize() {
    width = canvas.width = sceneEl.clientWidth;
    height = canvas.height = sceneEl.clientHeight;
  }

  function loadImages(srcs) {
    return Promise.all(srcs.map(src => new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    })));
  }

  function createCards(srcs) {
    const pos = generatePositions(srcs.length, width, height);
    return srcs.map((src, i) => {
      images[i] = images[i] || null;
      return {
        img: images[i],
        targetX: pos.targets[i].x,
        targetY: pos.targets[i].y,
        targetRotation: pos.targets[i].rot,
        startX: pos.starts[i].x,
        startY: pos.starts[i].y,
        startRotation: pos.starts[i].rot,
        endX: pos.ends[i].x,
        endY: pos.ends[i].y,
        endRotation: pos.ends[i].rot,
        floatOffset: Math.random() * Math.PI * 2,
        floatSpeed: Math.random() * 0.4 + 0.5,
        floatAmplitude: Math.random() * 4 + 2
      };
    });
  }

  function addTrail(x, y, alpha) {
    for (let i = 0; i < 2; i++) {
      trails.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        r: Math.random() * 3 + 1,
        alpha: alpha * (Math.random() * 0.5 + 0.3),
        life: 1,
        decay: Math.random() * 0.025 + 0.015
      });
    }
  }

  function updateTrails() {
    for (let i = trails.length - 1; i >= 0; i--) {
      const t = trails[i];
      t.life -= t.decay;
      t.alpha *= 0.97;
      t.r *= 0.99;
      if (t.life <= 0) { trails.splice(i, 1); continue; }
      ctx.globalAlpha = t.alpha * t.life;
      const grad = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, t.r * 3);
      grad.addColorStop(0, 'rgba(160,210,255,0.8)');
      grad.addColorStop(0.5, 'rgba(120,170,255,0.3)');
      grad.addColorStop(1, 'rgba(100,150,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawCard(card, x, y, rotation, scale, alpha) {
    if (!card.img) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;
    ctx.shadowColor = 'rgba(120,190,255,0.4)';
    ctx.shadowBlur = 35;
    ctx.drawImage(card.img, -100, -140, 200, 280);
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(180,220,255,0.2)';
    ctx.drawImage(card.img, -100, -140, 200, 280);
    ctx.restore();
  }

  function drawBurst(alpha) {
    ctx.save();
    ctx.globalAlpha = alpha * 0.15;
    const g1 = ctx.createRadialGradient(burstX, burstY, 0, burstX, burstY, burstR * 1.6);
    g1.addColorStop(0, 'rgba(180,220,255,0)');
    g1.addColorStop(0.5, 'rgba(140,200,255,0.3)');
    g1.addColorStop(1, 'rgba(80,160,255,0)');
    ctx.fillStyle = g1;
    ctx.beginPath();
    ctx.arc(burstX, burstY, burstR * 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = alpha * 0.25;
    const g2 = ctx.createRadialGradient(burstX, burstY, 0, burstX, burstY, burstR * 0.8);
    g2.addColorStop(0, 'rgba(220,240,255,0.6)');
    g2.addColorStop(1, 'rgba(140,200,255,0)');
    ctx.fillStyle = g2;
    ctx.beginPath();
    ctx.arc(burstX, burstY, burstR * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function flyEase(t) { return 1 - Math.pow(1 - t, 3.5); }
  function outEase(t) { return t * t * t; }

  // --- Phase 1: Fly In ---
  function phaseFlyIn(cards, onDone) {
    const startedAt = performance.now();
    burstAlpha = 0; burstR = 0;
    function tick() {
      const now = performance.now();
      const progress = Math.min(1, (now - startedAt) / FLY_IN_DURATION);
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const delay = i * 0.04;
        const localP = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));
        const eased = flyEase(localP);
        const x = card.startX + (card.targetX - card.startX) * eased;
        const y = card.startY + (card.targetY - card.startY) * eased;
        const rot = card.startRotation + (card.targetRotation - card.startRotation) * eased;
        const scale = 0.55 + 0.45 * eased;
        const alpha = 0.1 + 0.9 * eased;
        if (localP < 0.95 && localP > 0.05) addTrail(x, y, 1 - localP * 0.6);
        drawCard(card, x, y, rot, scale, alpha);
      }

      updateTrails();

      if (progress >= 0.8) {
        burstX = width / 2; burstY = height / 2;
        burstAlpha = Math.min(1, burstAlpha + 0.03);
        burstR += 10;
        drawBurst(burstAlpha);
      }
      if (progress >= 0.88 && !contentShown) {
        content.classList.add('visible');
        contentShown = true;
      }

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        onDone();
      }
    }
    frameId = requestAnimationFrame(tick);
  }

  // --- Phase 2: Float ---
  function phaseFloat(cards, onDone) {
    const startedAt = performance.now();
    function tick() {
      const now = performance.now();
      const elapsed = now - startedAt;
      const t = now / 1000;
      ctx.clearRect(0, 0, width, height);
      if (trails.length > 0) updateTrails();

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const floatY = Math.sin(t * card.floatSpeed + card.floatOffset) * card.floatAmplitude;
        const floatRot = Math.sin(t * card.floatSpeed * 0.7 + card.floatOffset + 1) * 1.2;
        drawCard(card, card.targetX, card.targetY + floatY, card.targetRotation + floatRot, 1, 1);
      }

      if (elapsed > FLOAT_DURATION * 0.6) {
        content.style.opacity = Math.max(0, 1 - (elapsed - FLOAT_DURATION * 0.6) / (FLOAT_DURATION * 0.4));
      }

      if (elapsed < FLOAT_DURATION) {
        frameId = requestAnimationFrame(tick);
      } else {
        content.classList.remove('visible');
        content.style.opacity = '';
        onDone();
      }
    }
    frameId = requestAnimationFrame(tick);
  }

  // --- Phase 3: Fly Out ---
  function phaseFlyOut(cards, onDone) {
    const startedAt = performance.now();
    function tick() {
      const now = performance.now();
      const progress = Math.min(1, (now - startedAt) / FLY_OUT_DURATION);
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const delay = i * 0.03;
        const localP = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));
        const eased = outEase(localP);
        const x = card.targetX + (card.endX - card.targetX) * eased;
        const y = card.targetY + (card.endY - card.targetY) * eased;
        const rot = card.targetRotation + (card.endRotation - card.targetRotation) * eased;
        const alpha = 1 - eased * 0.9;
        if (localP < 0.9 && localP > 0.05) addTrail(x, y, (1 - localP) * 0.4);
        drawCard(card, x, y, rot, 1, alpha);
      }

      updateTrails();

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        onDone();
      }
    }
    frameId = requestAnimationFrame(tick);
  }

  // --- Cycle ---
  function runCycle(cards) {
    phaseFlyIn(cards, () => {
      phaseFloat(cards, () => {
        phaseFlyOut(cards, () => {
          // Re-randomize for next cycle
          const pos = generatePositions(cards.length, width, height);
          cards.forEach((card, i) => {
            card.startX = pos.starts[i].x;
            card.startY = pos.starts[i].y;
            card.startRotation = pos.starts[i].rot;
            card.endX = pos.ends[i].x;
            card.endY = pos.ends[i].y;
            card.endRotation = pos.ends[i].rot;
            card.targetX = pos.targets[i].x;
            card.targetY = pos.targets[i].y;
            card.targetRotation = pos.targets[i].rot;
            card.floatOffset = Math.random() * Math.PI * 2;
          });
          burstAlpha = 0; burstR = 0;
          contentShown = false;
          setTimeout(() => runCycle(cards), 800);
        });
      });
    });
  }

  resize();
  window.addEventListener('resize', resize);

  const cardSrcs = pickDeckImages();
  loadImages(cardSrcs).then(imgs => {
    imgs.forEach((img, i) => { images[i] = img; });
    const cards = createCards(cardSrcs);
    runCycle(cards);
  });

  return {
    destroy() {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    }
  };
}
