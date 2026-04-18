let canvas;
let statusLabel;
let pageLoader;
let heroOverlay;
let heroContent;
let controlsOverlay;
let startButton;
let confirmControls;

let mapButtons = [];
let skinButtons = [];
let meshButtons = [];
let effectButtons = [];
let controlButtons = [];

const initDomRefs = () => {
  canvas = document.getElementById("renderCanvas");
  statusLabel = document.getElementById("scene-status");
  pageLoader = document.getElementById("page-loader");
  heroOverlay = document.querySelector(".hero-overlay");
  heroContent = document.querySelector(".hero-content");
  controlsOverlay = document.getElementById("controls-overlay");
  startButton = document.getElementById("start-button");
  confirmControls = document.getElementById("confirm-controls");
  mapButtons = [...document.querySelectorAll("[data-map-mode]")];
  skinButtons = [...document.querySelectorAll("[data-skin-mode]")];
  meshButtons = [...document.querySelectorAll("[data-mesh-mode]")];
  effectButtons = [...document.querySelectorAll("[data-effect]")];
  controlButtons = [...document.querySelectorAll(".control-button")];
};

let engine;
let scene;
let camera;
let earthMesh;
let populationMesh;
let nightMesh;
let atmosphereShell;
let cloudShell;
let pipeline;
let currentMeshMode = "sphere";
let pendingSelection = null;
let isApplyingSelection = false;
let hasEnteredViewingMode = false;
let radiusBeforeMenuOpen = null;
let isMenuReengageInProgress = false;
let isMenuReengageReady = false;
let menuReengageFrameId = 0;

const meshSetCache = {
  sphere: null,
  icosphere: null,
  poly: null,
};

let currentMapMode = "day";
let currentSkinMode = "realistic";

const effectsState = {
  atmosphere: true,
  glow: false,
  spin: false,
};

const materials = {
  earth: null,
  population: null,
  night: null,
  atmosphere: null,
  cloud: null,
};

const safeAddEventListener = (element, eventName, handler) => {
  if (!element || typeof element.addEventListener !== "function") {
    return;
  }

  element.addEventListener(eventName, handler);
};

const setControlsDisabled = (disabled) => {
  controlButtons.forEach((button) => {
    button.disabled = disabled;
  });
};

const setStatus = (message) => {
  if (statusLabel) {
    statusLabel.textContent = message;
  }
};

const hideStatus = () => {
  if (statusLabel) {
    statusLabel.style.display = "none";
  }
};

const hidePageLoader = () => {
  if (!pageLoader) {
    return;
  }

  pageLoader.classList.add("hidden");
  document.body.classList.remove("loading");
};

const setMenuReengageProgress = (value) => {
  if (!heroContent) {
    return;
  }

  heroContent.style.setProperty("--reengage-progress", String(value));
};

const resetMenuReengageState = () => {
  if (menuReengageFrameId) {
    window.cancelAnimationFrame(menuReengageFrameId);
    menuReengageFrameId = 0;
  }

  isMenuReengageInProgress = false;
  isMenuReengageReady = false;

  if (heroContent) {
    heroContent.classList.remove("menu-arming", "menu-ready");
  }

  setMenuReengageProgress(0);
};

const animateCameraRadius = (targetRadius, frameCount = 26) => {
  if (!camera) {
    return;
  }

  if (!scene || !BABYLON?.Animation?.CreateAndStartAnimation) {
    camera.radius = targetRadius;
    return;
  }

  BABYLON.Animation.CreateAndStartAnimation(
    "cameraRadiusTransition",
    camera,
    "radius",
    60,
    frameCount,
    camera.radius,
    targetRadius,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );
};

const beginMenuReengageSequence = () => {
  if (!hasEnteredViewingMode || isMenuReengageReady || isMenuReengageInProgress) {
    return;
  }

  if (!controlsOverlay?.classList.contains("hidden")) {
    return;
  }

  if (!heroContent) {
    return;
  }

  isMenuReengageInProgress = true;
  heroContent.classList.remove("menu-ready");
  heroContent.classList.add("menu-arming");
  setMenuReengageProgress(0);

  const durationMs = 1200;
  const startedAt = performance.now();

  const tick = (timestamp) => {
    const progress = Math.min((timestamp - startedAt) / durationMs, 1);
    setMenuReengageProgress(progress);

    if (progress < 1) {
      menuReengageFrameId = window.requestAnimationFrame(tick);
      return;
    }

    menuReengageFrameId = 0;
    isMenuReengageInProgress = false;
    isMenuReengageReady = true;
    heroContent.classList.remove("menu-arming");
    heroContent.classList.add("menu-ready");

    if (heroOverlay) {
      heroOverlay.classList.remove("drift-away");
      heroOverlay.classList.add("menu-reengage");
    }
  };

  menuReengageFrameId = window.requestAnimationFrame(tick);
};

