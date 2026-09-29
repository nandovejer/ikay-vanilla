const fullscreen = {
  init(el) {
    el.addEventListener("click", () => {
      document.body.requestFullscreen?.();
    });
  },
  exit(el) {
    el.addEventListener("click", () => {
      document.exitFullscreen?.();
    });
  },
};

export default fullscreen;
