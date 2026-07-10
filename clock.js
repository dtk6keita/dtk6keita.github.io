class SBBClock {
  constructor(canvasId, digitalId = null, miniDigitalId = null) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.digital = digitalId ? document.getElementById(digitalId) : null;
    this.miniDigital = miniDigitalId ? document.getElementById(miniDigitalId) : null;
    window.addEventListener("resize", () => this.resize());
    this.resize();
    this.draw();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const size = Math.max(10, Math.min(rect.width, rect.height));
    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.canvas.style.width = size + "px";
    this.canvas.style.height = size + "px";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.size = size;
    this.radius = size / 2;
  }

  hand(angle, length, width, color, back = 0) {
    const ctx = this.ctx;
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.moveTo(0, back);
    ctx.lineTo(0, -length);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.restore();
  }

  draw() {
    const now = new Date();
    const ctx = this.ctx;
    const r = this.radius;
    ctx.clearRect(0, 0, this.size, this.size);
    ctx.save();
    ctx.translate(r, r);
    ctx.beginPath();
    ctx.arc(0, 0, r - 8, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.lineWidth = Math.max(3, r * 0.035);
    ctx.strokeStyle = "#111";
    ctx.stroke();

    for (let i = 0; i < 60; i++) {
      ctx.save();
      ctx.rotate(i * Math.PI / 30);
      ctx.beginPath();
      ctx.lineWidth = i % 5 === 0 ? Math.max(2.5, r * 0.032) : Math.max(1, r * 0.011);
      ctx.moveTo(0, -r + r * 0.12);
      ctx.lineTo(0, -r + (i % 5 === 0 ? r * 0.30 : r * 0.22));
      ctx.strokeStyle = "#111";
      ctx.stroke();
      ctx.restore();
    }

    const hour = now.getHours() % 12 + now.getMinutes() / 60;
    const minute = now.getMinutes() + now.getSeconds() / 60;
    const second = now.getSeconds() + now.getMilliseconds() / 1000;
    this.hand(hour * Math.PI / 6, r * .47, Math.max(4, r * .067), "#111", r * .12);
    this.hand(minute * Math.PI / 30, r * .72, Math.max(3, r * .043), "#111", r * .16);
    this.hand(second * Math.PI / 30, r * .82, Math.max(1.2, r * .014), "#e21b2d", r * .20);
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(3, r * .04), 0, Math.PI * 2);
    ctx.fillStyle = "#111";
    ctx.fill();
    ctx.restore();
    const timeText = now.toLocaleTimeString("ja-JP", { hour12: false });
    if (this.digital) this.digital.textContent = timeText;
    if (this.miniDigital) this.miniDigital.textContent = timeText;
    requestAnimationFrame(() => this.draw());
  }
}
