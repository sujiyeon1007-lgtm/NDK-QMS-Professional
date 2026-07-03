# Project TITAN — Presentation Build Policy

**Version:** V1.3 (Presentation Build)  
**Target:** NDK PQMS (Version 3 · Presentation Version)  
**Lock date:** 2026-07-03 · **Menu:** Menu Freeze V1.3 (12 sidebar items · 기준정보 #2 · groups)

---

## Purpose

Transition from feature addition to **demo-ready presentation build**. Stability and workflow polish take priority over new features.

**Completion criterion:** *"실제 업무에서 이렇게 사용하면 되겠구나"* — CEO Demo · internal review quality.

---

## Menu Freeze V1.3 Summary

**Sidebar order:** HOME → 기준정보관리 → 입고현황 → 재고현황 → 작업일보 → 업무일지 → 품질관리 → 문서관리 → 출고현황 → 이력조회 → 통계조회 → 환경설정

**Sidebar groups:** HOME · 기준정보 · 운영(7) · 이력·통계 · 환경설정

**Product workflow:** 입고 → 재고 → 작업일보 → 품질 → 문서 → 출고 → 이력 (업무일지 제외)

**Dev order:** HOME → 기준정보 → 입고 → 재고 → 작업일보 → 업무일지 → 품질 → 문서 → 출고 → 이력 → 통계 → 환경

**Per-menu flow:** Workflow → UI → 기능 → 구현 → 테스트 → **검토** → 승인

See: `docs/MENU_FREEZE_V1.3.md` · `src/config/menuFreezeV1.js`

---

## Branch Structure

| Branch | Purpose | Vercel |
|--------|---------|--------|
| `main` | Stable release baseline · Electron EXE | ❌ |
| `presentation` | **CEO / boss demo only** — Presentation Build snapshots | ✅ (production URL for demos) |
| `develop` | Optional integration branch | ❌ |
| `feature/*` | Daily development · localhost only | ❌ |

### Policy

1. **Boss sees ONLY the `presentation` branch** via Vercel (not raw `develop` or in-progress work).
2. Daily development runs on **localhost** (`npm run dev`).
3. Push to `presentation` only after: checklist pass · `npm run build` OK · Console Error = 0 · PM approval.
4. Do **not** force-push `main` or `presentation` without explicit approval.

### Recommended Git Flow

```text
localhost develop → test → npm run build
  ↓ PM approval · 검토
git checkout presentation
git merge develop   # or cherry-pick release commits
git push origin presentation
  ↓
Vercel auto-deploy (presentation branch)
```

---

## V1.3 Checklist (release gate)

- [ ] All 12 sidebar menus display and navigate without crash
- [ ] Sidebar groups show visual dividers (HOME · master · ops · analysis · system)
- [ ] 기준정보관리 at sidebar position #2
- [ ] Popups portal to `document.body` (workspace · register · print preview)
- [ ] Inbound list print: click → preview → PDF save
- [ ] SessionStorage demo data on HOME · inbound · quality · documents · history
- [ ] Console Error = 0 on key pages
- [ ] `npm run build` passes
- [ ] Menu integrity check passes (`menuIntegrity.js`)
- [ ] `vercel.json` SPA rewrites valid

---

## Environments

| Environment | URL / command | Use |
|-------------|---------------|-----|
| Local | `npm run dev` | Development · unapproved features |
| Presentation Vercel | `presentation` branch deploy | CEO demo · meetings |
| Release | Electron EXE + SQLite | Production (post V1.0) |

---

## Companion

- `docs/PRESENTATION_BUILD_V1.3_HANDOVER.md` — **최종 인수인계** (새 세션 시작용)
- `src/config/presentationBuildPolicy.js`
- `src/config/menuFreezeV1.js`
- `docs/MENU_FREEZE_V1.3.md`
- `.cursor/rules/project-titan-presentation-build-policy.mdc`
- `.cursor/rules/project-titan-menu-freeze-v1.mdc`
- `.cursor/rules/project-titan-deployment-policy.mdc`
