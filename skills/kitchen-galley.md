---
name: kitchen-galley
description: Parallel galley kitchen with two opposing cabinet runs
tags: [kitchen, galley, parallel]
---

# Kitchen Galley

## When to use
- User asks for bep song song, galley kitchen, or two opposing counters.

## Recipe
1. Add a main `east` run with `origin:{x:0,z:0}`.
2. Add a second `west` run with `origin:{x:model.width, z:model.depth - 60}` (west extends toward -x from its origin) leaving a 90-120 cm aisle. In every run, module `x` is the position along the run axis and `z` is the perpendicular depth offset; coordinates must stay inside 0..width / 0..depth.
3. Use `base-cabinet-2door`, `base-drawer-stack`, and `sink-base` for lower cabinets.
4. Add `wall-cabinet-2door` only where there is wall space.
5. Keep appliance/tall storage at row ends.

## Common pitfalls
- Maintain walking clearance between runs.
- Do not mirror upper cabinets into open aisle if no wall is implied.
