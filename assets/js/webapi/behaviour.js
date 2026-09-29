/**
 * Live tracking of what you do on this page: mouse, clicks, scroll, keys,
 * tab switches and time. Nothing is saved or sent; it only shows that any
 * website can record it without asking.
 */
const state = {
  moves: 0,
  clicks: 0,
  keys: 0,
  hidden: 0,
  scroll: 0,
  start: performance.now(),
};

const formatTime = (ms) => {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

const behaviour = {
  init() {
    const article = document.querySelector(".js-card-behaviour");
    if (!article) return;
    const canvas = article.querySelector(".js-behaviour-map");
    const ctx = canvas.getContext("2d");
    const value = (key) => article.querySelector(`.js-behaviour-${key}`);

    // Keep the canvas buffer the same size as the element (it clears it)
    const resize = () => {
      canvas.width = canvas.clientWidth * devicePixelRatio;
      canvas.height = canvas.clientHeight * devicePixelRatio;
    };
    new ResizeObserver(resize).observe(canvas);

    // Dot colours come from the css (--behaviour-move / --behaviour-click),
    // so the map follows the light or dark theme
    const color = (name, fallback) =>
      getComputedStyle(canvas).getPropertyValue(name).trim() || fallback;

    // Your screen in miniature: the position inside the viewport
    const dot = (event, radius, fill) => {
      const x = (event.clientX / innerWidth) * canvas.width;
      const y = (event.clientY / innerHeight) * canvas.height;
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(x, y, radius * devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();
    };

    let pending = false;
    window.addEventListener(
      "pointermove",
      (event) => {
        state.moves++;
        if (pending) return;
        pending = true;
        requestAnimationFrame(() => {
          dot(event, 3, color("--behaviour-move", "rgb(51 51 51 / 0.35)"));
          pending = false;
        });
      },
      { passive: true }
    );
    window.addEventListener("pointerdown", (event) => {
      state.clicks++;
      dot(event, 6, color("--behaviour-click", "rgb(255 140 0 / 0.8)"));
    });
    window.addEventListener("keydown", () => state.keys++);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) state.hidden++;
    });
    window.addEventListener(
      "scroll",
      () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        state.scroll = Math.max(state.scroll, max > 0 ? Math.round((scrollY / max) * 100) : 100);
      },
      { passive: true }
    );

    const paint = () => {
      value("moves").textContent = state.moves;
      value("clicks").textContent = state.clicks;
      value("scroll").textContent = `${state.scroll}%`;
      value("keys").textContent = state.keys;
      value("hidden").textContent = state.hidden;
      value("time").textContent = formatTime(performance.now() - state.start);
    };
    paint();
    setInterval(paint, 500);
  },
};

export default behaviour;
