# Interior Design Engine - Agent Router

Static ES-module engine render thiet ke noi that, template DSL va demo browser.

## Doc theo viec

Luon doc `.claude/PROJECT_SUMMARY.md`.

| Task | Doc bat buoc |
|---|---|
| Engine, renderer, editor, style | `.claude/CONVENTIONS.md` |
| Template/model DSL | `.claude/MODEL_CONTRACT.md` |
| Luat chi tiet cu | `.claude/PROJECT_RULES.md` |
| Truoc khi giao | `.claude/SMOKE_TEST_CHECKLIST.md` |

Khong doc generated bundle, mirror runtime, research output hay `.claude/archive/` chi de hieu project.

## Luat bat bien

- Giu static HTML/CSS/JS; khong them build tool neu user khong yeu cau.
- CSS class dung prefix `ide-`; model/public API chi doi khi co yeu cau ro.
- Sua `src/**` phai dong bo mirror `alpha-studio/public/interior-design/src/**`.
- Template DSL phai qua validation; khong dung `eval`.

## VERIFY - artifact static demo/library

1. Chay `node --check` cho moi JS bi sua.
2. Mo `tu_quan_ao_engine_demo.html` qua static server, smoke render/edit/export.
3. So sanh source va mirror runtime; lap lai thao tac de kiem state/rac.
4. Task chi sua docs duoc mien browser smoke; van phai kiem path, placeholder, secret va diff.

## Sau moi task

Cap nhat `.claude/PROJECT_SUMMARY.md`; verify demo va mirror runtime.
