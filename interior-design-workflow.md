# Interior Design Workflow

This workflow adapts the useful parts of `huashu-design` for the Interior Design Engine. The engine remains a static renderer; the workflow sits above it and helps an AI produce better model JSON before rendering.

## Goal

Convert a vague interior request into one or more renderable `InteriorDesigner` models with enough context for schematic drawings and AI image prompts.

Recommended pipeline:

1. Collect project context.
2. Create 1 to 3 design directions.
3. Generate model JSON for each selected direction.
4. Validate the model with `InteriorDesigner.validateModel(model)`.
5. Render front, side, plan, 3D, and specs.
6. Review the model before exporting AI image prompts.
7. Export reference images and prompt files for photorealistic image generation.

## Context Checklist

Ask for these inputs before generating the final model when they are missing:

| Input | Why it matters |
| --- | --- |
| Site measurements | Keeps the model physically plausible: width, height, depth, ceiling, columns, beams, baseboards. |
| Current room photos | Prevents guessing wall openings, floor color, adjacent furniture, windows, and obstacles. |
| Fixed services | Protects outlets, switches, AC, vents, pipes, appliances, and other immovable elements. |
| Storage program | Determines module layout: hanging, drawers, shelves, desk, appliances, special objects. |
| Style and material references | Stabilizes colors, board finish, hardware, lighting, and AI image prompts. |
| Budget or build priority | Helps decide between simple laminate, veneer, glass, metal, lighting, and complex details. |

If the user wants speed, make explicit assumptions and write them into `specs`.

## Direction Advisor

When the brief is vague, do not produce only one design. Offer three differentiated directions:

| Direction | Use when | Material tendency |
| --- | --- | --- |
| Practical modern | User wants clean, safe, buildable, family-friendly storage. | Durable laminate, light veneer, matte black hardware. |
| Warm Japandi | User wants calm, soft minimalism, light wood, quiet bedroom mood. | Pale oak, ash veneer, satin finish, neutral wall and textiles. |
| Compact luxury | User wants a premium look in a small room. | Dark walnut, smoked glass, champagne or black metal, warm accent lighting. |

In code, use:

```js
const directions = InteriorDesigner.getDesignDirections({ language: "vi" });
```

The export panel also exposes these directions in the prompt tab.

## Model Generation Rules

Use `modules` for large functional zones and `details` for construction pieces. Keep all dimensions in centimeters.

Good model behavior:

- Preserve exact user dimensions.
- Keep every item inside the model bounds unless an external element is explicitly requested.
- Represent openings as `kind: "void"`.
- Use `hiddenIn3d: true` for planning zones that should not appear as physical boxes.
- Add enough construction details for AI image generation: panels, shelves, doors, tracks, handles, rods, desk surfaces, openings.
- Put assumptions, materials, and unresolved constraints into `specs`.

Avoid:

- One vague block for the whole cabinet.
- Floating unsupported elements.
- Negative or impossible dimensions.
- Prompt-only style notes that are not reflected in colors/materials/specs.

## Review Gate

Before render/export, validate runtime shape:

```js
const validation = InteriorDesigner.validateModel(model);
if (!validation.valid) {
  console.error(validation.errors);
}
```

Then run the schematic review:

```js
const review = InteriorDesigner.reviewModel(model, { language: "vi" });
console.log(review.score, review.issues, review.strengths);
```

Use the result as a lightweight gate:

| Score | Action |
| --- | --- |
| 8 to 10 | Safe to render/export. |
| 5 to 7.9 | Render is usable, but inspect issues before image generation. |
| Below 5 | Ask for missing context or revise the model. |

Review dimensions are schematic, not a substitute for construction drawings.

## AI Image Export

Use `createAiImagePackage()` after the model passes review:

```js
const pkg = await InteriorDesigner.createAiImagePackage({
  model,
  views: ["front", "side", "plan", "3d"],
  promptOptions: {
    language: "en",
    extra: "Keep the AC opening visible and preserve all cabinet bay proportions."
  }
});
```

Upload all `reference-*.png` files to the image-generation tool first, then use `ai-image-prompt-en.txt`. The Vietnamese prompt is mainly for user review.
