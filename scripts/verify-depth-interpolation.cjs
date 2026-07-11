/**
 * PM P0 - depth interpolation verification (UTF-8 safe runner)
 * Usage: npx vite-node scripts/verify-depth-interpolation.cjs
 */

const memory = new Map();
globalThis.sessionStorage = {
  getItem: (key) => (memory.has(key) ? memory.get(key) : null),
  setItem: (key, value) => memory.set(key, String(value)),
  removeItem: (key) => memory.delete(key),
  clear: () => memory.clear(),
};
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};

(async () => {
  const {
    calculateHeatTreatmentCalculations,
    calculateDepthAtThresholdFromRows,
    interpolateDepthAtThreshold,
    DEPTH_CALC_UNAVAILABLE,
    DEPTH_CALC_STATUS,
  } = await import("../src/utils/heatTreatmentCalculationEngine.js");
  const { createHardeningDepthRow } = await import("../src/utils/hardeningDepthModel.js");

  let passed = 0;
  let failed = 0;

  function assert(condition, label, detail = "") {
    if (condition) {
      passed += 1;
      console.log(`  PASS  ${label}`);
      return;
    }
    failed += 1;
    console.error(`  FAIL  ${label}${detail ? ` - ${detail}` : ""}`);
  }

  console.log("\n=== Depth Interpolation P0 Verification ===\n");

  console.log("1) PM example: 0.40/430, 0.50/370, threshold 400 -> 0.45");
  const pmResult = interpolateDepthAtThreshold(
    [
      { depthNum: 0.4, hv: 430, isCore: false },
      { depthNum: 0.5, hv: 370, isCore: false },
    ],
    400
  );
  assert(pmResult.depth === 0.45, "interpolateDepthAtThreshold returns 0.45", `got ${pmResult.depth}`);
  assert(pmResult.status === DEPTH_CALC_STATUS.OK, "status is ok", pmResult.status);

  console.log("\n2) Core 350 + offset 50 -> threshold 400 -> same interpolation on curve");
  const coreRows = [
    createHardeningDepthRow({ depth: "0.40", hv: 430 }),
    createHardeningDepthRow({ depth: "0.50", hv: 370 }),
    createHardeningDepthRow({ depth: "CORE", hv: 350, isCore: true }),
  ];
  const coreCalc = calculateHeatTreatmentCalculations({
    rows: coreRows,
    heatTreatment: {
      effectiveDepthBasis: "corePlus50",
      corePlusOffset: 50,
      grindingAllowanceMm: 0.15,
      certificateOutputMode: "all",
    },
    hardnessRows: [{ key: "core", item: "심부경도", measuredRaw: "350" }],
  });
  assert(
    coreCalc.effectiveDepth.auto === 0.45,
    "effective depth via core+50 threshold",
    `got ${coreCalc.effectiveDepth.auto}`
  );
  assert(
    coreCalc.meta.effectiveThresholdHv === 400,
    "threshold is 400",
    String(coreCalc.meta.effectiveThresholdHv)
  );

  console.log("\n3) Case depth uses interpolation (not nearest point)");
  const caseOnlyRows = [
    createHardeningDepthRow({ depth: "0.40", hv: 430 }),
    createHardeningDepthRow({ depth: "0.50", hv: 370 }),
  ];
  const caseResult = calculateDepthAtThresholdFromRows(caseOnlyRows, 390);
  assert(
    caseResult.depth === 0.47,
    "case depth at 390HV interpolates to 0.47",
    `got ${caseResult.depth}`
  );
  const nearestWouldBe = 0.4;
  assert(caseResult.depth !== nearestWouldBe, "interpolation differs from nearest-point 0.40");

  console.log("\n4) Edge cases");
  const exact = interpolateDepthAtThreshold(
    [
      { depthNum: 0.4, hv: 400, isCore: false },
      { depthNum: 0.5, hv: 370, isCore: false },
    ],
    400
  );
  assert(exact.depth === 0.4, "exact HV match uses point distance", `got ${exact.depth}`);
  assert(exact.status === DEPTH_CALC_STATUS.EXACT, "exact status");

  const unbracketed = interpolateDepthAtThreshold(
    [
      { depthNum: 0.4, hv: 500, isCore: false },
      { depthNum: 0.5, hv: 480, isCore: false },
    ],
    400
  );
  assert(unbracketed.depth == null, "no bracketing interval -> null depth");
  assert(unbracketed.message === DEPTH_CALC_UNAVAILABLE, "shows calc unavailable");

  const insufficient = interpolateDepthAtThreshold(
    [{ depthNum: 0.4, hv: 430, isCore: false }],
    400
  );
  assert(insufficient.status === DEPTH_CALC_STATUS.INSUFFICIENT, "insufficient data status");

  const badOrder = interpolateDepthAtThreshold(
    [
      { depthNum: 0.5, hv: 370, isCore: false },
      { depthNum: 0.4, hv: 430, isCore: false },
    ],
    400
  );
  assert(badOrder.status === DEPTH_CALC_STATUS.INVALID_ORDER, "invalid distance order");

  console.log(`\n=== Result: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
