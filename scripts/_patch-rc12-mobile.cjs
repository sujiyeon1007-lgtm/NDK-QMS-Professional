const fs = require("fs");
const p = "scripts/verify-rc12-qr-engine-qa.mjs";
let t = fs.readFileSync(p, "utf16le");
if (t.charCodeAt(0) === 0xfeff) t = t.slice(1);
const oldBlock = [
  '  const pixel7 = devices["Pixel 7"];',
  "  const mobileContext = await page.context().browser().newContext({ ...pixel7 });",
  "  const mobile = await mobileContext.newPage();",
  '  await mobile.goto(BASE + "/login", { waitUntil: "domcontentloaded" });',
  "  await login(mobile, loadAdminCredentials());",
  '  await mobile.goto(BASE + "/environment/debug", { waitUntil: "domcontentloaded" });',
  '  await mobile.getByRole("button", { name: "QA Demo Seed \\uB85C\\uB4DC" }).click();',
  "  await mobile.waitForTimeout(800);",
  "",
  '  await mobile.goto(BASE + "/qr/scan", { waitUntil: "domcontentloaded" });',
].join("\n");
const newBlock = [
  '  const pixel7 = devices["Pixel 7"];',
  "  const storageState = await page.context().storageState();",
  "  const mobileContext = await page.context().browser().newContext({ ...pixel7, storageState });",
  "  const mobile = await mobileContext.newPage();",
  "",
  '  await mobile.goto(BASE + "/qr/scan", { waitUntil: "domcontentloaded" });',
].join("\n");
if (!t.includes(oldBlock)) {
  console.error("patch target not found");
  process.exit(1);
}
t = t.replace(oldBlock, newBlock);
fs.writeFileSync(p, t, "utf8");
console.log("patched ok");