const showControlsOverlay = () => {
  if (controlsOverlay) {
    controlsOverlay.classList.remove("hidden");
    controlsOverlay.setAttribute("aria-hidden", "false");
  }

  if (heroOverlay) {
    heroOverlay.classList.remove("drift-away");
    heroOverlay.classList.add("menu-reengage");
  }

  if (heroContent) {
    heroContent.classList.remove("menu-arming", "menu-ready");
  }

  setMenuReengageProgress(0);

  if (hasEnteredViewingMode && camera) {
    radiusBeforeMenuOpen = camera.radius;
    const maxRadius = Math.max((camera.upperRadiusLimit || 11) - 0.2, camera.radius);
    const zoomedOutRadius = Math.min(maxRadius, camera.radius + 1.2);
    animateCameraRadius(zoomedOutRadius, 20);
  }

  pendingSelection = {
    mapMode: currentMapMode,
    skinMode: currentSkinMode,
    meshMode: currentMeshMode,
    effects: {
      atmosphere: effectsState.atmosphere,
      glow: effectsState.glow,
      spin: effectsState.spin,
    },
  };

  setButtonGroupState(mapButtons, pendingSelection.mapMode, "data-map-mode");
  setButtonGroupState(skinButtons, pendingSelection.skinMode, "data-skin-mode");
  setButtonGroupState(meshButtons, pendingSelection.meshMode, "data-mesh-mode");
  setEffectButtonState("atmosphere", pendingSelection.effects.atmosphere);
  setEffectButtonState("glow", pendingSelection.effects.glow);
  setEffectButtonState("spin", pendingSelection.effects.spin);
};

const hideControlsOverlay = () => {
  if (controlsOverlay) {
    controlsOverlay.classList.add("hidden");
    controlsOverlay.setAttribute("aria-hidden", "true");
  }

  if (heroOverlay) {
    heroOverlay.classList.remove("menu-reengage");
    heroOverlay.classList.add("drift-away");
  }

  if (hasEnteredViewingMode && camera && radiusBeforeMenuOpen !== null) {
    animateCameraRadius(radiusBeforeMenuOpen, 24);
  }

  radiusBeforeMenuOpen = null;

  // After each completed menu cycle, require one re-engage sequence before next open.
  resetMenuReengageState();

  hasEnteredViewingMode = true;
};

const commitControlsSelectionAndExit = async (event) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (isApplyingSelection) {
    return;
  }

  hideControlsOverlay();
  await applyPendingSelection();
};

