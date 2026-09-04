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
      if (!this.demoBaseReal) { this.demoBaseReal = Date.now(); this.demoBaseMinutes = this.toMinutes(CONFIG.demoStartTime); }
      return this.demoBaseMinutes + (Date.now() - this.demoBaseReal) / 60000;
    }
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  },
  resetDemoClock() { this.demoBaseReal = null; this.demoBaseMinutes = null; },
  sortedWaves() { return (CONFIG.waves || []).slice().sort((a,b)=>this.toMinutes(a)-this.toMinutes(b)); },

  // 「現在のOFFER」は、OFFERの15分前からOFFERの15分後までの30分間。
  // 例：17:30 OFFER → 17:15～17:45は常に17:30が現在のOFFER。
  findCurrentOffer() {
    const now = this.nowMinutes();
    const waves = this.sortedWaves();
    if (!waves.length) return "--:--";
    // 現在OFFERは「チェックイン開始～そのOFFERの出庫目安」ではなく、
    // OFFER-15分～OFFER+15分の30分枠。15分間隔のOFFERが重なる場合は、
    // 直前OFFERの30分枠を優先し、OFFER+15分で次へ切り替える。
    // 例：17:30 → 17:15～17:45、17:45 → 17:45～18:00(次のOFFER)。
    for (let i = 0; i < waves.length; i++) {
      const w = this.toMinutes(waves[i]);
      const start = w - CONFIG.checkinStartMinutesBeforeWave;
      const end = w + CONFIG.checkinStartMinutesBeforeWave;
      if (now >= start && now < end) {
        // 同じ時刻が複数の枠に入る場合、先に始まった枠を維持する。
        // これにより17:15～17:45は17:30 OFFERのまま。
        return waves[i];
      }
    }
    let latest = waves[0];
    for (const wave of waves) { if (now >= this.toMinutes(wave) + CONFIG.checkinStartMinutesBeforeWave) latest = wave; }
    return latest;
  },
  findNextWave(currentWave) {
    const waves = this.sortedWaves();
    const i = waves.indexOf(currentWave);
    return i >= 0 && i < waves.length - 1 ? waves[i + 1] : waves[0];
  },
  findModeWave(now) {
    const waves = this.sortedWaves();
    if (!waves.length) return "--:--";
    // モードは「そのOFFER」の時間帯で判定。
    for (const wave of waves) {
      const w = this.toMinutes(wave);
      const checkinStart = w - CONFIG.checkinStartMinutesBeforeWave;
      const checkinEnd = checkinStart + CONFIG.checkinDurationMinutes;
      const loadingStart = w + CONFIG.loadingStartMinutesAfterWave;
      const departStart = w + CONFIG.departStartMinutesAfterWave;
      const departEnd = departStart + CONFIG.departDurationMinutes;
      const safeEnd = departEnd + CONFIG.safeDriveDurationSeconds / 60;
      if (now >= checkinStart && now < checkinEnd) return {wave, mode:"checkin"};
      if (now >= loadingStart && now < departStart) return {wave, mode:"loading"};
      if (now >= departStart && now < departEnd) return {wave, mode:"depart"};
      if (now >= departEnd && now < safeEnd) return {wave, mode:"safe"};
    }
    return {wave:null, mode:"normal"};
  },
  getState() {
    const now = this.nowMinutes();
    const offerWave = this.findCurrentOffer();
    const ow = this.toMinutes(offerWave);
    const nextWave = this.findNextWave(offerWave);
    const nw = this.toMinutes(nextWave);
    const modeState = this.findModeWave(now);
    const modeWave = modeState.wave || offerWave;
    const w = this.toMinutes(modeWave);
    const otdTime = ow + CONFIG.otdMinutes - CONFIG.dtk6BufferMinutes;
    const nextCheckinStart = nw - CONFIG.checkinStartMinutesBeforeWave;
    let mode = modeState.mode;
    let remainSec = Math.floor((otdTime - now) * 60);
    if (remainSec < 0) remainSec = 0;
    const rm = Math.floor(remainSec / 60), rs = remainSec % 60;
    return {
      wave: offerWave, nextWave, mode, modeWave,
      otdTime: this.formatTime(otdTime),
      remaining: `${String(rm).padStart(2,"0")}:${String(rs).padStart(2,"0")}`,
      nextCheckinTime: this.formatTime(nextCheckinStart),
      offerIsNext: false,
      offerTime: this.formatTime(ow)
    };
  }
};
