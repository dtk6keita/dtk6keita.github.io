const FireStickNoSleep = {
  wakeLock: null,
  video: null,
  retryTimer: null,

  async requestWakeLock() {
    try {
      if ("wakeLock" in navigator) {
        if (this.wakeLock && !this.wakeLock.released) return;
        this.wakeLock = await navigator.wakeLock.request("screen");
        this.wakeLock.addEventListener("release", () => { this.wakeLock = null; });
      }
    } catch (e) {}
  },

  startRealMediaKeepAlive() {
    this.video = document.getElementById("keepAliveVideo");
    if (!this.video) return;

    const play = () => {
      try {
        this.video.muted = true;
        this.video.setAttribute("muted", "");
        this.video.setAttribute("playsinline", "");
        const promise = this.video.play();
        if (promise && promise.catch) promise.catch(() => {});
      } catch (e) {}
    };

    this.video.addEventListener("ended", play);
    this.video.addEventListener("pause", () => setTimeout(play, 250));
    this.video.addEventListener("stalled", () => setTimeout(play, 250));
    this.video.addEventListener("canplay", play);
    play();
    this.retryTimer = setInterval(play, 15000);
  },

  init() {
    this.requestWakeLock();
    this.startRealMediaKeepAlive();

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.requestWakeLock();
        if (this.video) this.video.play().catch(() => {});
      }
    });
    window.addEventListener("focus", () => {
      this.requestWakeLock();
      if (this.video) this.video.play().catch(() => {});
    });
    setInterval(() => this.requestWakeLock(), 60000);
  }
};