const setButtonGroupState = (buttons, activeValue, attrName) => {
  buttons.forEach((button) => {
    const isActive = button.getAttribute(attrName) === activeValue;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
};

const setEffectButtonState = (effectName, active) => {
  const button = effectButtons.find((item) => item.dataset.effect === effectName);
  if (!button) {
    return;
  }

  button.classList.toggle("active", active);
  button.setAttribute("aria-pressed", String(active));
};

const setCurrentGlobeVisibility = (isVisible) => {
  if (!earthMesh || !populationMesh || !nightMesh) {
    return;
  }

  if (!isVisible) {
    earthMesh.isVisible = false;
    populationMesh.isVisible = false;
    nightMesh.isVisible = false;

    if (atmosphereShell) {
      atmosphereShell.isVisible = false;
    }

    if (cloudShell) {
      cloudShell.isVisible = false;
    }

    return;
  }

  applyMapMode(currentMapMode);
  setAtmosphereEffect(effectsState.atmosphere);
};

const startParticleAssemblyIntro = (sceneRef, onProgress = () => {}) => {
  const PARTICLE_COUNT = 2200;
  const ROAM_DURATION = 2.7;
  const ASSEMBLY_DURATION = 3.8;
  const TOTAL_DURATION = ROAM_DURATION + ASSEMBLY_DURATION;
  const EARTH_RADIUS = 1;
  const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

  return new Promise((resolve) => {
    const particles = new BABYLON.PointsCloudSystem("earthAssemblyIntro", { pointSize: 2.2 }, sceneRef);
    const targetPositions = [];
    const driftVectors = [];
    const phaseOffsets = [];
    const orbitOffsets = [];

    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      const y = 1 - ((index + 0.5) / PARTICLE_COUNT) * 2;
      const radial = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = GOLDEN_ANGLE * index;
      targetPositions.push(
        new BABYLON.Vector3(Math.cos(theta) * radial * EARTH_RADIUS, y * EARTH_RADIUS, Math.sin(theta) * radial * EARTH_RADIUS)
      );

      driftVectors.push(
        new BABYLON.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02)
      );
      phaseOffsets.push(Math.random() * Math.PI * 2);
      orbitOffsets.push(Math.random() * Math.PI * 2);
    }

    particles.addPoints(PARTICLE_COUNT, (particle, index) => {
      const orbitRadius = 3.1 + Math.random() * 3.9;
      const orbitAngle = orbitOffsets[index];
      const verticalRange = (Math.random() - 0.5) * 4.8;

      particle.position = new BABYLON.Vector3(
        Math.cos(orbitAngle) * orbitRadius,
        verticalRange,
        Math.sin(orbitAngle) * orbitRadius
      );

      particle.color = new BABYLON.Color4(0.73, 0.84, 0.94, 0.9);
    });

    particles
      .buildMeshAsync()
      .then(() => {
        const startTime = performance.now();
        const animationState = { elapsed: 0 };

        particles.updateParticle = (particle) => {
          const index = particle.idx;
          const elapsed = animationState.elapsed;
          const roamRatio = BABYLON.Scalar.Clamp(elapsed / ROAM_DURATION, 0, 1);
          const assembleRatio = BABYLON.Scalar.Clamp(
            (elapsed - ROAM_DURATION * 0.42) / ASSEMBLY_DURATION,
            0,
            1
          );
          const joinStrength = BABYLON.Scalar.SmoothStep(0, 1, assembleRatio);

          const drift = driftVectors[index];
          const driftScale = 1 - joinStrength;
          particle.position.x +=
            (drift.x + Math.sin(elapsed * 1.5 + phaseOffsets[index]) * 0.0038) * driftScale;
          particle.position.y +=
            (drift.y + Math.sin(elapsed * 1.2 + phaseOffsets[index] * 0.7) * 0.0032) * driftScale;
          particle.position.z +=
            (drift.z + Math.cos(elapsed * 1.35 + phaseOffsets[index]) * 0.0038) * driftScale;

          const spiral = (1 - roamRatio) * 0.02;
          const spiralAngle = elapsed * 0.5 + orbitOffsets[index];
          particle.position.x += Math.cos(spiralAngle) * spiral;
          particle.position.z += Math.sin(spiralAngle) * spiral;

          const target = targetPositions[index];
          const pullForce = 0.012 + joinStrength * 0.16;
          particle.position.x += (target.x - particle.position.x) * pullForce;
          particle.position.y += (target.y - particle.position.y) * pullForce;
          particle.position.z += (target.z - particle.position.z) * pullForce;

          const shimmer = (1 - joinStrength) * 0.13;
          particle.color.r = 0.54 + joinStrength * 0.24 + Math.sin(elapsed * 3 + phaseOffsets[index]) * shimmer * 0.07;
          particle.color.g = 0.67 + joinStrength * 0.2 + Math.cos(elapsed * 2.4 + phaseOffsets[index]) * shimmer * 0.07;
          particle.color.b = 0.8 + joinStrength * 0.14;
          particle.color.a = 0.35 + joinStrength * 0.65;
          return particle;
        };

        const frameObserver = sceneRef.onBeforeRenderObservable.add(() => {
          animationState.elapsed = (performance.now() - startTime) / 1000;
          particles.setParticles();

          const totalProgress = BABYLON.Scalar.Clamp(animationState.elapsed / TOTAL_DURATION, 0, 1);
          onProgress(totalProgress);

          if (animationState.elapsed >= TOTAL_DURATION) {
            sceneRef.onBeforeRenderObservable.remove(frameObserver);
            particles.dispose();
            resolve();
          }
        });
      })
      .catch((error) => {
        console.warn("Particle intro failed to initialize, continuing startup.", error);
        particles.dispose();
        resolve();
      });
  });
};

