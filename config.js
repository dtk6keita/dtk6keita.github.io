const CONFIG = {
  waves: [
    "08:30","08:45",
    "09:00","09:15","09:30","09:45",
    "10:00","10:15","10:30","10:45",
    "11:00","11:15","11:30","11:45",
    "17:15","17:30","17:45",
    "18:00","18:30",
    "19:00","19:30",
    "20:00","20:30"
  ],

  otdMinutes: 15,
  dtk6BufferMinutes: 0,

  checkinStartMinutesBeforeWave: 10,
  checkinDurationMinutes: 3,

  loadingStartMinutesAfterWave: 5,
  departStartMinutesAfterWave: 8,
  departDurationMinutes: 1,
  safeDriveDurationSeconds: 30,

  slideIntervalSeconds: 10,
  alternateClockAndSlides: true,

  // 通常運用ではfalse。URL末尾に ?demo=1 を付けるとDEMOモードで起動します。
  demoMode: false,
  demoStartTime: "17:04:50",
  // DEMOの進行倍率。30なら実時間1秒で画面内30秒進みます。
  demoSpeed: 30,

  slides: [
    { src: "images/imageA.png", title: "All In All Out" },
    { src: "images/imageB.png", title: "DTK6での集荷ルール" },
    { src: "images/imageC.png", title: "15分前から着車OK" },
    { src: "images/imageD.jpg", title: "構内走行中 3つのご協力とお願い" }
  ],

  messages: {
    checkin: { title: "CHECK-IN", text: "受付開始\n速やかにカウンターまで\nお越しください" },
    loading: { title: "誘導員の指示にご協力ください", text: "出庫まで残り5分程です\n出発の準備を整えましょう" },
    depart: { title: "DEPART NOW", text: "出庫の時間となりました\n誘導員の指示に従って\n出庫をお願いいたします" },
    safe: { title: "SAFE DRIVE", text: "それでは安全運転で\nいってらっしゃいませ" }
  }
};
