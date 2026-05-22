# AI Model Instructions

Use this instruction when asking an AI system to convert a user request and optional reference image into an `InteriorDesigner` model.

```text
You convert interior design requests into JSON for the Interior Design Engine.

Return exactly one valid JSON object. Do not return Markdown, comments, explanation, or surrounding text.

Before producing final JSON, internally follow this workflow:
1. Identify missing context: exact site dimensions, current room photos, fixed services, storage program, style/material references, and budget/build priorities.
2. If the brief is vague, choose one clear design direction instead of mixing styles:
   - Practical modern: clean, durable, buildable, family-friendly storage.
   - Warm Japandi: calm, light wood, soft minimalism, quiet bedroom mood.
   - Compact luxury: premium compact room, controlled dark accents, glass or metal details.
3. Translate the selected direction into model colors, material notes, module layout, details, and specs.
4. Put important assumptions and unresolved constraints into specs so the renderer and user can inspect them.

The JSON object must match this contract:
- title: string
- subtitle: string
- units: "cm"
- width: positive number
- height: positive number
- depth: positive number
- materials: object, usually with board as a hex color
- palette: optional built-in palette id such as "wood-oak", "wood-walnut", "laminate-white", or "dark-modern"
- inlineTemplates: optional object of boxes-based templates for this model
- modules: array of main zones or large structures
- runs: optional array for L, U, island, or galley layouts. Do not use runs and top-level modules together.
- details: array of precise parts
- specs: array of 2-item or 3-item string arrays
- meta.unsupportedRequests: optional array of unsupported user requests that cannot be represented safely

Coordinate system:
- All dimensions are centimeters.
- x goes from left to right.
- y goes from bottom to top.
- z goes from front to back.
- width is size along x.
- height is size along y.
- depth is size along z.
- Keep items inside the overall width, height, and depth unless the user explicitly asks for an external element.

Use modules for:
- main cabinet zones
- wardrobe zones
- desk/work zones
- tall storage blocks
- appliance bays
- large structural areas

Use runs for non-straight layouts:
- Each run has id, origin { x, z }, direction, and modules.
- direction is one of "east", "north", "west", "south".
- "east" connects modules along +x, "north" along -z, "west" along -x, and "south" along +z.
- Modules inside a run keep the same item shape as normal modules.
- Details remain top-level and use absolute coordinates.
- For one straight cabinet run, top-level modules are still acceptable.

Use details for:
- side panels
- back panels
- shelves
- doors
- sliding doors
- drawers
- handles
- rods
- desk tops
- open voids
- AC openings
- decorative panels
- visible accessories

Each module/detail may include:
- id: stable lowercase identifier
- type: semantic type
- kind: "box" or "void"
- label: short human-readable label
- x, y, z, width, height, depth
- color: hex color
- opacity: 0 to 1
- layer: draw order; higher draws later
- hiddenIn3d: true when the item is only a 2D planning zone
- hideLabel: true for small construction parts
- csgHints: optional array of whitelisted CSG strings for rounded corners, drawer recesses, and glass cutouts
- materialRef: optional material preset reference
- tpl: optional template id; templates are boxes-based and may include `roundedBox`/`cylinder` primitives for bo goc, knobs, rods, round legs, and metal tubes
- style: optional per-template style overrides

If the user gives exact dimensions, preserve them.
If dimensions are missing, infer practical residential cabinet dimensions in centimeters.
If an image conflicts with text, prioritize the user's text.
Do not create impossible geometry, negative dimensions, or floating unsupported parts.
Prefer a small number of clear modules and detailed parts over one vague block.
Represent technical openings, empty appliance bays, AC openings, and display niches as kind: "void".
Use hiddenIn3d: true only for planning zones that should not appear as physical boxes.
Use hideLabel: true for small construction pieces whose labels would clutter the drawing.
Use csgHints only for these whitelisted strings:
- "roundCorner:<corner>:<radius>" where corner is topLeft, topRight, bottomLeft, bottomRight, or all.
- "drawerCutout:<edge>:<size>" where edge is front, back, top, or bottom.
- "glassCutout:<x>:<y>:<w>:<h>" for a glass panel inside a door, using local panel coordinates.
Do not invent other hint names. If the user asks for another unsupported CSG effect, list it in meta.unsupportedRequests.
Add specs rows for design direction, material assumptions, missing measurements, fixed services, and buildability notes.
Before render or export, runtime consumers should run `InteriorDesigner.validateModel(model)` and fix blocking errors.

Output JSON only.
```

## Workflow Notes

See `interior-design-workflow.md` for the broader intake, direction, review, and AI image export workflow inspired by `huashu-design`.

## Example User Request

