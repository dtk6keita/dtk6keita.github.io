class SBBClock {
  constructor(canvasId, digitalId = null) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
    this.digital = digitalId ? document.getElementById(digitalId) : null;

    if (!this.canvas || !this.ctx) return;

    window.addEventListener("resize", () => this.resize());
    this.resize();
    this.draw();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const size = Math.max(10, Math.min(rect.width, rect.height));

    this.canvas.width = Math.round(size * dpr);
    this.canvas.height = Math.round(size * dpr);
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;

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
    if (!this.canvas || !this.ctx || !this.size) return;

    const now = new Date();
    const ctx = this.ctx;
    const r = this.radius;

    ctx.clearRect(0, 0, this.size, this.size);
    ctx.save();
    ctx.translate(r, r);

    // 文字盤
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(1, r - 6), 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.lineWidth = Math.max(3, r * 0.055);
    ctx.strokeStyle = "#30353B";
    ctx.stroke();

    // 目盛り
    // V12修正版：小型サブ時計でも目盛りが中心まで伸びないよう、
    // 半径に対する比率で位置・太さを計算する。
    const outer = r * 0.84;
    for (let i = 0; i < 60; i++) {
      ctx.save();
      ctx.rotate(i * Math.PI / 30);
      const major = i % 5 === 0;
      const inner = outer - (major ? r * 0.15 : r * 0.085);

      ctx.beginPath();
      ctx.lineWidth = major ? Math.max(2.5, r * 0.065) : Math.max(1.2, r * 0.025);
      ctx.lineCap = "butt";
      ctx.moveTo(0, -outer);
      ctx.lineTo(0, -inner);
      ctx.strokeStyle = "#20242A";
      ctx.stroke();
      ctx.restore();
    }

    const hour = now.getHours() % 12 + now.getMinutes() / 60;
    const minute = now.getMinutes() + now.getSeconds() / 60;
    const second = now.getSeconds() + now.getMilliseconds() / 1000;

    // 時針・分針・秒針
    this.hand(hour * Math.PI / 6, r * 0.43, Math.max(3, r * 0.09), "#20242A", r * 0.12);
    this.hand(minute * Math.PI / 30, r * 0.67, Math.max(2.2, r * 0.06), "#20242A", r * 0.14);
    this.hand(second * Math.PI / 30, r * 0.76, Math.max(1.5, r * 0.022), "#E53935", r * 0.16);

    // 中央軸
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(3, r * 0.07), 0, Math.PI * 2);
    ctx.fillStyle = "#20242A";
    ctx.fill();

    ctx.restore();

    if (this.digital) {
      this.digital.textContent = now.toLocaleTimeString("ja-JP", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    }

    requestAnimationFrame(() => this.draw());
  }
}
