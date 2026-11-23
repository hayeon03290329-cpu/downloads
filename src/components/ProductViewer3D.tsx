import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { createTorridenBottle } from '../three/createTorridenBottle';
import { afterSoftwareDraw, detectSoftwareWebGL, disposeObject3D } from '../three/webglUtils';

export default function ProductViewer3D() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [webglError, setWebglError] = useState(false);
  const [isCapOpen, setIsCapOpen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [dockCollapsed, setDockCollapsed] = useState(false);

  const capOpenRef = useRef(false);
  const autoRotateRef = useRef(true);
  const resetViewRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    capOpenRef.current = isCapOpen;
  }, [isCapOpen]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const width = container.clientWidth || 420;
    const height = container.clientHeight || 520;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      setIsLoading(false);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = 'product-3d-canvas w-full h-full block';
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };
    const handleContextRestored = () => {
      setWebglError(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0.2, 1.45, 6.6);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmrem.dispose();

    const hemiLight = new THREE.HemisphereLight(0xf0f9ff, 0xdbeafe, 0.75);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffaf2, 2.0);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd9f2ff, 1.2);
    fillLight.position.set(-5, 3, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xbbe6ff, 1.8);
    rimLight.position.set(0, 4, -5);
    scene.add(rimLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 3.2;
    controls.maxDistance = 9.5;
    controls.target.set(0, 1.25, 0);
    controls.autoRotate = !isSoftwareGl;
    controls.autoRotateSpeed = 1.5;

    const maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy() || 4);
    const { productGroup, dropperGroup, bubblesGroup } = createTorridenBottle(
      maxAnisotropy,
      isSoftwareGl,
    );
    productGroup.rotation.y = -0.15;
    scene.add(productGroup);

    // Grounded contact shadow plane
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 512;
    shadowCanvas.height = 512;
    const sctx = shadowCanvas.getContext('2d')!;
    const grad = sctx.createRadialGradient(256, 256, 30, 256, 256, 240);
    grad.addColorStop(0, 'rgba(0, 70, 120, 0.25)');
    grad.addColorStop(0.5, 'rgba(0, 70, 120, 0.08)');
    grad.addColorStop(1, 'rgba(0, 70, 120, 0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 512, 512);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 3.4),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
      }),
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.01;
    productGroup.add(shadowPlane);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    resetViewRef.current = () => {
      camera.position.set(0.2, 1.45, 6.6);
      controls.target.set(0, 1.25, 0);
      productGroup.rotation.y = -0.15;
      controls.update();
    };

    const resizeObserver = new ResizeObserver(() => {
      if (!container.clientWidth || !container.clientHeight) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
    resizeObserver.observe(container);

    const readyTimer = window.setTimeout(() => setIsLoading(false), 180);

    const clock = new THREE.Clock();
    const frameIdRef = { current: 0 };
    let disposed = false;

    const animate = () => {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      const targetCapY = capOpenRef.current ? 1.15 : 0;
      dropperGroup.position.y = THREE.MathUtils.damp(
        dropperGroup.position.y,
        targetCapY,
        6,
        delta,
      );
      bubblesGroup.position.y = Math.sin(elapsed * 1.4) * 0.008;

      controls.autoRotate = !isSoftwareGl && autoRotateRef.current;
      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterSoftwareDraw(renderer, frameIdRef, animate);
      } else {
        frameIdRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      disposed = true;
      window.clearTimeout(readyTimer);
      cancelAnimationFrame(frameIdRef.current);
      window.clearTimeout(frameIdRef.current);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      disposeObject3D(scene);
      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative flex justify-center w-full">
      <div className="relative w-full max-w-md aspect-[4/5] bg-gradient-to-b from-[#f4f6f8] via-[#eef3f7] to-[#e6edf3] rounded-3xl shadow-2xl border border-white/80 overflow-hidden">
        {/* Top Metadata Overlay (No backdrop-filter over WebGL, no pulsing dots) */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
          <div className="bg-white/95 px-3 py-1.5 rounded-xl text-xs font-bold text-torriden-700 shadow-sm">
            3D 제품 뷰 · 드래그 회전
          </div>
          <div className="bg-white/95 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 shadow-sm tabular-nums">
            50ml / 1.69 fl. oz.
          </div>
        </div>

        {/* Dedicated Empty WebGL Mount Container */}
        <div ref={mountRef} className="w-full h-full relative" />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-torriden-700 text-sm font-medium bg-white/85 z-20">
            <div className="w-8 h-8 border-4 border-torriden-100 border-t-torriden-500 rounded-full animate-spin mb-2" />
            <span>3D 제품 불러오는 중...</span>
          </div>
        )}

        {/* WebGL Fallback */}
        {webglError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-torriden-50 to-white z-20">
            <div className="w-20 h-32 rounded-2xl bg-gradient-to-b from-sky-200 to-sky-400/70 border border-white shadow-lg mb-4 flex items-center justify-center text-xs font-extrabold text-torriden-900">
              DIVE IN
            </div>
            <p className="text-sm font-bold text-gray-800">토리든 다이브인 세럼 50ml</p>
            <p className="text-xs text-gray-500 mt-1">
              현재 브라우저 환경에서 3D 가속을 사용할 수 없어 제품 프리뷰를 표시합니다.
            </p>
          </div>
        )}

        {/* Collapsible Bottom-Center Control Dock */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 w-[calc(100%-24px)] max-w-[380px] flex flex-col items-center">
          <button
            type="button"
            onClick={() => setDockCollapsed((prev) => !prev)}
            className="mb-1.5 inline-flex items-center gap-1 bg-white/95 hover:bg-white text-gray-600 hover:text-torriden-600 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm border border-gray-200/80 transition-colors"
            aria-label={dockCollapsed ? '컨트롤 열기' : '컨트롤 숨기기'}
          >
            {dockCollapsed ? (
              <>
                <ChevronUp className="w-3 h-3" />
                <span>컨트롤 보기</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                <span>컨트롤 숨기기</span>
              </>
            )}
          </button>

          {!dockCollapsed && (
            <div className="w-full bg-white/95 border border-gray-200/80 rounded-2xl p-1.5 shadow-lg flex items-center justify-between gap-1.5">
              <button
                type="button"
                onClick={() => setIsCapOpen((prev) => !prev)}
                className={`flex-1 text-[11px] font-bold px-2.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
                  isCapOpen
                    ? 'bg-torriden-500 text-white'
                    : 'bg-torriden-50 text-torriden-700 hover:bg-torriden-100'
                }`}
              >
                {isCapOpen ? '스포이드 닫기' : '스포이드 열기'}
              </button>
              <button
                type="button"
                onClick={() => setAutoRotate((prev) => !prev)}
                className={`flex-1 text-[11px] font-bold px-2.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
                  autoRotate
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {autoRotate ? '자동회전 ON' : '자동회전 OFF'}
              </button>
              <button
                type="button"
                onClick={() => resetViewRef.current?.()}
                className="inline-flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold px-3 py-2 rounded-xl transition-colors whitespace-nowrap shrink-0"
                title="뷰 초기화"
              >
                <RotateCcw className="w-3 h-3" />
                <span>초기화</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
