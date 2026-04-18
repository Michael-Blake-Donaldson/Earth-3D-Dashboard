const canvas = document.getElementById("renderCanvas");
const statusLabel = document.getElementById("scene-status");
const populationMapButton = document.getElementById("togglePopulationMap");
const nightMapButton = document.getElementById("toggleNightEarthMap");

let engine;
let scene;
let earthGlobe;
let populationGlobe;
let nightEarthGlobe;
let mode = "day";

const setControlsDisabled = (disabled) => {
  populationMapButton.disabled = disabled;
  nightMapButton.disabled = disabled;
};

const setStatus = (message) => {
  statusLabel.textContent = message;
};

const hideStatus = () => {
  statusLabel.style.display = "none";
};

const setMode = (nextMode) => {
  mode = nextMode;

  earthGlobe.isVisible = mode === "day";
  populationGlobe.isVisible = mode === "population";
  nightEarthGlobe.isVisible = mode === "night";

  const isPopulation = mode === "population";
  const isNight = mode === "night";

  populationMapButton.classList.toggle("active", isPopulation);
  nightMapButton.classList.toggle("active", isNight);
  populationMapButton.setAttribute("aria-pressed", String(isPopulation));
  nightMapButton.setAttribute("aria-pressed", String(isNight));
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

const createScene = () => {
  const sceneRef = new BABYLON.Scene(engine);

  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    Math.PI / 2,
    Math.PI / 2,
    5,
    new BABYLON.Vector3(0, 0, 0),
    sceneRef
  );
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 2;
  camera.upperRadiusLimit = 10;
  camera.lowerBetaLimit = 0.1;
  camera.upperBetaLimit = Math.PI - 0.1;

  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), sceneRef);
  light.intensity = 1.2;

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
      setStatus(`Loading 3D globe textures (${complete}/${totalTextures})...`);
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
  earthMaterial.bumpTexture.vScale = -1;
  earthGlobe.material = earthMaterial;

  populationGlobe = BABYLON.MeshBuilder.CreateSphere("populationGlobe", { diameter: 2 }, sceneRef);
  const populationMaterial = new BABYLON.StandardMaterial("populationMaterial", sceneRef);
  populationMaterial.diffuseTexture = createTexture(texturePaths[2], sceneRef, onLoaded, onError);
  populationMaterial.alpha = 1;
  populationGlobe.material = populationMaterial;

  nightEarthGlobe = BABYLON.MeshBuilder.CreateSphere("nightEarthGlobe", { diameter: 2 }, sceneRef);
  const nightEarthMaterial = new BABYLON.StandardMaterial("nightEarthMaterial", sceneRef);
  nightEarthMaterial.diffuseTexture = createTexture(texturePaths[3], sceneRef, onLoaded, onError);
  nightEarthMaterial.alpha = 1;
  nightEarthGlobe.material = nightEarthMaterial;

  setMode("day");
  return sceneRef;
};

const bootstrap = () => {
  if (!canvas || !populationMapButton || !nightMapButton || !statusLabel) {
    console.error("Required DOM nodes for globe initialization are missing.");
    return;
  }

  setControlsDisabled(true);

  if (!window.BABYLON) {
    setStatus("3D engine failed to load. Please refresh the page.");
    return;
  }

  try {
    engine = new BABYLON.Engine(canvas, true);
    scene = createScene();

    engine.runRenderLoop(() => {
      scene.render();
    });

    window.addEventListener("resize", () => {
      engine.resize();
    });

    populationMapButton.addEventListener("click", () => {
      setMode(mode === "population" ? "day" : "population");
    });

    nightMapButton.addEventListener("click", () => {
      setMode(mode === "night" ? "day" : "night");
    });
  } catch (error) {
    console.error("Globe startup failed.", error);
    setStatus("Unable to initialize the 3D globe.");
  }
};

bootstrap();
