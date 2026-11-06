const COLORS = ['#5f7fff', '#ff6b6b', '#ffd166', '#06d6a0', '#ff9f1c', '#c77dff', '#4cc9f0'];

export function confetti(origin) {
  if (typeof window === 'undefined') return () => {};
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return () => {};

  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const resize = () => {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  const ox = origin?.x ?? window.innerWidth / 2;
  const oy = origin?.y ?? window.innerHeight / 3;
  const pieces = [];

  const burst = (x, y, count, angle, spread, speed) => {
    for (let i = 0; i < count; i += 1) {
      const a = angle + (Math.random() - 0.5) * spread;
      const v = speed * (0.55 + Math.random() * 0.6);
      pieces.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.4,
        tilt: Math.random() * Math.PI,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        round: Math.random() < 0.25,
        life: 0,
      });
    }
  };

  burst(ox, oy, 120, -Math.PI / 2, Math.PI * 1.1, 15);
  burst(0, window.innerHeight * 0.75, 60, -Math.PI / 3, Math.PI / 4, 20);
  burst(window.innerWidth, window.innerHeight * 0.75, 60, (-2 * Math.PI) / 3, Math.PI / 4, 20);

  let frame = 0;
  let stopped = false;
  const start = performance.now();

  const cleanup = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', resize);
    canvas.remove();
  };

  const tick = (now) => {
    const elapsed = now - start;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let alive = 0;
    for (const p of pieces) {
      p.life += 1;
      p.vx *= 0.97;
      p.vy = Math.min(p.vy * 0.98 + 0.22, 4.5);
      p.x += p.vx + Math.sin(p.tilt) * 0.6;
      p.y += p.vy;
      p.rot += p.vr;
      p.tilt += 0.08;
      if (p.y > window.innerHeight + 20) continue;
      alive += 1;
      const fade = elapsed > 3000 ? Math.max(0, 1 - (elapsed - 3000) / 800) : 1;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.round) {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.scale(1, Math.cos(p.tilt));
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    }
    if (alive === 0 || elapsed > 3800) cleanup();
    else frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return cleanup;
}
