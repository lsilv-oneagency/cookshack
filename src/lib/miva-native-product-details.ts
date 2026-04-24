import type { MivaProduct } from "@/types/miva";
import type { CustomFieldRow } from "@/lib/miva-custom-fields";

/**
 * Facts from the Miva list payload (ondemand + base columns). Order is intentional:
 * the first rows are the most useful in the small buy-box table when there are no custom fields.
 */
export function getNativeProductDetailRows(product: MivaProduct): CustomFieldRow[] {
  const rows: CustomFieldRow[] = [];

  if (product.categories && product.categories.length > 0) {
    const list = (product.categories.some((c) => c.active) ? product.categories.filter((c) => c.active) : product.categories) as {
      name: string;
    }[];
    const label = list.map((c) => c.name).filter(Boolean);
    if (label.length) {
      rows.push({ code: "categories", label: "Categories", value: label.join(" · ") });
    }
  }

  if (product.code) {
    rows.push({ code: "miva_code", label: "Product code", value: product.code });
  }

  if (Array.isArray(product.attributes) && product.attributes.length > 0) {
    for (const a of product.attributes) {
      if (!a?.prompt) continue;
      if (a.options && a.options.length > 0) {
        const optionLabels = a.options.map((o) => o.prompt).filter(Boolean);
        rows.push({
          code: `attr_${a.id}`,
          label: a.prompt,
          value: optionLabels.join(", "),
        });
      } else {
        rows.push({ code: `attr_${a.id}`, label: a.prompt, value: a.type });
      }
    }
  }

  if (product.taxable !== undefined) {
    rows.push({ code: "taxable", label: "Taxable", value: product.taxable ? "Yes" : "No" });
  }

  if (product.product_inventory_active === true && product.product_inventory != null) {
    rows.push({
      code: "product_inventory",
      label: "Quantity on hand",
      value: String(product.product_inventory),
    });
  }

  const inv = product.productinventorysettings;
  if (inv && (inv.in_long || inv.in_short)) {
    const s = (inv.in_long || inv.in_short || "").trim();
    if (s && s.length < 2_000) {
      rows.push({ code: "inv_message", label: "Availability (store)", value: s });
    }
  }

  if (product.cancat_code) {
    rows.push({ code: "cancat_code", label: "Default category code", value: product.cancat_code });
  }

  const uri = product.uris?.find((u) => u.canonical) || product.uris?.[0];
  if (uri?.uri) {
    rows.push({ code: "uri_path", label: "URL path", value: uri.uri });
  }
  if (product.url) {
    rows.push({ code: "store_url", label: "Store product URL", value: product.url });
  }

  return rows;
}

export function mergeDetailRows(customRows: CustomFieldRow[], nativeRows: CustomFieldRow[]): CustomFieldRow[] {
  const seen = new Set<string>();
  const out: CustomFieldRow[] = [];
  for (const r of customRows) {
    const k = r.label.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  for (const r of nativeRows) {
    const k = r.label.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  return out;
}

/**
 * Rows from `getNativeProductDetailRows` are **all** from Miva’s JSON, but some are
 * merchandising/SEO/internal (product code, taxable, canonical URL, default category, etc.).
 * The PDP “specifications / product information” table should not surface those to shoppers
 * when they only crowd out real specs from `CustomField_Values` (e.g. brand, material, BTUs).
 */
const STOREFRONT_EXCLUDED_NATIVE_CODES = new Set([
  "miva_code", // “Product code” — operational; SKU lives in the buy box
  "taxable",
  "cancat_code", // default category code
  "uri_path",
  "store_url",
  "product_inventory", // on-hand count — not a product spec; stock is shown in buy box
]);

export function filterNativeRowsForStorefrontPdp(rows: CustomFieldRow[]): CustomFieldRow[] {
  return rows.filter((r) => !STOREFRONT_EXCLUDED_NATIVE_CODES.has(r.code));
}
