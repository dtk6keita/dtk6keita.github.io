document.addEventListener("DOMContentLoaded", () => {
  if (window.FireStickNoSleep) FireStickNoSleep.init();

  new SBBClock("clockCanvas", "digitalClock");
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
