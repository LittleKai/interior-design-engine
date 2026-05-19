export const BUILTIN_TEMPLATES = [
  {
    id: "upper-2door",
    version: 1,
    category: "upper-cabinet",
    tags: ["shaker", "bar-handle", "2-door"],
    description: { vi: "Tu tren 2 canh shaker", en: "2-door upper cabinet" },
    params: { width: { type: "number", min: 40, max: 200, default: 95 }, height: { type: "number", min: 50, max: 130, default: 90 }, depth: { type: "number", min: 30, max: 70, default: 60 } },
    style: { door: { values: ["shaker", "flat"], default: "shaker" }, handle: { values: ["bar", "knob"], default: "bar" } },
    frontSvg: [
      { type: "rect", x: 0, y: 0, w: "{{width / 2}}", h: "{{height}}", fill: "$cab", stroke: "$cabDark", sw: 1.5 },
      { type: "rect", x: "{{width / 2}}", y: 0, w: "{{width / 2}}", h: "{{height}}", fill: "$cab", stroke: "$cabDark", sw: 1.5 },
      { type: "rect", x: 4, y: 6, w: "{{width / 2 - 8}}", h: "{{height - 12}}", rx: 2, fill: "$cabLight", stroke: "$cabEdge", sw: 1, if: "{{style.door == 'shaker'}}" },
      { type: "rect", x: "{{width / 2 + 4}}", y: 6, w: "{{width / 2 - 8}}", h: "{{height - 12}}", rx: 2, fill: "$cabLight", stroke: "$cabEdge", sw: 1, if: "{{style.door == 'shaker'}}" },
      { type: "rect", x: "{{width / 2 - 4}}", y: "{{height / 2 - 10}}", w: 2, h: 20, rx: 1, fill: "$handle", if: "{{style.handle == 'bar'}}" },
      { type: "rect", x: "{{width / 2 + 2}}", y: "{{height / 2 - 10}}", w: 2, h: 20, rx: 1, fill: "$handle", if: "{{style.handle == 'bar'}}" }
    ],
    sideSvg: [{ type: "rect", x: 0, y: 0, w: "{{depth}}", h: "{{height}}", fill: "$cab", stroke: "$cabDark", sw: 1.2 }],
    planSvg: [{ type: "rect", x: 0, y: 0, w: "{{width}}", h: "{{depth}}", fill: "$cab", stroke: "$cabDark", sw: 1.2 }, { type: "line", x1: "{{width / 2}}", y1: 0, x2: "{{width / 2}}", y2: "{{depth}}", stroke: "$cabEdge", sw: 0.8 }],
    isoBoxes: [
      { x: 0, y: 0, z: 0, w: "{{width}}", h: "{{height}}", d: "{{depth}}", faces: { top: "$woodTop", front: "$woodFront", right: "$woodSide", left: "$woodDark", back: "$woodBack" } },
      { x: 2, y: 2, z: "{{depth - 0.5}}", w: "{{width / 2 - 3}}", h: "{{height - 4}}", d: 0.5, faces: { front: "$woodFrontL" } },
      { x: "{{width / 2 + 1}}", y: 2, z: "{{depth - 0.5}}", w: "{{width / 2 - 3}}", h: "{{height - 4}}", d: 0.5, faces: { front: "$woodFrontL" } },
      { x: "{{width / 2 - 5}}", y: "{{height / 2 - 7}}", z: "{{depth}}", w: 1.5, h: 14, d: 1.5, faces: { front: "$handle", top: "$handleEdge", right: "$handle", left: "$handle" } },
      { x: "{{width / 2 + 3.5}}", y: "{{height / 2 - 7}}", z: "{{depth}}", w: 1.5, h: 14, d: 1.5, faces: { front: "$handle", top: "$handleEdge", right: "$handle", left: "$handle" } }
    ]
  },
  {
    id: "upper-glass-2door",
    version: 1,
    category: "upper-cabinet",
    tags: ["glass", "frame", "2-door"],
    description: { vi: "Tu tren 2 canh kinh", en: "2-door glass upper cabinet" },
    params: { width: { type: "number", min: 40, max: 200, default: 95 }, height: { type: "number", min: 50, max: 130, default: 90 }, depth: { type: "number", min: 30, max: 70, default: 60 } },
    style: { handle: { values: ["bar", "knob"], default: "bar" } },
    frontSvg: [
      { type: "rect", x: 0, y: 0, w: "{{width}}", h: "{{height}}", fill: "$cab", stroke: "$cabDark", sw: 1.5 },
      { type: "rect", x: 5, y: 7, w: "{{width / 2 - 9}}", h: "{{height - 14}}", rx: 2, fill: "$glass", stroke: "$glassBorder", sw: 1 },
      { type: "rect", x: "{{width / 2 + 4}}", y: 7, w: "{{width / 2 - 9}}", h: "{{height - 14}}", rx: 2, fill: "$glass", stroke: "$glassBorder", sw: 1 },
      { type: "line", x1: "{{width / 2}}", y1: 0, x2: "{{width / 2}}", y2: "{{height}}", stroke: "$cabDark", sw: 1 },
      { type: "rect", x: "{{width / 2 - 4}}", y: "{{height / 2 - 10}}", w: 2, h: 20, rx: 1, fill: "$handle" },
      { type: "rect", x: "{{width / 2 + 2}}", y: "{{height / 2 - 10}}", w: 2, h: 20, rx: 1, fill: "$handle" }
    ],
    sideSvg: [{ type: "rect", x: 0, y: 0, w: "{{depth}}", h: "{{height}}", fill: "$cab", stroke: "$cabDark", sw: 1.2 }],
    planSvg: [{ type: "rect", x: 0, y: 0, w: "{{width}}", h: "{{depth}}", fill: "$cab", stroke: "$cabDark", sw: 1.2 }],
    isoBoxes: [
      { x: 0, y: 0, z: 0, w: "{{width}}", h: "{{height}}", d: "{{depth}}", faces: { top: "$woodTop", front: "$woodFront", right: "$woodSide", left: "$woodDark", back: "$woodBack" } },
      { x: 5, y: 7, z: "{{depth - 0.4}}", w: "{{width / 2 - 9}}", h: "{{height - 14}}", d: 0.4, faces: { front: "$glass" } },
      { x: "{{width / 2 + 4}}", y: 7, z: "{{depth - 0.4}}", w: "{{width / 2 - 9}}", h: "{{height - 14}}", d: 0.4, faces: { front: "$glass" } },
      { x: "{{width / 2 - 5}}", y: "{{height / 2 - 7}}", z: "{{depth}}", w: 1.5, h: 14, d: 1.5, faces: { front: "$handle", top: "$handleEdge" } },
      { x: "{{width / 2 + 3.5}}", y: "{{height / 2 - 7}}", z: "{{depth}}", w: 1.5, h: 14, d: 1.5, faces: { front: "$handle", top: "$handleEdge" } }
    ]
  },
  {
    id: "sliding-2door",
    version: 1,
    category: "wardrobe",
    tags: ["sliding", "finger-pull", "2-door"],
    description: { vi: "Tu ao cua keo 2 canh", en: "2-door sliding wardrobe" },
    params: { width: { type: "number", min: 100, max: 300, default: 138 }, height: { type: "number", min: 150, max: 260, default: 186 }, depth: { type: "number", min: 55, max: 65, default: 60 } },
    style: { door: { values: ["flat"], default: "flat" }, handle: { values: ["finger-pull"], default: "finger-pull" } },
    frontSvg: [
      { type: "rect", x: 0, y: 0, w: "{{width}}", h: "{{height}}", fill: "$cab", stroke: "$cabDark", sw: 1.5 },
      { type: "rect", x: 0, y: 0, w: "{{width}}", h: 3, fill: "$woodDark", stroke: "$handleEdge", sw: 0.5 },
      { type: "rect", x: 0, y: "{{height - 3}}", w: "{{width}}", h: 3, fill: "$woodDark", stroke: "$handleEdge", sw: 0.5 },
      { type: "rect", x: 1, y: 3, w: "{{width / 2}}", h: "{{height - 6}}", rx: 1, fill: "$cabLight", stroke: "$cabEdge", sw: 1 },
      { type: "rect", x: "{{width / 2}}", y: 3, w: "{{width / 2 - 1}}", h: "{{height - 6}}", rx: 1, fill: "$cab", stroke: "$cabEdge", sw: 1 },
      { type: "rect", x: 5, y: "{{height / 2 - 25}}", w: 2, h: 50, rx: 1, fill: "$handle" },
      { type: "rect", x: "{{width - 7}}", y: "{{height / 2 - 25}}", w: 2, h: 50, rx: 1, fill: "$handle" }
    ],
    sideSvg: [{ type: "rect", x: 0, y: 0, w: "{{depth}}", h: "{{height}}", fill: "$cab", stroke: "$cabDark", sw: 1.2 }],
    planSvg: [{ type: "rect", x: 0, y: 0, w: "{{width}}", h: "{{depth}}", fill: "$cab", stroke: "$cabDark", sw: 1.2 }, { type: "line", x1: 0, y1: "{{depth - 3}}", x2: "{{width}}", y2: "{{depth - 3}}", stroke: "$woodDark", sw: 2 }],
    isoBoxes: [
      { x: 0, y: 0, z: 0, w: "{{width}}", h: "{{height}}", d: "{{depth}}", faces: { top: "$woodTop", front: "$woodBack", right: "$woodSide", left: "$woodDark", back: "$woodBack" } },
      { x: 0, y: "{{height - 3}}", z: "{{depth - 3}}", w: "{{width}}", h: 3, d: 3, faces: { top: "$woodDark", front: "$woodDark", bottom: "$handleEdge" } },
      { x: 0, y: 0, z: "{{depth - 3}}", w: "{{width}}", h: 2, d: 3, faces: { top: "$handleEdge", front: "$woodDark" } },
      { x: 1, y: 2, z: "{{depth - 1.5}}", w: "{{width / 2 - 1}}", h: "{{height - 5}}", d: 1.5, faces: { front: "$woodFrontL", right: "$woodSide", left: "$woodDark", top: "$woodTop" } },
      { x: "{{width / 2}}", y: 2, z: "{{depth - 3}}", w: "{{width / 2 - 1}}", h: "{{height - 5}}", d: 1.5, faces: { front: "$woodFront", right: "$woodSide", left: "$woodDark", top: "$woodTop" } },
      { x: 5, y: "{{height / 2 - 25}}", z: "{{depth - 1}}", w: 2, h: 50, d: 1.2, faces: { front: "$handle", right: "$handleEdge", top: "$handleEdge" } },
      { x: "{{width - 7}}", y: "{{height / 2 - 25}}", z: "{{depth - 2.5}}", w: 2, h: 50, d: 1.2, faces: { front: "$handle", right: "$handleEdge", top: "$handleEdge" } }
    ]
  },
  {
    id: "sliding-3door",
    version: 1,
    category: "wardrobe",
    tags: ["sliding", "3-door"],
    description: { vi: "Tu ao cua keo 3 canh", en: "3-door sliding wardrobe" },
    params: { width: { type: "number", min: 150, max: 400, default: 210 }, height: { type: "number", min: 150, max: 260, default: 220 }, depth: { type: "number", min: 55, max: 65, default: 60 } },
    style: { door: { values: ["flat"], default: "flat" } },
    frontSvg: [
      { type: "rect", x: 0, y: 0, w: "{{width}}", h: "{{height}}", fill: "$cab", stroke: "$cabDark", sw: 1.5 },
      { type: "rect", x: 0, y: 0, w: "{{width}}", h: 3, fill: "$woodDark" },
      { type: "rect", x: 0, y: "{{height - 3}}", w: "{{width}}", h: 3, fill: "$woodDark" },
      { type: "rect", x: 2, y: 4, w: "{{width / 3}}", h: "{{height - 8}}", fill: "$cabLight", stroke: "$cabEdge", sw: 1 },
      { type: "rect", x: "{{width / 3}}", y: 4, w: "{{width / 3}}", h: "{{height - 8}}", fill: "$cab", stroke: "$cabEdge", sw: 1 },
      { type: "rect", x: "{{width * 2 / 3 - 2}}", y: 4, w: "{{width / 3}}", h: "{{height - 8}}", fill: "$cabLight", stroke: "$cabEdge", sw: 1 }
    ],
    sideSvg: [{ type: "rect", x: 0, y: 0, w: "{{depth}}", h: "{{height}}", fill: "$cab", stroke: "$cabDark", sw: 1.2 }],
    planSvg: [{ type: "rect", x: 0, y: 0, w: "{{width}}", h: "{{depth}}", fill: "$cab", stroke: "$cabDark", sw: 1.2 }],
    isoBoxes: [
      { x: 0, y: 0, z: 0, w: "{{width}}", h: "{{height}}", d: "{{depth}}", faces: { top: "$woodTop", front: "$woodBack", right: "$woodSide", left: "$woodDark", back: "$woodBack" } },
      { x: 1, y: 2, z: "{{depth - 1.5}}", w: "{{width / 3}}", h: "{{height - 5}}", d: 1.5, faces: { front: "$woodFrontL", top: "$woodTop" } },
      { x: "{{width / 3}}", y: 2, z: "{{depth - 3}}", w: "{{width / 3}}", h: "{{height - 5}}", d: 1.5, faces: { front: "$woodFront", top: "$woodTop" } },
      { x: "{{width * 2 / 3 - 1}}", y: 2, z: "{{depth - 1.5}}", w: "{{width / 3}}", h: "{{height - 5}}", d: 1.5, faces: { front: "$woodFrontL", top: "$woodTop" } }
    ]
  },
  {
    id: "ac-recess-fold",
    version: 1,
    category: "upper-cabinet",
    tags: ["ac", "fold-down"],
    description: { vi: "Hoc may lanh va canh lat", en: "AC recess with fold-down door" },
    params: { width: { type: "number", min: 60, max: 130, default: 86 }, height: { type: "number", min: 80, max: 130, default: 90 }, depth: { type: "number", min: 50, max: 65, default: 60 } },
    style: {},
    frontSvg: [
      { type: "rect", x: 0, y: 0, w: "{{width}}", h: "{{height * 0.64}}", fill: "#d4dce2", stroke: "#a0b0b8", sw: 1 },
      { type: "rect", x: 5, y: 6, w: "{{width - 10}}", h: "{{height * 0.64 - 12}}", rx: 3, fill: "#f0f0ec", stroke: "#a0b0b8", sw: 1 },
      { type: "line", x1: 5, y1: "{{height * 0.22}}", x2: "{{width - 5}}", y2: "{{height * 0.22}}", stroke: "#a0b0b8", sw: 0.7 },
      { type: "line", x1: 5, y1: "{{height * 0.40}}", x2: "{{width - 5}}", y2: "{{height * 0.40}}", stroke: "#a0b0b8", sw: 0.7 },
      { type: "rect", x: 0, y: "{{height * 0.64}}", w: "{{width}}", h: "{{height * 0.36}}", fill: "$cab", stroke: "$cabDark", sw: 1.5 },
      { type: "rect", x: 3, y: "{{height * 0.64 + 3}}", w: "{{width - 6}}", h: "{{height * 0.36 - 6}}", fill: "$cabLight", stroke: "$cabEdge", sw: 1 },
      { type: "rect", x: "{{width / 2 - 10}}", y: "{{height * 0.82}}", w: 20, h: 1.5, rx: 1, fill: "$handle" }
    ],
    sideSvg: [{ type: "rect", x: 0, y: 0, w: "{{depth}}", h: "{{height}}", fill: "$cab", stroke: "$cabDark", sw: 1.2 }],
    planSvg: [{ type: "rect", x: 0, y: 0, w: "{{width}}", h: "{{depth}}", fill: "$cab", stroke: "$cabDark", sw: 1.2 }],
    isoBoxes: [
      { x: 0, y: 32, z: 0, w: "{{width}}", h: "{{height - 32}}", d: "{{depth}}", faces: { top: "#e0e4e8", front: "#d4dce2", right: "#b8c0c8", left: "#b8c0c8", back: "#8898a4" } },
      { x: 5, y: 38, z: 6, w: "{{width - 10}}", h: "{{height - 44}}", d: 18, faces: { top: "#f4f4f0", front: "#f0f0ec", right: "#d8d8d4", left: "#d8d8d4", back: "#c0c0bc" } },
      { x: 0, y: 0, z: 0, w: "{{width}}", h: 32, d: "{{depth}}", faces: { top: "$woodTop", front: "$woodFront", right: "$woodSide", left: "$woodSide", back: "$woodBack" } },
      { x: 2, y: 2, z: "{{depth - 0.5}}", w: "{{width - 4}}", h: 28, d: 0.5, faces: { front: "$woodFrontL" } },
      { x: "{{width / 2 - 10}}", y: 14, z: "{{depth}}", w: 20, h: 1.5, d: 1.5, faces: { front: "$handle", top: "$handleEdge", bottom: "$handle" } }
    ]
  },
  {
    id: "open-bookshelf",
    version: 1,
    category: "shelf",
    tags: ["open", "bookshelf"],
    description: { vi: "Ke sach mo", en: "Open bookshelf" },
    params: { width: { type: "number", min: 80, max: 200, default: 138 }, height: { type: "number", min: 40, max: 120, default: 80 }, depth: { type: "number", min: 25, max: 40, default: 35 } },
    style: { shelves: { values: [1, 2, 3], default: 2 } },
    frontSvg: [
      { type: "rect", x: 0, y: 0, w: "{{width}}", h: "{{height}}", fill: "$cab", stroke: "$cabDark", sw: 1.5 },
      { type: "rect", x: 4, y: 4, w: "{{width - 8}}", h: "{{height / 2 - 6}}", fill: "$cabDark" },
      { type: "rect", x: 4, y: "{{height / 2 + 2}}", w: "{{width - 8}}", h: "{{height / 2 - 6}}", fill: "$cabDark" },
      { type: "line", x1: 2, y1: "{{height / 2}}", x2: "{{width - 2}}", y2: "{{height / 2}}", stroke: "$woodTop", sw: 2 },
      { type: "rect", x: 8, y: 12, w: 5, h: "{{height / 2 - 16}}", fill: "#9060a0", opacity: 0.75 },
      { type: "rect", x: 17, y: 15, w: 5, h: "{{height / 2 - 19}}", fill: "#6090b0", opacity: 0.75 },
      { type: "rect", x: 26, y: 13, w: 5, h: "{{height / 2 - 17}}", fill: "#b08050", opacity: 0.75 }
    ],
    sideSvg: [{ type: "rect", x: 0, y: 0, w: "{{depth}}", h: "{{height}}", fill: "$cab", stroke: "$cabDark", sw: 1.2 }],
    planSvg: [{ type: "rect", x: 0, y: 0, w: "{{width}}", h: "{{depth}}", fill: "$cab", stroke: "$cabDark", sw: 1.2 }],
    isoBoxes: [
      { x: 0, y: 0, z: 0, w: "{{width}}", h: "{{height}}", d: "{{depth}}", faces: { top: "$woodTop", right: "$woodSide", left: "$woodDark", back: "$woodBack" } },
      { x: 1, y: "{{height / 2 - 1}}", z: 1, w: "{{width - 2}}", h: 2, d: "{{depth - 2}}", faces: { top: "$woodTop", front: "$woodFrontL", bottom: "$woodDark" } },
      { x: 1, y: 0, z: 1, w: "{{width - 2}}", h: 2, d: "{{depth - 2}}", faces: { top: "$woodTop", bottom: "$woodDark" } }
    ]
  },
  {
    id: "l-desk-return",
    version: 1,
    category: "desk",
    tags: ["L-shape", "working"],
    description: { vi: "Ban lam viec chu L", en: "L-shaped desk return" },
    params: { width: { type: "number", min: 80, max: 200, default: 138 }, height: { type: "number", min: 70, max: 80, default: 75 }, depth: { type: "number", min: 50, max: 65, default: 55 }, returnDepth: { type: "number", min: 80, max: 160, default: 130 } },
    style: {},
    frontSvg: [
      { type: "rect", x: 0, y: "{{height - 3}}", w: "{{width}}", h: 3, fill: "$deskTop", stroke: "$deskEdge", sw: 1.2 },
      { type: "rect", x: 0, y: "{{height}}", w: "{{width}}", h: 31, fill: "#e0dcd6", stroke: "#c8c0b0", sw: 0.5 },
      { type: "text", x: "{{width / 2}}", y: "{{height - 7}}", text: "Mat ban lam viec", fill: "$dim", fontSize: 9 }
    ],
    sideSvg: [{ type: "rect", x: 0, y: "{{height - 3}}", w: "{{returnDepth}}", h: 3, fill: "$deskTop", stroke: "$deskEdge", sw: 1 }],
    planSvg: [
      { type: "rect", x: 0, y: 0, w: "{{width}}", h: "{{depth}}", fill: "$deskTop", stroke: "$deskEdge", sw: 1 },
      { type: "rect", x: 0, y: "{{depth}}", w: "{{depth}}", h: "{{returnDepth}}", fill: "$deskTop", stroke: "$deskEdge", sw: 1 }
    ],
    isoBoxes: [
      { x: 0, y: "{{height - 3}}", z: 0, w: "{{width}}", h: 3, d: "{{depth}}", faces: { top: "$deskTop", front: "$deskEdge", right: "$deskSide", left: "$deskSide", back: "$woodBack" } },
      { x: 0, y: 0, z: "{{depth - 3}}", w: 3, h: "{{height - 3}}", d: 3, faces: { front: "$deskSide", left: "$woodDark", right: "$deskSide", top: "$deskEdge" } },
      { x: 0, y: "{{height - 3}}", z: "{{depth}}", w: "{{depth}}", h: 3, d: "{{returnDepth}}", faces: { top: "$deskTop", front: "$deskEdge", right: "$deskSide", left: "$deskSide", back: "$deskEdge" } },
      { x: "{{depth - 3}}", y: 0, z: "{{depth + returnDepth - 3}}", w: 3, h: "{{height - 3}}", d: 3, faces: { front: "$deskSide", left: "$woodDark", right: "$deskSide", top: "$deskEdge" } }
    ]
  }
];
