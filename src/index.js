const canvas = document.getElementById("renderCanvas");
const statusLabel = document.getElementById("scene-status");
const pageLoader = document.getElementById("page-loader");

const mapButtons = [...document.querySelectorAll("[data-map-mode]")];
const skinButtons = [...document.querySelectorAll("[data-skin-mode]")];
const meshButtons = [...document.querySelectorAll("[data-mesh-mode]")];
const effectButtons = [...document.querySelectorAll("[data-effect]")];
const controlButtons = [...document.querySelectorAll(".control-button")];

let engine;
let scene;
let camera;
let earthMesh;
let populationMesh;
let nightMesh;
let atmosphereShell;
let cloudShell;
let pipeline;

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

const disposeCurrentMeshes = () => {
  [earthMesh, populationMesh, nightMesh, atmosphereShell, cloudShell].forEach((mesh) => {
    if (mesh && !mesh.isDisposed()) {
      mesh.dispose(false, true);
    }
  });
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

  if (skinMode === "matte") {
    mapMaterials.forEach((material) => {
      if (!material) {
        return;
      }

      material.specularColor = new BABYLON.Color3(0.04, 0.06, 0.07);
      material.emissiveColor = new BABYLON.Color3(0.02, 0.05, 0.08);
    });
  }

  if (skinMode === "wireframe") {
    mapMaterials.forEach((material) => {
      if (!material) {
        return;
      }

      material.wireframe = true;
      material.emissiveColor = new BABYLON.Color3(0.32, 0.7, 0.96);
    });
  }

  if (materials.earth?.bumpTexture) {
    materials.earth.bumpTexture.level = skinMode === "realistic" ? 1.15 : 0.55;
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
  disposeCurrentMeshes();

  earthMesh = createPlanetMesh("earthMesh", meshMode, scene, 1);
  earthMesh.material = materials.earth;

  populationMesh = createPlanetMesh("populationMesh", meshMode, scene, 1);
  populationMesh.material = materials.population;

  nightMesh = createPlanetMesh("nightMesh", meshMode, scene, 1);
  nightMesh.material = materials.night;

  atmosphereShell = createPlanetMesh("atmosphereShell", meshMode, scene, 1.045);
  atmosphereShell.material = materials.atmosphere;

  cloudShell = createPlanetMesh("cloudShell", meshMode, scene, 1.028);
  cloudShell.material = materials.cloud;

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

  const updateLoading = () => {
    const complete = loadedTextures + failedTextures;

    if (complete < totalTextures) {
      setStatus(`Loading scene assets (${complete}/${totalTextures})...`);
      return;
    }

    if (failedTextures > 0) {
      setStatus(`Loaded with ${failedTextures} texture warning${failedTextures > 1 ? "s" : ""}.`);
    } else {
      setStatus("Scene ready.");
    }

    setControlsDisabled(false);
    window.setTimeout(() => {
      hideStatus();
      hidePageLoader();
    }, 380);
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

  buildMeshSet("sphere");
  applyMapMode("day");
  applySkinMode("realistic");
  setAtmosphereEffect(true);
  setGlowEffect(false);
  setSpinEffect(false);

  loadedTextures += 1;
  updateLoading();

  const sceneOptimizer = new BABYLON.SceneOptimizer(
    sceneRef,
    {
      targetFrameRate: 55,
      trackerDuration: 2000,
    },
    [
      new BABYLON.HardwareScalingOptimization(0, 1.4),
      new BABYLON.TextureOptimization(1, 256),
      new BABYLON.ShadowsOptimization(1),
    ]
  );
  sceneOptimizer.start();

  return sceneRef;
};

const bindControls = () => {
  mapButtons.forEach((button) => {
    safeAddEventListener(button, "click", () => {
      const modeName = button.dataset.mapMode;
      if (modeName) {
        applyMapMode(modeName);
      }
    });
  });

  skinButtons.forEach((button) => {
    safeAddEventListener(button, "click", () => {
      const skinName = button.dataset.skinMode;
      if (skinName) {
        applySkinMode(skinName);
      }
    });
  });

  meshButtons.forEach((button) => {
    safeAddEventListener(button, "click", () => {
      const meshMode = button.dataset.meshMode;
      if (meshMode) {
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
};

const waitForBabylonAndStart = (retryCount = 0) => {
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
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    waitForBabylonAndStart();
  });
} else {
  waitForBabylonAndStart();
}