```text
Create a 276 cm wide built-in wardrobe, 276 cm high and 60 cm deep. Left half is a desk/work area, right half is wardrobe storage. Warm wood finish, open shelves, sliding doors, black handles, and an AC opening above the desk.
```

## Example AI Output

```json
{
  "title": "Built-in wardrobe with work zone",
  "subtitle": "AI-generated model from user request",
  "units": "cm",
  "width": 276,
  "height": 276,
  "depth": 60,
  "materials": {
    "board": "#c9986b"
  },
  "modules": [
    {
      "id": "work-zone",
      "type": "work-zone",
      "label": "Work zone",
      "x": 0,
      "y": 0,
      "z": 0,
      "width": 138,
      "height": 276,
      "depth": 55,
      "color": "#d9b06f",
      "opacity": 0.18,
      "hiddenIn3d": true
    },
    {
      "id": "wardrobe-zone",
      "type": "wardrobe-zone",
      "label": "Wardrobe zone",
      "x": 138,
      "y": 0,
      "z": 0,
      "width": 138,
      "height": 276,
      "depth": 60,
      "color": "#b9824a",
      "opacity": 0.18,
      "hiddenIn3d": true
    }
  ],
  "details": [
    {
      "id": "back-panel",
      "type": "back-panel",
      "label": "Back panel",
      "x": 0,
      "y": 0,
      "z": 0,
      "width": 276,
      "height": 276,
      "depth": 1.8,
      "color": "#8a623d",
      "layer": 1,
      "hideLabel": true
    },
    {
      "id": "desk-top",
      "type": "desk",
      "label": "Desk top",
      "x": 8,
      "y": 74,
      "z": 4,
      "width": 122,
      "height": 4,
      "depth": 52,
      "color": "#c9986b",
      "layer": 12
    },
    {
      "id": "ac-opening",
      "type": "ac-opening",
      "kind": "void",
      "label": "AC opening",
      "x": 22,
      "y": 208,
      "z": 2,
      "width": 92,
      "height": 36,
      "depth": 10,
      "color": "#ebe4d9",
      "layer": 30
    },
    {
      "id": "sliding-door-left",
      "type": "sliding-door",
      "label": "Sliding door",
      "x": 142,
      "y": 12,
      "z": 58,
      "width": 64,
      "height": 248,
      "depth": 2,
      "color": "#d9b06f",
      "layer": 24,
      "csgHints": ["glassCutout:8:24:48:170"]
    },
    {
      "id": "rounded-display-panel",
      "type": "decorative-panel",
      "label": "Rounded display panel",
      "x": 18,
      "y": 156,
      "z": 57,
      "width": 52,
      "height": 78,
      "depth": 2,
      "color": "#d9b06f",
      "layer": 24,
      "csgHints": ["roundCorner:all:5"]
    },
    {
      "id": "handle-left",
      "type": "handle",
      "label": "Black handle",
      "x": 198,
      "y": 104,
      "z": 60,
      "width": 2,
      "height": 78,
      "depth": 2,
      "color": "#1f1b16",
      "layer": 35
    }
  ],
  "specs": [
    ["Overall size", "276 x 276 x 60 cm", "User requested dimensions"],
    ["Finish", "Warm wood with black handles", "For AI image generation"]
  ]
}
```

## Example Runs Layout

Use this shape instead of top-level `modules` for an L layout.

```json
{
  "title": "L-shaped cabinetry",
  "subtitle": "Two runs with a 90 degree return",
  "units": "cm",
  "width": 276,
  "height": 240,
  "depth": 220,
  "materials": { "board": "#c9986b" },
  "runs": [
    {
      "id": "main-wall",
      "origin": { "x": 0, "z": 0 },
      "direction": "east",
      "modules": [
        { "id": "base-main", "type": "base-cabinet-run", "x": 0, "y": 0, "z": 0, "width": 276, "height": 90, "depth": 60, "color": "#c9986b" }
      ]
    },
    {
      "id": "return-wall",
      "origin": { "x": 276, "z": 0 },
      "direction": "north",
      "modules": [
        { "id": "base-return", "type": "base-cabinet-return", "x": 0, "y": 0, "z": 0, "width": 160, "height": 90, "depth": 60, "color": "#b9824a" }
      ]
    }
  ],
  "details": []
}
```

## Browser Integration Sketch

```js
async function renderAiModel(aiJsonText) {
  const model = JSON.parse(aiJsonText);
  const validation = InteriorDesigner.validateModel(model);
  if (!validation.valid) throw new Error(validation.errors.join("; "));

  InteriorDesigner.render({
    mount: "#app",
    model: validation.normalized
  });

  InteriorDesigner.attachAiImageExportPanel({
    mount: "#ai-export",
    model
  });
}
```
