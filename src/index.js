// Get the canvas element
const canvas = document.getElementById("renderCanvas");

// Create the Babylon.js engine
const engine = new BABYLON.Engine(canvas, true);

// Declare global variables for the two globes
let earthGlobe, populationGlobe, nightEarthGlobe;

// Create the scene
const createScene = () => {
  const scene = new BABYLON.Scene(engine);

  // Add a camera
  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    Math.PI / 2, // Alpha (horizontal rotation)
    Math.PI / 2, // Beta (vertical rotation)
    5,           // Zoom distance
    new BABYLON.Vector3(0, 0, 0), // Target position (center of the globe)
    scene
  );
  camera.attachControl(canvas, true);

  // Set limits for zoom and rotation
  camera.lowerRadiusLimit = 2;   // Minimum zoom distance
  camera.upperRadiusLimit = 10;  // Maximum zoom distance
  camera.lowerBetaLimit = 0.1;   // Limit how far up the user can rotate
  camera.upperBetaLimit = Math.PI - 0.1; // Limit how far down the user can rotate

  // Add a light
  const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(1, 1, 0),
    scene
  );
  light.intensity = 1.2; // Brighten the scene

  // Create the Earth globe
  earthGlobe = BABYLON.MeshBuilder.CreateSphere("earthGlobe", { diameter: 2 }, scene);
  const earthMaterial = new BABYLON.StandardMaterial("earthMaterial", scene);
  earthMaterial.diffuseTexture = new BABYLON.Texture("assets/maps/earth_daymap.jpg", scene);
  earthMaterial.diffuseTexture.vScale = -1; // Flip vertically
  earthMaterial.bumpTexture = new BABYLON.Texture("assets/maps/earth_normal_map.jpeg", scene);
  earthMaterial.bumpTexture.vScale = -1; // Flip vertically
  earthGlobe.material = earthMaterial;

  // Create the Population Density globe
  populationGlobe = BABYLON.MeshBuilder.CreateSphere("populationGlobe", { diameter: 2 }, scene);
  const populationMaterial = new BABYLON.StandardMaterial("populationMaterial", scene);
  populationMaterial.diffuseTexture = new BABYLON.Texture("assets/maps/pop_density_map.jpg", scene);
  populationMaterial.diffuseTexture.vScale = -1; // Flip vertically
  populationMaterial.alpha = 1; // Fully opaque for testing
  populationGlobe.material = populationMaterial;

  // Initially hide the Population Density globe
  populationGlobe.isVisible = false;

  // Create the Night Time Earth globe
  nightEarthGlobe = BABYLON.MeshBuilder.CreateSphere("nightEarthGlobe", { diameter: 2 }, scene);
  const nightEarthMaterial = new BABYLON.StandardMaterial("nightEarthMaterial", scene);
  nightEarthMaterial.diffuseTexture = new BABYLON.Texture("assets/maps/earth_nightmap.jpg", scene);
  nightEarthMaterial.diffuseTexture.vScale = -1; // Flip vertically
  nightEarthMaterial.alpha = 1; // Fully opaque for testing
  nightEarthGlobe.material = nightEarthMaterial;

  // Initially hide the Population Density globe
  nightEarthGlobe.isVisible = false;

  return scene;
};

// Create and render the scene
const scene = createScene();
engine.runRenderLoop(() => {
  scene.render();
});

// Resize the engine on window resize
window.addEventListener("resize", () => {
  engine.resize();
});

// Toggle population map button logic
const populationMapButton = document.getElementById("togglePopulationMap");
let isPopulationMapVisible = false;

populationMapButton.addEventListener("click", () => {
  // Toggle visibility of the two globes
  earthGlobe.isVisible = !isPopulationMapVisible;
  populationGlobe.isVisible = isPopulationMapVisible;

  // Flip the visibility flag
  isPopulationMapVisible = !isPopulationMapVisible;
});

// Toggle night map button logic
const nightMapButton = document.getElementById("toggleNightEarthMap");
let isnightMapVisible = false;

nightMapButton.addEventListener("click", () => {
  // Toggle visibility of the two globes
  earthGlobe.isVisible = !isnightMapVisible;
  nightEarthGlobe.isVisible = isnightMapVisible;

  // Flip the visibility flag
  isnightMapVisible = !isnightMapVisible;
});
