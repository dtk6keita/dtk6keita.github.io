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

    // 現在Waveの出庫目安
    const otdTime =
      w +
      CONFIG.otdMinutes -
      CONFIG.dtk6BufferMinutes;

    // 現在Waveのチェックイン開始
    const checkinStart =
      w -
      CONFIG.checkinStartMinutesBeforeWave;

    const checkinEnd =
      checkinStart +
      CONFIG.checkinDurationMinutes;

    // 積込み開始
    const loadingStart =
      w +
      CONFIG.loadingStartMinutesAfterWave;

    // 出庫開始
    const departStart =
      w +
      CONFIG.departStartMinutesAfterWave;

    const departEnd =
      departStart +
      CONFIG.departDurationMinutes;

    // 安全運転表示終了
    const safeEnd =
      departEnd +
      CONFIG.safeDriveDurationSeconds / 60;

    // 次のWave
    const nextWave =
      this.findNextWave(wave);

    const nextWaveMinutes =
      this.toMinutes(nextWave);

    // 次のWaveまでの時間
    let gapToNext =
      nextWaveMinutes - w;

    // 日付またぎ対応
    if (gapToNext < 0) {
      gapToNext += 1440;
    }

    // 次のWaveの出庫目安
    const nextOtdTime =
      nextWaveMinutes +
      CONFIG.otdMinutes -
      CONFIG.dtk6BufferMinutes;

    /*
     * 出庫目安表示
     *
     * 次のWaveまで30分以上空いている場合
     * → 次のWaveの出庫目安
     *
     * 30分未満の場合
     * → 現在Waveの出庫目安
     */
    const displayOtdTime =
      gapToNext >= 30
        ? nextOtdTime
        : otdTime;

    // 次のチェックイン開始時刻
    let nextCheckinStart =
      nextWaveMinutes -
      CONFIG.checkinStartMinutesBeforeWave;

    /*
     * 現在時刻から次のチェックイン開始までの時間
     *
     * 日付またぎ対応
     */
    let timeToNextCheckin =
      nextCheckinStart - now;

    if (timeToNextCheckin < 0) {
      timeToNextCheckin += 1440;
    }

    /*
     * 現在のOFFER / 次回OFFER
     *
     * 次のチェックイン開始まで1時間以上ある場合
     * → 「次回OFFER」
     * → 次のWaveの開始時刻を表示
     *
     * 1時間未満になったら
     * → 「現在のOFFER」
     * → 現在Waveを表示
     */
    const offerIsNext =
      timeToNextCheckin >= 60;

    const offerTime =
      offerIsNext
        ? nextWave
        : wave;

    // 現在Waveの出庫目安までの残り時間
    let remainSec =
      Math.floor((otdTime - now) * 60);

    if (remainSec < 0) {
      remainSec = 0;
    }

    const rm =
      Math.floor(remainSec / 60);

    const rs =
      remainSec % 60;

    // 現在のモード
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

      // 出庫目安
      otdTime: this.formatTime(displayOtdTime),

      // OFFER
      offerTime: offerTime,

      // 次回OFFERかどうか
      offerIsNext: offerIsNext,

      // 現在Waveの出庫目安までの残り時間
      remaining:
        `${String(rm).padStart(2, "0")}:${String(rs).padStart(2, "0")}`,

      // 次のチェックイン開始時刻
      nextCheckinTime:
        this.formatTime(nextCheckinStart)
    };
  }
};