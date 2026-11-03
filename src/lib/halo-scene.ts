/**
 * Homepage scroll-driven WebGL scene (browser only).
 * Dynamically imported from the index route after hydration.
 */
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import Lenis from "lenis";
import {
  backgroundFragmentShader,
  backgroundVertexShader,
  particleFragmentShader,
  particleVertexShader,
} from "./halo-shaders";

type GroupKey = "hero" | "wave" | "galaxy";
type GroupState = "visible" | "after" | "before";

export function initHaloScene(root: HTMLElement): () => void {
  const container = root.querySelector<HTMLElement>("#webgl");
  const glow = root.querySelector<HTMLElement>("#glow");
  const dnaContainer = root.querySelector<HTMLElement>("#dna");
  if (!container || !glow || !dnaContainer) return () => {};

  /* ---------- Titles + reveal groups ---------- */
  const titles: Record<string, HTMLElement> = {};
  root.querySelectorAll<HTMLElement>("[data-title]").forEach((el) => {
    titles[el.dataset["title"] as string] = el;
  });
  const playTitle = (key: string) => {
    const el = titles[key];
    if (el && !el.classList.contains("played")) el.classList.add("played");
  };

  const groups: Record<GroupKey, HTMLElement[]> = { hero: [], wave: [], galaxy: [] };
  root.querySelectorAll<HTMLElement>("[data-rv]").forEach((el) => {
    groups[el.dataset["rv"] as GroupKey]?.push(el);
  });
  const applied: Record<GroupKey, GroupState | null> = { hero: null, wave: null, galaxy: null };
  const setGroup = (key: GroupKey, state: GroupState) => {
    if (applied[key] === state) return;
    applied[key] = state;
    for (const el of groups[key]) {
      el.classList.toggle("is-visible", state === "visible");
      el.classList.toggle("is-leaving", state === "after");
    }
  };
  setGroup("hero", "visible");
  const firstRaf = requestAnimationFrame(() => playTitle("hero"));

  const dnaCards = [...root.querySelectorAll<HTMLElement>(".dna-card-slot")];
  const ANGLE_OFFSETS = [0, (4 * Math.PI) / 3, (2 * Math.PI) / 3];
  const Y_OFFSETS = [-150, 0, 150];

  /* ---------- WebGL ---------- */
  let renderer: THREE.WebGLRenderer | null = null;
  let composer: EffectComposer | null = null;
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 8;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const bgUniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0.0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    color1: { value: new THREE.Color("#ff4c33") },
    color2: { value: new THREE.Color("#3366ff") },
  };
  const fgUniforms = { uTime: { value: 0 }, uScroll: { value: 0.0 }, uIntro: { value: 0.0 } };
  const bgMaterial = new THREE.ShaderMaterial({
    uniforms: bgUniforms,
    vertexShader: backgroundVertexShader,
    fragmentShader: backgroundFragmentShader,
    depthWrite: false,
  });
  const material = new THREE.ShaderMaterial({
    uniforms: fgUniforms,
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const bgGeometry = new THREE.PlaneGeometry(2, 2);
  // The original 200 × 600 sphere produced over 120,000 particles. This scene
  // is shader-heavy (noise, morphing, bloom), so use a density that preserves
  // the particle-cloud appearance without monopolising the main thread during
  // keyboard and scroll input.
  const isSmallScreen = window.matchMedia("(max-width: 768px)").matches;
  const geometry = new THREE.SphereGeometry(
    4.2,
    isSmallScreen ? 104 : 144,
    isSmallScreen ? 240 : 360,
  );
  const particles = new THREE.Points(geometry, material);
  particles.frustumCulled = false;
  scene.add(particles);

  try {
    // Keep the original canvas compositing configuration: the fixed WebGL
    // layer must stay transparent behind the HTML overlays on mobile browsers.
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmallScreen ? 1 : 1.5));
    renderer.autoClear = false;
    container.appendChild(renderer.domElement);

    const bgScene = new THREE.Scene();
    const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    bgScene.add(new THREE.Mesh(bgGeometry, bgMaterial));

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(bgScene, bgCamera));
    const renderFg = new RenderPass(scene, camera);
    renderFg.clear = false;
    renderFg.clearDepth = true;
    composer.addPass(renderFg);
    composer.addPass(
      new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.5, 0.05),
    );
  } catch (err) {
    console.warn("WebGL unavailable, rendering without background scene", err);
    renderer = null;
    composer = null;
  }

  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer?.setSize(window.innerWidth, window.innerHeight);
    composer?.setSize(window.innerWidth, window.innerHeight);
    bgUniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  };
  window.addEventListener("resize", handleResize);

  /* ---------- Smooth scroll ---------- */
  window.scrollTo(0, 0);
  const lenis = new Lenis({ smoothWheel: true });

  /* ---------- Render loop ---------- */
  let time = 0;
  const INTRO_MS = 2600;
  let introStart = 0;
  let rafId = 0;
  let isPageVisible = !document.hidden;
  let previousScroll = -1;
  const lookTarget = new THREE.Vector3();

  function frame(now: number) {
    if (!isPageVisible) {
      rafId = 0;
      return;
    }

    lenis.raf(now);
    time += 0.005;

    if (introStart === 0) introStart = now;
    const introRaw = Math.min((now - introStart) / INTRO_MS, 1);
    const introEased = 1 - Math.pow(1 - introRaw, 3);
    fgUniforms.uIntro.value = introEased;

    const doc = document.documentElement;
    const maxScroll = doc.scrollHeight - doc.clientHeight;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const currentScroll = maxScroll > 0 ? scrollTop / maxScroll : 0;

    fgUniforms.uTime.value = time;
    fgUniforms.uScroll.value = currentScroll;
    bgUniforms.uTime.value = time;
    bgUniforms.uScroll.value = currentScroll;

    // Camera & rotation
    const panProgress = Math.min(currentScroll / 0.5, 1.0);
    const smoothPan = panProgress * panProgress * (3.0 - 2.0 * panProgress);
    const flyPhase = currentScroll < 0.5 ? 0.0 : Math.min((currentScroll - 0.5) / 0.35, 1.0);
    const blackHoleDive = currentScroll < 0.8 ? 0.0 : Math.min((currentScroll - 0.8) / 0.12, 1.0);

    camera.position.y = -38.0 * smoothPan + 5.0 * Math.pow(blackHoleDive, 2.0);
    camera.position.z = 8.0 - 4.0 * smoothPan - 55.0 * flyPhase;

    const galaxyPullback =
      currentScroll < 0.93 ? 0.0 : Math.min((currentScroll - 0.93) / 0.07, 1.0);
    const smoothPullback = galaxyPullback * galaxyPullback * (3.0 - 2.0 * galaxyPullback);
    camera.position.z += 75.0 * smoothPullback;
    camera.position.y += 35.0 * smoothPullback;

    let waveTilt = 0.0;
    if (currentScroll > 0.3 && currentScroll < 0.7) {
      const tiltProgress = (currentScroll - 0.3) / 0.4;
      waveTilt = Math.sin(tiltProgress * Math.PI) * 15.0;
    }
    const lookY = THREE.MathUtils.lerp(camera.position.y + waveTilt, -33.0, smoothPullback);
    const lookZ = THREE.MathUtils.lerp(camera.position.z - 100.0, -120.0, smoothPullback);

    const introZoom = (1 - introEased) * -3.0 * (1 - Math.min(currentScroll / 0.05, 1));
    camera.position.z += introZoom;
    camera.lookAt(lookTarget.set(0, lookY, lookZ));

    particles.rotation.y = smoothPan * Math.PI * 2.0;
    particles.rotation.x = Math.sin(smoothPan * Math.PI) * 0.15;
    camera.rotation.z = 0.0;

    // DOM updates only need to happen when Lenis has actually moved the page.
    // Avoiding style writes on every rendered frame keeps keyboard input responsive.
    if (Math.abs(currentScroll - previousScroll) > 0.00001) {
      previousScroll = currentScroll;

      // Big-bang flash
      const glowScaleProgress =
        currentScroll < 0.9 ? 0.0 : Math.min((currentScroll - 0.9) / 0.03, 1.0);
      const glowScale = Math.pow(glowScaleProgress, 4.0) * 400.0;
      const hideGlow = currentScroll < 0.93 ? 0.0 : Math.min((currentScroll - 0.93) / 0.02, 1.0);
      glow!.style.transform = `translate(-50%, -50%) scale(${glowScale})`;
      glow!.style.opacity = `${1.0 - hideGlow}`;

      // Overlay windows
      setGroup("hero", currentScroll < 0.02 ? "visible" : "after");
      const waveState: GroupState =
        currentScroll < 0.48 ? "before" : currentScroll <= 0.62 ? "visible" : "after";
      setGroup("wave", waveState);
      if (waveState !== "before") playTitle("wave");
      const galaxyState: GroupState = currentScroll >= 0.93 ? "visible" : "before";
      setGroup("galaxy", galaxyState);
      if (galaxyState === "visible") playTitle("galaxy");

      // DNA stat cards
      let dnaOpacity = 0;
      const cs = currentScroll;
      if (cs > 0.15 && cs < 0.38) {
        dnaOpacity = Math.min((cs - 0.15) / 0.03, 1);
        if (cs > 0.35) dnaOpacity = Math.max(1 - (cs - 0.35) / 0.03, 0);
      }
      dnaContainer!.style.opacity = `${dnaOpacity}`;

      if (dnaOpacity > 0) {
        const dnaProgress = (cs - 0.15) / 0.23;
        const globalYOffset = 600 - dnaProgress * 1200;
        const baseAngle = dnaProgress * Math.PI * 2;
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const rx = Math.min(window.innerWidth * 0.35, 400);
        const ry = 80;
        dnaCards.forEach((el, i) => {
          const angle = baseAngle + (ANGLE_OFFSETS[i] ?? 0);
          const x = cx + Math.cos(angle) * rx;
          const y = cy + Math.sin(angle) * ry + globalYOffset + (Y_OFFSETS[i] ?? 0);
          const scale = 0.8 + 0.2 * Math.sin(angle);
          const opacity = 0.4 + 0.6 * Math.sin(angle);
          el.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) scale(${scale}) rotateY(${angle - Math.PI / 2}rad)`;
          el.style.opacity = `${opacity}`;
          el.style.zIndex = `${Math.round(scale * 100)}`;
        });
      }
    }

    composer?.render();
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);

  const handleVisibilityChange = () => {
    isPageVisible = !document.hidden;
    if (isPageVisible && rafId === 0) rafId = requestAnimationFrame(frame);
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    cancelAnimationFrame(firstRaf);
    cancelAnimationFrame(rafId);
    window.removeEventListener("resize", handleResize);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    lenis.destroy();
    geometry.dispose();
    bgGeometry.dispose();
    material.dispose();
    bgMaterial.dispose();
    composer?.dispose();
    if (renderer) {
      renderer.dispose();
      renderer.domElement.remove();
    }
  };
}