const getMeshSurfacePoint = (meshMode, index, totalPoints, radius = 1) => {
  const u = (index + 0.5) / totalPoints;
  const v = (index * 0.61803398875) % 1;
  const theta = 2 * Math.PI * v;
  const phi = Math.acos(1 - 2 * u);

  let x = Math.sin(phi) * Math.cos(theta);
  let y = Math.cos(phi);
  let z = Math.sin(phi) * Math.sin(theta);

  if (meshMode === "icosphere") {
    const quantize = 0.2;
    x = Math.round(x / quantize) * quantize;
    y = Math.round(y / quantize) * quantize;
    z = Math.round(z / quantize) * quantize;
  }

  if (meshMode === "poly") {
    const quantize = 0.36;
    x = Math.round(x / quantize) * quantize;
    y = Math.round(y / quantize) * quantize;
    z = Math.round(z / quantize) * quantize;
  }

  const normalized = new BABYLON.Vector3(x, y, z).normalize();
  return normalized.scale(radius);
};

const runMeshTransitionParticles = (sceneRef, fromMeshMode, toMeshMode) => {
  if (!sceneRef || fromMeshMode === toMeshMode) {
    return Promise.resolve();
  }

  const particleCount = 1700;
  const durationMs = 1200;
  const sourcePoints = [];
  const targetPoints = [];

  for (let index = 0; index < particleCount; index += 1) {
    sourcePoints.push(getMeshSurfacePoint(fromMeshMode, index, particleCount, 1));
    targetPoints.push(getMeshSurfacePoint(toMeshMode, index, particleCount, 1));
  }

  const particles = new BABYLON.PointsCloudSystem("meshSwitchParticles", { pointSize: 2.1 }, sceneRef);

  particles.addPoints(particleCount, (particle, index) => {
    particle.position = sourcePoints[index].clone();
    particle.color = new BABYLON.Color4(0.58, 0.73, 0.86, 0.9);
  });

  return particles
    .buildMeshAsync()
    .then(() =>
      new Promise((resolve) => {
        const startTs = performance.now();
        let blend = 0;

        particles.updateParticle = (particle) => {
          const idx = particle.idx;
          const eased = BABYLON.Scalar.SmoothStep(0, 1, blend);
          const from = sourcePoints[idx];
          const to = targetPoints[idx];

          particle.position.x = from.x + (to.x - from.x) * eased;
          particle.position.y = from.y + (to.y - from.y) * eased;
          particle.position.z = from.z + (to.z - from.z) * eased;

          particle.color.r = 0.56 + eased * 0.2;
          particle.color.g = 0.72 + eased * 0.14;
          particle.color.b = 0.85 + eased * 0.1;
          particle.color.a = 0.38 + eased * 0.62;
          return particle;
        };

        const observer = sceneRef.onBeforeRenderObservable.add(() => {
          blend = BABYLON.Scalar.Clamp((performance.now() - startTs) / durationMs, 0, 1);
          particles.setParticles();

          if (blend >= 1) {
            sceneRef.onBeforeRenderObservable.remove(observer);
            particles.dispose();
            resolve();
          }
        });
      })
    )
    .catch((error) => {
      console.warn("Mesh transition particle effect failed, applying mesh directly.", error);
      particles.dispose();
    });
};

const applyPendingSelection = async () => {
  if (!pendingSelection || isApplyingSelection || !scene) {
    return;
  }

  isApplyingSelection = true;
  setControlsDisabled(true);

  const selectedState = pendingSelection;
  pendingSelection = null;

  const meshChanged = selectedState.meshMode !== currentMeshMode;
  if (meshChanged) {
    setStatus("Reshaping globe from particles...");
    setCurrentGlobeVisibility(false);
    await runMeshTransitionParticles(scene, currentMeshMode, selectedState.meshMode);
    buildMeshSet(selectedState.meshMode);
  }

  applyMapMode(selectedState.mapMode);
  applySkinMode(selectedState.skinMode);
  setAtmosphereEffect(selectedState.effects.atmosphere);
  setGlowEffect(selectedState.effects.glow);
  setSpinEffect(selectedState.effects.spin);
  setCurrentGlobeVisibility(true);

  if (hasEnteredViewingMode) {
    setStatus("Viewing mode active.");
    window.setTimeout(() => {
      hideStatus();
    }, 900);
  }

  setControlsDisabled(false);
  isApplyingSelection = false;
};

