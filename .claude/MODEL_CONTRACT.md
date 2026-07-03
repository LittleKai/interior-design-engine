# Interior Design Engine Model Contract

**Last Updated:** 2026-05-21

This document describes the stable public model shape accepted by `InteriorDesigner.render()` and `InteriorDesigner.validateModel()`.

## Source Of Truth

The canonical source is the model JSON plus engine files under `tools/interior-design-engine/`. The public embed under `alpha-studio/public/interior-design/` is a mirrored runtime copy. Exported PNG, TXT, JSON download packages, screenshots, and AI conditioning images are generated artifacts, not source-of-truth files.

## Top-Level Model

Required fields:

- `width`: positive number, overall width in centimeters.
- `height`: positive number, overall height in centimeters.
- `depth`: positive number, overall depth in centimeters.
- Either non-empty legacy `modules[]` or non-empty `runs[]`.

Optional fields:

- `title`
- `subtitle`
- `units`
- `materials`
- `palette`: one of `wood-oak`, `wood-walnut`, `laminate-white`, `dark-modern`, `white-oak`, `navy-brass`, `green-sage`, `grey-minimal`.
- `inlineTemplates`
- `details`
- `specs`
- `meta`

Legacy top-level `modules[]` remains supported and is normalized into one default east-facing run.

## Runs

Use `runs[]` for L, U, galley, island, or multi-wall layouts.

Each run contains:

- `id`: optional stable identifier.
- `origin.x`: finite number.
- `origin.z`: finite number.
- `direction`: one of `east`, `north`, `west`, `south`.
- `modules[]`: non-empty array of design items.

Run module coordinate semantics (unified 2026-07-03): within every run, module `x` is the position ALONG the run axis measured from the origin, and module `z` is the perpendicular depth offset from the run's wall line. Directions extend east=+x, west=-x, south=+z, north=-z, so a north run needs its origin at the far z end to stay inside the model. When no module in a run carries an explicit `x > 0`, positions fall back to index-based auto-offset by cumulative widths (legacy single-module runs). Items that already carry `_runDirection` are treated as resolved world coordinates and are not re-translated.

## Design Items

Items appear in `modules[]`, `runs[].modules[]`, and `details[]`.

Supported fields:

- `id`
- `type`
- `kind`
- `label`
- `x`
- `y`
- `z`
- `width`
- `height`
- `depth`
- `color`
- `opacity`
- `layer`
- `materialRef`
- `tpl`
- `style`
- `hiddenIn3d`
- `hideLabel`

`width`, `height`, and `depth` must be finite positive numbers after defaulting. Modules default to the model size when dimensions are omitted. Details default to `1` cm for omitted dimensions.

`style.colors` is the supported per-module color override surface for template modules. Example:

```json
{
  "tpl": "base-cabinet-2door",
  "style": {
    "colors": {
      "front": "#1d2b44",
      "body": "#ffffff",
      "handle": "#c9a354"
    }
  }
}
```

Semantic keys include `front`, `body`, `top`, `side`, `back`, `handle`, `metal`, `fabric`, `stone`, `ceramic`, `plant`, `led`, `accent`, and `accent2`. Direct token keys such as `woodFront`, `cab`, `metalDark`, `plantGreen`, and `ledWarm` are also accepted.

## Templates

Modules may use `tpl` to reference a template. Since Phase 14, templates are `boxes`-based: 3D primitive definitions are the source of truth, and 2D front/side/plan drawings are projected from resolved primitives.

Supported `boxes[]` primitives:

- No `type` or `type: "box"`: regular rectangular box with `x/y/z/w/h/d`.
- `type: "roundedBox"`: rectangular box with `radius` for rounded 2D projections and rounded-form metadata.
- `type: "cylinder"`: round primitive with `x/y/z`, `radius`, `length`, and `axis: "x" | "y" | "z"` for knobs, rods, round legs, pendant stems, or metal tubes.

Inline templates may be supplied through `inlineTemplates`. Built-in templates and approved backend templates are loaded by the template catalog.

Template `faces` colors may use literal hex/rgba values or palette tokens. Supported tokens include `woodFront`, `woodFrontL`, `woodTop`, `woodSide`, `woodDark`, `woodBack`, `cab`, `cabLight`, `cabDark`, `cabEdge`, `handle`, `handleEdge`, `metal`, `metalDark`, `fabric`, `fabricDark`, `stone`, `stoneDark`, `ceramic`, `plantGreen`, `ledWarm`, `glass`, `glassBorder`, `accent`, and `accent2`. Backend validation rejects unknown `$token` references before import or `tplNew` promotion.

## Validation

Call `InteriorDesigner.validateModel(model)` before render/export when consuming AI-generated JSON. It returns:

```js
{
  valid: boolean,
  errors: string[],
  warnings: string[],
  normalized: object
}
```

Blocking errors cover invalid model shape, missing/invalid overall dimensions, missing modules/runs, invalid run metadata, and zero or negative item dimensions. Warnings cover recoverable fallbacks such as unknown palettes, suspicious material semantics, and unresolved template references.
