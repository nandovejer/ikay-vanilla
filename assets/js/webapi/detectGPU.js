/*
  GPU Detect
  inspired in the work of https://webkay.robinlinus.com/
*/
const getGL = () => {
  const canvas = document.createElement("canvas");
  try {
    return canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  } catch {
    return null;
  }
};

const detectGPU = {
  /** @return {string|undefined} renderer name */
  init() {
    const gl = getGL();
    if (!gl) return undefined;

    const extension = gl.getExtension("WEBGL_debug_renderer_info");
    return extension
      ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER);
  },
  /**
   * Extra details: WebGL limits and, when available, WebGPU adapter info
   * (no permission needed).
   * @return {Promise<Array<[string, string]>>}
   */
  async details() {
    const detail = [];
    const gl = getGL();
    if (gl) {
      const extension = gl.getExtension("WEBGL_debug_renderer_info");
      detail.push(
        ["UNMASKED_VENDOR_WEBGL", extension ? gl.getParameter(extension.UNMASKED_VENDOR_WEBGL) : undefined],
        ["MAX_TEXTURE_SIZE", gl.getParameter(gl.MAX_TEXTURE_SIZE)],
        ["getSupportedExtensions().length", gl.getSupportedExtensions()?.length]
      );
    }
    try {
      const adapter = await navigator.gpu?.requestAdapter();
      const info = adapter?.info ?? (await adapter?.requestAdapterInfo?.());
      if (info) {
        detail.push(["GPUAdapterInfo.vendor", info.vendor || undefined]);
        detail.push(["GPUAdapterInfo.architecture", info.architecture || undefined]);
      }
    } catch {
      // WebGPU not available
    }
    return detail;
  },
};

export default detectGPU;
