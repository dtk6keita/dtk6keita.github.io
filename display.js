const Display = {
  currentView: null,
  slideIndex: 0,
  lastSwitch: 0,
  showClockNext: false,
  lastMode: null,
  preloaded: [],

  init() {
    this.views = {
      clock:
        document.getElementById("clockView"),

      slide:
        document.getElementById("slideView"),

      message:
        document.getElementById("messageView")
    };

    this.slideImage =
      document.getElementById("slideImage");

    this.slidePlaceholder =
      document.getElementById("slidePlaceholder");

    this.slideTitle =
      document.getElementById("slideTitle");

    this.slideMessage =
      document.getElementById("slideMessage");

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
    if (
      !this.views ||
      !this.views[name] ||
      this.currentView === name
    ) {
      return;
    }

    Object.keys(this.views).forEach((key) => {
      this.views[key]
        .classList
        .remove("active");
    });

    this.views[name]
      .classList
      .add("active");

    this.currentView = name;
  },

  setModeClass(mode) {
    document.body.className =
      `mode-${mode}`;
  },

  statusText(mode) {
    return {
      normal: "NORMAL",
      checkin: "CHECK-IN",
      loading: "誘導員の指示に従ってください",
      depart: "DEPART NOW",
      safe: "SAFE DRIVE"
    }[mode] || "NORMAL";
  },

  setText(id, text) {
    const el =
      document.getElementById(id);

    if (el) {
      el.textContent = text;
    }
  },

  updateInfo(state) {

    const offerValue =
      document.getElementById(
        "offerValue"
      );

    /*
     * OFFERラベル
     */
    if (state.offerIsNext) {

      this.setText(
        "offerLabel",
        "次回OFFER"
      );

    } else {

      this.setText(
        "offerLabel",
        "現在のOFFER"
      );
    }

    /*
     * OFFER時刻
     */
    this.setText(
      "offerValue",
      state.offerTime
    );

    /*
     * OFFERの色
     *
     * 現在のOFFER → 白
     * 次回OFFER → 水色
     */
    if (offerValue) {

      if (state.offerIsNext) {

        offerValue.style.color =
          "#7DDCFF";

      } else {

        offerValue.style.color =
          "#FFFFFF";
      }
    }

    /*
     * 出庫目安
     */
    this.setText(
      "otdTime",
      state.otdTime
    );

    /*
     * 次のチェックイン開始時刻
     */
    this.setText(
      "nextCheckinTime",
      state.nextCheckinTime
    );
  },

  showMessage(mode) {

    const msg =
      CONFIG.messages[mode] ||
      CONFIG.messages.checkin;

    this.setText(
      "messageStatus",
      msg.title
    );

    this.setText(
      "messageText",
      msg.text
    );

    this.showView("message");
  },

  showSlide() {

    const slides =
      CONFIG.slides || [];

    if (!slides.length) {
      this.showView("clock");
      return;
    }

    const slide =
      slides[
        this.slideIndex %
        slides.length
      ];

    this.slideIndex =
      (this.slideIndex + 1) %
      slides.length;

    if (this.slideTitle) {
      this.slideTitle.textContent =
        slide.title || "IMAGE";
    }

    if (this.slideMessage) {
      this.slideMessage.textContent =
        "画像を読み込み中";
    }

    if (this.slidePlaceholder) {
      this.slidePlaceholder.style.display =
        "flex";
    }

    if (this.slideImage) {

      this.slideImage.style.display =
        "none";

      this.slideImage.onload = () => {

        this.slideImage.style.display =
          "block";

        if (this.slidePlaceholder) {
          this.slidePlaceholder.style.display =
            "none";
        }
      };

      this.slideImage.onerror = () => {

        this.slideImage.style.display =
          "none";

        if (this.slidePlaceholder) {
          this.slidePlaceholder.style.display =
            "flex";
        }

        if (this.slideMessage) {
          this.slideMessage.textContent =
            `${slide.src} が見つかりません`;
        }
      };

      /*
       * Silk Browser対策
       */
      this.slideImage
        .removeAttribute("src");

      setTimeout(() => {
        this.slideImage.src =
          slide.src;
      }, 30);
    }

    this.showView("slide");
  },

  updateMainView(state) {

    if (
      state.mode !==
      this.lastMode
    ) {

      this.lastMode =
        state.mode;

      this.lastSwitch = 0;

      this.showClockNext =
        false;
    }

    /*
     * SAFE DRIVE中
     */
    if (
      state.mode !==
      "normal"
    ) {

      this.showMessage(
        state.mode
      );

      return;
    }

    const now =
      Date.now();

    const interval =
      Math.max(
        5,
        Number(
          CONFIG.slideIntervalSeconds ||
          20
        )
      ) * 1000;

    if (
      !this.lastSwitch ||
      now - this.lastSwitch >=
      interval
    ) {

      this.lastSwitch =
        now;

      if (
        CONFIG.alternateClockAndSlides &&
        this.showClockNext
      ) {

        this.showView(
          "clock"
        );

      } else {

        this.showSlide();
      }

      this.showClockNext =
        !this.showClockNext;
    }
  }
};