import { el } from "../core/dom.js";
import { t, pickLang } from "../core/i18n.js";

function relativeTime(timestamp, language) {
  const elapsed = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 1) return t("history.relative.justNow", language);
  if (minutes < 60) return t("history.relative.minutesAgo", language, { n: minutes });
  return t("history.relative.hoursAgo", language, { n: Math.floor(minutes / 60) });
}

function placeholderSvg(label) {
  const safeLabel = String(label || "").slice(0, 24).replace(/[&<>"']/g, "");
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 96"><rect width="160" height="96" fill="#fbf8f1"/><path d="M20 74h120M28 24h104v50H28zM54 24v50M106 24v50" stroke="#9b6b35" stroke-width="5" fill="none"/><text x="80" y="88" text-anchor="middle" font-family="Arial" font-size="10" fill="#6d746f">${safeLabel}</text></svg>`
  )}`;
}

export function attachHistoryPanel(options) {
  const mount = typeof options.mount === "string" ? document.querySelector(options.mount) : options.mount;
  if (!mount) throw new Error("attachHistoryPanel: mount not found");
  const history = options.history;
  const language = pickLang(options.language);
  const onPreview = typeof options.onPreview === "function" ? options.onPreview : () => {};
  const onRestore = typeof options.onRestore === "function" ? options.onRestore : () => {};

  const panel = el("section", { class: "ide-history-panel" });
  const title = el("h3", { class: "ide-history-title", text: t("history.title", language) });
  const list = el("div", { class: "ide-history-list" });
  panel.appendChild(title);
  panel.appendChild(list);
  mount.appendChild(panel);

  function render() {
    list.innerHTML = "";
    const entries = history.list();
    if (!entries.length) {
      list.appendChild(el("p", { class: "ide-history-empty", text: t("history.empty", language) }));
      return;
    }
    const currentId = history.currentEntryId();
    entries.forEach((entry, index) => {
      const card = el("article", { class: "ide-history-card" });
      const thumb = el("img", {
        class: "ide-history-thumb",
        alt: entry.label,
        src: entry.renderUrl || placeholderSvg(entry.label)
      });
      const meta = el("div", { class: "ide-history-meta" });
      meta.appendChild(el("span", { class: "ide-history-time", text: relativeTime(entry.timestamp, language) }));
      meta.appendChild(el("strong", { class: "ide-history-label", text: entry.label }));
      if (entry.id === currentId) {
        meta.appendChild(el("span", { class: "ide-history-badge", text: t("history.current", language) }));
      }
      const actions = el("div", { class: "ide-history-actions" });
      const preview = el("button", { class: "ide-editor-btn", type: "button", text: t("history.preview", language) });
      preview.addEventListener("click", () => onPreview(entry.model, entry));
      actions.appendChild(preview);
      if (entry.id !== currentId) {
        const restore = el("button", { class: "ide-editor-btn", type: "button", text: t("history.restore", language) });
        restore.addEventListener("click", () => onRestore(index, entry));
        actions.appendChild(restore);
      }
      card.appendChild(thumb);
      card.appendChild(meta);
      card.appendChild(actions);
      list.appendChild(card);
    });
  }

  render();

  return {
    refresh: render,
    destroy() { panel.remove(); }
  };
}
