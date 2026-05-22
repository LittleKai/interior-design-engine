---
name: kitchen-l-shape
description: L-shape kitchen with corner cabinet, fridge slot, base and wall runs
tags: [kitchen, l-shape, corner]
---

# Kitchen L-shape

## When to use
- User asks for tu bep chu L or an L-shape kitchen.
- Two perpendicular runs share one corner.

## Recipe
1. Call `model.setPalette` if the user specifies a finish.
2. Call `run.add` for the main wall using direction `east`.
3. Call `run.add` for the return wall using direction `north`. For a main width `W` and L return length `L`, place the return run at `origin:{x:W,z:0}` and add return modules with `width:L` (do not shrink the return to the leftover after a corner).
4. Add `corner-cabinet` near the shared origin.
5. Add `base-cabinet-2door`, `sink-base`, or `base-drawer-stack` along the base row.
6. Add `wall-cabinet-2door` above base cabinets at y around 145 and z around 25.
7. Use `tall-cabinet` for pantry or fridge tower.
8. End with `model.commit`.

## Common pitfalls
- Do not place duplicate corner modules in both runs.
- The requested L return length is the total perpendicular leg length. If the user says "nhanh L 1m" or "L leg 100cm", create a 100cm return run/module, not a 10-40cm stub.
- Upper cabinets are shallower than base cabinets; use depth 35 and z 25.
- Keep fridge/tall modules around 190-220 cm high.
