const canvas = document.getElementById("renderCanvas");
const statusLabel = document.getElementById("scene-status");
const mapButtons = [...document.querySelectorAll("[data-map-mode]")];
const skinButtons = [...document.querySelectorAll("[data-skin-mode]")];
const effectButtons = [...document.querySelectorAll("[data-effect]")];
const controlButtons = [...document.querySelectorAll(".control-button")];

let engine;
let scene;
let camera;
let earthGlobe;
let populationGlobe;
let nightGlobe;
let atmosphereShell;
let cloudShell;
let pipeline;

const effectsState = {
  atmosphere: true,
  glow: false,
  spin: false,
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

const getMapMaterials = () => [earthGlobe.material, populationGlobe.material, nightGlobe.material];

const applySkin = (skinName) => {
  const materials = getMapMaterials();

  materials.forEach((material) => {
    material.wireframe = false;
    material.alpha = 1;
    material.specularColor = new BABYLON.Color3(0.2, 0.24, 0.25);
    material.emissiveColor = BABYLON.Color3.Black();
  });

  if (skinName === "matte") {
    materials.forEach((material) => {
      material.specularColor = new BABYLON.Color3(0.06, 0.08, 0.08);
      material.emissiveColor = new BABYLON.Color3(0.02, 0.05, 0.08);
    });
  }

  if (skinName === "wireframe") {
    materials.forEach((material) => {
      material.wireframe = true;
      material.emissiveColor = new BABYLON.Color3(0.32, 0.7, 0.96);
    });
  }

  const dayMaterial = earthGlobe.material;
  if (dayMaterial.bumpTexture) {
    dayMaterial.bumpTexture.level = skinName === "realistic" ? 1.1 : 0.55;
  }

  setButtonGroupState(skinButtons, skinName, "data-skin-mode");
};

const setMode = (modeName) => {
  earthGlobe.isVisible = modeName === "day";
  populationGlobe.isVisible = modeName === "population";
  nightGlobe.isVisible = modeName === "night";

  setButtonGroupState(mapButtons, modeName, "data-map-mode");
};

const setAtmosphereEffect = (isActive) => {
  effectsState.atmosphere = isActive;
  atmosphereShell.isVisible = isActive;
  cloudShell.isVisible = isActive;
  setEffectButtonState("atmosphere", isActive);
};

const setGlowEffect = (isActive) => {
  effectsState.glow = isActive;
  if (pipeline) {
    pipeline.bloomEnabled = isActive;
    pipeline.bloomThreshold = 0.75;
    pipeline.bloomWeight = isActive ? 0.8 : 0;
    pipeline.bloomKernel = 68;
  }
  setEffectButtonState("glow", isActive);
};

const setSpinEffect = (isActive) => {
  effectsState.spin = isActive;
  setEffectButtonState("spin", isActive);
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

  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), sceneRef);
  light.intensity = 1.15;

  const keyLight = new BABYLON.PointLight("key", new BABYLON.Vector3(4, 2, -4), sceneRef);
  keyLight.intensity = 0.65;

  pipeline = new BABYLON.DefaultRenderingPipeline("default", false, sceneRef, [camera]);

  const texturePaths = [
    "assets/maps/earth_daymap.jpg",
    "assets/maps/earth_normal_map.jpeg",
    "assets/maps/pop_density_map.jpg",
    "assets/maps/earth_nightmap.jpg",
  ];

  let loadedTextures = 0;
  let failedTextures = 0;
  const totalTextures = texturePaths.length;

  const updateLoading = () => {
    const complete = loadedTextures + failedTextures;

    if (complete < totalTextures) {
      setStatus(`Loading scene assets (${complete}/${totalTextures})...`);
      return;
    }

    if (failedTextures > 0) {
      setStatus(`Loaded with ${failedTextures} texture warning${failedTextures > 1 ? "s" : ""}.`);
    } else {
      setStatus("Globe ready.");
    }

    setControlsDisabled(false);
    window.setTimeout(hideStatus, 1400);
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

  earthGlobe = BABYLON.MeshBuilder.CreateSphere("earthGlobe", { diameter: 2 }, sceneRef);
  const earthMaterial = new BABYLON.StandardMaterial("earthMaterial", sceneRef);
  earthMaterial.diffuseTexture = createTexture(texturePaths[0], sceneRef, onLoaded, onError);
  earthMaterial.bumpTexture = createTexture(texturePaths[1], sceneRef, onLoaded, onError);
  earthGlobe.material = earthMaterial;

  populationGlobe = BABYLON.MeshBuilder.CreateSphere("populationGlobe", { diameter: 2 }, sceneRef);
  const populationMaterial = new BABYLON.StandardMaterial("populationMaterial", sceneRef);
  populationMaterial.diffuseTexture = createTexture(texturePaths[2], sceneRef, onLoaded, onError);
  populationGlobe.material = populationMaterial;

  nightGlobe = BABYLON.MeshBuilder.CreateSphere("nightGlobe", { diameter: 2 }, sceneRef);
  const nightMaterial = new BABYLON.StandardMaterial("nightMaterial", sceneRef);
  nightMaterial.diffuseTexture = createTexture(texturePaths[3], sceneRef, onLoaded, onError);
  nightGlobe.material = nightMaterial;

  atmosphereShell = BABYLON.MeshBuilder.CreateSphere(
    "atmosphereShell",
    { diameter: 2.08, segments: 64 },
    sceneRef
  );
  const atmosphereMaterial = new BABYLON.StandardMaterial("atmosphereMaterial", sceneRef);
  atmosphereMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.58, 0.9);
  atmosphereMaterial.alpha = 0.18;
  atmosphereMaterial.backFaceCulling = false;
  atmosphereMaterial.disableLighting = true;
  atmosphereShell.material = atmosphereMaterial;

  cloudShell = BABYLON.MeshBuilder.CreateSphere(
    "cloudShell",
    { diameter: 2.05, segments: 64 },
    sceneRef
  );
  const cloudMaterial = new BABYLON.StandardMaterial("cloudMaterial", sceneRef);
  cloudMaterial.diffuseTexture = createTexture(texturePaths[0], sceneRef, onLoaded, onError);
  cloudMaterial.alpha = 0.14;
  cloudMaterial.specularColor = BABYLON.Color3.Black();
  cloudMaterial.emissiveColor = new BABYLON.Color3(0.03, 0.05, 0.08);
  cloudShell.material = cloudMaterial;

  setMode("day");
  applySkin("realistic");
  setAtmosphereEffect(true);
  setGlowEffect(false);
  setSpinEffect(false);

  return sceneRef;
};

const bindControls = () => {
  mapButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modeName = button.dataset.mapMode;
      if (modeName) {
        setMode(modeName);
      }
    });
  });

  skinButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const skinName = button.dataset.skinMode;
      if (skinName) {
        applySkin(skinName);
      }
    });
  });

  effectButtons.forEach((button) => {
    button.addEventListener("click", () => {
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

  if (retryCount > 20) {
    setStatus("3D engine failed to load. Please refresh the page.");
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
    !effectButtons.length
  ) {
    console.error("Required DOM nodes for globe initialization are missing.");
    return;
  }

  setControlsDisabled(true);

  try {
    engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
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

    window.addEventListener("resize", () => {
      engine.resize();
    });
  } catch (error) {
    console.error("Globe startup failed.", error);
    setStatus("Unable to initialize the 3D globe.");
  }
};

waitForBabylonAndStart();
