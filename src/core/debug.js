export function isDebugEnabled() {
  if (typeof window === "undefined") return false;
  try {
    return window.location.search.includes("debug=1") || localStorage.getItem("ide:debug") === "1";
  } catch (e) {
    return false;
  }
}

export function debugLog(scope, event, payload) {
  if (!isDebugEnabled()) return;
  if (typeof console !== "undefined" && typeof console.debug === "function") {
    console.debug(`[ide:${scope}]`, event, payload || {});
  }
}