const createTexture = (path, sceneRef, onLoaded, onError) => {
  const texture = new BABYLON.Texture(
    path,
    sceneRef,
    false,
    true,
    BABYLON.Texture.TRILINEAR_SAMPLINGMODE,
    () => onLoaded(path),
    (message, exception) => onError(path, message, exception)
  );

  texture.vScale = -1;
  return texture;
};

const createPlanetMesh = (name, meshMode, sceneRef, size = 1) => {
  if (meshMode === "icosphere") {
    return BABYLON.MeshBuilder.CreateIcoSphere(name, { radius: size, subdivisions: 4 }, sceneRef);
  }

  if (meshMode === "poly") {
    return BABYLON.MeshBuilder.CreatePolyhedron(name, { type: 2, size }, sceneRef);
  }

  return BABYLON.MeshBuilder.CreateSphere(name, { diameter: size * 2, segments: 64 }, sceneRef);
};

const disposeMeshSet = (meshSet) => {
  if (!meshSet) {
    return;
  }

  [meshSet.earth, meshSet.population, meshSet.night, meshSet.atmosphere, meshSet.cloud].forEach(
    (mesh) => {
      if (mesh && !mesh.isDisposed()) {
        mesh.dispose(false, true);
      }
    }
  );
};

const disposeCurrentMeshes = () => {
  [earthMesh, populationMesh, nightMesh, atmosphereShell, cloudShell].forEach((mesh) => {
    if (mesh && !mesh.isDisposed()) {
      mesh.dispose(false, true);
    }
  });
};

const setMeshSetVisibility = (meshSet, isVisible) => {
  if (!meshSet) {
    return;
  }

  meshSet.earth.isVisible = isVisible;
  meshSet.population.isVisible = false;
  meshSet.night.isVisible = false;
  meshSet.atmosphere.isVisible = isVisible && effectsState.atmosphere;
  meshSet.cloud.isVisible = isVisible && effectsState.atmosphere;
};

const createMeshSet = (meshMode) => {
  const modeSuffix = `${meshMode}Mesh`;

  const meshSet = {
    earth: createPlanetMesh(`earth-${modeSuffix}`, meshMode, scene, 1),
    population: createPlanetMesh(`population-${modeSuffix}`, meshMode, scene, 1),
    night: createPlanetMesh(`night-${modeSuffix}`, meshMode, scene, 1),
    atmosphere: createPlanetMesh(`atmosphere-${modeSuffix}`, meshMode, scene, 1.045),
    cloud: createPlanetMesh(`cloud-${modeSuffix}`, meshMode, scene, 1.028),
  };

  meshSet.earth.material = materials.earth;
  meshSet.population.material = materials.population;
  meshSet.night.material = materials.night;
  meshSet.atmosphere.material = materials.atmosphere;
  meshSet.cloud.material = materials.cloud;

  setMeshSetVisibility(meshSet, false);
  return meshSet;
};

const setActiveMeshSet = (meshMode) => {
  const nextMeshSet = meshSetCache[meshMode] || createMeshSet(meshMode);
  meshSetCache[meshMode] = nextMeshSet;

  const previousMeshSet = meshSetCache[currentMeshMode];
  if (previousMeshSet && previousMeshSet !== nextMeshSet) {
    setMeshSetVisibility(previousMeshSet, false);
  }

  earthMesh = nextMeshSet.earth;
  populationMesh = nextMeshSet.population;
  nightMesh = nextMeshSet.night;
  atmosphereShell = nextMeshSet.atmosphere;
  cloudShell = nextMeshSet.cloud;

  setMeshSetVisibility(nextMeshSet, true);
  currentMeshMode = meshMode;
};

const applyMapMode = (modeName) => {
  currentMapMode = modeName;

  if (!earthMesh || !populationMesh || !nightMesh) {
    return;
  }

  earthMesh.isVisible = modeName === "day";
  populationMesh.isVisible = modeName === "population";
  nightMesh.isVisible = modeName === "night";
  setButtonGroupState(mapButtons, modeName, "data-map-mode");
};

