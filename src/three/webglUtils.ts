import * as THREE from 'three';

export function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
}

export function afterSoftwareDraw(
  renderer: THREE.WebGLRenderer,
  scheduleIdRef: { current: number },
  cb: () => void,
): void {
  const gl = renderer.getContext() as WebGL2RenderingContext;
  if (!gl || typeof gl.fenceSync !== 'function') {
    scheduleIdRef.current = window.setTimeout(cb, 80);
    return;
  }
  const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
  gl.flush();
  const poll = () => {
    const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
    if (state === gl.UNSIGNALED) {
      scheduleIdRef.current = window.setTimeout(poll, 5);
    } else {
      if (sync) gl.deleteSync(sync);
      scheduleIdRef.current = window.setTimeout(cb, 80);
    }
  };
  scheduleIdRef.current = window.setTimeout(poll, 5);
}

export function disposeObject3D(root: THREE.Object3D): void {
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((mat) => {
        if (!mat) return;
        const m = mat as THREE.MeshPhysicalMaterial;
        m.map?.dispose();
        m.roughnessMap?.dispose();
        m.metalnessMap?.dispose();
        m.normalMap?.dispose();
        m.alphaMap?.dispose();
        mat.dispose();
      });
    }
  });
}
