# Conventions - Interior Design Engine

**Last Updated:** 2026-09-16

| Quy uoc | Vi du that |
|---|---|
| Model duoc validate tai boundary truoc render | `src/core/validation.js::validateModel`, `src/ui/main-renderer.js::mount3dTab` |
| 3D boxes la source truth; renderer chi project tu boxes | `src/core/box-resolver.js::resolveItemBoxes`, `src/template-engine/interpreter.js::projectBoxToView` |
| Template DSL di qua interpreter whitelist, khong dung `eval` | `src/template-engine/interpreter.js::renderTemplate`, `src/template-engine/expression.js::evalExpr` |
| Renderer co class/module rieng va dung chung resolver | `src/renderers/iso-renderer.js::IsoRenderer`, `src/renderers/svg-renderer.js::renderSvg` |

## Cuong che bang cong cu

| Quy uoc | Cong cu cuong che |
|---|---|
| JavaScript syntax | `node --check src/index.js` va file JS bi sua |
| Model/template invariants | `node --test src/**/__tests__/*.test.mjs` |
| Source va mirror khop | so sanh `src/**` voi `alpha-studio/public/interior-design/src/**` |
