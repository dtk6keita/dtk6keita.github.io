const Scheduler = {
  demoBaseReal: null,
  demoBaseMinutes: null,

  toMinutes(time) {
    const parts = time.split(":").map(Number);
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
      return this.demoBaseMinutes + (Date.now() - this.demoBaseReal) / 60000;
    }
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  },

  sortedWaves() {
    return (CONFIG.waves || []).slice().sort((a, b) => this.toMinutes(a) - this.toMinutes(b));
  },

  findWave() {
    const now = this.nowMinutes();
    const waves = this.sortedWaves();
    if (!waves.length) return "--:--";

    for (const wave of waves) {
      const w = this.toMinutes(wave);
      const start = w - CONFIG.checkinStartMinutesBeforeWave;
      const end = w + CONFIG.departStartMinutesAfterWave + CONFIG.departDurationMinutes + CONFIG.safeDriveDurationSeconds / 60;
      if (now >= start && now < end) return wave;
    }

    let latest = waves[0];
    for (const wave of waves) {
      if (now >= this.toMinutes(wave)) latest = wave;
    }
    return latest;
  },

  findNextWave(currentWave) {
    const waves = this.sortedWaves();
    if (!waves.length) return "--:--";
    const idx = waves.indexOf(currentWave);
    if (idx >= 0 && idx < waves.length - 1) return waves[idx + 1];
    return waves[0];
  },

  getState() {
    const now = this.nowMinutes();
    const wave = this.findWave();
    const w = this.toMinutes(wave);
    const otdTime = w + CONFIG.otdMinutes - CONFIG.dtk6BufferMinutes;
    const checkinStart = w - CONFIG.checkinStartMinutesBeforeWave;
    const checkinEnd = checkinStart + CONFIG.checkinDurationMinutes;
    const loadingStart = w + CONFIG.loadingStartMinutesAfterWave;
    const departStart = w + CONFIG.departStartMinutesAfterWave;
    const departEnd = departStart + CONFIG.departDurationMinutes;
    const safeEnd = departEnd + CONFIG.safeDriveDurationSeconds / 60;
    const nextWave = this.findNextWave(wave);
    const nextCheckinStart = this.toMinutes(nextWave) - CONFIG.checkinStartMinutesBeforeWave;

    let mode = "normal";
    if (now >= checkinStart && now < checkinEnd) mode = "checkin";
    else if (now >= loadingStart && now < departStart) mode = "loading";
    else if (now >= departStart && now < departEnd) mode = "depart";
    else if (now >= departEnd && now < safeEnd) mode = "safe";

    let remainSec = Math.floor((otdTime - now) * 60);
    if (remainSec < 0) remainSec = 0;
    const rm = Math.floor(remainSec / 60);
    const rs = remainSec % 60;

    return {
      wave,
      nextWave,
      mode,
      otdTime: this.formatTime(otdTime),
      remaining: `${String(rm).padStart(2, "0")}:${String(rs).padStart(2, "0")}`,
      nextCheckinTime: this.formatTime(nextCheckinStart)
    };
  }
};
