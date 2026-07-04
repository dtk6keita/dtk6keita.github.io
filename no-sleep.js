const FireStickNoSleep = {
  wakeLock: null,
  video: null,
  canvas: null,
  ctx: null,
  tick: 0,

  async requestWakeLock() {
    try {
      if ("wakeLock" in navigator) {
        this.wakeLock = await navigator.wakeLock.request("screen");
        this.wakeLock.addEventListener("release", () => {
          this.wakeLock = null;
        });
      }
    } catch (e) {
      // Fire OS / Silkのバージョンによっては未対応。別対策を継続します。
    }
  },

  startHiddenVideoKeepAlive() {
    try {
      if (!HTMLCanvasElement.prototype.captureStream) return;

      this.canvas = document.createElement("canvas");
      this.canvas.width = 2;
      this.canvas.height = 2;
      this.canvas.style.position = "fixed";
      this.canvas.style.left = "-10px";
      this.canvas.style.top = "-10px";
      this.canvas.style.width = "1px";
      this.canvas.style.height = "1px";
      this.canvas.style.opacity = "0";
      this.canvas.setAttribute("aria-hidden", "true");
      document.body.appendChild(this.canvas);

      this.ctx = this.canvas.getContext("2d");
      const stream = this.canvas.captureStream(1);
      this.video = document.createElement("video");
      this.video.muted = true;
      this.video.playsInline = true;
      this.video.autoplay = true;
      this.video.loop = true;
      this.video.srcObject = stream;
      this.video.style.position = "fixed";
      this.video.style.left = "-10px";
      this.video.style.top = "-10px";
      this.video.style.width = "1px";
      this.video.style.height = "1px";
      this.video.style.opacity = "0";
      this.video.setAttribute("aria-hidden", "true");
      document.body.appendChild(this.video);
      this.video.play().catch(() => {});

      setInterval(() => {
        if (!this.ctx) return;
        this.tick = (this.tick + 1) % 255;
        this.ctx.fillStyle = `rgb(${this.tick},${this.tick},${this.tick})`;
        this.ctx.fillRect(0, 0, 2, 2);
        if (this.video && this.video.paused) this.video.play().catch(() => {});
      }, 30000);
    } catch (e) {}
  },

  startPseudoActivity() {
    setInterval(() => {
      try {
        window.focus();
        window.scrollBy(0, 1);
        window.scrollBy(0, -1);
        document.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, clientX: 1, clientY: 1 }));
        document.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Shift" }));
      } catch (e) {}
    }, 240000);
  },

  init() {
    this.requestWakeLock();
    this.startHiddenVideoKeepAlive();
    this.startPseudoActivity();

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") this.requestWakeLock();
    });

    window.addEventListener("focus", () => this.requestWakeLock());
    setInterval(() => this.requestWakeLock(), 300000);
  }
};
