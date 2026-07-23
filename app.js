document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const demoParam = params.get("demo");
  const timeParam = params.get("time");
  const speedParam = params.get("speed");

  if (demoParam === "1" || demoParam === "true") CONFIG.demoMode = true;
  if (demoParam === "0" || demoParam === "false") CONFIG.demoMode = false;
  if (timeParam && /^\d{1,2}:\d{2}(:\d{2})?$/.test(timeParam)) CONFIG.demoStartTime = timeParam;
  if (speedParam && Number(speedParam) > 0) CONFIG.demoSpeed = Number(speedParam);

  const demoBadge = document.getElementById("demoBadge");
  const refreshDemoBadge = () => {
    if (!demoBadge) return;
    demoBadge.classList.toggle("active", !!CONFIG.demoMode);
    demoBadge.textContent = CONFIG.demoMode ? `DEMO ×${CONFIG.demoSpeed}` : "DEMO";
  };
  refreshDemoBadge();

  // PCでの確認用：DキーでDEMO ON/OFF、Rキーで開始時刻へリセット。
  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "d") {
      CONFIG.demoMode = !CONFIG.demoMode;
      Scheduler.resetDemoClock();
      Display.lastMode = null;
      Display.lastSwitch = 0;
      refreshDemoBadge();
    }
    if (event.key.toLowerCase() === "r" && CONFIG.demoMode) {
      Scheduler.resetDemoClock();
      Display.lastMode = null;
      Display.lastSwitch = 0;
    }
  });

  if (window.FireStickNoSleep) FireStickNoSleep.init();
  new SBBClock("clockCanvas");
  new SBBClock("miniClockCanvas", null, "miniDigitalClock");
  Display.init();

  function loop() {
    const state = Scheduler.getState();
    Display.setModeClass(state.mode);
    Display.updateInfo(state);
    Display.updateMainView(state);
  }

  loop();
  setInterval(loop, 1000);
});
