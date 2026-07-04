class SBBClock {
  constructor(canvasId, digitalId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.digital = document.getElementById(digitalId);
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
    ctx.lineWidth = 9;
    ctx.strokeStyle = "#111";
    ctx.stroke();

    for (let i = 0; i < 60; i++) {
      ctx.save();
      ctx.rotate(i * Math.PI / 30);
      ctx.beginPath();
      ctx.lineWidth = i % 5 === 0 ? 8 : 2.8;
      ctx.moveTo(0, -r + 30);
      ctx.lineTo(0, -r + (i % 5 === 0 ? 76 : 56));
      ctx.strokeStyle = "#111";
      ctx.stroke();
      ctx.restore();
    }

    const hour = now.getHours() % 12 + now.getMinutes() / 60;
    const minute = now.getMinutes() + now.getSeconds() / 60;
    const second = now.getSeconds() + now.getMilliseconds() / 1000;
    this.hand(hour * Math.PI / 6, r * .47, 17, "#111", 30);
    this.hand(minute * Math.PI / 30, r * .72, 11, "#111", 40);
    this.hand(second * Math.PI / 30, r * .82, 3.5, "#e21b2d", 50);
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#111";
    ctx.fill();
    ctx.restore();
    this.digital.textContent = now.toLocaleTimeString("ja-JP", { hour12: false });
    requestAnimationFrame(() => this.draw());
  }
}
