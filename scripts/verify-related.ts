/**
 * Pure logic checks for PDP related-product pairing (no Next.js runtime).
 * Run: npm run verify:related
 * Run: npx tsx scripts/verify-related.ts
 *
 * E2E: `npm run dev` → open /shop/SP165 (or any SKU) and confirm “Frequently bought together” when getRelatedProducts returns companions.
 */
import type { MivaProduct } from "../src/types/miva";
import { isPdpRelatedPair } from "../src/lib/miva-storefront-visibility";

function mock(partial: Partial<MivaProduct>): MivaProduct {
  return partial as MivaProduct;
}

let failed = 0;
function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed++;
  }
}

const sauceCat = { code: "ctgy_sauces", name: "S", depth: 1 } as NonNullable<MivaProduct["categories"]>[number];
assert(
  isPdpRelatedPair(mock({ categories: [sauceCat] }), mock({ categories: [sauceCat] })),
  "same category code should pair"
);

assert(
  isPdpRelatedPair(mock({ cancat_code: "sauces-cat" }), mock({ cancat_code: "sauces-cat" })),
  "matching cancat_code should pair"
);

const cA = { code: "a", name: "A", depth: 1 } as NonNullable<MivaProduct["categories"]>[number];
const cB = { code: "b", name: "B", depth: 1 } as NonNullable<MivaProduct["categories"]>[number];
assert(!isPdpRelatedPair(mock({ categories: [cA] }), mock({ categories: [cB] })), "different categories and no cancat should not pair");

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("isPdpRelatedPair: OK (3 cases)");

const code = process.argv[2] || "SP165";
console.log(
  `E2E: npm run dev → http://localhost:3000/shop/${encodeURIComponent(code)} (FBT = first 2 related from getRelatedProducts)`
);
process.exit(0);
