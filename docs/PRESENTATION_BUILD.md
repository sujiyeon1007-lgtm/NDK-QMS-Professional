# Project TITAN — Presentation Build Policy

**Version:** V0.9 (Presentation Build)  
**Target:** NDK PQMS (Version 3 · Presentation Version)  
**Lock date:** 2026-07-03

---

## Purpose

Transition from feature addition to **demo-ready presentation build**. Stability and workflow polish take priority over new features.

**Completion criterion:** *"실제 업무에서 이렇게 사용하면 되겠구나"* — CEO Demo · internal review quality.

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

### Recommended Git Flow (V0.9)

```text
localhost develop → test → npm run build
  ↓ PM approval
git checkout presentation
git merge develop   # or cherry-pick release commits
git push origin presentation
  ↓
Vercel auto-deploy (presentation branch)
```

---

## V0.9 → V1.0 Roadmap

| Milestone | Scope |
|-----------|--------|
| **V0.9** (current) | Menu integrity · print preview · seed data · build pass · demo polish |
| **V1.0** | PM-approved Presentation Build · Beta-stable workflow · Sprint-complete outputs |

V1.0 does **not** mean MES Oracle integration (Version 1 architecture roadmap remains long-term).

---

## V0.9 Checklist (release gate)

- [ ] All 9 sidebar menus display and navigate without crash
- [ ] Popups portal to `document.body` (workspace · register · print preview)
- [ ] Inbound list print: click → preview → PDF save
- [ ] SessionStorage demo data on HOME · inbound · quality · documents · history
- [ ] Console Error = 0 on key pages
- [ ] `npm run build` passes
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

- `src/config/presentationBuildPolicy.js`
- `.cursor/rules/project-titan-presentation-build-policy.mdc`
- `.cursor/rules/project-titan-deployment-policy.mdc`
