const Display = {
  currentView: null,
  slideIndex: 0,
  lastSwitch: 0,
  showClockNext: false,
  lastMode: null,
  preloaded: [],

  init() {
    this.views = {
      clock: document.getElementById("clockView"),
      slide: document.getElementById("slideView"),
      message: document.getElementById("messageView")
    };

    this.slideImage = document.getElementById("slideImage");
    this.slidePlaceholder = document.getElementById("slidePlaceholder");
    this.slideTitle = document.getElementById("slideTitle");
    this.slideMessage = document.getElementById("slideMessage");

    this.preloadSlides();
    this.showView("clock");
  },

  preloadSlides() {
    (CONFIG.slides || []).forEach((slide) => {
      const img = new Image();
      img.src = slide.src;
      this.preloaded.push(img);
    });
  },

  showView(name) {
    if (!this.views || !this.views[name] || this.currentView === name) return;
    Object.keys(this.views).forEach((key) => this.views[key].classList.remove("active"));
    this.views[name].classList.add("active");
    this.currentView = name;
  },

  setModeClass(mode) {
    document.body.className = `mode-${mode}`;
  },

  setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  },

  updateInfo(state) {
    const offerValue = document.getElementById("offerValue");

    this.setText("offerLabel", state.offerIsNext ? "次回OFFER" : "現在のOFFER");
    this.setText("offerValue", state.offerTime);
    this.setText("otdTime", state.otdTime);
    this.setText("nextCheckinTime", state.nextCheckinTime);

    if (offerValue) offerValue.style.color = state.offerIsNext ? "#18A7C7" : "#1B9A4A";
  },

  showMessage(mode) {
    const msg = CONFIG.messages[mode] || CONFIG.messages.checkin;
    this.setText("messageStatus", msg.title);
    this.setText("messageText", msg.text);
    this.showView("message");
  },

  showSlide() {
    const slides = CONFIG.slides || [];
    if (!slides.length) {
      this.showView("clock");
      return;
    }

    const slide = slides[this.slideIndex % slides.length];
    this.slideIndex = (this.slideIndex + 1) % slides.length;

    if (this.slideTitle) this.slideTitle.textContent = slide.title || "POSTER";
    if (this.slideMessage) this.slideMessage.textContent = "画像を読み込み中";
    if (this.slidePlaceholder) this.slidePlaceholder.style.display = "flex";

    if (this.slideImage) {
      this.slideImage.style.display = "none";
      this.slideImage.onload = () => {
        this.slideImage.style.display = "block";
        if (this.slidePlaceholder) this.slidePlaceholder.style.display = "none";
      };
      this.slideImage.onerror = () => {
        this.slideImage.style.display = "none";
        if (this.slidePlaceholder) this.slidePlaceholder.style.display = "flex";
        if (this.slideMessage) this.slideMessage.textContent = `${slide.src} が見つかりません`;
      };

      // Google TV系ブラウザでも画像更新を確実にするため、srcを一度外して再設定。
      this.slideImage.removeAttribute("src");
      setTimeout(() => { this.slideImage.src = slide.src; }, 30);
    }

    this.showView("slide");
  },

  updateMainView(state) {
    // CHECK-INは常に最優先で表示。
    if (state.mode === "checkin") {
      if (this.lastMode !== "checkin") {
        this.lastMode = "checkin";
        this.lastSwitch = Date.now();
      }
      this.showMessage("checkin");
      return;
    }

    if (state.mode !== this.lastMode) {
      this.lastMode = state.mode;
      this.lastSwitch = 0;
      this.showClockNext = false;
    }

    // loading / depart / safe は時間案内を優先。
    if (state.mode !== "normal") {
      this.showMessage(state.mode);
      return;
    }

    const now = Date.now();
    const interval = Math.max(5, Number(CONFIG.slideIntervalSeconds || 20)) * 1000;

    if (!this.lastSwitch || now - this.lastSwitch >= interval) {
      this.lastSwitch = now;

      if (CONFIG.alternateClockAndSlides && this.showClockNext) {
        this.showView("clock");
      } else {
        this.showSlide();
      }

      this.showClockNext = !this.showClockNext;
    }
  }
};
