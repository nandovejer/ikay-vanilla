/**
 * Motion sensors (gyroscope + accelerometer), WITHOUT asking permission.
 * - Android: devicemotion / deviceorientation fire with no prompt -> live.
 * - iOS / iPadOS: DeviceMotionEvent.requestPermission exists, so Apple
 *   asks first. We never call it: protected.
 * - Desktop or no sensor: no event with real data in WAIT ms: protected.
 * Live values never feed "Your ID"; only whether the sensors answer.
 */
import { t, formatNumber } from "../i18n.js";

const WAIT = 1500;
const SPAN = 5000; // ms of history in the scope
const TEXT_EVERY = 500; // ms between sentence updates

const num = (value) => (Number.isFinite(value) ? formatNumber(Math.round(value * 10) / 10) : "—");
const triple = (a, b, c) => `${num(a)} · ${num(b)} · ${num(c)}`;
const present = (...values) => values.some((value) => value !== null && value !== undefined && value !== 0);

const hasData = (event) =>
  event.type === "devicemotion"
    ? present(
        event.accelerationIncludingGravity?.x,
        event.accelerationIncludingGravity?.y,
        event.accelerationIncludingGravity?.z,
        event.rotationRate?.alpha,
        event.rotationRate?.beta,
        event.rotationRate?.gamma
      )
    : present(event.alpha, event.beta, event.gamma);

/** Tilt in degrees: from the orientation, or from gravity when that is all we have */
const tiltOf = (orientation, motion) => {
  if (Number.isFinite(orientation?.beta)) return Math.abs(orientation.beta);
  const g = motion?.accelerationIncludingGravity;
  if (!g || !Number.isFinite(g.z)) return undefined;
  return (Math.atan2(Math.hypot(g.x ?? 0, g.y ?? 0), Math.abs(g.z)) * 180) / Math.PI;
};

const speedOf = (motion) => {
  const r = motion?.rotationRate;
  return r ? Math.hypot(r.alpha ?? 0, r.beta ?? 0, r.gamma ?? 0) : 0;
};

const levelOf = (speed) => (speed < 5 ? "still" : speed < 60 ? "little" : "lot");

/** The iPhone case: its own honest sentence in the protected state */
const paintIos = () => {
  const el = document.querySelector(".js-card-motion .js-card-protected");
  if (!el) return;
  const [before = "", after = ""] = t("motion.protectedIos").split("{0}");
  const verb = document.createElement("strong");
  verb.textContent = t("motion.protectedIosVerb");
  el.replaceChildren(before, verb, after);
};

/** First event with real data, or null after WAIT */
const listen = () =>
  new Promise((resolve) => {
    const state = { motion: null, orientation: null };
    let timer;
    const finish = (value) => {
      clearTimeout(timer);
      removeEventListener("devicemotion", onEvent);
      removeEventListener("deviceorientation", onEvent);
      resolve(value);
    };
    const onEvent = (event) => {
      if (!hasData(event)) return;
      state[event.type === "devicemotion" ? "motion" : "orientation"] = event;
      finish(state);
    };
    addEventListener("devicemotion", onEvent);
    addEventListener("deviceorientation", onEvent);
    timer = setTimeout(() => finish(null), WAIT);
  });

const detectMotion = {
  async init() {
    const hasMotion = typeof DeviceMotionEvent !== "undefined";
    if (!hasMotion && typeof DeviceOrientationEvent === "undefined") return undefined;
    // Apple asks for permission first: we do not ask, so it stays private
    if (typeof DeviceMotionEvent?.requestPermission === "function") {
      paintIos();
      return undefined;
    }
    const first = await listen();
    if (!first) return undefined; // no sensors a website can read

    const tilt = tiltOf(first.orientation, first.motion);
    const m = first.motion;
    const o = first.orientation;
    return {
      value: `${num(tilt)}°`,
      detail: [
        ["DeviceMotionEvent.interval", m ? `${num(m.interval)} ms` : "—"],
        ["rotationRate (α · β · γ) °/s", triple(m?.rotationRate?.alpha, m?.rotationRate?.beta, m?.rotationRate?.gamma)],
        [
          "accelerationIncludingGravity (x · y · z) m/s²",
          triple(m?.accelerationIncludingGravity?.x, m?.accelerationIncludingGravity?.y, m?.accelerationIncludingGravity?.z),
        ],
        ["deviceorientation (α · β · γ) °", triple(o?.alpha, o?.beta, o?.gamma)],
      ],
      fingerprint: "motion-supported:true",
      render(article) {
        detectMotion.live(article, first);
      },
    };
  },
  /** Live sentence, scope and tilt; paused off-screen and in hidden tabs */
  live(article, first) {
    const canvas = article.querySelector(".js-motion-scope");
    const phone = article.querySelector(".js-motion-phone");
    const tiltEl = article.querySelector(".js-apiValue-motion");
    const levelEl = article.querySelector(".js-motion-level");
    const ctx = canvas?.getContext("2d");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const samples = [];
    let motion = first.motion;
    let orientation = first.orientation;
    let visible = true;
    let lastText = 0;
    let queued = false;

    const draw = (now) => {
      queued = false;
      if (!visible || document.hidden) return;
      // sentence, calmly
      if (now - lastText > TEXT_EVERY) {
        lastText = now;
        const tilt = tiltOf(orientation, motion);
        if (tilt !== undefined) tiltEl.textContent = `${num(tilt)}°`;
        const recent = samples.filter((sample) => now - sample.time < 1000);
        const speed = recent.length ? Math.max(...recent.map((sample) => sample.value)) : 0;
        levelEl.textContent = t(`motion.level.${levelOf(speed)}`);
      }
      // tilt drawing (no animation when motion is not welcome)
      if (phone && !reduced.matches && Number.isFinite(orientation?.gamma)) {
        phone.style.rotate = `${Math.max(-60, Math.min(60, orientation.gamma))}deg`;
      }
      // scope: last SPAN ms of rotation speed
      if (!ctx) return;
      const width = (canvas.width = canvas.clientWidth * devicePixelRatio);
      const height = (canvas.height = canvas.clientHeight * devicePixelRatio);
      const style = getComputedStyle(canvas);
      ctx.lineWidth = 2 * devicePixelRatio;
      ctx.lineJoin = "round";
      const max = 180;
      const x = (sample) => width - ((now - sample.time) / SPAN) * width;
      const y = (sample) => height - Math.min(sample.value / max, 1) * (height - 4) - 2;
      ctx.strokeStyle = style.color;
      ctx.beginPath();
      samples.forEach((sample, index) => (index ? ctx.lineTo(x(sample), y(sample)) : ctx.moveTo(x(sample), y(sample))));
      ctx.stroke();
      ctx.fillStyle = style.caretColor;
      samples
        .filter((sample) => sample.value >= 60)
        .forEach((sample) => {
          ctx.beginPath();
          ctx.arc(x(sample), y(sample), 3 * devicePixelRatio, 0, Math.PI * 2);
          ctx.fill();
        });
    };
    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(draw);
    };

    addEventListener("devicemotion", (event) => {
      if (!hasData(event)) return;
      motion = event;
      const now = performance.now();
      samples.push({ time: now, value: speedOf(event) });
      while (samples.length && now - samples[0].time > SPAN) samples.shift();
      schedule();
    });
    addEventListener("deviceorientation", (event) => {
      if (!hasData(event)) return;
      orientation = event;
      schedule();
    });
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
    }).observe(article);
    document.addEventListener("visibilitychange", schedule);
    schedule();
  },
};

export default detectMotion;
