# Interior Design Engine

Static browser library for rendering an interior design model into front, side, plan, 3D schematic, specs, and AI image export assets.

The library exposes `window.InteriorDesigner` from `interior-design-engine.js`. It does not call an AI service directly. AI systems should produce a structured model JSON object, then this library renders that model.

## Files

- `interior-design-engine.js` - reusable rendering and AI export library.
- `interior-design-engine.css` - styles for the generated UI.
- `tu_quan_ao_engine_demo.html` - demo model and usage example.
- `interior-design-model.schema.json` - JSON Schema contract for AI-generated models.
- `ai-model-instructions.md` - prompt template for asking an AI to create compatible model JSON.
- `interior-design-workflow.md` - intake, design direction, review, and AI image export workflow.

## Basic Usage

```html
<link rel="stylesheet" href="./interior-design-engine.css">

<div id="app"></div>
<div id="design-review"></div>
<div id="ai-export"></div>

<script src="./interior-design-engine.js"></script>
<script>
  const model = {
    title: "Built-in wardrobe",
    subtitle: "Generated from user request",
    units: "cm",
    width: 276,
    height: 276,
    depth: 60,
    materials: {
      board: "#c9986b"
    },
    modules: [
      {
        type: "wardrobe-zone",
        label: "Wardrobe zone",
        x: 0,
        y: 0,
        z: 0,
        width: 276,
        height: 276,
        depth: 60,
        color: "#c9986b"
      }
    ],
    details: [
      {
        type: "door",
        label: "Sliding door",
        x: 0,
        y: 0,
        z: 58,
        width: 138,
        height: 260,
        depth: 2,
        color: "#d9b06f",
        layer: 20
      }
    ],
    specs: [
      ["Style", "Modern built-in cabinet", "Derived from user request"]
    ]
  };

  InteriorDesigner.render({
    mount: "#app",
    model
  });

  InteriorDesigner.attachDesignReviewPanel({
    mount: "#design-review",
    model,
    language: "vi"
  });

  InteriorDesigner.attachAiImageExportPanel({
    mount: "#ai-export",
    model
  });
</script>
```

## Public API

### `InteriorDesigner.render(options)`

Renders the tabbed design UI.

```js
InteriorDesigner.render({
  mount: "#app",
  model
});
```

### `InteriorDesigner.buildAiPrompt(model, promptOptions)`

Builds a text prompt for external image generation from the same design model. English is the default because many image-generation models follow English prompts more consistently. Use `language: "vi"` when you want a Vietnamese review copy for the user.

```js
const promptEn = InteriorDesigner.buildAiPrompt(model, {
  language: "en",
  colorSchemeEn: "warm oak and matte black handles",
  materialEn: "natural wood veneer",
  roomLayoutEn: "compact modern bedroom",
  lightingEn: "soft daylight",
  extra: "Keep the desk opening visible"
});

const promptVi = InteriorDesigner.buildAiPrompt(model, {
  language: "vi",
  colorSchemeVi: "gỗ sồi ấm và tay nắm đen mờ",
  materialVi: "veneer gỗ tự nhiên",
  roomLayoutVi: "phòng ngủ hiện đại nhỏ gọn",
  lightingVi: "ánh sáng tự nhiên mềm",
  extra: "Giữ rõ ô bàn làm việc"
});
```

### `InteriorDesigner.getDesignDirections(options)`

Returns the built-in design directions used by the AI workflow and export panel.

```js
const directions = InteriorDesigner.getDesignDirections({ language: "vi" });
```

Current directions:

- Practical modern.
- Warm Japandi.
- Compact luxury.

### `InteriorDesigner.buildIntakeChecklist(options)`

Returns the context checklist an AI or UI should collect before final model generation.

```js
const checklist = InteriorDesigner.buildIntakeChecklist({ language: "en" });
```

### `InteriorDesigner.reviewModel(model, options)`

Runs a lightweight schematic review against the normalized model. This does not replace construction review, but it catches common AI-model problems before export.

```js
const review = InteriorDesigner.reviewModel(model, { language: "vi" });

if (review.score < 8) {
  console.warn(review.issues);
}
```

### `InteriorDesigner.attachDesignReviewPanel(options)`

Mounts the built-in review panel for a model.

```html
<div id="design-review"></div>
```

```js
InteriorDesigner.attachDesignReviewPanel({
  mount: "#design-review",
  model,
  language: "vi"
});
```

### `InteriorDesigner.createAiImagePackage(options)`

Creates reference images, English/Vietnamese prompt text, a short Vietnamese usage guide, and normalized model JSON in memory.

```js
const pkg = await InteriorDesigner.createAiImagePackage({
  model,
  views: ["front", "side", "plan", "3d"]
});
```

The package includes:

- `reference-front.png`, `reference-side.png`, `reference-plan.png`, `reference-3d.png`
- `ai-image-prompt-en.txt` - recommended prompt for AI image generation
- `ai-image-prompt-vi.txt` - Vietnamese copy for user review
- `huong-dan-tao-anh-ai.txt`
- `design-model.json`

