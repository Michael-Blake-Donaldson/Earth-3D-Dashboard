import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const RAW_PATH = path.join(ROOT, "data", "raw", "layers.json");
const REQUIRED_LAYERS = [
  "climate",
  "geology",
  "oceanography",
  "astronomy",
  "ecology",
  "environmental",
];

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const validateRecord = (layerId, record) => {
  assert(typeof record.id === "string" && record.id.length > 0, `${layerId}: record.id missing`);
  assert(typeof record.name === "string" && record.name.length > 0, `${layerId}: record.name missing`);
  assert(typeof record.latitude === "number", `${layerId}:${record.id} latitude must be number`);
  assert(typeof record.longitude === "number", `${layerId}:${record.id} longitude must be number`);
  assert(record.latitude >= -90 && record.latitude <= 90, `${layerId}:${record.id} latitude out of range`);
  assert(record.longitude >= -180 && record.longitude <= 180, `${layerId}:${record.id} longitude out of range`);
  assert(typeof record.value === "number", `${layerId}:${record.id} value must be number`);
};

const validateLayer = (layerId, layer) => {
  assert(layer && typeof layer === "object", `${layerId}: layer object missing`);
  assert(typeof layer.source === "string" && layer.source.length > 0, `${layerId}: source missing`);
  assert(typeof layer.sourceUrl === "string" && layer.sourceUrl.startsWith("http"), `${layerId}: sourceUrl invalid`);
  assert(typeof layer.year === "string" && layer.year.length > 0, `${layerId}: year missing`);
  assert(typeof layer.updated === "string" && layer.updated.length > 0, `${layerId}: updated missing`);
  assert(typeof layer.unit === "string" && layer.unit.length > 0, `${layerId}: unit missing`);
  assert(Array.isArray(layer.records) && layer.records.length > 0, `${layerId}: no records`);

  const ids = new Set();
  layer.records.forEach((record) => {
    validateRecord(layerId, record);
    assert(!ids.has(record.id), `${layerId}: duplicate record id ${record.id}`);
    ids.add(record.id);
  });
};

const main = async () => {
  const rawText = await fs.readFile(RAW_PATH, "utf8");
  const raw = JSON.parse(rawText);

  assert(raw.layers && typeof raw.layers === "object", "layers object missing");

  REQUIRED_LAYERS.forEach((layerId) => {
    validateLayer(layerId, raw.layers[layerId]);
  });

  console.log("Layer dataset validation passed.");
};

main().catch((error) => {
  console.error("Layer dataset validation failed.");
  console.error(error.message);
  process.exit(1);
});
