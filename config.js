const CONFIG = {
  // 対象Wave
  waves: [
    "09:00", "09:15", "09:30", "09:45",
    "10:00", "10:15", "10:30", "10:45",
    "11:00", "11:15", "11:30", "11:45",
    "17:15", "17:30", "17:45",
    "18:00", "18:15", "18:30",
    "19:00", "19:30",
    "20:00", "20:30"
  ],

  // 出庫目安 = OFFER + 15分
  otdMinutes: 15,
  dtk6BufferMinutes: 0,

  // CHECK-IN
  checkinStartMinutesBeforeWave: 15,
  checkinDurationMinutes: 2,

  // 案内画面のタイミング
  loadingStartMinutesAfterWave: 5,
  departStartMinutesAfterWave: 8,
  departDurationMinutes: 1,
  safeDriveDurationSeconds: 30,

  // 通常時：時計 → ポスター → 時計 → ポスター…
  slideIntervalSeconds: 10,
  alternateClockAndSlides: true,

  // 動作テスト用。通常運用はfalse。
  demoMode: false,
  demoStartTime: "17:04:50",
  demoSpeed: 1,

  // V12では既存ポスターを優先して使用。3枚目は15分前着車案内。
  slides: [
    { src: "images/imageA.png", title: "All In All Out" },
    { src: "images/imageB.png", title: "正しく集荷して、エラーゼロへ" },
    { src: "images/imageC.png", title: "15分前から着車OK" }
  ],

  messages: {
    checkin: {
      title: "CHECK-IN",
      text: "受付開始\n速やかにカウンターまで\nお越しください"
    },
    loading: {
      title: "ALERT",
      text: "出庫まで残り5分程です\n出発の準備を整えましょう"
    },
    depart: {
      title: "DEPART NOW",
      text: "出庫の時間となりました\n誘導員に従って\n出庫してください"
    },
    safe: {
      title: "SAFE DRIVE",
      text: "それでは安全運転で\nいってらっしゃいませ"
    }
  }
};
