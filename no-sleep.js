const FireStickNoSleep = {
  wakeLock: null,
  video: null,
  canvas: null,
  ctx: null,
  frame: 0,

  async requestWakeLock() {
    try {
      if ("wakeLock" in navigator) {
        this.wakeLock = await navigator.wakeLock.request("screen");
      }
    } catch (e) {}
  },

  startVideoKeepAlive() {
    try {
      if (!HTMLCanvasElement.prototype.captureStream) return;
      this.canvas = document.createElement("canvas");
      this.canvas.width = 2;
      this.canvas.height = 2;
      this.canvas.className = "keep-alive-element";
      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext("2d");

      this.video = document.createElement("video");
      this.video.muted = true;
      this.video.playsInline = true;
      this.video.autoplay = true;
      this.video.srcObject = this.canvas.captureStream(1);
      this.video.className = "keep-alive-element";
      document.body.appendChild(this.video);
      this.video.play().catch(() => {});

      setInterval(() => {
        this.frame = (this.frame + 1) % 255;
        if (this.ctx) {
          this.ctx.fillStyle = `rgb(${this.frame},${this.frame},${this.frame})`;
          this.ctx.fillRect(0, 0, 2, 2);
        }
        if (this.video && this.video.paused) this.video.play().catch(() => {});
      }, 30000);
    } catch (e) {}
  },

  startActivityPulse() {
    setInterval(() => {
      try {
        window.focus();
        window.scrollBy(0, 1);
        window.scrollBy(0, -1);
        document.dispatchEvent(new MouseEvent("mousemove", {
          bubbles: true,
          clientX: 1,
          clientY: 1
        }));
      } catch (e) {}
    }, 240000);
  },

  init() {
    this.requestWakeLock();
    this.startVideoKeepAlive();
    this.startActivityPulse();

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") this.requestWakeLock();
    });
    window.addEventListener("focus", () => this.requestWakeLock());
    setInterval(() => this.requestWakeLock(), 300000);
  }
};
