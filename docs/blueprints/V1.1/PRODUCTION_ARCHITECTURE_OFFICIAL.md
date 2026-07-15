# Project TITAN V1.1 — Official Production Architecture

**Status:** PM Official Blueprint · **2026-07-11**
**Code SSoT:** src/config/titanV11ProductionArchitecture.js
**RC1 Storage:** sessionStorage

---

## Vision

Master-centric + Equipment-centric + Workflow-centric production model.

### Principles

1. **Master First**
2. **Automation First**
3. **Exception Allowed**

---

## PM Sections 1–15

1. Design principles
2. Master registry
3. Product Master hub
4-5. Process type + workflow automation
6. Inbound autofill
7. Production menu
8-9. Pending read / equipment work
10-11. LOT + daily report auto-create
12. Process completion
13. Workflow skip + workflowChangeLog
14. Inspection Template Master (질화 · 침탄 · 쇼트)
15. Certificate Policy Master (항상 · 요청 · 발행 안 함)

---

## Migration Notes

- Legacy specification when no inspectionTemplateId
- Legacy certificateIssuePolicy still read; maps to certificatePolicyId on save
- Legacy process field maps to processWorkflow step 1
- Inbound certificate override wins over product policy

---

## Appendix A — Gap Table

See V11_PRODUCTION_IMPLEMENTATION_GAP in src/config/titanV11ProductionArchitecture.js.

| Section | Topic | Status |
|---:|---|---|
| 1 | Design principles | implemented |
| 2 | Master structure | partial |
| 3 | Product Hub | partial |
| 4 | Process Type Master | implemented |
| 5 | Workflow automation | implemented |
| 6 | Inbound autofill | implemented |
| 7 | Production menu | implemented |
| 8 | Production pending | implemented |
| 9 | Equipment status | implemented |
| 10 | LOT auto-create | implemented |
| 11 | Daily report auto | implemented |
| 12 | Step completion | implemented |
| 13 | Workflow exception | implemented |
| 14 | Inspection Template | partial |
| 15 | Certificate Policy | partial |

---

## Out of Scope

Oracle/API/Repository swap, full UI redesign, PVD/plating/oxidation runtime.

