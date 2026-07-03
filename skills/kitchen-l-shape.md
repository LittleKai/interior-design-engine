---
name: kitchen-l-shape
description: L-shape kitchen with corner cabinet, fridge slot, base and wall runs
tags: [kitchen, l-shape, corner]
---

# Kitchen L-shape

## When to use
- User asks for tu bep chu L or an L-shape kitchen.
- Two perpendicular runs share one corner.

## Coordinate rules
- In every run, module `x` is the position ALONG the run axis measured from the run origin; module `z` is the perpendicular depth offset from the run's wall.
- All resolved coordinates must stay inside the model block: 0..width on x, 0..depth on z.
- A return leg going from the back wall (z=0) into the room uses direction `south` with `origin:{x:0,z:0}` (south = +z). Use `north` only with the origin at the far end (`origin.z = model.depth`) because north extends toward -z.
- The corner block belongs to exactly ONE run. Shift the other run's origin past the corner so nothing overlaps.

## Recipe
1. Call `model.setPalette` if the user specifies a finish.
2. Call `run.add` for the return wall first: direction `south`, `origin:{x:0,z:0}` (left wall; for a right wall use `origin.x = model.width - depth`). Add `corner-cabinet` at `x:0`, then the remaining return modules at cumulative x. For a requested L return length `L`, the return modules must total `L` along the run (do not shrink the return to a stub).
3. Call `run.add` for the main wall: direction `east`, `origin:{x:C,z:0}` where `C` is the corner block depth (e.g. 100), so main modules start after the corner.
4. Add `base-cabinet-2door`, `sink-base`, or `base-drawer-stack` along the main base row with cumulative x; the last module should end exactly at `model.width - C`.
5. Add `wall-cabinet-2door` above base cabinets at y around 145 and z around 25.
6. Use `tall-cabinet` for pantry or fridge tower.
7. End with `model.commit`.

## Common pitfalls
- Do not place duplicate corner modules in both runs.
- Do not place a `north` run with `origin.z = 0` — its modules resolve to negative z, outside the model.
- The requested L return length is the total perpendicular leg length. If the user says "nhanh L 1m" or "L leg 100cm", create a 100cm return run/module, not a 10-40cm stub.
- Upper cabinets are shallower than base cabinets; use depth 35 and z 25.
- Keep fridge/tall modules around 190-220 cm high.
