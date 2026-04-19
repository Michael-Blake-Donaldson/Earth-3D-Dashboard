import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const RAW_PATH = path.join(ROOT, "data", "raw", "layers.json");
const PROCESSED_PATH = path.join(ROOT, "data", "processed", "layers.processed.json");
const APP_PATH = path.join(ROOT, "src", "data", "layers", "layers.generated.json");
const APP_MODULE_PATH = path.join(ROOT, "src", "data", "layers", "generatedLayers.js");

const normalizeRecord = (record) => ({
  id: String(record.id).trim(),
  name: String(record.name).trim(),
  latitude: Number(record.latitude),
  longitude: Number(record.longitude),
  value: Number(record.value),
});

const normalizeLayer = (layer) => ({
  source: String(layer.source),
  sourceUrl: String(layer.sourceUrl),
  year: String(layer.year),
  updated: String(layer.updated),
  unit: String(layer.unit),
  records: layer.records.map(normalizeRecord),
});

const main = async () => {
  const rawText = await fs.readFile(RAW_PATH, "utf8");
  const raw = JSON.parse(rawText);

  const processed = {
    version: 1,
    builtAt: new Date().toISOString(),
    layers: Object.fromEntries(
      Object.entries(raw.layers).map(([layerId, layer]) => [layerId, normalizeLayer(layer)])
    ),
  };

  const encoded = JSON.stringify(processed, null, 2) + "\n";
  await fs.writeFile(PROCESSED_PATH, encoded, "utf8");
  await fs.writeFile(APP_PATH, encoded, "utf8");
  await fs.writeFile(
    APP_MODULE_PATH,
    `export const generatedLayers = ${JSON.stringify(processed, null, 2)};\n`,
    "utf8"
  );

  console.log("Built processed layers dataset.");
};

main().catch((error) => {
  console.error("Failed to build layers dataset.");
  console.error(error.message);
  process.exit(1);
});
