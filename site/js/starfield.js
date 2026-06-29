export function initStarfield(canvas) {
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let mouse = { x: 0.5, y: 0.5 };
  let smoothMouse = { x: 0.5, y: 0.5 };
  let frameId = null;
  let time = 0;

  // Star layers
  const smallStars = [];
  const brightStars = [];
  const nebulaBlobs = [];

  const SMALL_COUNT = 260;
  const BRIGHT_COUNT = 18;
  const NEBULA_COUNT = 5;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createElements();
  }

  function createElements() {
    // Small twinkling stars
    smallStars.length = 0;
    for (let i = 0; i < SMALL_COUNT; i++) {
      smallStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.2 + 0.2,
        baseAlpha: Math.random() * 0.5 + 0.15,
        twinkleSpeed: Math.random() * 1.5 + 0.5,
        twinkleOffset: Math.random() * Math.PI * 2,
        depth: Math.random() * 0.6 + 0.2 // parallax depth
      });
    }

    // Bright stars with glow halos
    brightStars.length = 0;
    for (let i = 0; i < BRIGHT_COUNT; i++) {
      brightStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2.2 + 1.5,
        haloR: Math.random() * 18 + 10,
        baseAlpha: Math.random() * 0.4 + 0.3,
        twinkleSpeed: Math.random() * 0.8 + 0.3,
        twinkleOffset: Math.random() * Math.PI * 2,
        depth: Math.random() * 0.4 + 0.3
      });
    }

    // Nebula blobs
    nebulaBlobs.length = 0;
    const nebulaColors = [
      { r: 80, g: 50, b: 180 },
      { r: 40, g: 100, b: 200 },
      { r: 100, g: 60, b: 220 },
      { r: 30, g: 80, b: 160 },
      { r: 120, g: 80, b: 255 }
    ];
    for (let i = 0; i < NEBULA_COUNT; i++) {
      const c = nebulaColors[i % nebulaColors.length];
      nebulaBlobs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 350 + 200,
        color: c,
        alpha: Math.random() * 0.06 + 0.02,
        driftX: (Math.random() - 0.5) * 0.15,
        driftY: (Math.random() - 0.5) * 0.1,
        depth: Math.random() * 0.2 + 0.05
      });
    }
  }

  function drawBackground() {
    // Deep space gradient
    const grad = ctx.createRadialGradient(
      width * 0.5, height * 0.35, 0,
      width * 0.5, height * 0.5, Math.max(width, height) * 0.8
    );
    grad.addColorStop(0, '#0a1628');
    grad.addColorStop(0.4, '#070e1e');
    grad.addColorStop(1, '#040810');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  function drawNebulaBlobs() {
    const px = (smoothMouse.x - 0.5) * 20;
    const py = (smoothMouse.y - 0.5) * 15;

    for (const blob of nebulaBlobs) {
      // Slow drift
      blob.x += blob.driftX;
      blob.y += blob.driftY;
      if (blob.x < -blob.r) blob.x = width + blob.r;
      if (blob.x > width + blob.r) blob.x = -blob.r;
      if (blob.y < -blob.r) blob.y = height + blob.r;
      if (blob.y > height + blob.r) blob.y = -blob.r;

      const x = blob.x + px * blob.depth * 3;
      const y = blob.y + py * blob.depth * 3;
      const c = blob.color;

      const grad = ctx.createRadialGradient(x, y, 0, x, y, blob.r);
      grad.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${blob.alpha * 1.5})`);
      grad.addColorStop(0.5, `rgba(${c.r},${c.g},${c.b},${blob.alpha * 0.6})`);
      grad.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`);

      ctx.fillStyle = grad;
      ctx.fillRect(x - blob.r, y - blob.r, blob.r * 2, blob.r * 2);
    }
  }

  function drawSmallStars() {
    const px = (smoothMouse.x - 0.5) * 16;
    const py = (smoothMouse.y - 0.5) * 12;

    for (const star of smallStars) {
      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5;
      const alpha = star.baseAlpha * (0.5 + twinkle * 0.5);
      const x = star.x + px * star.depth;
      const y = star.y + py * star.depth;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#e0eeff';
      ctx.beginPath();
      ctx.arc(x, y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawBrightStars() {
    const px = (smoothMouse.x - 0.5) * 20;
    const py = (smoothMouse.y - 0.5) * 15;

    for (const star of brightStars) {
      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5;
      const alpha = star.baseAlpha * (0.6 + twinkle * 0.4);
      const x = star.x + px * star.depth;
      const y = star.y + py * star.depth;

      // Soft halo glow
      const haloGrad = ctx.createRadialGradient(x, y, 0, x, y, star.haloR);
      haloGrad.addColorStop(0, `rgba(180,210,255,${alpha * 0.35})`);
      haloGrad.addColorStop(0.4, `rgba(140,180,255,${alpha * 0.12})`);
      haloGrad.addColorStop(1, 'rgba(100,160,255,0)');
      ctx.fillStyle = haloGrad;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(x, y, star.haloR, 0, Math.PI * 2);
      ctx.fill();

      // Core dot
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#f0f6ff';
      ctx.beginPath();
      ctx.arc(x, y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function draw() {
    time += 0.016;

    // Smooth mouse interpolation
    smoothMouse.x += (mouse.x - smoothMouse.x) * 0.04;
    smoothMouse.y += (mouse.y - smoothMouse.y) * 0.04;

    ctx.clearRect(0, 0, width, height);
    drawBackground();
    drawNebulaBlobs();
    drawSmallStars();
    drawBrightStars();

    ctx.globalAlpha = 1;
    frameId = requestAnimationFrame(draw);
  }

  function onMouseMove(e) {
    mouse.x = e.clientX / window.innerWidth;
    mouse.y = e.clientY / window.innerHeight;
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', onMouseMove);

  resize();
  draw();

  return {
    destroy() {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    }
  };
}