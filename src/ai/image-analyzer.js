import { debugLog } from "../core/debug.js";

const MAX_EDGE = 1600;

function resolveBackendBase(options) {
  if (options && options.apiBase) return options.apiBase.replace(/\/+$/, "");
  if (typeof window !== "undefined" && window.INTERIOR_API_BASE) {
    return String(window.INTERIOR_API_BASE).replace(/\/+$/, "");
  }
  return "/api/interior";
}

function getAuthToken(options) {
  if (options && options.token) return options.token;
  if (typeof localStorage !== "undefined") {
    return localStorage.getItem("alpha_studio_token") || null;
  }
  return null;
}

export async function resizeImageFile(file, maxEdge = MAX_EDGE) {
  if (!file || !file.type || !file.type.startsWith("image/")) {
    throw new Error("Tệp không phải ảnh.");
  }
  const bitmap = await createImageBitmap(file);
  const longest = Math.max(bitmap.width, bitmap.height);
  const scale = longest > maxEdge ? maxEdge / longest : 1;
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, w, h);
  return await new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Không thể nén ảnh."));
        return;
      }
      resolve(new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" }));
    }, "image/jpeg", 0.88);
  });
}

async function presignAndUpload(file, options) {
  const apiRoot = (options && options.uploadApi) || "/api/upload/presign";
  const token = getAuthToken(options);
  if (!token) throw new Error("Cần đăng nhập trước khi upload ảnh.");
  debugLog("ai", "upload:presign:start", { size: file.size, type: file.type, name: file.name });
  const presignRes = await fetch(apiRoot, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      folder: "interior-design/uploads"
    })
  });
  const presignBody = await presignRes.json().catch(() => ({}));
  if (!presignRes.ok || !presignBody.success) {
    throw new Error(presignBody.message || "Không thể tạo URL upload.");
  }
  const { presignedUrl, publicUrl } = presignBody.data;
  debugLog("ai", "upload:put:start", { publicUrl });
  const putRes = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file
  });
  if (!putRes.ok) throw new Error(`Upload B2 thất bại (${putRes.status}).`);
  debugLog("ai", "upload:done", { publicUrl });
  return publicUrl;
}

export async function analyzeImage(file, options) {
  const opts = options || {};
  const onProgress = typeof opts.onProgress === "function" ? opts.onProgress : () => {};
  const apiBase = resolveBackendBase(opts);
  const token = getAuthToken(opts);
  if (!token) throw new Error("Cần đăng nhập trước khi phân tích ảnh.");

  onProgress({ stage: "resizing" });
  const resized = await resizeImageFile(file, opts.maxEdge || MAX_EDGE);
  debugLog("ai", "resize:done", { originalSize: file.size, resizedSize: resized.size });

  onProgress({ stage: "uploading" });
  const imageUrl = await presignAndUpload(resized, opts);

  onProgress({ stage: "analyzing" });
  const startedAt = performance.now();
  debugLog("ai", "analyze:start", { imageUrl, hintsLength: (opts.hints || "").length });
  const analyzeRes = await fetch(`${apiBase}/analyze-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      imageUrl,
      hints: opts.hints || "",
      modelOverride: opts.modelOverride || "auto"
    })
  });
  const body = await analyzeRes.json().catch(() => ({}));
  debugLog("ai", "analyze:done", {
    status: analyzeRes.status,
    latencyMs: Math.round(performance.now() - startedAt),
    responseSize: JSON.stringify(body).length
  });
  if (!analyzeRes.ok || !body.success) {
    debugLog("ai", "analyze:error", { status: analyzeRes.status, message: body.message });
    if (analyzeRes.status === 402) debugLog("ai", "analyze:quota-exceeded", { message: body.message });
    throw new Error(body.message || `Phân tích thất bại (${analyzeRes.status}).`);
  }
  if (body.data?.model?.meta?.unsupportedRequests?.length) {
    console.warn("[ide:ai] unsupported:", body.data.model.meta.unsupportedRequests);
  }
  onProgress({ stage: "done" });
  return {
    imageUrl,
    model: body.data.model,
    suggestedModel: body.data.suggestedModel,
    meta: body.data.meta
  };
}

export async function generateRender(modelJson, stylePrompt, viewBase64, options) {
  const opts = options || {};
  const apiBase = resolveBackendBase(opts);
  const token = getAuthToken(opts);
  if (!token) throw new Error("Cần đăng nhập trước khi tạo render.");
  const startedAt = performance.now();
  debugLog("ai", "render:start", { promptLength: (stylePrompt || "").length });
  const res = await fetch(`${apiBase}/generate-render`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ modelJson, stylePrompt, viewBase64 })
  });
  const body = await res.json().catch(() => ({}));
  debugLog("ai", "render:done", {
    status: res.status,
    latencyMs: Math.round(performance.now() - startedAt),
    responseSize: JSON.stringify(body).length
  });
  if (!res.ok || !body.success) {
    debugLog("ai", "render:error", { status: res.status, message: body.message });
    if (res.status === 402) debugLog("ai", "render:quota-exceeded", { message: body.message });
    throw new Error(body.message || `Tạo render thất bại (${res.status}).`);
  }
  const renderUrl = body.data?.renderUrl;
  if (renderUrl && typeof opts.onRenderComplete === "function") {
    opts.onRenderComplete(renderUrl, modelJson);
  }
  if (renderUrl && typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new CustomEvent("interior:render-complete", {
      detail: { url: renderUrl, modelSnapshot: modelJson, data: body.data }
    }));
  }
  return body.data;
}
