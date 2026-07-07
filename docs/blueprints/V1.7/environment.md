# Blueprint — 환경설정 (V1.7)

**Status:** ⏳ PM 승인 대기 · **Route:** `/environment`

---

## 1. 목적 (Purpose)

시스템 · 사용자 · 권한 · 저장경로 · Module · **MES PoC (Admin)** · About.

---

## 2. 역할 (Role)

**가능**

- 프로그램/Edition 설정 (architecture)
- Module ON/OFF
- Admin: MES PoC · Architecture · Debug

**불가**

- 일상 생산/품질 업무 · Master Data 대체

---

## 3. 화면 구성 (Layout)

```text
Tab Shell
  ↓
Section panels (프로그램 · 저장 · 사용자 · 관리자 · About)
```

---

## 4. 데이터 (Data)

| Source | 용도 |
|--------|------|
| `operationMode.js` · `titanEditionSession` | Edition |
| `demoAdminPolicy` · `titanAdminAccess` | Admin UI |
| `dashboardStore` | 캐시 (간접) |

---

## 5. Workflow

```text
설정 변경 → Session persist → Sidebar/HOME/권한 반영 (module)
```

---

## 6. 자동화 (Automation)

| 사용자 | 시스템 |
|--------|--------|
| 설정값 | Demo Admin watermark · Repository status |

---

## 7. 연결 화면

전역 (Sidebar · HOME · 권한)

---

## 8. 출력물

없음

---

## 9. 완료 조건 (Freeze)

- [ ] Admin-only gates
- [ ] Browser QA · **PM 승인**
