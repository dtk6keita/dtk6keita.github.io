const Scheduler = {
  demoBaseReal: null,
  demoBaseMinutes: null,

  toMinutes(time) {
    const parts = String(time).split(":").map(Number);
    return parts[0] * 60 + parts[1] + (parts[2] || 0) / 60;
  },

  formatTime(totalMinutes) {
    totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;
    const h = Math.floor(totalMinutes / 60);
    const m = Math.floor(totalMinutes % 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  },

  nowMinutes() {
    if (CONFIG.demoMode) {
      if (!this.demoBaseReal) {
        this.demoBaseReal = Date.now();
        this.demoBaseMinutes = this.toMinutes(CONFIG.demoStartTime);
      }
      const speed = Math.max(0.1, Number(CONFIG.demoSpeed || 1));
      return this.demoBaseMinutes + ((Date.now() - this.demoBaseReal) / 60000) * speed;
    }
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  },

  resetDemoClock() {
    this.demoBaseReal = null;
    this.demoBaseMinutes = null;
  },

  sortedWaves() {
    return (CONFIG.waves || []).slice().sort((a, b) => this.toMinutes(a) - this.toMinutes(b));
  },

  // 日付またぎを考慮した「次のWave」を取得
  findNextWave(currentWave) {
    const waves = this.sortedWaves();
    if (!waves.length) return "--:--";
    const idx = waves.indexOf(currentWave);
    if (idx >= 0 && idx < waves.length - 1) return waves[idx + 1];
    return waves[0];
  },

  // 現在Waveを決める。
  // V12重要：どのWaveのCHECK-IN中でも、CHECK-INを最優先する。
  // これにより「前WaveのSAFE DRIVE」と「次WaveのCHECK-IN」が重なる時間でも
  // 必ずCHECK-IN画面が表示される。
  findWaveAndMode() {
    const now = this.nowMinutes();
    const waves = this.sortedWaves();
    if (!waves.length) return { wave: "--:--", mode: "normal" };

    // ① CHECK-INを最優先
    for (const wave of waves) {
      const w = this.toMinutes(wave);
      const start = w - CONFIG.checkinStartMinutesBeforeWave;
      const end = start + CONFIG.checkinDurationMinutes;
      if (now >= start && now < end) {
        return { wave, mode: "checkin" };
      }
    }

    // ② CHECK-IN以外の現在Waveを判定
    for (const wave of waves) {
      const w = this.toMinutes(wave);
      const loadingStart = w + CONFIG.loadingStartMinutesAfterWave;
      const departStart = w + CONFIG.departStartMinutesAfterWave;
      const departEnd = departStart + CONFIG.departDurationMinutes;
      const safeEnd = departEnd + CONFIG.safeDriveDurationSeconds / 60;

      if (now >= loadingStart && now < departStart) return { wave, mode: "loading" };
      if (now >= departStart && now < departEnd) return { wave, mode: "depart" };
      if (now >= departEnd && now < safeEnd) return { wave, mode: "safe" };
    }

    // ③ 通常時は直近のWaveを現在Waveとして扱う
    let latest = waves[0];
    for (const wave of waves) {
      if (now >= this.toMinutes(wave)) latest = wave;
    }
    return { wave: latest, mode: "normal" };
  },

  getState() {
    const now = this.nowMinutes();
    const result = this.findWaveAndMode();
    const wave = result.wave;
    const mode = result.mode;

    if (wave === "--:--") {
      return {
        wave,
        nextWave: "--:--",
        mode: "normal",
        offerTime: "--:--",
        offerIsNext: false,
        otdTime: "--:--",
        nextCheckinTime: "--:--",
        remaining: "00:00"
      };
    }

    const w = this.toMinutes(wave);
    const otdTime = w + CONFIG.otdMinutes - CONFIG.dtk6BufferMinutes;
    const nextWave = this.findNextWave(wave);
    const nextW = this.toMinutes(nextWave);

    let gapToNext = nextW - w;
    if (gapToNext <= 0) gapToNext += 1440;

    const nextOtdTime = nextW + CONFIG.otdMinutes - CONFIG.dtk6BufferMinutes;
    const displayOtdTime = gapToNext >= 30 ? nextOtdTime : otdTime;
    const nextCheckinStart = nextW - CONFIG.checkinStartMinutesBeforeWave;

    // CHECK-IN中は、そのWaveを現在OFFERとして扱う。
    // それ以外でOFFER/出庫目安が終了した後は次回OFFERを表示。
    const currentOfferStart = w - CONFIG.checkinStartMinutesBeforeWave;
    const safeEnd = w + CONFIG.departStartMinutesAfterWave + CONFIG.departDurationMinutes + CONFIG.safeDriveDurationSeconds / 60;
    let offerIsNext = false;
    let offerTime = wave;

    // CHECK-IN開始からSAFE DRIVE終了までは現在OFFER。
    // SAFE DRIVE終了後は次回OFFERへ切り替え、次のCHECK-IN開始時に現在OFFERへ戻す。
    if (now >= currentOfferStart && now < safeEnd) {
      offerIsNext = false;
      offerTime = wave;
    } else if (now >= safeEnd) {
      offerIsNext = true;
      offerTime = nextWave;
    }

    let remainSec = Math.floor((otdTime - now) * 60);
    if (remainSec < 0) remainSec = 0;
    const rm = Math.floor(remainSec / 60);
    const rs = remainSec % 60;

    return {
      wave,
      nextWave,
      mode,
      offerTime,
      offerIsNext,
      otdTime: this.formatTime(displayOtdTime),
      remaining: `${String(rm).padStart(2, "0")}:${String(rs).padStart(2, "0")}`,
      nextCheckinTime: this.formatTime(nextCheckinStart)
    };
  }
};
