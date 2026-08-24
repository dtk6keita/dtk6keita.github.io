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

      const speed = Math.max(0.1, Number(CONFIG.demoSpeed || 1));

      return this.demoBaseMinutes +
        ((Date.now() - this.demoBaseReal) / 60000) * speed;
    }

    const now = new Date();

    return now.getHours() * 60 +
      now.getMinutes() +
      now.getSeconds() / 60;
  },

  resetDemoClock() {
    this.demoBaseReal = null;
    this.demoBaseMinutes = null;
  },

  sortedWaves() {
    return (CONFIG.waves || [])
      .slice()
      .sort((a, b) => this.toMinutes(a) - this.toMinutes(b));
  },

  findWave() {
    const now = this.nowMinutes();
    const waves = this.sortedWaves();

    if (!waves.length) return "--:--";

    for (const wave of waves) {
      const w = this.toMinutes(wave);

      const start =
        w - CONFIG.checkinStartMinutesBeforeWave;

      const end =
        w +
        CONFIG.departStartMinutesAfterWave +
        CONFIG.departDurationMinutes +
        CONFIG.safeDriveDurationSeconds / 60;

      if (now >= start && now < end) {
        return wave;
      }
    }

    let latest = waves[0];

    for (const wave of waves) {
      if (now >= this.toMinutes(wave)) {
        latest = wave;
      }
    }

    return latest;
  },

  findNextWave(currentWave) {
    const waves = this.sortedWaves();

    if (!waves.length) return "--:--";

    const idx = waves.indexOf(currentWave);

    if (idx >= 0 && idx < waves.length - 1) {
      return waves[idx + 1];
    }

    return waves[0];
  },

  getState() {
    const now = this.nowMinutes();

    const wave = this.findWave();

    if (wave === "--:--") {
      return {
        wave: "--:--",
        nextWave: "--:--",
        mode: "normal",
        otdTime: "--:--",
        offerTime: "--:--",
        offerIsNext: false,
        remaining: "00:00",
        nextCheckinTime: "--:--"
      };
    }

    const w = this.toMinutes(wave);

    /*
     * 現在Waveの各種時刻
     */
    const checkinStart =
      w - CONFIG.checkinStartMinutesBeforeWave;

    const checkinEnd =
      checkinStart +
      CONFIG.checkinDurationMinutes;

    const loadingStart =
      w + CONFIG.loadingStartMinutesAfterWave;

    const departStart =
      w + CONFIG.departStartMinutesAfterWave;

    const departEnd =
      departStart +
      CONFIG.departDurationMinutes;

    const safeEnd =
      departEnd +
      CONFIG.safeDriveDurationSeconds / 60;

    /*
     * 次のWave
     */
    const nextWave =
      this.findNextWave(wave);

    const nextWaveMinutes =
      this.toMinutes(nextWave);

    /*
     * 次のチェックイン開始
     */
    const nextCheckinStart =
      nextWaveMinutes -
      CONFIG.checkinStartMinutesBeforeWave;

    /*
     * 現在時刻から次のチェックイン開始まで
     *
     * 日付またぎ対応
     */
    let timeToNextCheckin =
      nextCheckinStart - now;

    if (timeToNextCheckin < 0) {
      timeToNextCheckin += 1440;
    }

    /*
     * OFFER判定
     *
     * 次のチェックインまで1時間以上
     * → 次回OFFER
     *
     * それ以外
     * → 現在のOFFER
     */
    const offerIsNext =
      timeToNextCheckin >= 60;

    const offerMinutes =
      offerIsNext
        ? nextWaveMinutes
        : w;

    const offerTime =
      this.formatTime(offerMinutes);

    /*
     * 出庫目安
     *
     * 必ず「現在表示しているOFFERの15分後」
     *
     * 現在OFFER 17:15 → 17:30
     * 次回OFFER 18:00 → 18:15
     */
    const otdTime =
      offerMinutes + 15;

    /*
     * 現在のOFFERの出庫目安までの残り時間
     *
     * ※画面表示用
     */
    let remainSec =
      Math.floor((otdTime - now) * 60);

    if (remainSec < 0) {
      remainSec = 0;
    }

    const rm =
      Math.floor(remainSec / 60);

    const rs =
      remainSec % 60;

    /*
     * モード判定
     */
    let mode = "normal";

    if (now >= checkinStart && now < checkinEnd) {
      mode = "checkin";
    }
    else if (now >= loadingStart && now < departStart) {
      mode = "loading";
    }
    else if (now >= departStart && now < departEnd) {
      mode = "depart";
    }
    else if (now >= departEnd && now < safeEnd) {
      mode = "safe";
    }

    return {
      wave: wave,

      nextWave: nextWave,

      mode: mode,

      /*
       * 出庫目安
       * OFFER + 15分
       */
      otdTime:
        this.formatTime(otdTime),

      /*
       * 現在OFFER / 次回OFFER
       */
      offerTime:
        offerTime,

      /*
       * 次回OFFER表示中か
       */
      offerIsNext:
        offerIsNext,

      /*
       * 出庫目安までの残り時間
       */
      remaining:
        `${String(rm).padStart(2, "0")}:${String(rs).padStart(2, "0")}`,

      /*
       * 次のチェックイン開始時刻
       */
      nextCheckinTime:
        this.formatTime(nextCheckinStart)
    };
  }
};