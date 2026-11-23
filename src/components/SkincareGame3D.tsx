import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Check, RotateCcw } from 'lucide-react';
import { createTorridenBottle } from '../three/createTorridenBottle';
import { afterSoftwareDraw, detectSoftwareWebGL, disposeObject3D } from '../three/webglUtils';

interface SkincareGame3DProps {
  onOpenPurchase: () => void;
}

type GamePhase = 'STEP1_CAP' | 'OPENING' | 'STEP2_APPLY' | 'WIN';
type ZoneKey = 'forehead' | 'nose' | 'leftCheek' | 'rightCheek' | 'chin';

interface ZoneProgress {
  forehead: number;
  nose: number;
  leftCheek: number;
  rightCheek: number;
  chin: number;
}

const INITIAL_ZONES: ZoneProgress = {
  forehead: 0,
  nose: 0,
  leftCheek: 0,
  rightCheek: 0,
  chin: 0,
};

const ZONE_LABELS: { key: ZoneKey; label: string; fullSpan?: boolean }[] = [
  { key: 'forehead', label: '이마' },
  { key: 'nose', label: '콧등' },
  { key: 'leftCheek', label: '왼쪽 볼' },
  { key: 'rightCheek', label: '오른쪽 볼' },
  { key: 'chin', label: '턱 & 턱선', fullSpan: true },
];

