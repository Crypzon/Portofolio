import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

const state = {
  mouseX: 0,
  mouseY: 0,
  scrollProgress: 0,
  sceneReady: false,
};

function initMobileNav() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#mobile-nav");
  const links = nav?.querySelectorAll("a") || [];

  if (!toggle || !nav) return;

  const close = () => {
    toggle.classList.remove("is-open");
    nav.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const shouldOpen = !nav.classList.contains("is-open");
    toggle.classList.toggle("is-open", shouldOpen);
    nav.classList.toggle("is-open", shouldOpen);
    document.body.classList.toggle("is-locked", shouldOpen);
    toggle.setAttribute("aria-expanded", String(shouldOpen));
  });

  links.forEach((link) => link.addEventListener("click", close));
}

function initScrollProgress() {
  const progress = document.querySelector("#scroll-progress");
  if (!progress) return;

  const update = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const value = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    state.scrollProgress = value / 100;
    progress.style.width = `${Math.min(100, Math.max(0, value))}%`;
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

function initActiveNav() {
  const links = [...document.querySelectorAll(".desktop-nav a")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!links.length || !sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 },
  );

  sections.forEach((section) => observer.observe(section));
}

function initReveal() {
  const items = [...document.querySelectorAll(".reveal")];
  if (!items.length) return;

  items.forEach((item, index) => {
    item.style.setProperty("--delay", `${Math.min(index * 45, 240)}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );

  items.forEach((item) => observer.observe(item));
}

function initCounters() {
  const counters = [...document.querySelectorAll("[data-count]")];
  if (!counters.length) return;

  const formatValue = (target, value) => {
    const hasDecimal = String(target).includes(".");
    return hasDecimal ? value.toFixed(2) : Math.round(value).toString();
  };

  const animate = (node) => {
    const target = Number(node.dataset.count);
    const duration = 1150;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = formatValue(node.dataset.count, target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 },
  );

  counters.forEach((counter) => observer.observe(counter));
}

function initTilt() {
  if (!finePointer || reduceMotion) return;

  document.querySelectorAll("[data-tilt]").forEach((element) => {
    element.addEventListener("mousemove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = (x / rect.width - 0.5) * 9;
      const rotateX = (y / rect.height - 0.5) * -9;
      element.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });

    element.addEventListener("mouseleave", () => {
      element.style.transform = "";
    });
  });
}

function initMagnetic() {
  if (!finePointer || reduceMotion) return;

  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("mousemove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      element.style.transform = `translate(${x * 0.13}px, ${y * 0.16}px)`;
    });

    element.addEventListener("mouseleave", () => {
      element.style.transform = "";
    });
  });
}

function createArchitectureScene() {
  const canvas = document.querySelector("#portfolio-scene");
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
  const clock = new THREE.Clock();
  const pointer = new THREE.Vector2();
  const targetPointer = new THREE.Vector2();
  const stage = new THREE.Group();
  const system = new THREE.Group();
  const hub = new THREE.Group();
  const orbit = new THREE.Group();
  const bars = [];
  const floating = [];

  camera.position.set(0, 1.1, 9.4);
  stage.add(system);
  system.add(hub, orbit);
  scene.add(stage);

  scene.add(new THREE.AmbientLight(0xdde8ff, 1.2));

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.7);
  keyLight.position.set(4, 5, 5);
  scene.add(keyLight);

  const cyanLight = new THREE.PointLight(0x3bdcff, 2.5, 18);
  const mintLight = new THREE.PointLight(0x9cf56b, 1.7, 16);
  cyanLight.position.set(-3.8, 1.4, 3.4);
  mintLight.position.set(3.5, -0.6, 2.8);
  scene.add(cyanLight, mintLight);

  const grid = new THREE.GridHelper(18, 36, 0x3bdcff, 0x24303c);
  grid.position.set(0, -2.35, -2.4);
  grid.material.transparent = true;
  grid.material.opacity = 0.2;
  system.add(grid);

  const platform = createPlatform();
  platform.position.set(0.9, -1.72, -2.45);
  system.add(platform);

  createBalancedBars().forEach((bar) => {
    bars.push(bar);
    system.add(bar.mesh);
  });

  hub.position.set(1.48, -0.5, -2.28);
  hub.add(createHubCore());
  hub.add(createHubRings());

  createOrbitNodes().forEach((node) => {
    orbit.add(node);
    floating.push(node);
  });
  orbit.position.copy(hub.position);

  const leftPanel = createInfoPanel({
    title: "SYSTEM",
    items: ["Laravel API", "Responsive UI", "Data analytics"],
    accent: "#3bdcff",
  });
  leftPanel.position.set(-2.85, -0.78, -2.05);
  leftPanel.rotation.set(-0.06, 0.34, 0.02);
  leftPanel.scale.setScalar(0.78);
  leftPanel.userData.baseY = leftPanel.position.y;
  floating.push(leftPanel);
  system.add(leftPanel);

  const rightPanel = createInfoPanel({
    title: "DELIVERY",
    items: ["Dashboard", "Workflow", "Reporting"],
    accent: "#9cf56b",
  });
  rightPanel.position.set(3.88, -0.62, -2.35);
  rightPanel.rotation.set(-0.05, -0.42, -0.02);
  rightPanel.scale.setScalar(0.72);
  rightPanel.userData.baseY = rightPanel.position.y;
  floating.push(rightPanel);
  system.add(rightPanel);

  const particles = createSubtleParticles();
  system.add(particles);

  const resize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isSmall = width < 720;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.set(0, isSmall ? 1.28 : 1.1, isSmall ? 10.6 : 9.4);
    stage.scale.setScalar(isSmall ? 0.76 : 1);
    system.position.set(isSmall ? 0.15 : 0, isSmall ? -0.34 : 0, 0);
    camera.updateProjectionMatrix();
  };

  const onPointerMove = (event) => {
    targetPointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    targetPointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    state.mouseX = targetPointer.x;
    state.mouseY = targetPointer.y;
  };

  const animate = () => {
    const elapsed = clock.getElapsedTime();
    pointer.lerp(targetPointer, 0.05);

    stage.rotation.y = pointer.x * 0.09 + state.scrollProgress * 0.08;
    stage.rotation.x = -0.035 + pointer.y * 0.045;
    system.position.y = (window.innerWidth < 720 ? -0.34 : 0) - state.scrollProgress * 0.52;

    hub.rotation.y = elapsed * 0.22;
    hub.rotation.x = Math.sin(elapsed * 0.35) * 0.05;
    orbit.rotation.y = -elapsed * 0.18;
    orbit.rotation.z = Math.sin(elapsed * 0.2) * 0.02;
    particles.rotation.y = elapsed * 0.012;

    bars.forEach((bar, index) => {
      const height = bar.baseHeight + Math.sin(elapsed * bar.speed + bar.phase) * 0.08;
      bar.mesh.scale.y = height;
      bar.mesh.position.y = -1.82 + height / 2;
      bar.mesh.rotation.y = Math.sin(elapsed * 0.22 + index) * 0.015;
    });

    floating.forEach((object, index) => {
      object.position.y = object.userData.baseY + Math.sin(elapsed * object.userData.speed + index) * 0.045;
    });

    renderer.render(scene, camera);
    if (!reduceMotion) requestAnimationFrame(animate);
  };

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  resize();
  renderer.render(scene, camera);
  state.sceneReady = true;

  if (!reduceMotion) animate();

  function createPlatform() {
    const group = new THREE.Group();
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x071018,
      emissive: 0x061b21,
      metalness: 0.42,
      roughness: 0.36,
      transparent: true,
      opacity: 0.56,
    });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(2.45, 2.72, 0.08, 96), baseMaterial);
    base.scale.z = 0.42;
    group.add(base);

    const rings = [
      { radius: 1.78, color: 0x3bdcff, opacity: 0.34 },
      { radius: 2.22, color: 0x9cf56b, opacity: 0.24 },
      { radius: 2.68, color: 0xffcf5a, opacity: 0.18 },
    ];

    rings.forEach((ring) => {
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(ring.radius, 0.01, 8, 140),
        new THREE.MeshBasicMaterial({
          color: ring.color,
          transparent: true,
          opacity: ring.opacity,
          depthWrite: false,
        }),
      );
      mesh.rotation.x = Math.PI / 2;
      mesh.scale.y = 0.42;
      group.add(mesh);
    });

    return group;
  }

  function createBalancedBars() {
    const result = [];
    const materialPalette = [
      new THREE.MeshStandardMaterial({
        color: 0xffcf5a,
        emissive: 0x342500,
        metalness: 0.18,
        roughness: 0.32,
        transparent: true,
        opacity: 0.72,
      }),
      new THREE.MeshStandardMaterial({
        color: 0x3bdcff,
        emissive: 0x032a32,
        metalness: 0.16,
        roughness: 0.36,
        transparent: true,
        opacity: 0.58,
      }),
    ];

    const geometry = new THREE.BoxGeometry(0.09, 1, 0.09);
    for (let row = 0; row < 5; row += 1) {
      for (let col = 0; col < 14; col += 1) {
        const mirrored = Math.abs(col - 6.5);
        const baseHeight = 0.32 + (1 - mirrored / 6.5) * 0.62 + row * 0.035;
        const x = -0.9 + col * 0.25;
        const z = -3.28 + row * 0.26;
        const mesh = new THREE.Mesh(geometry, materialPalette[(row + col) % materialPalette.length]);
        mesh.position.set(x, -1.82 + baseHeight / 2, z);
        mesh.scale.y = baseHeight;
        result.push({
          mesh,
          baseHeight,
          speed: 0.55 + row * 0.08,
          phase: col * 0.42 + row,
        });
      }
    }

    return result;
  }

  function createHubCore() {
    const group = new THREE.Group();
    const glass = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.64, 2),
      new THREE.MeshStandardMaterial({
        color: 0x0d1b24,
        emissive: 0x0a3a47,
        metalness: 0.52,
        roughness: 0.18,
        transparent: true,
        opacity: 0.62,
      }),
    );
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(glass.geometry),
      new THREE.LineBasicMaterial({ color: 0x3bdcff, transparent: true, opacity: 0.66 }),
    );
    group.add(glass, wire);
    return group;
  }

  function createHubRings() {
    const group = new THREE.Group();
    const configs = [
      { radius: 0.98, color: 0x3bdcff, rotation: [Math.PI / 2, 0, 0] },
      { radius: 1.22, color: 0x9cf56b, rotation: [0.55, 0.15, Math.PI / 2] },
      { radius: 1.42, color: 0xffcf5a, rotation: [0.15, Math.PI / 2.4, 0.3] },
    ];

    configs.forEach((config) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(config.radius, 0.009, 8, 160),
        new THREE.MeshBasicMaterial({ color: config.color, transparent: true, opacity: 0.5, depthWrite: false }),
      );
      ring.rotation.set(...config.rotation);
      group.add(ring);
    });

    return group;
  }

  function createOrbitNodes() {
    const nodes = [];
    const labels = [
      ["API", "#3bdcff"],
      ["UI", "#9cf56b"],
      ["DATA", "#ffcf5a"],
      ["MOBILE", "#ff6f61"],
      ["OPS", "#b69cff"],
    ];

    labels.forEach(([label, color], index) => {
      const angle = (index / labels.length) * Math.PI * 2;
      const radius = 2.05;
      const node = new THREE.Group();
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.095, 24, 16),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(color),
          emissive: new THREE.Color(color).multiplyScalar(0.35),
          metalness: 0.2,
          roughness: 0.24,
        }),
      );
      const tag = createTextSprite(label, color);
      tag.position.set(0, 0.22, 0);
      node.add(sphere, tag);
      node.position.set(Math.cos(angle) * radius, Math.sin(angle) * 0.22, Math.sin(angle) * radius * 0.36);
      node.userData = {
        baseY: node.position.y,
        speed: 0.42 + index * 0.04,
      };
      nodes.push(node);
    });

    return nodes;
  }

  function createInfoPanel({ title, items, accent }) {
    const texture = createPanelTexture(title, items, accent);
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(1.72, 1),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.76,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(panel.geometry),
      new THREE.LineBasicMaterial({ color: new THREE.Color(accent), transparent: true, opacity: 0.42 }),
    );
    panel.add(edge);
    panel.userData = { baseY: panel.position.y, speed: 0.34 };
    return panel;
  }

  function createPanelTexture(title, items, accent) {
    const textureCanvas = document.createElement("canvas");
    textureCanvas.width = 640;
    textureCanvas.height = 380;
    const context = textureCanvas.getContext("2d");

    context.fillStyle = "rgba(7, 12, 18, 0.86)";
    context.fillRect(0, 0, textureCanvas.width, textureCanvas.height);
    context.strokeStyle = "rgba(255, 255, 255, 0.14)";
    context.lineWidth = 2;
    context.strokeRect(18, 18, textureCanvas.width - 36, textureCanvas.height - 36);
    context.fillStyle = accent;
    context.fillRect(38, 42, 96, 6);

    context.font = "700 34px JetBrains Mono, Consolas, monospace";
    context.fillStyle = "#f7f9fc";
    context.fillText(title, 38, 108);

    context.font = "600 28px JetBrains Mono, Consolas, monospace";
    items.forEach((item, index) => {
      context.fillStyle = index === 1 ? accent : "#dbe2ee";
      context.fillText(item, 58, 178 + index * 54);
      context.fillStyle = "rgba(255, 255, 255, 0.1)";
      context.fillRect(38, 160 + index * 54, 8, 28);
    });

    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }

  function createTextSprite(text, color) {
    const spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = 256;
    spriteCanvas.height = 96;
    const context = spriteCanvas.getContext("2d");

    context.fillStyle = "rgba(6, 9, 14, 0.72)";
    context.fillRect(20, 20, 216, 56);
    context.strokeStyle = color;
    context.lineWidth = 3;
    context.strokeRect(20, 20, 216, 56);
    context.font = "700 28px JetBrains Mono, Consolas, monospace";
    context.fillStyle = "#f7f9fc";
    context.textAlign = "center";
    context.fillText(text, 128, 57);

    const texture = new THREE.CanvasTexture(spriteCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.8 }));
    sprite.scale.set(0.7, 0.26, 1);
    return sprite;
  }

  function createSubtleParticles() {
    const positions = [];
    const colors = [];
    const palette = [new THREE.Color(0x3bdcff), new THREE.Color(0x9cf56b), new THREE.Color(0xffcf5a)];

    for (let i = 0; i < 160; i += 1) {
      const angle = (i / 160) * Math.PI * 8;
      const radius = 2.2 + (i % 17) * 0.12;
      positions.push(Math.cos(angle) * radius, -0.2 + Math.sin(i * 0.43) * 1.2, -3.2 + Math.sin(angle) * 0.9);
      const color = palette[i % palette.length];
      colors.push(color.r, color.g, color.b);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    return new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        size: 0.018,
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      }),
    );
  }
}

initMobileNav();
initScrollProgress();
initActiveNav();
initReveal();
initCounters();
initTilt();
initMagnetic();
createArchitectureScene();
