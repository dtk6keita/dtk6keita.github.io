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

      const speed = Math.max(
        0.1,
        Number(CONFIG.demoSpeed || 1)
      );

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
      .sort(
        (a, b) =>
          this.toMinutes(a) -
          this.toMinutes(b)
      );
  },

  findWave() {
    const now = this.nowMinutes();
    const waves = this.sortedWaves();

    if (!waves.length) {
      return "--:--";
    }

    for (const wave of waves) {
      const w = this.toMinutes(wave);

      const start =
        w -
        CONFIG.checkinStartMinutesBeforeWave;

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

    if (!waves.length) {
      return "--:--";
    }

    const idx =
      waves.indexOf(currentWave);

    if (
      idx >= 0 &&
      idx < waves.length - 1
    ) {
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

    const w =
      this.toMinutes(wave);

    /*
     * 現在Wave
     */

    const checkinStart =
      w -
      CONFIG.checkinStartMinutesBeforeWave;

    const checkinEnd =
      checkinStart +
      CONFIG.checkinDurationMinutes;

    const loadingStart =
      w +
      CONFIG.loadingStartMinutesAfterWave;

    const departStart =
      w +
      CONFIG.departStartMinutesAfterWave;

    const departEnd =
      departStart +
      CONFIG.departDurationMinutes;

    /*
     * SAFE DRIVE終了時刻
     */
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
    let nextCheckinStart =
      nextWaveMinutes -
      CONFIG.checkinStartMinutesBeforeWave;

    /*
     * SAFE DRIVE終了後、
     * 次のOFFER時刻になるまで
     * 「次回OFFER」を表示する。
     *
     * SAFE DRIVE終了
     *       ↓
     * 次回OFFER
     *       ↓
     * 次のWave時刻
     *       ↓
     * 現在のOFFER
     */

    const offerIsNext =
      now >= safeEnd &&
      now < nextWaveMinutes;

    /*
     * 表示するOFFER
     */
    const offerMinutes =
      offerIsNext
        ? nextWaveMinutes
        : w;

    const offerTime =
      this.formatTime(offerMinutes);

    /*
     * 出庫目安
     *
     * OFFERの15分後
     */
    const otdTime =
      offerMinutes + 15;

    /*
     * 出庫目安までの残り時間
     */
    let remainSec =
      Math.floor(
        (otdTime - now) * 60
      );

    if (remainSec < 0) {
      remainSec = 0;
    }

    const rm =
      Math.floor(
        remainSec / 60
      );

    const rs =
      remainSec % 60;

    /*
     * モード判定
     */
    let mode = "normal";

    if (
      now >= checkinStart &&
      now < checkinEnd
    ) {
      mode = "checkin";
    }
    else if (
      now >= loadingStart &&
      now < departStart
    ) {
      mode = "loading";
    }
    else if (
      now >= departStart &&
      now < departEnd
    ) {
      mode = "depart";
    }
    else if (
      now >= departEnd &&
      now < safeEnd
    ) {
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
       * OFFER
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
        this.formatTime(
          nextCheckinStart
        )
    };
  }
};