/* ═══════════════════════════════════════════════════════
   VERDANT FORGE — 3D HERO SCENE
   js/hero3d.js  (Three.js r128)
═══════════════════════════════════════════════════════ */

(function initHero3D() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // ── SETUP ──────────────────────────────────────────
  const W = canvas.offsetWidth || window.innerWidth;
  const H = canvas.offsetHeight || window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x080E0A, 0.035);

  const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 200);
  camera.position.set(8, 5, 14);
  camera.lookAt(0, 1, 0);

  // ── LIGHTING ───────────────────────────────────────
  const ambient = new THREE.AmbientLight(0x0A1A0E, 0.6);
  scene.add(ambient);

  const sunLight = new THREE.DirectionalLight(0x88CC99, 1.2);
  sunLight.position.set(8, 12, 6);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(1024, 1024);
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 50;
  sunLight.shadow.camera.left = -15;
  sunLight.shadow.camera.right = 15;
  sunLight.shadow.camera.top = 15;
  sunLight.shadow.camera.bottom = -15;
  scene.add(sunLight);

  const fillLight = new THREE.PointLight(0x4EBF5E, 0.8, 20);
  fillLight.position.set(-4, 3, 4);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0x2A6B88, 0.5);
  rimLight.position.set(-8, 4, -6);
  scene.add(rimLight);

  // ── MATERIALS ──────────────────────────────────────
  const mat = {
    ground:  new THREE.MeshLambertMaterial({ color: 0x1A2E18 }),
    soil:    new THREE.MeshLambertMaterial({ color: 0x3A2010 }),
    body:    new THREE.MeshPhongMaterial({ color: 0x2A4A32, shininess: 60, specular: 0x223322 }),
    bodyAlt: new THREE.MeshPhongMaterial({ color: 0x1E3828, shininess: 40 }),
    wheel:   new THREE.MeshPhongMaterial({ color: 0x1A1A1A, shininess: 20 }),
    rim:     new THREE.MeshPhongMaterial({ color: 0x3A5A3A, shininess: 80, specular: 0x4EBF5E }),
    sensor:  new THREE.MeshPhongMaterial({ color: 0x4EBF5E, emissive: 0x2A8A3A, emissiveIntensity: 0.4, shininess: 100 }),
    glass:   new THREE.MeshPhongMaterial({ color: 0x88BBCC, transparent: true, opacity: 0.6, shininess: 200 }),
    metal:   new THREE.MeshPhongMaterial({ color: 0x557755, shininess: 120, specular: 0x88CC88 }),
    crop:    new THREE.MeshLambertMaterial({ color: 0x2D6B2A }),
    cropB:   new THREE.MeshLambertMaterial({ color: 0x4A8C40 }),
    stake:   new THREE.MeshLambertMaterial({ color: 0x5A3A20 }),
    wire:    new THREE.MeshLambertMaterial({ color: 0x8A7A50 }),
    basket:  new THREE.MeshPhongMaterial({ color: 0x8B5E3C, shininess: 30 }),
  };

  // ── GROUND PLANE ───────────────────────────────────
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), mat.ground);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Soil rows
  for (let i = -4; i <= 4; i += 2) {
    const row = new THREE.Mesh(new THREE.BoxGeometry(20, 0.08, 0.7), mat.soil);
    row.position.set(0, 0.04, i);
    row.receiveShadow = true;
    scene.add(row);
  }

  // ── HELPER: addMesh ────────────────────────────────
  function addMesh(geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }

  // ── ROVER BODY ─────────────────────────────────────
  const roverGroup = new THREE.Group();
  scene.add(roverGroup);
  roverGroup.position.set(-1, 0, 0);

  // Main chassis
  const chassis = addMesh(new THREE.BoxGeometry(2.2, 0.55, 3.0), mat.body, 0, 0.75, 0);
  roverGroup.add(chassis);

  // Side panels
  roverGroup.add(addMesh(new THREE.BoxGeometry(0.12, 0.45, 2.8), mat.bodyAlt, -1.15, 0.75, 0));
  roverGroup.add(addMesh(new THREE.BoxGeometry(0.12, 0.45, 2.8), mat.bodyAlt,  1.15, 0.75, 0));

  // Top deck
  roverGroup.add(addMesh(new THREE.BoxGeometry(2.0, 0.1, 2.6), mat.metal, 0, 1.07, 0));

  // Equipment deck (upper)
  roverGroup.add(addMesh(new THREE.BoxGeometry(1.6, 0.08, 1.8), mat.body, 0, 1.35, -0.2));

  // Sensor mast
  const mast = addMesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2), mat.metal, 0, 2.0, -0.2);
  roverGroup.add(mast);

  // Sensor head on mast
  roverGroup.add(addMesh(new THREE.BoxGeometry(0.4, 0.3, 0.35), mat.body, 0, 2.75, -0.2));

  // Stereo camera eyes
  roverGroup.add(addMesh(new THREE.CylinderGeometry(0.07, 0.07, 0.12), mat.glass, -0.12, 2.75, -0.38, Math.PI/2, 0, 0));
  roverGroup.add(addMesh(new THREE.CylinderGeometry(0.07, 0.07, 0.12), mat.glass,  0.12, 2.75, -0.38, Math.PI/2, 0, 0));

  // Status light on mast top
  roverGroup.add(addMesh(new THREE.SphereGeometry(0.07), mat.sensor, 0, 3.15, -0.2));

  // Solar panel on deck
  const solarPanel = addMesh(new THREE.BoxGeometry(1.4, 0.05, 1.0), mat.glass, 0, 1.45, 0.4, -0.15, 0, 0);
  roverGroup.add(solarPanel);

  // Basket (rear)
  const basketWall = (w, h, d, bx, by, bz) => {
    const m = addMesh(new THREE.BoxGeometry(w, h, d), mat.basket, bx, by, bz);
    roverGroup.add(m);
  };
  basketWall(2.0, 0.06, 1.4, 0, 0.73, 1.55); // floor
  basketWall(2.0, 0.5, 0.06, 0, 1.0, 2.22);   // back
  basketWall(0.06, 0.5, 1.4, -1.0, 1.0, 1.55); // left
  basketWall(0.06, 0.5, 1.4,  1.0, 1.0, 1.55); // right

  // ── 6 WHEELS ──────────────────────────────────────
  function addWheel(x, z) {
    const wheelGroup = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.32, 12), mat.wheel);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wheelGroup.add(tire);
    const rimMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.34, 8), mat.rim);
    rimMesh.rotation.z = Math.PI / 2;
    wheelGroup.add(rimMesh);
    // Spokes
    for (let i = 0; i < 5; i++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.05, 0.05), mat.rim);
      spoke.rotation.z = (i / 5) * Math.PI;
      wheelGroup.add(spoke);
    }
    wheelGroup.position.set(x, 0.42, z);
    wheelGroup.castShadow = true;
    roverGroup.add(wheelGroup);
    return wheelGroup;
  }

  const wheels = [
    addWheel(-1.3, -1.0), addWheel(-1.3, 0), addWheel(-1.3, 1.0),
    addWheel( 1.3, -1.0), addWheel( 1.3, 0), addWheel( 1.3, 1.0),
  ];

  // ── CROP PLANTS (tomato stakes) ─────────────────────
  function addPlant(x, z) {
    const g = new THREE.Group();
    // Stake
    g.add(addMesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8), mat.stake, x, 0.9, z));
    // Stem
    g.add(addMesh(new THREE.CylinderGeometry(0.025, 0.025, 1.2), mat.crop, x, 0.6, z));
    // Leaf clusters
    const leafPositions = [[0,1.4,0],[0.2,0.8,0.1],[-0.15,1.0,-0.1],[0.1,1.2,-0.15]];
    leafPositions.forEach(([lx,ly,lz]) => {
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(0.18 + Math.random()*0.1, 5, 4),
        Math.random() > 0.5 ? mat.crop : mat.cropB
      );
      leaf.position.set(x+lx, ly, z+lz);
      leaf.castShadow = true;
      g.add(leaf);
    });
    // Tomato fruit
    if (Math.random() > 0.4) {
      const fruitMat = new THREE.MeshPhongMaterial({ color: 0xCC4422, shininess: 60 });
      const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 5), fruitMat);
      fruit.position.set(x + (Math.random()-0.5)*0.3, 0.7 + Math.random()*0.4, z + (Math.random()-0.5)*0.2);
      fruit.castShadow = true;
      g.add(fruit);
    }
    scene.add(g);
    return g;
  }

  const plants = [];
  const plantPositions = [
    [-4,2],[-4,0],[-4,-2],[4,2],[4,0],[4,-2],
    [-6,2],[-6,0],[-6,-2],[6,2],[6,0],[6,-2],
    [-8,2],[-8,0],[-8,-2],[8,2],[8,0],[8,-2],
  ];
  plantPositions.forEach(([px, pz]) => plants.push(addPlant(px, pz)));

  // Wire between stakes (row lines)
  const wireGeo = new THREE.CylinderGeometry(0.01, 0.01, 16, 4);
  [-2, 0, 2].forEach(row => {
    const wire = new THREE.Mesh(wireGeo, mat.wire);
    wire.rotation.z = Math.PI / 2;
    wire.position.set(0, 1.3, row);
    scene.add(wire);
  });

  // ── GROUND FOG PARTICLES ────────────────────────────
  const particleGeo = new THREE.BufferGeometry();
  const particleCount = 80;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i*3]   = (Math.random() - 0.5) * 30;
    positions[i*3+1] = Math.random() * 0.5;
    positions[i*3+2] = (Math.random() - 0.5) * 20;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({ color: 0x4EBF5E, size: 0.06, transparent: true, opacity: 0.4 });
  scene.add(new THREE.Points(particleGeo, particleMat));

  // ── ANIMATION LOOP ─────────────────────────────────
  let t = 0;
  let raf;

  // Rover path points
  const path = [
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(2, 0, 0),
    new THREE.Vector3(2, 0, -3),
    new THREE.Vector3(-1, 0, -3),
    new THREE.Vector3(-1, 0, 0),
  ];
  const curve = new THREE.CatmullRomCurve3(path, true);
  let pathT = 0;

  function animate() {
    raf = requestAnimationFrame(animate);
    t += 0.008;

    // Rover follows path
    pathT = (pathT + 0.0012) % 1;
    const pos = curve.getPoint(pathT);
    const tangent = curve.getTangent(pathT);
    roverGroup.position.set(pos.x, 0, pos.z);
    roverGroup.rotation.y = Math.atan2(tangent.x, tangent.z);

    // Wheel rotation
    wheels.forEach((w, i) => {
      w.rotation.x -= 0.05;
    });

    // Bobbing / suspension
    roverGroup.position.y = Math.sin(t * 3) * 0.015;

    // Status light pulse
    if (mat.sensor) {
      mat.sensor.emissiveIntensity = 0.3 + Math.sin(t * 4) * 0.25;
    }

    // Fill light pulse (simulates sensor scanning)
    fillLight.intensity = 0.6 + Math.sin(t * 2.5) * 0.3;

    // Plants sway gently
    plants.forEach((plant, i) => {
      const swayFreq = 0.8 + i * 0.07;
      const swayAmp = 0.02;
      plant.rotation.z = Math.sin(t * swayFreq + i) * swayAmp;
    });

    // Camera slow orbit
    const camRadius = 14;
    const camAngle = t * 0.05;
    camera.position.x = Math.sin(camAngle) * camRadius;
    camera.position.z = Math.cos(camAngle) * camRadius;
    camera.position.y = 5 + Math.sin(t * 0.3) * 0.3;
    camera.lookAt(0, 1.2, 0);

    renderer.render(scene, camera);
  }

  animate();

  // ── RESIZE ─────────────────────────────────────────
  window.addEventListener('resize', () => {
    const w = canvas.parentElement?.offsetWidth || window.innerWidth;
    const h = canvas.parentElement?.offsetHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // ── PAUSE ON HIDDEN ────────────────────────────────
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else animate();
  });

})();