### `InteriorDesigner.downloadAiImagePackage(options)`

Downloads the generated package files in the browser.

```js
await InteriorDesigner.downloadAiImagePackage({ model });
```

### `InteriorDesigner.attachAiImageExportPanel(options)`

Mounts the built-in AI image export panel.

```js
InteriorDesigner.attachAiImageExportPanel({
  mount: "#ai-export",
  model
});
```

## Model Contract

The model is a plain JavaScript object. Coordinates and dimensions use centimeters by default.

Coordinate convention:

- `x`: left to right.
- `y`: bottom to top.
- `z`: front to back.
- `width`: size along x.
- `height`: size along y.
- `depth`: size along z.

Top-level fields:

| Field | Type | Required | Purpose |
| --- | --- | --- | --- |
| `title` | string | no | Main design title. |
| `subtitle` | string | no | Short supporting description. |
| `units` | string | no | Usually `cm`. |
| `width` | number | yes | Overall model width. |
| `height` | number | yes | Overall model height. |
| `depth` | number | yes | Overall model depth. |
| `materials` | object | no | Shared material/color values. |
| `modules` | array | yes | Main zones or large structures. |
| `details` | array | no | Panels, doors, shelves, handles, rods, appliances, voids. |
| `specs` | array | no | Extra rows for the specs tab. |

Item fields for `modules` and `details`:

| Field | Type | Required | Purpose |
| --- | --- | --- | --- |
| `id` | string | no | Stable item identifier. |
| `type` | string | no | Semantic type, such as `door`, `shelf`, `rod`, `void`. |
| `kind` | string | no | Render primitive. Defaults to `box`; `void` is used for openings. |
| `label` | string | no | Display label. |
| `x`, `y`, `z` | number | no | Item origin. Defaults to `0`. |
| `width`, `height`, `depth` | number | no | Item size. Modules default to full model size; details default to `1`. |
| `color` | string | no | CSS color, usually hex. |
| `opacity` | number | no | SVG/canvas opacity from `0` to `1`. |
| `layer` | number | no | Draw order. Higher values render later. |
| `hiddenIn3d` | boolean | no | Hide item in the 3D schematic. |
| `hideLabel` | boolean | no | Hide item label in drawings. |

Use `interior-design-model.schema.json` when validating AI output.

## AI Integration Flow

Recommended flow:

1. Collect project context using `InteriorDesigner.buildIntakeChecklist()` or the checklist in `interior-design-workflow.md`.
2. If the brief is vague, choose one of the built-in design directions from `InteriorDesigner.getDesignDirections()`.
3. Send the user text, optional image, selected direction, and known constraints to an AI model.
4. Use `ai-model-instructions.md` as the system/developer instruction.
5. Ask the AI to return JSON only.
6. Parse the JSON.
7. Validate it against `interior-design-model.schema.json`.
8. Run `InteriorDesigner.reviewModel()` and inspect issues before image export.
9. Pass the model to `InteriorDesigner.render()`.
10. Optionally call `createAiImagePackage()` to generate image references, English/Vietnamese prompts, a usage guide, and model JSON for external photorealistic rendering.

In the export panel, the UI labels and usage guide are Vietnamese. The prompt tab shows both versions: English for the image AI, Vietnamese for user review.
The prompt tab also includes a design direction selector adapted from the workflow.

For production, do not expose AI provider API keys in static HTML. Put the AI call behind a backend endpoint and return the model JSON to the browser.

## Editor Mode

The engine ships with a lightweight property editor. It is select + edit only — no drag and drop, no module splitting. Use it to tweak an AI-generated model before exporting.

```html
<div id="editor"></div>
<script type="module">
  import "./src/index.js";

  const result = InteriorDesigner.enableEditor({
    mount: "#editor",
    model: cabinetModel,
    language: "vi",
    onChange: (nextModel, change) => {
      // change.type is "edit" | "delete" | "undo" | "redo" | "external"
      console.log("model changed", change, nextModel);
    }
  });

  // result.getModel()       -> current model
  // result.setModel(next)   -> replace model (pushes a history entry)
  // result.destroy()        -> tear down editor + listeners
</script>
```

**Interactions**

- Click any detail in a front/side/plan view to select it. The sidebar form fills with name, position (x/y/z), size (width/height/depth), color, material preset, and catalog id.
- Edit any field and the model updates instantly. All four tabs re-render together (front/side/plan/3D) so dimensions and the 3D scene stay in sync.
- Sidebar buttons: **Undo**, **Redo**, **Delete detail**.
- Keyboard: `Ctrl+Z` undo, `Ctrl+Y` or `Ctrl+Shift+Z` redo, `Delete` removes the selected item, `Escape` clears selection. Keys are ignored while typing in a form field (except `Escape`).
- History keeps up to 50 snapshots via `structuredClone`. Editing after an undo discards the redo tail.

The editor uses `BoxService.update` / `BoxService.delete` for every mutation, so the model JSON shape stays valid and ready to feed back into `createAiImagePackage()` or `analyzeImage()`.
"# interior-design-engine" 
# interior-design-engine
