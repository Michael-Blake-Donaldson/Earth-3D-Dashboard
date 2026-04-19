let canvas;
let statusLabel;
let pageLoader;
let heroOverlay;
let heroContent;
let controlsOverlay;
let startButton;
let confirmControls;
let dataInsightPanel;
let dataInsightKicker;
let dataInsightTitle;
let dataInsightSummary;
let dataInsightStat;
let dataInsightSource;
let dataInsightUpdated;
let dataInsightLink;
let layerOpacityInput;
let layerOpacityValue;

let mapButtons = [];
let skinButtons = [];
let meshButtons = [];
let effectButtons = [];
let dataLayerButtons = [];
let controlButtons = [];
let navActionLinks = [];

const initDomRefs = () => {
  canvas = document.getElementById("renderCanvas");
  statusLabel = document.getElementById("scene-status");
  pageLoader = document.getElementById("page-loader");
  heroOverlay = document.querySelector(".hero-overlay");
  heroContent = document.querySelector(".hero-content");
  controlsOverlay = document.getElementById("controls-overlay");
  startButton = document.getElementById("start-button");
  confirmControls = document.getElementById("confirm-controls");
  dataInsightPanel = document.getElementById("data-insight-panel");
  dataInsightKicker = document.getElementById("data-insight-kicker");
  dataInsightTitle = document.getElementById("data-insight-title");
  dataInsightSummary = document.getElementById("data-insight-summary");
  dataInsightStat = document.getElementById("data-insight-stat");
  dataInsightSource = document.getElementById("data-insight-source");
  dataInsightUpdated = document.getElementById("data-insight-updated");
  dataInsightLink = document.getElementById("data-insight-link");
  layerOpacityInput = document.getElementById("layer-opacity");
  layerOpacityValue = document.getElementById("layer-opacity-value");
  mapButtons = [...document.querySelectorAll("[data-map-mode]")];
  skinButtons = [...document.querySelectorAll("[data-skin-mode]")];
  meshButtons = [...document.querySelectorAll("[data-mesh-mode]")];
  effectButtons = [...document.querySelectorAll("[data-effect]")];
  dataLayerButtons = [...document.querySelectorAll("[data-layer]")];
  controlButtons = [...document.querySelectorAll(".control-button")];
  navActionLinks = [...document.querySelectorAll("[data-nav-action]")];
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
let pendingResetRequest = false;
let layerRegistry = {};
let dataLayerOpacity = 0.95;

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

const dataLayerState = {
  climate: false,
  geology: false,
  oceanography: false,
  astronomy: false,
  ecology: false,
  environmental: false,
};

const materials = {
  earth: null,
  population: null,
  night: null,
  atmosphere: null,
  cloud: null,
};

const CLIMATE_EMISSIONS = [
  { name: "China", lat: 35.86, lon: 104.19, mtco2: 11472 },
  { name: "United States", lat: 37.09, lon: -95.71, mtco2: 5007 },
  { name: "India", lat: 20.59, lon: 78.96, mtco2: 2741 },
  { name: "Russia", lat: 61.52, lon: 105.31, mtco2: 1760 },
  { name: "Japan", lat: 36.2, lon: 138.25, mtco2: 1067 },
  { name: "Iran", lat: 32.43, lon: 53.69, mtco2: 745 },
  { name: "Germany", lat: 51.16, lon: 10.45, mtco2: 675 },
  { name: "Indonesia", lat: -0.79, lon: 113.92, mtco2: 619 },
  { name: "Saudi Arabia", lat: 23.89, lon: 45.08, mtco2: 615 },
  { name: "South Korea", lat: 35.91, lon: 127.77, mtco2: 598 },
];

const GEOLOGY_MAJOR_QUAKES = [
  { name: "Chile 1960", lat: -38.24, lon: -73.05, magnitude: 9.5 },
  { name: "Alaska 1964", lat: 61.02, lon: -147.65, magnitude: 9.2 },
  { name: "Indian Ocean 2004", lat: 3.32, lon: 95.85, magnitude: 9.1 },
  { name: "Japan 2011", lat: 38.3, lon: 142.37, magnitude: 9.1 },
  { name: "Kamchatka 1952", lat: 52.76, lon: 160.06, magnitude: 9 },
  { name: "Ecuador 1906", lat: 1.0, lon: -81.5, magnitude: 8.8 },
  { name: "Maule 2010", lat: -35.91, lon: -72.73, magnitude: 8.8 },
  { name: "Tibet 1950", lat: 28.5, lon: 96.5, magnitude: 8.6 },
];

const OCEAN_MAJOR_REEFS = [
  { name: "Great Barrier", lat: -18.29, lon: 147.7, health: 62 },
  { name: "Coral Triangle", lat: 0.6, lon: 125.4, health: 55 },
  { name: "Mesoamerican", lat: 18.2, lon: -87.8, health: 58 },
  { name: "Red Sea", lat: 20.4, lon: 39.3, health: 64 },
  { name: "New Caledonia", lat: -20.9, lon: 165.6, health: 60 },
  { name: "Maldives", lat: 3.2, lon: 73.2, health: 57 },
  { name: "Florida Reef", lat: 24.7, lon: -80.5, health: 46 },
  { name: "Andaman", lat: 11.5, lon: 92.7, health: 59 },
];

const ECOLOGY_FOREST_CARBON = [
  { name: "Amazon", lat: -3.47, lon: -62.22, gtco2: 123 },
  { name: "Congo Basin", lat: -1.64, lon: 15.6, gtco2: 66 },
  { name: "Boreal Eurasia", lat: 61.2, lon: 90.1, gtco2: 95 },
  { name: "Boreal North America", lat: 57.6, lon: -106.2, gtco2: 72 },
  { name: "SE Asia Rainforest", lat: 1.3, lon: 113.5, gtco2: 43 },
  { name: "Temperate Europe", lat: 49.7, lon: 12.8, gtco2: 26 },
];

const ENVIRONMENTAL_RENEWABLE_HUBS = [
  { name: "Gansu Wind Base", lat: 40.23, lon: 96.58, gw: 20 },
  { name: "California Solar", lat: 35.37, lon: -119.02, gw: 18 },
  { name: "North Sea Offshore", lat: 56.2, lon: 3.5, gw: 27 },
  { name: "Rajasthan Solar", lat: 26.9, lon: 73.1, gw: 16 },
  { name: "Brazil Hydro Belt", lat: -4.6, lon: -54.2, gw: 19 },
  { name: "Morocco Noor", lat: 30.9, lon: -6.9, gw: 6 },
  { name: "Australia REZ", lat: -31.6, lon: 149.3, gw: 12 },
  { name: "Chile Atacama", lat: -23.6, lon: -68.2, gw: 10 },
];

const LAYER_ARTICLE_TITLES = {
  climate: "The Effects of Climate Change",
  geology: "The Formation of Mountains",
  oceanography: "Coral Reefs: The Rainforests of the Sea",
  astronomy: "The Earth's Magnetic Field",
  ecology: "The Role of Forests in Earth's Ecosystem",
  environmental: "The Science of Renewable Energy",
};

const LAYER_META = {
  climate: {
    category: "Climate",
    title: "Carbon Emission Hotspots",
    summary: "Top national emitters scaled by annual fossil CO2 output. Useful for understanding mitigation priority.",
    stat: "Dataset: top 10 annual emitters, MtCO2 per year (OWID/Global Carbon Project style values).",
    source: "Our World in Data, Global Carbon Project",
    sourceUrl: "https://ourworldindata.org/co2-and-greenhouse-gas-emissions",
    year: "2023",
    updated: "2026-03-15",
  },
  geology: {
    category: "Geology",
    title: "Great Earthquake Belt",
    summary: "Historic high-magnitude earthquakes illuminate subduction zones and plate-boundary hazard corridors.",
    stat: "Dataset: selected M8.6-M9.5 earthquakes with epicenter coordinates (USGS-style records).",
    source: "USGS Earthquake Catalog",
    sourceUrl: "https://earthquake.usgs.gov/earthquakes/search/",
    year: "1906-2011",
    updated: "2026-03-15",
  },
  oceanography: {
    category: "Oceanography",
    title: "Coral Reef Vital Zones",
    summary: "Major reef systems in tropical seas. Marker intensity approximates present ecological condition.",
    stat: "Dataset: representative global reef clusters with health index (0-100).",
    source: "NOAA Coral Reef Watch, UNEP-WCMC",
    sourceUrl: "https://coralreefwatch.noaa.gov/",
    year: "2023",
    updated: "2026-03-15",
  },
  astronomy: {
    category: "Astronomy",
    title: "Auroral Ovals",
    summary: "Aurora belts show where charged particles from solar wind couple most strongly with Earth's magnetosphere.",
    stat: "Dataset: modeled mean auroral oval latitudes near +/-67 degrees geomagnetic latitude.",
    source: "NOAA SWPC, NASA heliophysics references",
    sourceUrl: "https://www.swpc.noaa.gov/",
    year: "Modeled climatology",
    updated: "2026-03-15",
  },
  ecology: {
    category: "Ecology",
    title: "Forest Carbon Reservoirs",
    summary: "Large biomes storing major terrestrial carbon stocks. Taller bars indicate larger carbon storage.",
    stat: "Dataset: regional forest biomass carbon estimates in GtCO2-equivalent.",
    source: "FAO FRA, Global Forest Watch synthesis",
    sourceUrl: "https://fra-data.fao.org/",
    year: "2020-2023",
    updated: "2026-03-15",
  },
  environmental: {
    category: "Environmental Science",
    title: "Renewable Energy Hubs",
    summary: "High-capacity solar, wind, hydro, and hybrid zones that anchor clean-grid transitions.",
    stat: "Dataset: representative utility-scale renewable clusters with capacity in GW.",
    source: "IRENA, IEA open datasets",
    sourceUrl: "https://www.irena.org/Data",
    year: "2023",
    updated: "2026-03-15",
  },
};

const analyticsEvents = [];

const trackEvent = (eventName, details = {}) => {
  const event = {
    event: eventName,
    details,
    timestamp: new Date().toISOString(),
  };

  analyticsEvents.push(event);
  if (analyticsEvents.length > 150) {
    analyticsEvents.shift();
  }

  try {
    localStorage.setItem("earthDashboardAnalytics", JSON.stringify(analyticsEvents));
  } catch (error) {
    console.warn("Analytics persistence unavailable.", error);
  }

  if (window?.console) {
    console.info("[analytics]", eventName, details);
  }
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

const resetCameraView = () => {
  if (!camera) {
    return;
  }

  const defaultAlpha = Math.PI / 2;
  const defaultBeta = Math.PI / 2.2;
  const defaultRadius = 5;

  if (scene && BABYLON?.Animation?.CreateAndStartAnimation) {
    BABYLON.Animation.CreateAndStartAnimation(
      "cameraAlphaReset",
      camera,
      "alpha",
      60,
      26,
      camera.alpha,
      defaultAlpha,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    BABYLON.Animation.CreateAndStartAnimation(
      "cameraBetaReset",
      camera,
      "beta",
      60,
      26,
      camera.beta,
      defaultBeta,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
  } else {
    camera.alpha = defaultAlpha;
    camera.beta = defaultBeta;
  }

  animateCameraRadius(defaultRadius, 26);
};

const applyDefaultEarthState = (showStatusMessage = false) => {
  if (!scene || !camera) {
    return;
  }

  pendingSelection = null;

  if (controlsOverlay && !controlsOverlay.classList.contains("hidden")) {
    hideControlsOverlay();
  }

  buildMeshSet("sphere");
  applyMapMode("day");
  applySkinMode("realistic");
  Object.keys(dataLayerState).forEach((layerId) => {
    applyDataLayerState(layerId, false);
  });
  setAtmosphereEffect(true);
  setGlowEffect(false);
  setSpinEffect(false);
  setCurrentGlobeVisibility(true);
  resetCameraView();

  if (showStatusMessage) {
    setStatus("Earth view reset.");
  }
};

const resetEarthState = () => {
  if (!scene || !camera || isApplyingSelection) {
    pendingResetRequest = true;
    setStatus("Reset queued until scene is ready...");
    return;
  }

  applyDefaultEarthState(true);
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
    dataLayers: { ...dataLayerState },
    effects: {
      atmosphere: effectsState.atmosphere,
      glow: effectsState.glow,
      spin: effectsState.spin,
    },
  };

  setButtonGroupState(mapButtons, pendingSelection.mapMode, "data-map-mode");
  setButtonGroupState(skinButtons, pendingSelection.skinMode, "data-skin-mode");
  setButtonGroupState(meshButtons, pendingSelection.meshMode, "data-mesh-mode");
  Object.entries(pendingSelection.dataLayers).forEach(([layerId, isActive]) => {
    setDataLayerButtonState(layerId, Boolean(isActive));
  });
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

const setDataLayerButtonState = (layerId, active) => {
  const button = dataLayerButtons.find((item) => item.dataset.layer === layerId);
  if (!button) {
    return;
  }

  button.classList.toggle("active", active);
  button.setAttribute("aria-pressed", String(active));
};

const applyDataLayerOpacity = (opacity) => {
  const clamped = Math.min(1, Math.max(0.2, opacity));
  dataLayerOpacity = clamped;

  Object.values(layerRegistry).forEach((layer) => {
    if (layer && typeof layer.setOpacity === "function") {
      layer.setOpacity(clamped);
    }
  });

  if (layerOpacityInput) {
    layerOpacityInput.value = clamped.toFixed(2);
  }

  if (layerOpacityValue) {
    layerOpacityValue.textContent = `${Math.round(clamped * 100)}%`;
  }
};

const getLayerArticleLink = (layerId) => {
  const title = LAYER_ARTICLE_TITLES[layerId];
  if (!title) {
    return "blog.html";
  }

  return `article.html?title=${encodeURIComponent(title)}`;
};

const updateDataInsightPanel = () => {
  if (
    !dataInsightPanel ||
    !dataInsightKicker ||
    !dataInsightTitle ||
    !dataInsightSummary ||
    !dataInsightStat ||
    !dataInsightSource ||
    !dataInsightUpdated ||
    !dataInsightLink
  ) {
    return;
  }

  const activeLayers = Object.entries(dataLayerState)
    .filter(([, isActive]) => isActive)
    .map(([layerId]) => layerId);

  if (!activeLayers.length) {
    dataInsightPanel.classList.add("hidden");
    return;
  }

  const focusLayer = activeLayers[activeLayers.length - 1];
  const meta = LAYER_META[focusLayer];
  if (!meta) {
    dataInsightPanel.classList.add("hidden");
    return;
  }

  dataInsightPanel.classList.remove("hidden");
  dataInsightKicker.textContent = `${meta.category} Layer`;
  dataInsightTitle.textContent = meta.title;
  dataInsightSummary.textContent = meta.summary;
  dataInsightStat.textContent =
    activeLayers.length > 1
      ? `${meta.stat} Active layers: ${activeLayers.length}.`
      : meta.stat;
  dataInsightSource.textContent = `Source: ${meta.source}`;
  dataInsightUpdated.textContent = `Coverage year: ${meta.year} | Refreshed: ${meta.updated}`;
  dataInsightLink.href = getLayerArticleLink(focusLayer);
  dataInsightLink.textContent = `Read ${meta.category} article`;
  dataInsightLink.title = `Source: ${meta.sourceUrl}`;
};

const latLonToVector3 = (lat, lon, radius = 1) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return new BABYLON.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

const createLatitudeBand = (lat, radius = 1.03, segments = 96) => {
  const points = [];
  for (let step = 0; step <= segments; step += 1) {
    const lon = -180 + (360 * step) / segments;
    points.push(latLonToVector3(lat, lon, radius));
  }

  return points;
};

const createRingAtLocation = (lat, lon, radius = 1.024, ringRadius = 0.045, segments = 20) => {
  const center = latLonToVector3(lat, lon, radius);
  const normal = center.normalize();
  const axisA = BABYLON.Vector3.Cross(normal, BABYLON.Axis.Y);
  if (axisA.lengthSquared() < 0.0001) {
    axisA.copyFrom(BABYLON.Axis.X);
  }
  axisA.normalize();
  const axisB = BABYLON.Vector3.Cross(normal, axisA).normalize();

  const points = [];
  for (let index = 0; index <= segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    const offsetA = axisA.scale(Math.cos(angle) * ringRadius);
    const offsetB = axisB.scale(Math.sin(angle) * ringRadius);
    const onSurface = center.add(offsetA).add(offsetB).normalize().scale(radius);
    points.push(onSurface);
  }

  return points;
};

const createPopulationHeatmapTexture = (sceneRef, onLoaded) => {
  const width = 2048;
  const height = 1024;
  const texture = new BABYLON.DynamicTexture(
    "populationHeatmapTexture",
    { width, height },
    sceneRef,
    false,
    BABYLON.Texture.BILINEAR_SAMPLINGMODE
  );
  const context = texture.getContext();

  context.clearRect(0, 0, width, height);
  context.fillStyle = "rgba(4, 8, 18, 0.22)";
  context.fillRect(0, 0, width, height);

  const maxCo2 = Math.max(...CLIMATE_EMISSIONS.map((entry) => entry.mtco2));
  CLIMATE_EMISSIONS.forEach((entry) => {
    const x = ((entry.lon + 180) / 360) * width;
    const y = ((90 - entry.lat) / 180) * height;
    const normalized = entry.mtco2 / maxCo2;
    const radius = 18 + normalized * 56;

    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(255, 226, 136, ${0.2 + normalized * 0.32})`);
    gradient.addColorStop(0.5, `rgba(255, 126, 82, ${0.24 + normalized * 0.34})`);
    gradient.addColorStop(1, "rgba(84, 12, 36, 0)");

    context.fillStyle = gradient;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  });

  const legendX = 36;
  const legendY = height - 130;
  const gradientBar = context.createLinearGradient(legendX, 0, legendX + 200, 0);
  gradientBar.addColorStop(0, "rgba(255, 220, 130, 0.85)");
  gradientBar.addColorStop(1, "rgba(255, 110, 66, 0.95)");
  context.fillStyle = "rgba(8, 14, 28, 0.68)";
  context.fillRect(legendX - 14, legendY - 32, 256, 70);
  context.fillStyle = gradientBar;
  context.fillRect(legendX, legendY, 200, 14);
  context.fillStyle = "rgba(224, 237, 255, 0.95)";
  context.font = "22px IBM Plex Sans, Arial";
  context.fillText("Annual CO2 intensity", legendX, legendY - 8);
  context.font = "18px IBM Plex Sans, Arial";
  context.fillText("lower", legendX, legendY + 34);
  context.fillText("higher", legendX + 154, legendY + 34);

  texture.vScale = -1;
  texture.update(false);
  onLoaded();
  return texture;
};

const createDataLayerRegistry = (sceneRef) => {
  const climateLines = CLIMATE_EMISSIONS.map((entry) => {
    const normalized = entry.mtco2 / 11472;
    const start = latLonToVector3(entry.lat, entry.lon, 1.014);
    const end = latLonToVector3(entry.lat, entry.lon, 1.014 + 0.07 + normalized * 0.42);
    return [start, end];
  });
  const climateMesh = BABYLON.MeshBuilder.CreateLineSystem(
    "climateEmissionsLayer",
    { lines: climateLines, updatable: false },
    sceneRef
  );
  climateMesh.color = new BABYLON.Color3(1, 0.58, 0.35);
  climateMesh.alpha = dataLayerOpacity;
  climateMesh.setEnabled(false);

  const geologyLines = GEOLOGY_MAJOR_QUAKES.map((quake) => {
    const normalized = (quake.magnitude - 8.6) / (9.5 - 8.6);
    const start = latLonToVector3(quake.lat, quake.lon, 1.018);
    const end = latLonToVector3(quake.lat, quake.lon, 1.018 + 0.05 + normalized * 0.22);
    return [start, end];
  });

  const quakeRings = GEOLOGY_MAJOR_QUAKES.map((quake) =>
    createRingAtLocation(quake.lat, quake.lon, 1.022, 0.018 + (quake.magnitude - 8.6) * 0.012)
  );

  const geologyMesh = BABYLON.MeshBuilder.CreateLineSystem(
    "geologyQuakeLayer",
    { lines: [...geologyLines, ...quakeRings], updatable: false },
    sceneRef
  );
  geologyMesh.color = new BABYLON.Color3(0.98, 0.45, 0.56);
  geologyMesh.alpha = dataLayerOpacity;
  geologyMesh.setEnabled(false);

  const oceanMaterial = new BABYLON.StandardMaterial("oceanReefMarkerMaterial", sceneRef);
  oceanMaterial.disableLighting = true;
  oceanMaterial.emissiveColor = new BABYLON.Color3(0.35, 0.92, 0.82);
  oceanMaterial.alpha = dataLayerOpacity;
  const oceanRoot = new BABYLON.TransformNode("oceanReefLayerRoot", sceneRef);
  const oceanBaseMarker = BABYLON.MeshBuilder.CreateSphere(
    "oceanReefMarkerBase",
    { diameter: 0.026, segments: 8 },
    sceneRef
  );
  oceanBaseMarker.material = oceanMaterial;
  oceanBaseMarker.isVisible = false;

  OCEAN_MAJOR_REEFS.forEach((reef, index) => {
    const marker = oceanBaseMarker.createInstance(`reefMarker${index}`);
    marker.parent = oceanRoot;
    marker.position = latLonToVector3(reef.lat, reef.lon, 1.025);
    const scale = 0.8 + (reef.health / 100) * 1.6;
    marker.scaling.set(scale, scale, scale);
  });
  oceanRoot.setEnabled(false);

  const auroraNorth = createLatitudeBand(67, 1.034, 140);
  const auroraSouth = createLatitudeBand(-67, 1.034, 140);
  const astronomyMesh = BABYLON.MeshBuilder.CreateLineSystem(
    "astronomyAuroraLayer",
    { lines: [auroraNorth, auroraSouth], updatable: false },
    sceneRef
  );
  astronomyMesh.color = new BABYLON.Color3(0.47, 0.95, 0.7);
  astronomyMesh.alpha = dataLayerOpacity;
  astronomyMesh.setEnabled(false);

  const ecologyLines = ECOLOGY_FOREST_CARBON.map((forest) => {
    const normalized = forest.gtco2 / 123;
    const start = latLonToVector3(forest.lat, forest.lon, 1.013);
    const end = latLonToVector3(forest.lat, forest.lon, 1.013 + normalized * 0.34 + 0.06);
    return [start, end];
  });
  const ecologyMesh = BABYLON.MeshBuilder.CreateLineSystem(
    "ecologyForestCarbonLayer",
    { lines: ecologyLines, updatable: false },
    sceneRef
  );
  ecologyMesh.color = new BABYLON.Color3(0.48, 0.86, 0.5);
  ecologyMesh.alpha = dataLayerOpacity;
  ecologyMesh.setEnabled(false);

  const renewableLines = ENVIRONMENTAL_RENEWABLE_HUBS.map((hub) => {
    const normalized = hub.gw / 27;
    const start = latLonToVector3(hub.lat, hub.lon, 1.013);
    const end = latLonToVector3(hub.lat, hub.lon, 1.013 + 0.06 + normalized * 0.26);
    return [start, end];
  });
  const renewableMesh = BABYLON.MeshBuilder.CreateLineSystem(
    "environmentalRenewablesLayer",
    { lines: renewableLines, updatable: false },
    sceneRef
  );
  renewableMesh.color = new BABYLON.Color3(0.56, 0.84, 1);
  renewableMesh.alpha = dataLayerOpacity;
  renewableMesh.setEnabled(false);

  return {
    climate: {
      show: () => climateMesh.setEnabled(true),
      hide: () => climateMesh.setEnabled(false),
      setOpacity: (value) => {
        climateMesh.alpha = value;
      },
    },
    geology: {
      show: () => geologyMesh.setEnabled(true),
      hide: () => geologyMesh.setEnabled(false),
      setOpacity: (value) => {
        geologyMesh.alpha = value;
      },
    },
    oceanography: {
      show: () => oceanRoot.setEnabled(true),
      hide: () => oceanRoot.setEnabled(false),
      setOpacity: (value) => {
        oceanMaterial.alpha = value;
      },
    },
    astronomy: {
      show: () => astronomyMesh.setEnabled(true),
      hide: () => astronomyMesh.setEnabled(false),
      setOpacity: (value) => {
        astronomyMesh.alpha = value;
      },
    },
    ecology: {
      show: () => ecologyMesh.setEnabled(true),
      hide: () => ecologyMesh.setEnabled(false),
      setOpacity: (value) => {
        ecologyMesh.alpha = value;
      },
    },
    environmental: {
      show: () => renewableMesh.setEnabled(true),
      hide: () => renewableMesh.setEnabled(false),
      setOpacity: (value) => {
        renewableMesh.alpha = value;
      },
    },
  };
};

const applyDataLayerState = (layerId, isActive) => {
  const layer = layerRegistry[layerId];
  if (!layer) {
    return;
  }

  dataLayerState[layerId] = isActive;
  if (isActive) {
    layer.show();
  } else {
    layer.hide();
  }

  setDataLayerButtonState(layerId, isActive);
  updateDataInsightPanel();
  trackEvent("layer_toggled", { layerId, isActive });
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
  Object.entries(selectedState.dataLayers || {}).forEach(([layerId, isActive]) => {
    applyDataLayerState(layerId, Boolean(isActive));
  });
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
    "assets/maps/earth_nightmap.jpg",
  ];

  let loadedTextures = 0;
  let failedTextures = 0;
  const totalTextures = 6;
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

    if (pendingResetRequest) {
      pendingResetRequest = false;
      applyDefaultEarthState(true);
    }

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
  materials.population.diffuseTexture = createPopulationHeatmapTexture(sceneRef, onLoaded);

  materials.night = new BABYLON.StandardMaterial("nightMaterial", sceneRef);
  materials.night.diffuseTexture = createTexture(texturePaths[2], sceneRef, onLoaded, onError);

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

  layerRegistry = createDataLayerRegistry(sceneRef);

  currentMeshMode = "sphere";
  currentMapMode = "day";
  currentSkinMode = "realistic";
  effectsState.atmosphere = true;
  effectsState.glow = false;
  effectsState.spin = false;
  dataLayerState.climate = false;
  dataLayerState.geology = false;
  dataLayerState.oceanography = false;
  dataLayerState.astronomy = false;
  dataLayerState.ecology = false;
  dataLayerState.environmental = false;

  setActiveMeshSet("sphere");
  setButtonGroupState(meshButtons, "sphere", "data-mesh-mode");
  applyMapMode(currentMapMode);
  applySkinMode("colormap");
  applySkinMode(currentSkinMode);
  applyDataLayerOpacity(dataLayerOpacity);
  Object.keys(dataLayerState).forEach((layerId) => {
    applyDataLayerState(layerId, false);
  });
  updateDataInsightPanel();
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
        trackEvent("map_mode_changed", { mode: modeName });
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
        trackEvent("skin_mode_changed", { mode: skinName });
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
        trackEvent("mesh_mode_changed", { mode: meshMode });
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
        trackEvent("effect_toggled", { effectName, active: effectsState.atmosphere });
      }

      if (effectName === "glow") {
        setGlowEffect(!effectsState.glow);
        trackEvent("effect_toggled", { effectName, active: effectsState.glow });
      }

      if (effectName === "spin") {
        setSpinEffect(!effectsState.spin);
        trackEvent("effect_toggled", { effectName, active: effectsState.spin });
      }
    });
  });

  dataLayerButtons.forEach((button) => {
    safeAddEventListener(button, "click", () => {
      const layerId = button.dataset.layer;
      if (!layerId) {
        return;
      }

      if (pendingSelection) {
        const nextActive = !pendingSelection.dataLayers[layerId];
        pendingSelection.dataLayers[layerId] = nextActive;
        setDataLayerButtonState(layerId, nextActive);
        return;
      }

      const nextActive = !dataLayerState[layerId];
      applyDataLayerState(layerId, nextActive);
    });
  });

  safeAddEventListener(layerOpacityInput, "input", (event) => {
    const value = Number(event.target?.value || dataLayerOpacity);
    applyDataLayerOpacity(value);
  });

  safeAddEventListener(layerOpacityInput, "change", () => {
    trackEvent("layer_opacity_changed", { opacity: Number(dataLayerOpacity.toFixed(2)) });
  });

  safeAddEventListener(startButton, "click", () => {
    if (hasEnteredViewingMode && !isMenuReengageReady) {
      beginMenuReengageSequence();
      return;
    }

    showControlsOverlay();
    trackEvent("controls_opened", { source: "hero_cta" });
  });

  safeAddEventListener(heroContent, "mouseenter", () => {
    if (!hasEnteredViewingMode || !controlsOverlay?.classList.contains("hidden")) {
      return;
    }

    beginMenuReengageSequence();
  });

  safeAddEventListener(heroContent, "focusin", () => {
    if (!hasEnteredViewingMode || !controlsOverlay?.classList.contains("hidden")) {
      return;
    }

    beginMenuReengageSequence();
  });

  navActionLinks.forEach((link) => {
    safeAddEventListener(link, "click", (event) => {
      event.preventDefault();

      const action = link.dataset.navAction;
      if (action === "open-controls") {
        showControlsOverlay();
        trackEvent("controls_opened", { source: "top_nav" });
        return;
      }

      if (action === "reset-view") {
        resetEarthState();
        trackEvent("globe_reset", {});
      }
    });
  });

  safeAddEventListener(confirmControls, commitControlsSelectionAndExit);
  safeAddEventListener(confirmControls, "pointerup", commitControlsSelectionAndExit);

  safeAddEventListener(controlsOverlay, "click", async (e) => {
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
