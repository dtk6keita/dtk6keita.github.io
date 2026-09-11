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
      return this.demoBaseMinutes +
        (Date.now() - this.demoBaseReal) / 60000;
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

  /*
   * 現在のOFFER
   *
   * OFFERの15分前からOFFERの15分後までを
   * そのOFFERの表示時間とする。
   *
   * 例：
   * 17:30 OFFER
   * → 17:15～17:45 は 17:30
   *
   * 複数OFFERの表示時間が重なる場合は、
   * より後のOFFERを優先する。
   */
  findCurrentOffer() {
    const now = this.nowMinutes();
    const waves = this.sortedWaves();

    if (!waves.length) return "--:--";

    let current = null;

    for (const wave of waves) {
      const w = this.toMinutes(wave);
      const start = w - CONFIG.checkinStartMinutesBeforeWave;
      const end = w + CONFIG.checkinStartMinutesBeforeWave;

      if (now >= start && now < end) {
        current = wave;
      }
    }

    if (current) return current;

    // 次のOFFER開始前は直前のOFFERを基準にする
    let latest = waves[0];

    for (const wave of waves) {
      const w = this.toMinutes(wave);
      if (now >= w - CONFIG.checkinStartMinutesBeforeWave) {
        latest = wave;
      }
    }

    return latest;
  },

  findNextWave(currentWave) {
    const waves = this.sortedWaves();
    const i = waves.indexOf(currentWave);

    return i >= 0 && i < waves.length - 1
      ? waves[i + 1]
      : waves[0];
  },

  findModeWave(now) {
    const waves = this.sortedWaves();

    if (!waves.length) {
      return {
        wave: "--:--",
        mode: "normal"
      };
    }

    for (const wave of waves) {
      const w = this.toMinutes(wave);

      const checkinStart =
        w - CONFIG.checkinStartMinutesBeforeWave;

      const checkinEnd =
        checkinStart + CONFIG.checkinDurationMinutes;

      const loadingStart =
        w + CONFIG.loadingStartMinutesAfterWave;

      const departStart =
        w + CONFIG.departStartMinutesAfterWave;

      const departEnd =
        departStart + CONFIG.departDurationMinutes;

      const safeEnd =
        departEnd +
        CONFIG.safeDriveDurationSeconds / 60;

      if (now >= checkinStart && now < checkinEnd) {
        return { wave, mode: "checkin" };
      }

      if (now >= loadingStart && now < departStart) {
        return { wave, mode: "loading" };
      }

      if (now >= departStart && now < departEnd) {
        return { wave, mode: "depart" };
      }

      if (now >= departEnd && now < safeEnd) {
        return { wave, mode: "safe" };
      }
    }

    return {
      wave: null,
      mode: "normal"
    };
  },

  getState() {
    const now = this.nowMinutes();

    const offerWave = this.findCurrentOffer();
    const ow = this.toMinutes(offerWave);

    const nextWave = this.findNextWave(offerWave);
    const nw = this.toMinutes(nextWave);

    const modeState = this.findModeWave(now);
    const modeWave = modeState.wave || offerWave;

    const otdTime =
      ow +
      CONFIG.otdMinutes -
      CONFIG.dtk6BufferMinutes;

    const nextCheckinStart =
      nw -
      CONFIG.checkinStartMinutesBeforeWave;

    let mode = modeState.mode;

    /*
     * OFFER表示ルール
     *
     * 現在のOFFERは
     * 「OFFERの15分前～OFFERの15分後」
     * の30分間表示。
     *
     * その30分が終了した後、
     * 次のOFFERまで30分以上空いている場合は
     * 現在のOFFER・出庫目安時間を --:-- にする。
     *
     * 次のOFFERの30分前になったら
     * 次のOFFERを表示する。
     *
     * 例：
     * 17:15 OFFER
     * 17:00～17:30 → 17:15 / 17:30
     *
     * 17:30～18:00
     * 次が18:30なら → --:-- / --:--
     *
     * 18:00
     * 次のOFFERまで30分 → 18:30 / 18:45
     */
    let displayOfferTime = this.formatTime(ow);
    let displayOtdTime = this.formatTime(otdTime);

    // 現在のOFFER表示終了時刻
    const currentOfferEnd =
      ow + CONFIG.checkinStartMinutesBeforeWave;

    // 次のOFFERまでの時間
    let minutesToNext =
      nw - now;

    // 日付またぎ対応
    if (minutesToNext < 0) {
      minutesToNext += 1440;
    }

    // 現在のOFFER表示時間を過ぎたか
    const currentOfferExpired =
      now >= currentOfferEnd;

    if (currentOfferExpired) {

      /*
       * 次のOFFERまで30分以上ある
       * → --:-- 表示
       */
      if (minutesToNext > 30) {
        displayOfferTime = "--:--";
        displayOtdTime = "--:--";
      }

      /*
       * 次のOFFERまで30分以内
       * → 次のOFFERを表示
       */
      else {
        displayOfferTime = this.formatTime(nw);

        const nextOtdTime =
          nw +
          CONFIG.otdMinutes -
          CONFIG.dtk6BufferMinutes;

        displayOtdTime =
          this.formatTime(nextOtdTime);
      }
    }

    /*
     * 出庫目安時間のカウントダウン
     */
    let remainSec =
      Math.floor((otdTime - now) * 60);

    if (remainSec < 0) remainSec = 0;

    const rm = Math.floor(remainSec / 60);
    const rs = remainSec % 60;

    return {
      wave: offerWave,
      nextWave,
      mode,
      modeWave,

      otdTime: displayOtdTime,

      remaining:
        `${String(rm).padStart(2, "0")}:${String(rs).padStart(2, "0")}`,

      nextCheckinTime:
        this.formatTime(nextCheckinStart),

      offerIsNext: currentOfferExpired &&
        minutesToNext <= 30,

      offerTime: displayOfferTime
    };
  }
};