const applySkinMode = (skinMode) => {
  if (skinMode === currentSkinMode) {
    return;
  }

  currentSkinMode = skinMode;

  const mapMaterials = [materials.earth, materials.population, materials.night];
  mapMaterials.forEach((material) => {
    if (!material) {
      return;
    }

    material.wireframe = false;
    material.alpha = 1;
    material.specularColor = new BABYLON.Color3(0.2, 0.24, 0.25);
    material.emissiveColor = BABYLON.Color3.Black();
  });

  if (skinMode === "colormap") {
    mapMaterials.forEach((material) => {
      if (!material) {
        return;
      }

      material.specularColor = new BABYLON.Color3(0.02, 0.02, 0.02);
      material.emissiveColor = new BABYLON.Color3(0.1, 0.14, 0.18);
    });
  }

  if (materials.earth?.bumpTexture) {
    materials.earth.bumpTexture.level = skinMode === "realistic" ? 1.15 : 0.35;
  }

  setButtonGroupState(skinButtons, skinMode, "data-skin-mode");
};

const setAtmosphereEffect = (isActive) => {
  effectsState.atmosphere = isActive;

  if (atmosphereShell) {
    atmosphereShell.isVisible = isActive;
  }

  if (cloudShell) {
    cloudShell.isVisible = isActive;
  }

  setEffectButtonState("atmosphere", isActive);
};

const setGlowEffect = (isActive) => {
  effectsState.glow = isActive;

  if (pipeline) {
    pipeline.bloomEnabled = isActive;
    pipeline.bloomThreshold = 0.74;
    pipeline.bloomWeight = isActive ? 0.78 : 0;
    pipeline.bloomKernel = 64;
  }

  setEffectButtonState("glow", isActive);
};

const setSpinEffect = (isActive) => {
  effectsState.spin = isActive;
  setEffectButtonState("spin", isActive);
};

const buildMeshSet = (meshMode) => {
  if (!scene || !meshSetCache[meshMode] && !materials.earth) {
    return;
  }

  if (meshMode === currentMeshMode && earthMesh && populationMesh && nightMesh) {
    return;
  }

  setActiveMeshSet(meshMode);

  setButtonGroupState(meshButtons, meshMode, "data-mesh-mode");
  applyMapMode(currentMapMode);
  setAtmosphereEffect(effectsState.atmosphere);
  applySkinMode(currentSkinMode);
};

