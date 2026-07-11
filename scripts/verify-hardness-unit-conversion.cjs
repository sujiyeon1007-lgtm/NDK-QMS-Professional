/**
 * RC1 hardness unit conversion verification
 * Usage: node scripts/verify-hardness-unit-conversion.cjs
 */

(async () => {
  const {
    convertHardness,
    convertAllHardnessUnits,
    formatHardnessConversionDisplay,
    HARDNESS_UNITS_RC1,
    toCanonicalHv,
    fromCanonicalHv,
  } = await import("../src/utils/hardnessUnitConversion.js");

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

  console.log("\n=== Hardness Unit Conversion RC1 Verification ===\n");

  console.log("1) PM example: 620 HV");
  const hrcFrom620 = convertHardness(620, "HV", "HRC");
  const hsFrom620 = convertHardness(620, "HV", "HS");
  assert(hrcFrom620 === 55.5, "620 HV -> 55.5 HRC", `got ${hrcFrom620}`);
  assert(hsFrom620 === 75.5, "620 HV -> 75.5 HS", `got ${hsFrom620}`);

  console.log("\n2) PM example: 55 HRC");
  const hvFrom55 = convertHardness(55, "HRC", "HV");
  const hsFrom55 = convertHardness(55, "HRC", "HS");
  assert(hvFrom55 === 595, "55 HRC -> 595 HV", `got ${hvFrom55}`);
  assert(hsFrom55 === 75, "55 HRC -> 75 HS", `got ${hsFrom55}`);

  console.log("\n3) Round-trip via canonical HV");
  const hvHub = toCanonicalHv(55, "HRC");
  assert(hvHub === 595, "canonical HV from 55 HRC", `got ${hvHub}`);
  assert(fromCanonicalHv(620, "HRC") === 55.5, "canonical round-trip to HRC");

  console.log("\n4) Display formatter");
  const display = formatHardnessConversionDisplay(620, "HV", HARDNESS_UNITS_RC1);
  assert(display.includes("55.5 HRC"), "display includes HRC", display);
  assert(display.includes("75.5 HS"), "display includes HS", display);

  console.log("\n5) convertAllHardnessUnits bundle");
  const bundle = convertAllHardnessUnits(620, "HV");
  assert(bundle?.conversions?.HRC === 55.5, "bundle HRC", JSON.stringify(bundle));
  assert(bundle?.conversions?.HS === 75.5, "bundle HS", JSON.stringify(bundle));

  console.log(`\n=== Result: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
