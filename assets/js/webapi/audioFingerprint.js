/**
 * Audio fingerprinting: render a sound without playing it
 * (OfflineAudioContext, no user gesture needed) and add up the samples.
 * Every audio stack rounds numbers in its own way.
 */
const audioFingerprint = {
  async init() {
    const Offline = window.OfflineAudioContext ?? window.webkitOfflineAudioContext;
    if (!Offline) return undefined;

    const context = new Offline(1, 5000, 44100);
    const oscillator = context.createOscillator();
    oscillator.type = "triangle";
    oscillator.frequency.value = 10000;

    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -50;
    compressor.knee.value = 40;
    compressor.ratio.value = 12;
    compressor.attack.value = 0;
    compressor.release.value = 0.25;

    oscillator.connect(compressor);
    compressor.connect(context.destination);
    oscillator.start(0);

    const buffer = await context.startRendering();
    const samples = buffer.getChannelData(0);
    let sum = 0;
    for (let i = 4500; i < samples.length; i++) sum += Math.abs(samples[i]);

    return {
      value: String(sum),
      detail: [
        ["OfflineAudioContext", "triangle 10kHz → DynamicsCompressor"],
        ["Σ |samples[4500…5000]|", sum],
      ],
      fingerprint: String(sum),
    };
  },
};

export default audioFingerprint;
