import type { MivaProduct } from "@/types/miva";

export type CustomFieldRow = { code: string; label: string; value: string };

/** Humanize Miva field codes for display (spec_btus → Spec Btus). */
function labelFromCode(code: string): string {
  if (!code) return "";
  return code
    .replace(/^customfield_?/i, "")
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function stringValue(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (typeof v === "object" && "value" in (v as object)) {
    return stringValue((v as { value: unknown }).value);
  }
  return "";
}

export function isWhatsInTheBoxRow(r: CustomFieldRow): boolean {
  return (
    /whats?[_\s-]?in[_\s-]?the[_\s-]?box|in_the_box|box_contents|included_?items/i.test(r.code) ||
    /what'?s in the box|in the box|box contents|included in box/i.test(r.label)
  );
}

/** Custom fields that read as marketing "feature" lists (dedicated from schema / naming). */
export function isFeatureFieldRow(r: CustomFieldRow): boolean {
  if (isWhatsInTheBoxRow(r)) return false;
  const c = r.code.toLowerCase();
  const l = r.label.toLowerCase();
  if (
    /^(features?|feat|feature_?list|ftr|key_?features|product_?features|product_?highlights?|key_?points|selling_?points|bullet_?list|value_?props|pro_?bullets?|merch_?highlights?)$/i.test(
      c
    )
  ) {
    return true;
  }
  if (/\bfeatures?\b/.test(c) && !/\bspec|dimension|weight\b/.test(c)) return true;
  if (/\bfeatures?\b/.test(l) && !/\bspec(ification)?\b/.test(l)) return true;
  if (/\b(key highlights?|key benefits?|at a glance|highlights?|bullets?|selling points?)\b/.test(l)) {
    return true;
  }
  if (/^feature[_\s-]|[_\s-]feature$|_ftrs?\b|\.features\./.test(c)) return true;
  return false;
}

/** SEO / meta custom fields: not useful on PDP tables. */
export function isSeoMetadataRow(r: CustomFieldRow): boolean {
  const c = r.code.toLowerCase();
  if (
    c === "keywords" ||
    c === "meta_keywords" ||
    c === "meta_description" ||
    c === "og_description" ||
    c === "page_description" ||
    c === "google_product_category" ||
    c === "gpc"
  ) {
    return true;
  }
  if (c === "description" && r.value.length < 400 && !r.value.includes("•") && !/<[a-z][\s\S]*>/i.test(r.value)) {
    return true;
  }
  return false;
}

/**
 * Normalize Miva `CustomField_Values` (array, record, or module-nested) into label/value rows.
 * Miva often nests by module, e.g. `{ "cmp-foo": { "brand": "X", "features": "..." } }` — this flattens that.
 */
export function getProductCustomFieldRows(product: MivaProduct): CustomFieldRow[] {
  const raw = product.CustomField_Values;
  if (raw == null) return [];

  const skip = new Set(["", "id", "product_id", "field_id"]);

  const pushRow = (code: string, value: unknown, out: CustomFieldRow[]) => {
    const c = String(code).trim();
    if (!c || skip.has(c.toLowerCase())) return;
    const s = stringValue(value);
    if (!s) return;
    if (s.length > 12_000) return;
    out.push({ code: c, label: labelFromCode(c), value: s });
  };

  const out: CustomFieldRow[] = [];

  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        const code = String(
          o.code ?? o.name ?? o.field_code ?? o.field_id ?? o.Field_Code ?? ""
        );
        const val = o.value ?? o.Value ?? o.data;
        pushRow(code, val, out);
      }
    }
    return sortRows(dedupe(out));
  }

  if (typeof raw === "object") {
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const nested = value as Record<string, unknown>;
        const hasValue = nested.value !== undefined || nested.Value !== undefined;
        const hasFieldId = Boolean(
          nested.code || nested.name || nested.field_code || (nested as { Field_Code?: string }).Field_Code
        );
        if (hasValue && hasFieldId) {
          const code = String(
            nested.code ?? nested.name ?? nested.field_code ?? (nested as { Field_Code?: string }).Field_Code ?? key
          );
          pushRow(code, nested.value ?? nested.Value, out);
        } else {
          for (const [innerKey, innerVal] of Object.entries(nested)) {
            if (innerKey === "header" || innerKey === "footer") {
              continue;
            }
            pushRow(innerKey, innerVal, out);
          }
        }
      } else if (Array.isArray(value)) {
        for (const el of value) {
          if (el && typeof el === "object" && !Array.isArray(el)) {
            const o = el as Record<string, unknown>;
            if (o.code && (o.value !== undefined || o.Value !== undefined)) {
              pushRow(String(o.code), o.value ?? o.Value, out);
            } else {
              for (const [k2, v2] of Object.entries(o)) {
                pushRow(k2, v2, out);
              }
            }
          }
        }
      } else {
        pushRow(key, value, out);
      }
    }
  }

  return sortRows(dedupe(out));
}

function dedupe(rows: CustomFieldRow[]): CustomFieldRow[] {
  const seen = new Set<string>();
  return rows.filter((r) => {
    const k = `${r.code}::${r.value}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function sortRows(rows: CustomFieldRow[]): CustomFieldRow[] {
  return [...rows].sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
}

export function partitionWhatsInTheBoxRows(rows: CustomFieldRow[]): {
  specRows: CustomFieldRow[];
  boxText: string | null;
} {
  const found = rows.find(isWhatsInTheBoxRow);
  if (!found) return { specRows: rows, boxText: null };
  return { specRows: rows.filter((r) => r.code !== found.code), boxText: found.value };
}