export default function SkincareGame3D({ onOpenPurchase }: SkincareGame3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const resetFnRef = useRef<(() => void) | null>(null);

  const [phase, setPhase] = useState<GamePhase>('STEP1_CAP');
  const [stepText, setStepText] = useState('STEP 1. 오른쪽 아래 세럼 뚜껑을 클릭해서 열어주세요!');
  const [overallPct, setOverallPct] = useState(0);
  const [zones, setZones] = useState<ZoneProgress>(INITIAL_ZONES);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const [webglError, setWebglError] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const width = container.clientWidth || 720;
    const height = container.clientHeight || 540;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = 'game-3d-canvas w-full h-full block';
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
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.25, 5.4);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.05);
    scene.environment = envTarget.texture;
    pmrem.dispose();

    scene.add(new THREE.HemisphereLight(0xfff6f0, 0xd9f2ff, 0.9));
    const gKey = new THREE.DirectionalLight(0xfffaf2, 1.6);
    gKey.position.set(3, 5, 5);
    gKey.castShadow = !isSoftwareGl;
    gKey.shadow.bias = -0.0005;
    gKey.shadow.normalBias = 0.02;
    scene.add(gKey);

    const gFill = new THREE.DirectionalLight(0xd9f2ff, 0.9);
    gFill.position.set(-4, 2, 4);
    scene.add(gFill);

    // --- A. 3D Character Head ---
    const characterGroup = new THREE.Group();
    characterGroup.position.set(-0.2, 0.15, 0);
    scene.add(characterGroup);

    const texSize = 1024;
    const skinCanvas = document.createElement('canvas');
    skinCanvas.width = texSize;
    skinCanvas.height = texSize;
    const skinCtx = skinCanvas.getContext('2d')!;

    const roughCanvas = document.createElement('canvas');
    roughCanvas.width = 512;
    roughCanvas.height = 512;
    const roughCtx = roughCanvas.getContext('2d')!;

    const skinTexture = new THREE.CanvasTexture(skinCanvas);
    skinTexture.colorSpace = THREE.SRGBColorSpace;
    const roughTexture = new THREE.CanvasTexture(roughCanvas);

    const headGeo = new THREE.SphereGeometry(1.05, 64, 64);
    const posAttr = headGeo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < posAttr.count; i++) {
      v.fromBufferAttribute(posAttr, i);
      v.x *= 0.88;
      v.y *= 1.12;
      v.z *= 0.92;

      if (v.y < -0.2) {
        const t = Math.min(1, (-0.2 - v.y) / 0.9);
        v.x *= 1.0 - t * 0.24;
        v.z *= 1.0 - t * 0.14;
      }
      if (v.z > 0.2 && v.y > -0.38 && v.y < 0.26 && Math.abs(v.x) > 0.2) {
        v.z += 0.068 * Math.cos((v.y + 0.04) * 2.6);
      }
      if (v.z > 0.4 && v.y > 0.06 && v.y < 0.34 && Math.abs(v.x) > 0.16 && Math.abs(v.x) < 0.5) {
        v.z -= 0.032;
      }
      posAttr.setXYZ(i, v.x, v.y, v.z);
    }
    headGeo.computeVertexNormals();

    const headMat = new THREE.MeshPhysicalMaterial({
      map: skinTexture,
      roughnessMap: roughTexture,
      roughness: 1.0,
      metalness: 0.0,
      clearcoat: 0.0,
      clearcoatRoughness: 0.12,
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.castShadow = !isSoftwareGl;
    headMesh.receiveShadow = !isSoftwareGl;
    characterGroup.add(headMesh);

    const noseGeo = new THREE.SphereGeometry(0.155, 32, 32);
    noseGeo.scale(0.85, 1.32, 1.08);
    const noseMat = new THREE.MeshPhysicalMaterial({
      color: 0xfad7c4,
      roughness: 0.72,
      clearcoat: 0.0,
      clearcoatRoughness: 0.15,
    });
    const noseMesh = new THREE.Mesh(noseGeo, noseMat);
    noseMesh.position.set(0, -0.03, 0.96);
    characterGroup.add(noseMesh);

    const neckGeo = new THREE.CylinderGeometry(0.36, 0.44, 0.9, 32);
    const neckMat = new THREE.MeshStandardMaterial({ color: 0xf6cdb7, roughness: 0.7 });
    const neckMesh = new THREE.Mesh(neckGeo, neckMat);
    neckMesh.position.set(0, -1.35, -0.08);
    characterGroup.add(neckMesh);

    const shoulderGeo = new THREE.SphereGeometry(0.95, 32, 24);
    shoulderGeo.scale(1.25, 0.45, 0.75);
    const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x00a3ff, roughness: 0.65 });
    const shoulderMesh = new THREE.Mesh(shoulderGeo, shoulderMat);
    shoulderMesh.position.set(0, -1.85, -0.08);
    characterGroup.add(shoulderMesh);

    const earGeo = new THREE.SphereGeometry(0.18, 24, 24);
    earGeo.scale(0.45, 1.1, 0.65);
    [-0.92, 0.92].forEach((ex) => {
      const ear = new THREE.Mesh(earGeo, neckMat);
      ear.position.set(ex, 0.0, -0.05);
      characterGroup.add(ear);
    });

    const hairMat = new THREE.MeshStandardMaterial({ color: 0x3b2a24, roughness: 0.65 });
    const backHairGeo = new THREE.SphereGeometry(1.08, 32, 32);
    backHairGeo.scale(0.94, 1.14, 0.94);
    const backHair = new THREE.Mesh(backHairGeo, hairMat);
    backHair.position.set(0, 0.14, -0.18);
    characterGroup.add(backHair);

    const bandGeo = new THREE.TorusGeometry(0.95, 0.13, 20, 64);
    bandGeo.scale(0.96, 1.02, 1.02);
    const bandMat = new THREE.MeshStandardMaterial({ color: 0xbae0ff, roughness: 0.85 });
    const bandMesh = new THREE.Mesh(bandGeo, bandMat);
    bandMesh.position.set(0, 0.56, 0.02);
    bandMesh.rotation.x = Math.PI / 2 - 0.52;
    characterGroup.add(bandMesh);

    // --- B. Forbidden Zones: Smiling Eyes & Smiling Lips ---
    const eyeHitZones: THREE.Mesh[] = [];
    const eyeGroups: THREE.Group[] = [];
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.18 });
    const irisMat = new THREE.MeshStandardMaterial({ color: 0x2c1b18, roughness: 0.08 });
    const lashMat = new THREE.MeshStandardMaterial({ color: 0x1f1412, roughness: 0.45 });
    const smileLidMat = new THREE.MeshStandardMaterial({ color: 0xf4bea6, roughness: 0.75 });
    const invisibleMat = new THREE.MeshBasicMaterial({ visible: false });

    [-0.33, 0.33].forEach((ex) => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(ex, 0.18, 0.82);
      eyeGroup.rotation.y = ex < 0 ? -0.26 : 0.26;

      const eyeball = new THREE.Mesh(new THREE.SphereGeometry(0.14, 24, 24), eyeWhiteMat);
      eyeball.scale.set(1.16, 0.78, 0.54);
      eyeGroup.add(eyeball);

      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.084, 24, 24), irisMat);
      iris.position.set(0, 0.008, 0.046);
      iris.scale.set(1.0, 0.96, 0.5);
      eyeGroup.add(iris);

      const glintMain = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 12), eyeWhiteMat);
      glintMain.position.set(0.028, 0.032, 0.088);
      eyeGroup.add(glintMain);

      const glintSub = new THREE.Mesh(new THREE.SphereGeometry(0.013, 10, 10), eyeWhiteMat);
      glintSub.position.set(-0.024, -0.014, 0.088);
      eyeGroup.add(glintSub);

      const lash = new THREE.Mesh(
        new THREE.TorusGeometry(0.138, 0.02, 12, 28, Math.PI * 0.88),
        lashMat,
      );
      lash.position.set(0, 0.014, 0.052);
      lash.rotation.z = Math.PI * 0.06;
      eyeGroup.add(lash);

      const smileLidCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.125, -0.032, 0.045),
        new THREE.Vector3(0, -0.048, 0.072),
        new THREE.Vector3(0.125, -0.032, 0.045),
      ]);
      const smileLid = new THREE.Mesh(
        new THREE.TubeGeometry(smileLidCurve, 16, 0.014, 8, false),
        smileLidMat,
      );
      eyeGroup.add(smileLid);

      const browCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.11, 0.195, 0.02),
        new THREE.Vector3(0, 0.235, 0.045),
        new THREE.Vector3(0.11, 0.195, 0.02),
      ]);
      const brow = new THREE.Mesh(
        new THREE.TubeGeometry(browCurve, 18, 0.021, 10, false),
        hairMat,
      );
      eyeGroup.add(brow);

      const eyeZone = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), invisibleMat);
      eyeZone.userData.forbidden = 'eye';
      eyeGroup.add(eyeZone);
      eyeHitZones.push(eyeZone);

      eyeGroups.push(eyeGroup);
      characterGroup.add(eyeGroup);
    });

    const lipsGroup = new THREE.Group();
    lipsGroup.position.set(0, -0.42, 0.875);

    const lipMat = new THREE.MeshPhysicalMaterial({
      color: 0xea7a86,
      roughness: 0.28,
      clearcoat: 0.55,
    });
    const smileCreaseMat = new THREE.MeshStandardMaterial({
      color: 0xb64b5a,
      roughness: 0.4,
    });

    const smileLineCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.21, 0.062, -0.048),
      new THREE.Vector3(-0.11, -0.008, 0.015),
      new THREE.Vector3(0, -0.026, 0.036),
      new THREE.Vector3(0.11, -0.008, 0.015),
      new THREE.Vector3(0.21, 0.062, -0.048),
    ]);
    lipsGroup.add(
      new THREE.Mesh(new THREE.TubeGeometry(smileLineCurve, 32, 0.013, 10, false), smileCreaseMat),
    );

    const upperLipCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.195, 0.058, -0.042),
      new THREE.Vector3(-0.08, 0.028, 0.025),
      new THREE.Vector3(0, 0.016, 0.038),
      new THREE.Vector3(0.08, 0.028, 0.025),
      new THREE.Vector3(0.195, 0.058, -0.042),
    ]);
    lipsGroup.add(
      new THREE.Mesh(new THREE.TubeGeometry(upperLipCurve, 32, 0.028, 12, false), lipMat),
    );

    const lowerLipCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.19, 0.054, -0.042),
      new THREE.Vector3(-0.09, -0.04, 0.018),
      new THREE.Vector3(0, -0.065, 0.036),
      new THREE.Vector3(0.09, -0.04, 0.018),
      new THREE.Vector3(0.19, 0.054, -0.042),
    ]);
    lipsGroup.add(
      new THREE.Mesh(new THREE.TubeGeometry(lowerLipCurve, 32, 0.036, 12, false), lipMat),
    );

    [-1, 1].forEach((dir) => {
      const cornerTip = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 12), smileCreaseMat);
      cornerTip.position.set(dir * 0.214, 0.068, -0.05);
      lipsGroup.add(cornerTip);
    });

    const lipZone = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), invisibleMat);
    lipZone.scale.set(1.22, 0.78, 0.85);
    lipZone.userData.forbidden = 'lips';
    lipsGroup.add(lipZone);
    eyeHitZones.push(lipZone);
    characterGroup.add(lipsGroup);

    // --- C. Stage Torriden Bottle & Floating Active Dropper ---
    const maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy() || 4);
    const bottleAsset = createTorridenBottle(maxAnisotropy, isSoftwareGl);
    const gameBottle = bottleAsset.productGroup;
    const gameDropper = bottleAsset.dropperGroup;
    gameBottle.scale.setScalar(0.55);
    gameBottle.position.set(1.68, -1.25, 0.35);
    gameBottle.rotation.y = -0.35;
    scene.add(gameBottle);

    const capHitMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.65, 1.5, 16),
      invisibleMat,
    );
    capHitMesh.position.y = 2.55;
    gameDropper.add(capHitMesh);

    const activeDropper = gameDropper.clone();
    activeDropper.scale.setScalar(0.45);
    activeDropper.visible = false;
    activeDropper.children.forEach((ch) => {
      ch.position.y -= 0.3;
    });
    scene.add(activeDropper);

    // --- D. Droplets & Twinkle Stars ---
    interface DropletItem {
      mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhysicalMaterial>;
      life: number;
    }
    const dropletPool: DropletItem[] = [];
    const dropletGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const dropletBaseMat = new THREE.MeshPhysicalMaterial({
      color: 0x70d2ff,
      roughness: 0.05,
      transmission: isSoftwareGl ? 0 : 0.7,
      transparent: true,
      opacity: 0.9,
      ior: 1.33,
      clearcoat: 1.0,
    });

    const _lookTarget = new THREE.Vector3();
    const spawnSerumDroplet = (worldPos: THREE.Vector3, normal: THREE.Vector3) => {
      const drop = new THREE.Mesh(dropletGeo, dropletBaseMat.clone());
      drop.position.copy(worldPos).addScaledVector(normal, 0.025);
      const s = 0.6 + Math.random() * 0.7;
      drop.scale.set(s, s * 0.65, s);
      _lookTarget.copy(worldPos).add(normal);
      drop.lookAt(_lookTarget);
      scene.add(drop);
      dropletPool.push({ mesh: drop, life: 1.0 });
    };

    interface StarItem {
      mesh: THREE.Mesh<THREE.OctahedronGeometry, THREE.MeshBasicMaterial>;
      vy: number;
      rot: number;
      phase: number;
    }
    const starPool: StarItem[] = [];
    const starGeo = new THREE.OctahedronGeometry(0.06, 0);
    const starBaseMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true });

    const spawnWinTwinkles = () => {
      for (let i = 0; i < 42; i++) {
        const star = new THREE.Mesh(starGeo, starBaseMat.clone());
        star.material.color.setHex(i % 2 === 0 ? 0xffffff : 0x38bdf8);
        const angle = Math.random() * Math.PI * 2;
        const rad = 0.8 + Math.random() * 1.1;
        star.position.set(
          characterGroup.position.x + Math.cos(angle) * rad,
          characterGroup.position.y + (Math.random() - 0.5) * 2.0,
          0.6 + Math.random() * 0.8,
        );
        scene.add(star);
        starPool.push({
          mesh: star,
          vy: 0.008 + Math.random() * 0.015,
          rot: (Math.random() - 0.5) * 0.1,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // --- E. Game State & Coverage Tracking ---
    let currentPhase: GamePhase = 'STEP1_CAP';
    let isPointerDown = false;
    let capOpenAnim = 0;
    let lastSpawnTime = 0;
    let lastMoveRaycastTime = 0;
    let warningTimer = 0;
    let shakeTimer1 = 0;
    let shakeTimer2 = 0;
    let shakeTimer3 = 0;

    const zoneTrackers: Record<ZoneKey, { hits: Set<string>; target: number }> = {
      forehead: { hits: new Set(), target: 14 },
      nose: { hits: new Set(), target: 8 },
      leftCheek: { hits: new Set(), target: 16 },
      rightCheek: { hits: new Set(), target: 16 },
      chin: { hits: new Set(), target: 12 },
    };

    const resetSkinCanvas = () => {
      skinCtx.fillStyle = '#f8d3be';
      skinCtx.fillRect(0, 0, texSize, texSize);

      const drawBlush = (bx: number, by: number) => {
        const g = skinCtx.createRadialGradient(bx, by, 12, bx, by, 78);
        g.addColorStop(0, 'rgba(246, 140, 138, 0.36)');
        g.addColorStop(1, 'rgba(246, 140, 138, 0)');
        skinCtx.fillStyle = g;
        skinCtx.fillRect(bx - 82, by - 82, 164, 164);
      };
      drawBlush(texSize * 0.63, texSize * 0.56);
      drawBlush(texSize * 0.87, texSize * 0.56);

      roughCtx.fillStyle = '#d6d6d6';
      roughCtx.fillRect(0, 0, 512, 512);

      skinTexture.needsUpdate = true;
      roughTexture.needsUpdate = true;
      headMat.clearcoat = 0.0;
      noseMat.clearcoat = 0.0;
      noseMat.roughness = 0.72;
    };

    const paintSerumOnSkin = (uv: THREE.Vector2) => {
      const x = uv.x * texSize;
      const y = (1 - uv.y) * texSize;

      const grad = skinCtx.createRadialGradient(x, y, 4, x, y, 56);
      grad.addColorStop(0, 'rgba(130, 218, 255, 0.55)');
      grad.addColorStop(0.55, 'rgba(175, 234, 255, 0.28)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      skinCtx.fillStyle = grad;
      skinCtx.beginPath();
      skinCtx.arc(x, y, 56, 0, Math.PI * 2);
      skinCtx.fill();

      skinCtx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      skinCtx.beginPath();
      skinCtx.arc(
        x + (Math.random() - 0.5) * 26,
        y + (Math.random() - 0.5) * 26,
        4 + Math.random() * 4,
        0,
        Math.PI * 2,
      );
      skinCtx.fill();
      skinTexture.needsUpdate = true;

      const rx = uv.x * 512;
      const ry = (1 - uv.y) * 512;
      const rGrad = roughCtx.createRadialGradient(rx, ry, 2, rx, ry, 28);
      rGrad.addColorStop(0, 'rgba(24, 24, 24, 0.85)');
      rGrad.addColorStop(1, 'rgba(24, 24, 24, 0)');
      roughCtx.fillStyle = rGrad;
      roughCtx.beginPath();
      roughCtx.arc(rx, ry, 28, 0, Math.PI * 2);
      roughCtx.fill();
      roughTexture.needsUpdate = true;
    };

    const updateProgress = () => {
      const nextZones: ZoneProgress = {
        forehead: 0,
        nose: 0,
        leftCheek: 0,
        rightCheek: 0,
        chin: 0,
      };
      let totalPct = 0;
      const keys = Object.keys(zoneTrackers) as ZoneKey[];

      keys.forEach((k) => {
        const z = zoneTrackers[k];
        const pct = Math.min(100, Math.round((z.hits.size / z.target) * 100));
        nextZones[k] = pct;
        totalPct += pct;
      });

      const overall = Math.min(100, Math.round(totalPct / keys.length));
      headMat.clearcoat = (overall / 100) * 0.95;

      setZones(nextZones);
      setOverallPct(overall);

      if (overall >= 100 && currentPhase === 'STEP2_APPLY') {
        currentPhase = 'WIN';
        isPointerDown = false;
        activeDropper.visible = false;
        setPhase('WIN');
        setStepText('얼굴 구석구석 수분 충전 완료!');
        spawnWinTwinkles();
      }
    };

    const recordZoneCoverage = (localPt: THREE.Vector3) => {
      if (localPt.z < 0.25) return;
      const qx = Math.round(localPt.x * 10);
      const qy = Math.round(localPt.y * 10);
      const key = `${qx},${qy}`;

      if (localPt.y > 0.36 && Math.abs(localPt.x) < 0.72) {
        zoneTrackers.forehead.hits.add(key);
      } else if (Math.abs(localPt.x) <= 0.19 && localPt.y >= -0.18 && localPt.y <= 0.36) {
        zoneTrackers.nose.hits.add(key);
        noseMat.clearcoat = 0.85;
        noseMat.roughness = 0.18;
      } else if (localPt.x < -0.22 && localPt.y >= -0.38 && localPt.y <= 0.34) {
        zoneTrackers.leftCheek.hits.add(key);
      } else if (localPt.x > 0.22 && localPt.y >= -0.38 && localPt.y <= 0.34) {
        zoneTrackers.rightCheek.hits.add(key);
      } else if (localPt.y < -0.35 && localPt.y > -0.92 && Math.abs(localPt.x) < 0.65) {
        zoneTrackers.chin.hits.add(key);
      }

      updateProgress();
    };

    const showForbiddenWarning = (type: string) => {
      setWarningMsg(
        type === 'eye'
          ? '눈은 예민해요! 눈을 피해 발라주세요.'
          : '입술을 피해 피부에만 발라주세요.',
      );
      characterGroup.rotation.z = 0.06;
      window.clearTimeout(shakeTimer1);
      window.clearTimeout(shakeTimer2);
      window.clearTimeout(shakeTimer3);
      shakeTimer1 = window.setTimeout(() => {
        characterGroup.rotation.z = -0.06;
      }, 70);
      shakeTimer2 = window.setTimeout(() => {
        characterGroup.rotation.z = 0;
      }, 140);

      window.clearTimeout(warningTimer);
      warningTimer = window.setTimeout(() => {
        setWarningMsg(null);
      }, 1400);
    };

    const resetGame = () => {
      currentPhase = 'STEP1_CAP';
      isPointerDown = false;
      capOpenAnim = 0;
      gameDropper.visible = true;
      gameDropper.position.y = 0;
      gameDropper.rotation.y = 0;
      activeDropper.visible = false;
      characterGroup.rotation.set(0, 0, 0);
      eyeGroups.forEach((eg) => {
        eg.scale.y = 1;
      });

      (Object.keys(zoneTrackers) as ZoneKey[]).forEach((k) => {
        zoneTrackers[k].hits.clear();
      });

      starPool.forEach((s) => {
        scene.remove(s.mesh);
        s.mesh.material.dispose();
      });
      starPool.length = 0;

      dropletPool.forEach((d) => {
        scene.remove(d.mesh);
        d.mesh.material.dispose();
      });
      dropletPool.length = 0;

      resetSkinCanvas();
      setPhase('STEP1_CAP');
      setStepText('STEP 1. 오른쪽 아래 세럼 뚜껑을 클릭해서 열어주세요!');
      setOverallPct(0);
      setZones(INITIAL_ZONES);
      setWarningMsg(null);
    };

    resetFnRef.current = resetGame;
    resetSkinCanvas();

    // --- F. Pointer Interaction (Pre-allocated math objects) ---
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const dropperPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -1.3);
    const _targetPos = new THREE.Vector3();
    const _localPt = new THREE.Vector3();
    const _worldNormal = new THREE.Vector3();
    const _noseSamplePt = new THREE.Vector3(0, -0.05, 0.9);

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleStep1Click = (clientX: number, clientY: number) => {
      updatePointer(clientX, clientY);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects([capHitMesh, gameBottle], true);
      if (hits.length > 0) {
        currentPhase = 'OPENING';
        setPhase('OPENING');
        setStepText('뚜껑이 열리고 있어요...');
      }
    };

    const handleApplySerum = (clientX: number, clientY: number) => {
      updatePointer(clientX, clientY);
      raycaster.setFromCamera(pointer, camera);

      if (raycaster.ray.intersectPlane(dropperPlane, _targetPos)) {
        activeDropper.position.lerp(_targetPos, 0.45);
        activeDropper.rotation.z = -0.35;
        activeDropper.rotation.x = 0.25;
      }

      if (!isPointerDown) return;

      const forbiddenHits = raycaster.intersectObjects(eyeHitZones, false);
      if (forbiddenHits.length > 0) {
        showForbiddenWarning(String(forbiddenHits[0].object.userData.forbidden || 'eye'));
        return;
      }

      const skinHits = raycaster.intersectObjects([headMesh, noseMesh], false);
      if (skinHits.length > 0) {
        const hit = skinHits[0];
        if (hit.object === headMesh && hit.uv) {
          paintSerumOnSkin(hit.uv);
          _localPt.copy(hit.point);
          headMesh.worldToLocal(_localPt);
          recordZoneCoverage(_localPt);
        } else if (hit.object === noseMesh) {
          recordZoneCoverage(_noseSamplePt);
        }

        const now = performance.now();
        if (now - lastSpawnTime > 55 && hit.face) {
          lastSpawnTime = now;
          _worldNormal.copy(hit.face.normal).transformDirection(hit.object.matrixWorld);
          spawnSerumDroplet(hit.point, _worldNormal);
        }
      }
    };

    const dom = renderer.domElement;
    const onPointerDown = (e: PointerEvent) => {
      if (currentPhase === 'STEP1_CAP') {
        handleStep1Click(e.clientX, e.clientY);
      } else if (currentPhase === 'STEP2_APPLY') {
        isPointerDown = true;
        handleApplySerum(e.clientX, e.clientY);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (currentPhase !== 'STEP2_APPLY') return;
      const now = performance.now();
      if (now - lastMoveRaycastTime < 16) return;
      lastMoveRaycastTime = now;
      handleApplySerum(e.clientX, e.clientY);
    };

    const onPointerUp = () => {
      isPointerDown = false;
    };

    dom.addEventListener('pointerdown', onPointerDown);
    dom.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const resizeObserver = new ResizeObserver(() => {
      if (!container.clientWidth || !container.clientHeight) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
    resizeObserver.observe(container);

    // --- G. Animation Loop ---
    const gClock = new THREE.Clock();
    const frameIdRef = { current: 0 };
    let disposed = false;

    const animateGame = () => {
      if (disposed) return;
      const delta = Math.min(gClock.getDelta(), 0.1);
      const t = gClock.getElapsedTime();

      if (currentPhase !== 'WIN') {
        characterGroup.position.y = 0.15 + Math.sin(t * 1.8) * 0.015;
      } else {
        characterGroup.rotation.y = Math.sin(t * 2.0) * 0.14;
        characterGroup.position.y = 0.15 + Math.abs(Math.sin(t * 3.2)) * 0.035;
        eyeGroups.forEach((eg) => {
          eg.scale.y = 0.85;
        });
      }

      if (currentPhase === 'OPENING') {
        capOpenAnim += delta * 2.1;
        gameDropper.position.y = capOpenAnim * 1.4;
        gameDropper.rotation.y = capOpenAnim * Math.PI * 2;
        if (capOpenAnim >= 1.0) {
          currentPhase = 'STEP2_APPLY';
          gameDropper.visible = false;
          activeDropper.visible = true;
          activeDropper.position.set(0.7, 0.4, 1.3);
          setPhase('STEP2_APPLY');
          setStepText('STEP 2. 눈과 입술을 피해 얼굴 구석구석 문질러 발라주세요!');
        }
      }

      for (let i = dropletPool.length - 1; i >= 0; i--) {
        const d = dropletPool[i];
        d.life -= delta * 1.5;
        d.mesh.scale.multiplyScalar(1 + delta * 1.1);
        d.mesh.material.opacity = Math.max(0, d.life * 0.9);
        if (d.life <= 0) {
          scene.remove(d.mesh);
          d.mesh.material.dispose();
          dropletPool.splice(i, 1);
        }
      }

      starPool.forEach((s) => {
        s.mesh.position.y += s.vy;
        s.mesh.rotation.y += s.rot;
        s.mesh.rotation.x += s.rot;
        const pulse = 0.7 + Math.sin(t * 6 + s.phase) * 0.45;
        s.mesh.scale.setScalar(pulse);
        if (s.mesh.position.y > 1.8) s.mesh.position.y = -1.0;
      });

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterSoftwareDraw(renderer, frameIdRef, animateGame);
      } else {
        frameIdRef.current = requestAnimationFrame(animateGame);
      }
    };

    animateGame();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameIdRef.current);
      window.clearTimeout(frameIdRef.current);
      window.clearTimeout(warningTimer);
      window.clearTimeout(shakeTimer1);
      window.clearTimeout(shakeTimer2);
      window.clearTimeout(shakeTimer3);
      resizeObserver.disconnect();
      dom.removeEventListener('pointerdown', onPointerDown);
      dom.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('webglcontextlost', handleContextLost);
      dom.removeEventListener('webglcontextrestored', handleContextRestored);

      dropletGeo.dispose();
      dropletBaseMat.dispose();
      starGeo.dispose();
      starBaseMat.dispose();
      invisibleMat.dispose();
      skinTexture.dispose();
      roughTexture.dispose();
      disposeObject3D(scene);
      envTarget.dispose();
      renderer.dispose();
      if (dom.parentNode === container) {
        container.removeChild(dom);
      }
    };
  }, []);

  const capDone = phase === 'STEP2_APPLY' || phase === 'WIN';

  return (
    <section
      id="game"
      className="py-20 bg-gradient-to-b from-white via-torriden-50/40 to-gray-50"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-torriden-600 font-bold text-xs tracking-wider mb-2">
            3D SKINCARE MINI GAME
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 [text-wrap:balance]">
            직접 뚜껑을 열고 <span className="text-torriden-500">촉촉한 수분</span>을 채워보세요
          </h2>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto text-sm sm:text-base">
            먼저 토리든 세럼의 뚜껑을 클릭해 연 다음, 눈과 입술을 피해 웃는 얼굴 구석구석 세럼을 발라주세요.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* 3D Game Stage */}
          <div className="lg:col-span-8 relative bg-gradient-to-b from-[#dbeeff] via-[#eef7ff] to-[#f8fbff] rounded-3xl shadow-xl border border-white overflow-hidden min-h-[480px] sm:min-h-[560px]">
            {/* Top HUD (no backdrop-blur over WebGL, no pulsing dots) */}
            <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
              <div className="bg-white/95 px-4 py-2 rounded-2xl shadow-sm border border-torriden-100">
                <span className="text-xs sm:text-sm font-bold text-gray-800">{stepText}</span>
              </div>

              <div className="bg-white/95 px-4 py-2 rounded-2xl shadow-sm border border-torriden-100 flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500 whitespace-nowrap">수분 충전</span>
                <div className="w-24 sm:w-32 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-torriden-500 to-cyan-400 rounded-full transition-all duration-150"
                    style={{ width: `${overallPct}%` }}
                  />
                </div>
                <span className="text-xs font-black text-torriden-600 w-9 text-right tabular-nums">
                  {overallPct}%
                </span>
              </div>
            </div>

            {/* Warning Toast */}
            {warningMsg && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-amber-500 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-full shadow-lg pointer-events-none whitespace-nowrap">
                {warningMsg}
              </div>
            )}

            {/* Dedicated Empty WebGL Mount Container */}
            <div ref={mountRef} className="w-full h-full min-h-[480px] sm:min-h-[560px] relative" />

            {/* WebGL Fallback */}
            {webglError && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-sky-50">
                <p className="text-base font-bold text-gray-900">3D 미니게임 로드 안내</p>
                <p className="text-sm text-gray-600 mt-1">
                  브라우저에서 WebGL 컨텍스트를 사용할 수 없어 미니게임을 실행할 수 없습니다.
                </p>
              </div>
            )}

            {/* Step 1 Floating Hint */}
            {phase === 'STEP1_CAP' && !webglError && (
              <div className="absolute bottom-20 right-6 sm:right-10 z-20 pointer-events-none animate-bounce">
                <div className="bg-torriden-500 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl shadow-lg">
                  여기 뚜껑을 클릭하세요
                </div>
              </div>
            )}

            {/* Victory Overlay: "Twinkle!" */}
            {phase === 'WIN' && (
              <div className="absolute inset-0 z-40 bg-torriden-900/40 flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-torriden-200 animate-twinkle-pop">
                  <p className="text-xs font-bold tracking-widest text-torriden-600 mb-1">
                    HYDRATION COMPLETE
                  </p>
                  <div className="text-5xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-torriden-500 via-cyan-400 to-blue-600 bg-clip-text text-transparent mb-3">
                    Twinkle!
                  </div>
                  <p className="text-gray-800 font-bold text-lg mb-1">속보습 100% 충전 완료!</p>
                  <p className="text-gray-500 text-xs sm:text-sm mb-6 leading-relaxed">
                    눈과 입술을 피해 얼굴 구석구석
                    <br />
                    토리든 다이브인 세럼을 완벽하게 발랐어요.
                  </p>
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => resetFnRef.current?.()}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl text-sm transition-colors whitespace-nowrap"
                    >
                      다시 하기
                    </button>
                    <button
                      type="button"
                      onClick={onOpenPurchase}
                      className="flex-1 bg-torriden-500 hover:bg-torriden-600 text-white font-bold py-3 rounded-xl text-sm shadow-md shadow-torriden-500/25 transition-colors whitespace-nowrap"
                    >
                      제품 구매하기
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Status & Checklist Panel */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-200/80 flex flex-col justify-between gap-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-extrabold text-gray-900">미션 체크리스트</h3>
                <button
                  type="button"
                  onClick={() => resetFnRef.current?.()}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-torriden-600 bg-gray-100 hover:bg-torriden-50 px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>게임 초기화</span>
                </button>
              </div>

              {/* Step 1 Status Row */}
              <div className="flex items-center justify-between py-3 px-4 rounded-2xl bg-torriden-50/70 border border-torriden-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-white text-torriden-600 font-bold text-xs flex items-center justify-center shadow-sm">
                    {capDone ? <Check className="w-3.5 h-3.5" /> : '1'}
                  </span>
                  <span className="text-sm font-bold text-gray-800">세럼 뚜껑 열기</span>
                </div>
                <span
                  className={`text-xs font-bold tabular-nums ${
                    capDone ? 'text-torriden-600' : 'text-gray-500'
                  }`}
                >
                  {capDone ? '열림 완료' : '대기중'}
                </span>
              </div>

              {/* Face Zones Checklist */}
              <div>
                <p className="text-xs font-bold text-gray-500 mb-3">
                  얼굴 부위별 세럼 도포 (눈 · 입술 제외)
                </p>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  {ZONE_LABELS.map(({ key, label, fullSpan }) => {
                    const pct = zones[key];
                    const done = pct >= 100;
                    return (
                      <div
                        key={key}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                          fullSpan ? 'col-span-2' : ''
                        } ${
                          done
                            ? 'bg-torriden-50 border-torriden-200'
                            : 'bg-gray-50 border-gray-100'
                        }`}
                      >
                        <span className="font-semibold text-gray-700">{label}</span>
                        <span
                          className={`tabular-nums font-bold ${
                            done ? 'text-torriden-600' : 'text-torriden-500'
                          }`}
                        >
                          {done ? '완료' : `${pct}%`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 text-xs text-gray-600 space-y-1.5 leading-relaxed">
              <p className="font-bold text-torriden-700">플레이 안내</p>
              <p>
                뚜껑을 연 뒤 마우스(또는 손가락)를 누른 채로 얼굴 위를 천천히 문질러 보세요. 파란 세럼 방울이 피부에 발리며 물광으로 변합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
