import * as THREE from 'three';

export interface TorridenBottleAsset {
  productGroup: THREE.Group;
  dropperGroup: THREE.Group;
  bubblesGroup: THREE.Group;
}

export function createTorridenBottle(
  maxAnisotropy = 8,
  isSoftwareGl = false,
): TorridenBottleAsset {
  const productGroup = new THREE.Group();

  // 1) Outer glass bottle
  const bottleRadius = 0.84;
  const bottlePoints = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.68, 0.0),
    new THREE.Vector2(0.79, 0.04),
    new THREE.Vector2(0.835, 0.14),
    new THREE.Vector2(bottleRadius, 0.24),
    new THREE.Vector2(bottleRadius, 1.44),
    new THREE.Vector2(0.82, 1.58),
    new THREE.Vector2(0.72, 1.72),
    new THREE.Vector2(0.52, 1.84),
    new THREE.Vector2(0.39, 1.90),
    new THREE.Vector2(0.39, 2.06),
    new THREE.Vector2(0.35, 2.06),
  ];
  const bottleGeo = new THREE.LatheGeometry(bottlePoints, 64);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xf4fbff,
    metalness: 0.0,
    roughness: 0.05,
    transmission: isSoftwareGl ? 0 : 0.92,
    transparent: true,
    opacity: isSoftwareGl ? 0.34 : 1,
    ior: 1.52,
    thickness: 0.35,
    reflectivity: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    depthWrite: false,
  });
  const bottleMesh = new THREE.Mesh(bottleGeo, glassMat);
  bottleMesh.renderOrder = 3;
  bottleMesh.castShadow = true;
  productGroup.add(bottleMesh);

  // Thick refractive glass base
  const basePoints = [
    new THREE.Vector2(0.0, 0.02),
    new THREE.Vector2(0.72, 0.02),
    new THREE.Vector2(0.76, 0.14),
    new THREE.Vector2(0.70, 0.19),
    new THREE.Vector2(0.0, 0.18),
  ];
  const baseGeo = new THREE.LatheGeometry(basePoints, 48);
  const baseGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xdff4ff,
    roughness: 0.08,
    transmission: isSoftwareGl ? 0 : 0.85,
    transparent: true,
    opacity: isSoftwareGl ? 0.45 : 1,
    ior: 1.55,
    thickness: 0.5,
    depthWrite: false,
  });
  const baseMesh = new THREE.Mesh(baseGeo, baseGlassMat);
  baseMesh.renderOrder = 2;
  productGroup.add(baseMesh);

  // 2) Inner sky-blue serum liquid
  const liquidPoints = [
    new THREE.Vector2(0.0, 0.17),
    new THREE.Vector2(0.73, 0.17),
    new THREE.Vector2(0.765, 0.24),
    new THREE.Vector2(0.765, 1.44),
    new THREE.Vector2(0.74, 1.56),
    new THREE.Vector2(0.65, 1.65),
    new THREE.Vector2(0.0, 1.64),
  ];
  const liquidGeo = new THREE.LatheGeometry(liquidPoints, 64);
  const liquidMat = new THREE.MeshPhysicalMaterial({
    color: 0x99dcff,
    emissive: 0x0c4a6e,
    emissiveIntensity: 0.08,
    roughness: 0.06,
    metalness: 0.0,
    transmission: isSoftwareGl ? 0 : 0.72,
    transparent: true,
    opacity: isSoftwareGl ? 0.78 : 0.88,
    ior: 1.34,
    thickness: 1.2,
    attenuationColor: new THREE.Color(0x66ccff),
    attenuationDistance: 1.8,
    depthWrite: false,
  });
  const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
  liquidMesh.renderOrder = 2;
  productGroup.add(liquidMesh);

  // 3) Serum micro-bubbles
  const bubblesGroup = new THREE.Group();
  const bubbleGeo = new THREE.SphereGeometry(1, 16, 16);
  const bubbleMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.02,
    transmission: isSoftwareGl ? 0 : 0.95,
    transparent: true,
    opacity: isSoftwareGl ? 0.65 : 1,
    ior: 1.0,
    clearcoat: 1.0,
  });
  const bubbleSpecs = [
    { x: -0.27, y: 1.60, z: 0.28, r: 0.044 },
    { x: -0.20, y: 1.62, z: 0.31, r: 0.026 },
    { x: -0.33, y: 1.57, z: 0.23, r: 0.022 },
    { x: 0.22, y: 1.61, z: -0.24, r: 0.032 },
    { x: 0.09, y: 1.32, z: 0.12, r: 0.015 },
    { x: -0.11, y: 1.20, z: 0.09, r: 0.012 },
    { x: 0.08, y: 1.06, z: -0.07, r: 0.016 },
    { x: -0.06, y: 0.88, z: 0.14, r: 0.013 },
    { x: 0.12, y: 0.76, z: 0.08, r: 0.011 },
    { x: -0.09, y: 0.60, z: -0.11, r: 0.014 },
  ];
  bubbleSpecs.forEach((b) => {
    const m = new THREE.Mesh(bubbleGeo, bubbleMat);
    m.position.set(b.x, b.y, b.z);
    m.scale.setScalar(b.r);
    m.renderOrder = 1;
    bubblesGroup.add(m);
  });
  productGroup.add(bubblesGroup);

  // 4) Procedural wrap-around label texture
  const labelRadius = bottleRadius + 0.005;
  const labelHeight = 1.18;
  const circumference = 2 * Math.PI * labelRadius;
  const aspect = circumference / labelHeight;

  const createLabelTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.height = 560;
    canvas.width = Math.round(canvas.height * aspect);
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width * 0.5;

    ctx.save();
    ctx.translate(cx, 155);
    ctx.scale(0.84, 1.32);
    ctx.fillStyle = '#090d16';
    ctx.font = '800 84px "Pretendard", "Plus Jakarta Sans", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Torriden', 0, 0);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#111827';
    ctx.font = '600 28px "Pretendard", "Plus Jakarta Sans", Arial, sans-serif';
    ctx.textBaseline = 'middle';

    ctx.save();
    ctx.translate(cx - 155, 232);
    ctx.scale(0.92, 1.15);
    ctx.textAlign = 'left';
    ctx.fillText('DIVE IN', 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(cx + 155, 232);
    ctx.scale(0.92, 1.15);
    ctx.textAlign = 'right';
    ctx.fillText('Serum', 0, 0);
    ctx.restore();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#111827';
    ctx.font = '600 18px "Pretendard", "Plus Jakarta Sans", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Low Molecular', cx, 474);
    ctx.fillText('Hyaluronic Acid', cx, 498);
    ctx.restore();

    const drawBackText = (bx: number) => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
      ctx.textAlign = 'center';
      ctx.font = 'bold 24px "Pretendard", Arial, sans-serif';
      ctx.fillText('다이브인 저분자 히알루론산 세럼', bx, 165);

      ctx.font = '500 17px "Pretendard", Arial, sans-serif';
      ctx.fillText('5D 복합 저분자 히알루론산 & D-판테놀', bx, 212);
      ctx.fillText('피부 속까지 촘촘하게 채워주는 수분 진정 세럼', bx, 240);

      ctx.font = '600 16px "Pretendard", Arial, sans-serif';
      ctx.fillText('50 ml / 1.69 fl. oz.   MADE IN KOREA', bx, 455);
      ctx.fillText('VEGAN CERTIFIED  ·  TORRIDEN', bx, 485);
    };
    drawBackText(0);
    drawBackText(canvas.width);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAnisotropy;
    tex.needsUpdate = true;
    return tex;
  };

  const labelGeo = new THREE.CylinderGeometry(
    labelRadius,
    labelRadius,
    labelHeight,
    64,
    1,
    true,
  );
  labelGeo.rotateY(-Math.PI / 2);
  const labelMat = new THREE.MeshBasicMaterial({
    map: createLabelTexture(),
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
  });
  const labelMesh = new THREE.Mesh(labelGeo, labelMat);
  labelMesh.position.y = 0.84;
  labelMesh.renderOrder = 4;
  productGroup.add(labelMesh);

  // 5) Dropper cap & internal glass pipette
  const dropperGroup = new THREE.Group();
  productGroup.add(dropperGroup);

  const pipettePoints = [
    new THREE.Vector2(0.0, 0.28),
    new THREE.Vector2(0.025, 0.29),
    new THREE.Vector2(0.055, 0.40),
    new THREE.Vector2(0.068, 0.48),
    new THREE.Vector2(0.068, 1.92),
    new THREE.Vector2(0.085, 1.98),
  ];
  const pipetteGeo = new THREE.LatheGeometry(pipettePoints, 32);
  const pipetteMat = new THREE.MeshPhysicalMaterial({
    color: 0xeaf8ff,
    roughness: 0.04,
    transmission: isSoftwareGl ? 0 : 0.9,
    transparent: true,
    opacity: isSoftwareGl ? 0.55 : 1,
    ior: 1.5,
    thickness: 0.1,
    depthWrite: false,
  });
  const pipetteMesh = new THREE.Mesh(pipetteGeo, pipetteMat);
  pipetteMesh.renderOrder = 1;
  dropperGroup.add(pipetteMesh);

  const innerSerumGeo = new THREE.CylinderGeometry(0.044, 0.040, 0.88, 24);
  const innerSerumMat = new THREE.MeshPhysicalMaterial({
    color: 0x8ad7ff,
    roughness: 0.05,
    transmission: isSoftwareGl ? 0 : 0.7,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });
  const innerSerumMesh = new THREE.Mesh(innerSerumGeo, innerSerumMat);
  innerSerumMesh.position.y = 0.90;
  innerSerumMesh.renderOrder = 1;
  dropperGroup.add(innerSerumMesh);

  const capPoints = [
    new THREE.Vector2(0.39, 1.90),
    new THREE.Vector2(0.46, 1.90),
    new THREE.Vector2(0.465, 2.46),
    new THREE.Vector2(0.43, 2.51),
    new THREE.Vector2(0.24, 2.52),
  ];
  const capGeo = new THREE.LatheGeometry(capPoints, 64);
  const capMat = new THREE.MeshPhysicalMaterial({
    color: 0xf9fbfd,
    roughness: 0.28,
    metalness: 0.04,
    clearcoat: 0.7,
    clearcoatRoughness: 0.12,
  });
  const capMesh = new THREE.Mesh(capGeo, capMat);
  capMesh.castShadow = true;
  dropperGroup.add(capMesh);

  const ribGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.52, 8);
  const ribMat = new THREE.MeshStandardMaterial({ color: 0xedf2f7, roughness: 0.35 });
  const ribCount = 44;
  for (let i = 0; i < ribCount; i++) {
    const angle = (i / ribCount) * Math.PI * 2;
    const rib = new THREE.Mesh(ribGeo, ribMat);
    rib.position.set(Math.cos(angle) * 0.463, 2.18, Math.sin(angle) * 0.463);
    dropperGroup.add(rib);
  }

  const collarGeo = new THREE.CylinderGeometry(0.275, 0.295, 0.06, 48);
  const collarMesh = new THREE.Mesh(collarGeo, capMat);
  collarMesh.position.y = 2.53;
  dropperGroup.add(collarMesh);

  const bulbPoints = [
    new THREE.Vector2(0.245, 2.53),
    new THREE.Vector2(0.23, 2.66),
    new THREE.Vector2(0.215, 2.98),
    new THREE.Vector2(0.20, 3.10),
    new THREE.Vector2(0.15, 3.19),
    new THREE.Vector2(0.08, 3.23),
    new THREE.Vector2(0.0, 3.24),
  ];
  const bulbGeo = new THREE.LatheGeometry(bulbPoints, 48);
  const bulbMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.45,
    metalness: 0.0,
    sheen: 0.4,
    sheenColor: new THREE.Color(0xffffff),
  });
  const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
  bulbMesh.castShadow = true;
  dropperGroup.add(bulbMesh);

  return { productGroup, dropperGroup, bubblesGroup };
}
