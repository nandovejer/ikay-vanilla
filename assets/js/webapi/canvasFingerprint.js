/**
 * Canvas fingerprinting: draw the same text and shapes on every browser.
 * GPU, drivers, operating system and fonts paint them with tiny
 * differences, so the hash of the image changes from one device to another.
 */
import hash from "../modules/hash.js";

const TEXT = "IKAY <canvas> 1.0 😃";

const canvasFingerprint = {
  draw() {
    const canvas = document.createElement("canvas");
    canvas.width = 280;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    ctx.textBaseline = "top";
    ctx.font = "18px Arial";
    ctx.fillStyle = "#f60";
    ctx.fillRect(120, 4, 80, 24);
    ctx.fillStyle = "#069";
    ctx.fillText(TEXT, 4, 20);
    ctx.fillStyle = "rgb(102 204 0 / 0.7)";
    ctx.fillText(TEXT, 6, 22);

    const gradient = ctx.createLinearGradient(0, 0, 280, 0);
    gradient.addColorStop(0, "gold");
    gradient.addColorStop(1, "#333");
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(240, 32, 24, 0, Math.PI * 2);
    ctx.fill();

    return canvas.toDataURL();
  },
  async init() {
    const image = canvasFingerprint.draw();
    if (!image) return undefined;
    const digest = (await hash(image)).slice(0, 16);
    return {
      value: digest,
      detail: [
        ["canvas.toDataURL().length", image.length],
        ["SHA-256", digest],
      ],
      fingerprint: digest,
      render(article) {
        const img = article.querySelector(".js-canvas-image");
        if (img) img.src = image;
      },
    };
  },
};

export default canvasFingerprint;
