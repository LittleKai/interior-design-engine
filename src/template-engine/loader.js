import { BUILTIN_TEMPLATES } from "./builtin-templates.js";

// CATALOG is seeded synchronously from BUILTIN_TEMPLATES so the first render
// can resolve `tpl` references without awaiting a fetch. `hasFetched` tracks
// whether we have actually merged in the static manifest + backend rows; until
// it flips true, `loadTemplateCatalog()` will perform the merge so that
// admin-approved templates from Phase 12 reach the engine.
let CATALOG = new Map(BUILTIN_TEMPLATES.map((template) => [template.id, template]));
let hasFetched = false;
const INLINE = new Map();
let backendFetchInflight = null;

function readToken() {
  if (typeof window !== "undefined" && typeof window.__IDE_AUTH_TOKEN__ === "string" && window.__IDE_AUTH_TOKEN__.trim()) {
    return window.__IDE_AUTH_TOKEN__.trim();
  }
  if (typeof localStorage !== "undefined") {
    try {
      const stored = localStorage.getItem("alpha_studio_token");
      if (stored) return stored;
    } catch (err) {
      // ignore
    }
  }
  return null;
}

function readBackendUrl() {
  if (typeof window !== "undefined" && typeof window.__IDE_BACKEND_URL__ === "string" && window.__IDE_BACKEND_URL__.trim()) {
    return window.__IDE_BACKEND_URL__.trim();
  }
  return null;
}

async function fetchStaticManifest() {
  try {
    const manifestRes = await fetch("./src/templates/manifest.json");
    if (!manifestRes.ok) return [];
    const manifest = await manifestRes.json();
    const templates = await Promise.all((manifest.templates || []).map(async (name) => {
      try {
        const res = await fetch(`./src/templates/${name}`);
        if (!res.ok) return null;
        return res.json();
      } catch (err) {
        return null;
      }
    }));
    return templates.filter((tpl) => tpl && tpl.id);
  } catch (err) {
    return [];
  }
}

async function fetchBackendTemplates(backendUrl) {
  const url = backendUrl || readBackendUrl();
  if (!url) return [];
  const token = readToken();
  try {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json?.data?.templates) ? json.data.templates : [];
  } catch (err) {
    console.warn("[ide:loader] backend templates fetch failed:", err.message || err);
    return [];
  }
}

export async function loadTemplateCatalog(options = {}) {
  if (hasFetched && !options.force) return CATALOG;
  if (backendFetchInflight && !options.force) return backendFetchInflight;

  backendFetchInflight = (async () => {
    const merged = new Map(BUILTIN_TEMPLATES.map((template) => [template.id, template]));
    const [staticTemplates, backendTemplates] = await Promise.all([
      fetchStaticManifest(),
      fetchBackendTemplates(options.backendUrl)
    ]);
    staticTemplates.forEach((tpl) => merged.set(tpl.id, tpl));
    backendTemplates.forEach((tpl) => merged.set(tpl.id, tpl));
    CATALOG = merged;
    hasFetched = true;
    return CATALOG;
  })();

  try {
    const result = await backendFetchInflight;
    return result;
  } finally {
    backendFetchInflight = null;
  }
}

export function getTemplate(id) {
  if (INLINE.has(id)) return INLINE.get(id);
  return CATALOG.get(id) || null;
}

export function registerInlineTemplates(inlineDict) {
  INLINE.clear();
  Object.entries(inlineDict || {}).forEach(([id, template]) => {
    if (template && typeof template === "object") INLINE.set(template.id || id, template);
  });
}

export function resetCache() {
  CATALOG = new Map(BUILTIN_TEMPLATES.map((template) => [template.id, template]));
  INLINE.clear();
  backendFetchInflight = null;
  hasFetched = false;
}