const createScene = () => {
  const sceneRef = new BABYLON.Scene(engine);

  camera = new BABYLON.ArcRotateCamera(
    "camera",
    Math.PI / 2,
    Math.PI / 2.2,
    5,
    new BABYLON.Vector3(0, 0, 0),
    sceneRef
  );
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 2;
  camera.upperRadiusLimit = 11;
  camera.lowerBetaLimit = 0.2;
  camera.upperBetaLimit = Math.PI - 0.2;

  const hemiLight = new BABYLON.HemisphericLight(
    "hemiLight",
    new BABYLON.Vector3(1, 1, 0),
    sceneRef
  );
  hemiLight.intensity = 1.1;

  const keyLight = new BABYLON.PointLight("keyLight", new BABYLON.Vector3(4, 2, -4), sceneRef);
  keyLight.intensity = 0.65;

  pipeline = new BABYLON.DefaultRenderingPipeline("dashboardPipeline", false, sceneRef, [camera]);

  const texturePaths = [
    "assets/maps/earth_daymap.jpg",
    "assets/maps/earth_normal_map.jpeg",
    "assets/maps/pop_density_map.jpg",
    "assets/maps/earth_nightmap.jpg",
  ];

  let loadedTextures = 0;
  let failedTextures = 0;
  const totalTextures = texturePaths.length + 1;
  let texturesReady = false;
  let introReady = false;
  let startupFinalized = false;

  const finalizeStartup = () => {
    if (startupFinalized || !texturesReady || !introReady) {
      return;
    }

    startupFinalized = true;
    setCurrentGlobeVisibility(true);
    setStatus("Scene ready.");
    setControlsDisabled(false);
    window.setTimeout(() => {
      hideStatus();
      hidePageLoader();
    }, 420);
  };

  const updateLoading = () => {
    const complete = loadedTextures + failedTextures;

    if (complete < totalTextures) {
      setStatus(`Loading scene assets (${complete}/${totalTextures})...`);
      return;
    }

    texturesReady = true;

    if (!introReady) {
      setStatus("Particles are assembling Earth...");
      return;
    }

    if (failedTextures > 0) {
      setStatus(`Loaded with ${failedTextures} texture warning${failedTextures > 1 ? "s" : ""}.`);
    }

    finalizeStartup();
  };

  const onLoaded = () => {
    loadedTextures += 1;
    updateLoading();
  };

  const onError = (path, message) => {
    failedTextures += 1;
    console.error(`Failed to load texture: ${path}`, message);
    updateLoading();
  };

  materials.earth = new BABYLON.StandardMaterial("earthMaterial", sceneRef);
  materials.earth.diffuseTexture = createTexture(texturePaths[0], sceneRef, onLoaded, onError);
  materials.earth.bumpTexture = createTexture(texturePaths[1], sceneRef, onLoaded, onError);

  materials.population = new BABYLON.StandardMaterial("populationMaterial", sceneRef);
  materials.population.diffuseTexture = createTexture(texturePaths[2], sceneRef, onLoaded, onError);

  materials.night = new BABYLON.StandardMaterial("nightMaterial", sceneRef);
  materials.night.diffuseTexture = createTexture(texturePaths[3], sceneRef, onLoaded, onError);

  materials.atmosphere = new BABYLON.StandardMaterial("atmosphereMaterial", sceneRef);
  materials.atmosphere.emissiveColor = new BABYLON.Color3(0.2, 0.58, 0.9);
  materials.atmosphere.alpha = 0.18;
  materials.atmosphere.backFaceCulling = false;
  materials.atmosphere.disableLighting = true;

  materials.cloud = new BABYLON.StandardMaterial("cloudMaterial", sceneRef);
  materials.cloud.diffuseTexture = createTexture(texturePaths[0], sceneRef, onLoaded, onError);
  materials.cloud.alpha = 0.13;
  materials.cloud.specularColor = BABYLON.Color3.Black();
  materials.cloud.emissiveColor = new BABYLON.Color3(0.03, 0.05, 0.08);

  currentMeshMode = "sphere";
  currentMapMode = "day";
  currentSkinMode = "realistic";
  effectsState.atmosphere = true;
  effectsState.glow = false;
  effectsState.spin = false;

  setActiveMeshSet("sphere");
  setButtonGroupState(meshButtons, "sphere", "data-mesh-mode");
  applyMapMode(currentMapMode);
  applySkinMode("colormap");
  applySkinMode(currentSkinMode);
  setAtmosphereEffect(false);
  setAtmosphereEffect(true);
  setGlowEffect(false);
  setSpinEffect(false);
  setCurrentGlobeVisibility(false);

  startParticleAssemblyIntro(sceneRef, (progress) => {
    if (texturesReady) {
      setStatus(`Particles are assembling Earth (${Math.round(progress * 100)}%)...`);
    }
  }).then(() => {
    introReady = true;
    finalizeStartup();
  });

  loadedTextures += 1;
  updateLoading();

  try {
    const optimizerOptions = new BABYLON.SceneOptimizerOptions(55, 2000);
    optimizerOptions.optimizations.push(
      new BABYLON.HardwareScalingOptimization(0, 1.4),
      new BABYLON.TextureOptimization(1, 256),
      new BABYLON.ShadowsOptimization(1)
    );

    const sceneOptimizer = new BABYLON.SceneOptimizer(sceneRef, optimizerOptions);
    sceneOptimizer.start();
  } catch (optimizerError) {
    // Optimizer failure should not block globe startup or UI interactions.
    console.warn("Scene optimizer setup failed, continuing without optimizations.", optimizerError);
  }

  return sceneRef;
};

