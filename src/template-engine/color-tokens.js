import { t, pickLang } from "../core/i18n.js";

export const DEFAULT_PALETTE = "wood-oak";

export const PALETTES = {
  "wood-oak": {
    bg: "#f2f0eb",
    cab: "#4a4a52",
    cabLight: "#6b6b75",
    cabDark: "#2e2e35",
    cabEdge: "#3a3a42",
    woodFront: "#c9986b",
    woodFrontL: "#d8a97a",
    woodTop: "#b8875e",
    woodSide: "#9a6b44",
    woodDark: "#6b4423",
    woodBack: "#7a5a3a",
    deskTop: "#e8c89a",
    deskEdge: "#b8875e",
    deskSide: "#9a6b44",
    handle: "#1a1a1a",
    handleEdge: "#2a2a2a",
    glass: "rgba(180,210,230,0.25)",
    glassBorder: "rgba(180,210,230,0.6)",
    dim: "#4a4050",
    dimLine: "#c0b8a8",
    accent: "#b8860b"
  },
  "wood-walnut": {
    bg: "#f0ece7",
    cab: "#3f3530",
    cabLight: "#6c5446",
    cabDark: "#241b17",
    cabEdge: "#33251f",
    woodFront: "#8a623d",
    woodFrontL: "#a97a50",
    woodTop: "#6c4a2d",
    woodSide: "#5a3d28",
    woodDark: "#2f2118",
    woodBack: "#4a3326",
    deskTop: "#d7b07c",
    deskEdge: "#8a623d",
    deskSide: "#5a3d28",
    handle: "#111111",
    handleEdge: "#2a2a2a",
    glass: "rgba(150,175,190,0.28)",
    glassBorder: "rgba(150,175,190,0.65)",
    dim: "#43372f",
    dimLine: "#b9aa99",
    accent: "#9a6b35"
  },
  "laminate-white": {
    bg: "#f5f6f4",
    cab: "#ecece8",
    cabLight: "#ffffff",
    cabDark: "#c8c8c2",
    cabEdge: "#d8d8d2",
    woodFront: "#f7f7f3",
    woodFrontL: "#ffffff",
    woodTop: "#e0e0da",
    woodSide: "#d4d4ce",
    woodDark: "#9b9b94",
    woodBack: "#c7c7c1",
    deskTop: "#f0e1c7",
    deskEdge: "#d3bd98",
    deskSide: "#c8b28e",
    handle: "#1e1e1e",
    handleEdge: "#3a3a3a",
    glass: "rgba(180,210,230,0.22)",
    glassBorder: "rgba(120,150,170,0.55)",
    dim: "#545454",
    dimLine: "#b7b7b0",
    accent: "#8d7a55"
  },
  "dark-modern": {
    bg: "#ecebea",
    cab: "#2f3136",
    cabLight: "#4c5058",
    cabDark: "#17191d",
    cabEdge: "#26282d",
    woodFront: "#30323a",
    woodFrontL: "#454954",
    woodTop: "#25272d",
    woodSide: "#202228",
    woodDark: "#111216",
    woodBack: "#1e2025",
    deskTop: "#d9c7a5",
    deskEdge: "#8d7650",
    deskSide: "#5b503e",
    handle: "#0b0b0c",
    handleEdge: "#2b2b2d",
    glass: "rgba(120,150,170,0.32)",
    glassBorder: "rgba(170,200,220,0.6)",
    dim: "#3a3a3d",
    dimLine: "#aaa49b",
    accent: "#b38b4a"
  }
};

export function resolveToken(paletteId, token) {
  const palette = PALETTES[paletteId || DEFAULT_PALETTE];
  if (!palette) throw new Error(`Unknown palette: ${paletteId}`);
  return Object.prototype.hasOwnProperty.call(palette, token) ? palette[token] : null;
}

export function hasPalette(paletteId) {
  return Object.prototype.hasOwnProperty.call(PALETTES, paletteId);
}

export function listPalettes(language) {
  const lang = pickLang(language);
  return Object.keys(PALETTES).map((id) => ({
    id,
    label: t(`palette.${id}.label`, lang)
  }));
}
