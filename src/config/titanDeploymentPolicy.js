/**
 * Project TITAN — Deployment Policy (REV.5)
 * Vercel = Beta Release (CEO Demo · Version 3 QMS Presentation Build) · Localhost = development
 * Aligns with Version 3 QMS framework — see titanV1DevelopmentDirection.js
 */

/** Vercel production URL (Beta Release) */
export const VERCEL_BETA_URL = "https://ndk-qms-beta.vercel.app";

/** Git branch deployed to Vercel Beta */
export const VERCEL_BETA_BRANCH = "beta-demo";

/** Release branch (Electron EXE — not Vercel) */
export const RELEASE_BRANCH = "main";

export const DEPLOYMENT_ENVIRONMENTS = {
  localhost: {
    id: "localhost",
    label: "Local Host",
    purpose: "일상 개발 · 테스트 · PM 미승인 기능",
    deployTarget: false,
    command: "npm run dev",
  },
  vercelBeta: {
    id: "vercel-beta",
    label: "Beta Release (Vercel)",
    url: VERCEL_BETA_URL,
    branch: VERCEL_BETA_BRANCH,
    purpose: "CEO Demo · Version 3 QMS Presentation Build · 회의 · PM 승인 Sprint 완료 버전",
    deployTarget: true,
    developmentVersion: "v3",
  },
  release: {
    id: "release",
    label: "Release",
    branch: RELEASE_BRANCH,
    purpose: "Electron EXE + SQLite — 정식 운영",
    deployTarget: false,
    note: "Vercel 배포 대상 ❌",
  },
};

/** 공식 배포 원칙 (REV.5 · Version 3 QMS Presentation Build) */
export const DEPLOYMENT_PRINCIPLES = [
  "Vercel은 항상 안정 버전(Beta Release)만 배포한다 — CEO Demo · Version 3 QMS Presentation Build",
  "개발은 localhost에서 진행한다 (Version 3 QMS · SessionStorage Demo)",
  "승인되지 않은 개발 중 기능은 Vercel에 배포하지 않는다",
  "Presentation Sprint 완료 + PM 승인 후 GitHub Push → Vercel 배포",
];

/** Version 3 Sprint 완료 후 배포 절차 */
export const DEPLOYMENT_FLOW = [
  "localhost 개발 · npm run build 성공",
  "Regression Test (Console Error = 0)",
  "git commit",
  "git push (presentation)",
  "git checkout beta-demo && git merge presentation && git push origin beta-demo",
  "Vercel 자동 배포 (Beta Release · ndk-qms-beta.vercel.app)",
  "Beta 사이트 동작 확인 (BETA_SITE_VERIFICATION_CHECKLIST)",
];

/** Beta 배포 후 필수 확인 — developmentStandard.js BETA_SITE_VERIFICATION_CHECKLIST */
export const BETA_VERIFICATION_MENUS = [
  "로그인",
  "HOME",
  "입고관리",
  "생산관리",
  "검사관리",
  "성적서관리",
  "출고관리",
  "문서관리",
  "QR관리",
];

/** Vercel 배포 금지 */
export const VERCEL_DEPLOY_EXCLUDED = [
  "Sprint 진행 중 미완성 기능",
  "PM 미승인 UI/Workflow 변경",
  "Console/Terminal Error 존재 빌드",
  "개발 중 실험 Edition/Repository 전환",
];

export function getDeploymentPolicySummary() {
  return {
    principles: DEPLOYMENT_PRINCIPLES,
    flow: DEPLOYMENT_FLOW,
    vercelBeta: DEPLOYMENT_ENVIRONMENTS.vercelBeta,
    localhost: DEPLOYMENT_ENVIRONMENTS.localhost,
    excluded: VERCEL_DEPLOY_EXCLUDED,
  };
}