const bindControls = () => {
  window.__earthConfirmSelection = () => {
    void commitControlsSelectionAndExit();
  };

  mapButtons.forEach((button) => {
    safeAddEventListener(button, "click", () => {
      const modeName = button.dataset.mapMode;
      if (modeName) {
        if (pendingSelection) {
          pendingSelection.mapMode = modeName;
          setButtonGroupState(mapButtons, modeName, "data-map-mode");
          return;
        }

        applyMapMode(modeName);
      }
    });
  });

  skinButtons.forEach((button) => {
    safeAddEventListener(button, "click", () => {
      const skinName = button.dataset.skinMode;
      if (skinName) {
        if (pendingSelection) {
          pendingSelection.skinMode = skinName;
          setButtonGroupState(skinButtons, skinName, "data-skin-mode");
          return;
        }

        applySkinMode(skinName);
      }
    });
  });

  meshButtons.forEach((button) => {
    safeAddEventListener(button, "click", () => {
      const meshMode = button.dataset.meshMode;
      if (meshMode) {
        if (pendingSelection) {
          pendingSelection.meshMode = meshMode;
          setButtonGroupState(meshButtons, meshMode, "data-mesh-mode");
          return;
        }

        buildMeshSet(meshMode);
      }
    });
  });

  effectButtons.forEach((button) => {
    safeAddEventListener(button, "click", () => {
      const effectName = button.dataset.effect;
      if (!effectName) {
        return;
      }

      if (pendingSelection) {
        pendingSelection.effects[effectName] = !pendingSelection.effects[effectName];
        setEffectButtonState(effectName, pendingSelection.effects[effectName]);
        return;
      }

      if (effectName === "atmosphere") {
        setAtmosphereEffect(!effectsState.atmosphere);
      }

      if (effectName === "glow") {
        setGlowEffect(!effectsState.glow);
      }

      if (effectName === "spin") {
        setSpinEffect(!effectsState.spin);
      }
    });
  });

  safeAddEventListener(startButton, "click", () => {
    if (hasEnteredViewingMode && !isMenuReengageReady) {
      beginMenuReengageSequence();
      return;
    }

    showControlsOverlay();
  });

  safeAddEventListener(startButton, "mouseenter", () => {
    if (!hasEnteredViewingMode || !controlsOverlay?.classList.contains("hidden")) {
      return;
    }

    beginMenuReengageSequence();
  });

  safeAddEventListener(startButton, "focus", () => {
    if (!hasEnteredViewingMode || !controlsOverlay?.classList.contains("hidden")) {
      return;
    }

    beginMenuReengageSequence();
  });

  safeAddEventListener(confirmControls, commitControlsSelectionAndExit);
  safeAddEventListener(confirmControls, "pointerup", commitControlsSelectionAndExit);

  safeAddEventListener(controlsOverlay, async (e) => {
    const confirmTrigger = e.target?.closest?.("#confirm-controls");
    if (confirmTrigger) {
      await commitControlsSelectionAndExit(e);
      return;
    }

    if (e.target === controlsOverlay) {
      await commitControlsSelectionAndExit();
    }
  });
};

const waitForBabylonAndStart = (retryCount = 0) => {
  initDomRefs();
  if (window.BABYLON) {
    bootstrap();
    return;
  }

  if (retryCount > 28) {
    setStatus("3D engine failed to load. Please refresh the page.");
    hidePageLoader();
    return;
  }

  window.setTimeout(() => {
    waitForBabylonAndStart(retryCount + 1);
  }, 120);
};

const bootstrap = () => {
  if (
    !canvas ||
    !statusLabel ||
    !mapButtons.length ||
    !skinButtons.length ||
    !meshButtons.length ||
    !effectButtons.length
  ) {
    console.error("Required DOM nodes for globe initialization are missing.");
    hidePageLoader();
    return;
  }

  document.body.classList.add("loading");
  setControlsDisabled(true);

  try {
    engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      adaptToDeviceRatio: true,
    });

    const hardwareScaling = Math.min(window.devicePixelRatio || 1, 1.35);
    engine.setHardwareScalingLevel(1 / hardwareScaling);

    if (engine.getCaps().parallelShaderCompile) {
      setStatus("Compiling shaders and loading Earth assets...");
    }

    scene = createScene();
    bindControls();

    engine.runRenderLoop(() => {
      if (effectsState.spin && camera) {
        camera.alpha += 0.0016;
      }

      if (cloudShell) {
        cloudShell.rotation.y += 0.00065;
      }

      scene.render();
    });

    safeAddEventListener(document, "visibilitychange", () => {
      if (document.hidden) {
        engine.stopRenderLoop();
        return;
      }

      engine.runRenderLoop(() => {
        if (effectsState.spin && camera) {
          camera.alpha += 0.0016;
        }

        if (cloudShell) {
          cloudShell.rotation.y += 0.00065;
        }

        scene.render();
      });
    });

    safeAddEventListener(window, "resize", () => {
      engine.resize();
    });
  } catch (error) {
    console.error("Globe startup failed.", error);
    setStatus("Unable to initialize the 3D globe.");
    hidePageLoader();

    Object.keys(meshSetCache).forEach((key) => {
      disposeMeshSet(meshSetCache[key]);
      meshSetCache[key] = null;
    });
    disposeCurrentMeshes();
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    waitForBabylonAndStart();
  });
} else {
  waitForBabylonAndStart();
}
