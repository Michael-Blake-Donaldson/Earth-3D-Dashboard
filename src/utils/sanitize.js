export function sanitizeText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function normalizeQueryValue(value) {
  if (typeof value !== "string") {
    return "";
  }

  try {
    return decodeURIComponent(value).trim();
  } catch (_error) {
    return "";
  }
}
