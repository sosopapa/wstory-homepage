/* Tiny live sparkline renderer for the dashboard mock */
(function () {
  const canvases = document.querySelectorAll('canvas[data-spark]');
  const DPRT = devicePixelRatio || 1;

  function draw(canvas, values, color) {
    const w = canvas.clientWidth || 160;
    const h = 44;
    canvas.width = w * DPRT;
    canvas.height = h * DPRT;
    const ctx = canvas.getContext('2d');
    ctx.scale(DPRT, DPRT);
    ctx.clearRect(0, 0, w, h);

    const max = Math.max(...values);
    const min = Math.min(...values);
    // Flat data (e.g. status = constant): center the line instead of pinning to bottom
    const range = max - min || Math.max(Math.abs(max) * 0.02, 1);
    const pad = 4;
    const pts = values.map((v, i) => {
      const x = (i / (values.length - 1)) * (w - pad * 2) + pad;
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return [x, y];
    });

    // area fill
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + '55');
    grad.addColorStop(1, color + '00');
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    pts.forEach((p) => ctx.lineTo(p[0], p[1]));
    ctx.lineTo(pts[pts.length - 1][0], h);
    ctx.lineTo(pts[0][0], h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // line
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // end dot
    const [ex, ey] = pts[pts.length - 1];
    ctx.beginPath();
    ctx.arc(ex, ey, 2.6, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function renderAll() {
    canvases.forEach((c) => {
      const values = c.dataset.spark.split(',').map(Number);
      draw(c, values, c.dataset.color || '#00d0f0');
    });
  }

  document.fonts?.ready.then(renderAll);
  window.addEventListener('resize', renderAll);
  renderAll();
})();
