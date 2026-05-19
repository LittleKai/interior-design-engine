import { el } from "../core/dom.js";
import { normalizeModel, allItems, modelBounds } from "../core/model.js";
import { t, pickLang, buildIntakeChecklist } from "../core/i18n.js";

export function reviewModel(input, options) {
  const language = pickLang(options && options.language);
  const model = normalizeModel(input || {});
  const issues = [];
  const strengths = [];
  const items = allItems(model);
  const modules = model.modules || [];
  const details = model.details || [];
  const bounds = modelBounds(model);

  function addIssue(category, key, arg) {
    const value = t(`review.msg.${key}`, language);
    issues.push({ category, text: typeof value === "function" ? value(arg) : value });
  }

  function addStrength(category, key, arg) {
    const value = t(`review.msg.${key}`, language);
    strengths.push({ category, text: typeof value === "function" ? value(arg) : value });
  }

  if (modules.length >= 2) {
    addStrength("function", "multiZoneGood");
  } else {
    addIssue("function", "singleZoneBad");
  }

  if (details.length >= 6) {
    addStrength("craft", "enoughDetail");
  } else {
    addIssue("craft", "sparseDetail");
  }

  const overflowItems = items.filter((item) => (
    item.x < 0 ||
    item.y < 0 ||
    item.z < 0 ||
    item.x + item.width > model.width ||
    item.y + item.height > model.height ||
    item.z + item.depth > model.depth
  ));
  if (overflowItems.length) {
    addIssue("geometry", "overflowItems", overflowItems.length);
  } else {
    addStrength("geometry", "boundsOk");
  }

  const hasVoid = details.some((item) => item.kind === "void");
  if (hasVoid) {
    addStrength("buildability", "hasVoid");
  }

  const hasMaterials = model.materials && Object.keys(model.materials).length > 0;
  if (hasMaterials) {
    addStrength("material", "hasMaterials");
  } else {
    addIssue("material", "noMaterials");
  }

  const score = Math.max(0, Math.min(10, 10 - issues.length * 1.5));
  return {
    score,
    dimensions: {
      width: model.width,
      height: model.height,
      depth: model.depth,
      bounds
    },
    strengths,
    issues,
    checklist: buildIntakeChecklist({ language })
  };
}

export function attachDesignReviewPanel(options) {
  const settings = Object.assign({
    mount: null,
    model: null,
    language: "vi",
    titleVi: null,
    titleEn: null
  }, options || {});
  const language = pickLang(settings.language);
  const mount = typeof settings.mount === "string" ? document.querySelector(settings.mount) : settings.mount;
  if (!mount) throw new Error("InteriorDesigner.attachDesignReviewPanel: mount element not found.");

  const review = reviewModel(settings.model || {}, { language });
  const panel = el("section", { class: "ide-review-panel" });
  const statusClass = review.score >= 8 ? "is-good" : review.score >= 5 ? "is-warning" : "is-critical";
  const explicitTitle = language === "vi" ? settings.titleVi : settings.titleEn;
  const title = explicitTitle || t("review.title", language);

  panel.appendChild(el("div", { class: "ide-review-header" }, [
    el("div", {}, [
      el("h2", { text: title }),
      el("p", { text: t("review.subtitle", language) })
    ]),
    el("div", { class: `ide-review-score ${statusClass}`, text: `${review.score.toFixed(1)}/10` })
  ]));

  const issueList = review.issues.length
    ? review.issues.map((item) => el("li", { text: item.text }))
    : [el("li", { text: t("review.noIssues", language) })];
  const strengthList = review.strengths.length
    ? review.strengths.map((item) => el("li", { text: item.text }))
    : [el("li", { text: t("review.noStrengths", language) })];

  panel.appendChild(el("div", { class: "ide-review-grid" }, [
    el("div", { class: "ide-review-card" }, [
      el("strong", { text: t("review.issuesHeader", language) }),
      el("ul", {}, issueList)
    ]),
    el("div", { class: "ide-review-card" }, [
      el("strong", { text: t("review.strengthsHeader", language) }),
      el("ul", {}, strengthList)
    ]),
    el("div", { class: "ide-review-card" }, [
      el("strong", { text: t("review.checklistHeader", language) }),
      el("ul", {}, review.checklist.map((item) => el("li", { text: item.text })))
    ])
  ]));

  mount.innerHTML = "";
  mount.appendChild(panel);
  return { review, panel };
}
