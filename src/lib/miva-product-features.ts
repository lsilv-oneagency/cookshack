import type { MivaProduct } from "@/types/miva";
import {
  getProductCustomFieldRows,
  isFeatureFieldRow,
  isSeoMetadataRow,
  type CustomFieldRow,
} from "@/lib/miva-custom-fields";

/**
 * Splits a blob into lines: newlines, pipes, and bullet characters.
 * Strips a single level of simple HTML.
 */
function splitFeatureBlob(text: string): string[] {
  const cleaned = text.replace(/<br\s*\/?>/gi, "\n");
  return cleaned
    .split(/\n+|\|/)
    .flatMap((line) => line.split(/(?=•)/))
    .map((s) => s.replace(/<[^>]+>/g, "").replace(/^•\s*/, "").trim())
    .filter((s) => s.length > 0 && s.length < 800);
}

function uniqueLines(lines: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    const k = line.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(line);
  }
  return out;
}

const TOP_LEVEL_FEATURE_KEYS = [
  "features",
  "Features",
  "product_features",
  "ProductFeatures",
  "key_features",
  "KeyFeatures",
  "selling_features",
] as const;

/**
 * Normalizes `features` from the API whether it is a string, list of strings, or list of small objects
 * (common in Miva and JSON feeds).
 */
function normalizeFeaturesPayload(v: unknown): string[] {
  if (v == null) return [];
  if (typeof v === "string") {
    return splitFeatureBlob(v);
  }
  if (Array.isArray(v)) {
    const out: string[] = [];
    for (const item of v) {
      if (item == null) continue;
      if (typeof item === "string") {
        out.push(...splitFeatureBlob(item));
        continue;
      }
      if (typeof item === "object" && !Array.isArray(item)) {
        const o = item as Record<string, unknown>;
        const text =
          o.text ?? o.name ?? o.title ?? o.label ?? o.value ?? o.feature ?? o.description ?? o.content;
        if (text != null) {
          out.push(...splitFeatureBlob(String(text)));
        }
      }
    }
    return out.filter((s) => s.length > 0);
  }
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (Array.isArray(o.items)) {
      return normalizeFeaturesPayload(o.items);
    }
    if (Array.isArray(o.data)) {
      return normalizeFeaturesPayload(o.data);
    }
    if (Array.isArray(o.features)) {
      return normalizeFeaturesPayload(o.features);
    }
    const fromObject: string[] = [];
    for (const val of Object.values(o)) {
      if (typeof val === "string") {
        fromObject.push(...splitFeatureBlob(val));
      } else if (Array.isArray(val)) {
        fromObject.push(...normalizeFeaturesPayload(val));
      }
    }
    return fromObject.filter((s) => s.length > 0);
  }
  return [];
}

/**
 * First-party `features` on the product JSON (or common aliases). Checked before custom fields and HTML fallbacks.
 */
export function extractApiFeatureLines(product: MivaProduct): string[] {
  const p = product as unknown as Record<string, unknown>;
  for (const k of TOP_LEVEL_FEATURE_KEYS) {
    const v = p[k];
    if (v == null) continue;
    const lines = normalizeFeaturesPayload(v);
    if (lines.length) return uniqueLines(lines);
  }
  return [];
}

/**
 * From description HTML, pull first <ul> or <ol> and return list item text.
 */
export function parseFirstListFromHtml(html: string): { items: string[]; withoutList: string } {
  if (!html || typeof html !== "string") {
    return { items: [], withoutList: "" };
  }
  const ulMatch = html.match(/<ul[^>]*>([\s\S]*?)<\/ul>/i);
  if (ulMatch) {
    const items = Array.from(ulMatch[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi))
      .map((m) => m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim())
      .filter((s) => s.length > 0);
    return { items, withoutList: html.replace(ulMatch[0], "\n\n").trim() };
  }
  const olMatch = html.match(/<ol[^>]*>([\s\S]*?)<\/ol>/i);
  if (olMatch) {
    const items = Array.from(olMatch[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi))
      .map((m) => m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim())
      .filter((s) => s.length > 0);
    return { items, withoutList: html.replace(olMatch[0], "\n\n").trim() };
  }
  return { items: [], withoutList: html };
}

function linesFromAttributes(product: MivaProduct): string[] {
  const attrs = product.attributes;
  if (!Array.isArray(attrs) || attrs.length === 0) return [];
  const lines: string[] = [];
  for (const a of attrs) {
    if (!a || typeof a !== "object") continue;
    const type = (a.type || "").toLowerCase();
    if (type !== "memo" && type !== "text") continue;
    const prompt = ((a as { prompt?: string }).prompt || a.code || "").toLowerCase();
    if (!/\b(feature|highlights?|details?|more info|description)\b/.test(prompt)) continue;
    const firstOpt = a.options?.[0];
    const body = firstOpt
      ? stringFromUnknown((firstOpt as { prompt?: string }).prompt)
      : "";
    for (const part of splitFeatureBlob(body)) {
      if (part) lines.push(part);
    }
  }
  return lines;
}

function stringFromUnknown(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
}

export type ProductFeatureResult = {
  /** Final bullet list for the “Key features” / features band */
  lines: string[];
  /** If features were only filled from a list inside `descrip`, that HTML with the first list removed for the long read */
  descripForLongCopy: string | null;
};

/**
 * Builds a feature list from (1) custom field rows that match `isFeatureFieldRow`, (2) memo attributes
 * whose prompt looks feature-like, and (3) the first list in the HTML description when (1) and (2) are empty.
 */
export function getProductFeatureData(
  product: MivaProduct,
  featureCustomRows: CustomFieldRow[]
): ProductFeatureResult {
  const fromApi = extractApiFeatureLines(product);
  if (fromApi.length > 0) {
    return { lines: fromApi, descripForLongCopy: null };
  }

  const fromFields: string[] = [];
  for (const row of featureCustomRows) {
    for (const part of splitFeatureBlob(row.value)) {
      if (part) fromFields.push(part);
    }
  }
  fromFields.push(...linesFromAttributes(product));

  if (fromFields.length > 0) {
    return { lines: uniqueLines(fromFields), descripForLongCopy: null };
  }

  if (product.descrip) {
    const { items, withoutList } = parseFirstListFromHtml(product.descrip);
    if (items.length > 0) {
      return { lines: uniqueLines(items), descripForLongCopy: withoutList };
    }
  }

  return { lines: [], descripForLongCopy: null };
}

/**
 * First feature line for cards — only uses custom fields (not full `descrip` HTML parse)
 * so grids stay fast.
 */
export function getProductFeatureTeaser(product: MivaProduct): string | null {
  const apiFirst = extractApiFeatureLines(product)[0];
  if (apiFirst) return apiFirst;

  const rows = getProductCustomFieldRows(product)
    .filter((r) => !isSeoMetadataRow(r))
    .filter(isFeatureFieldRow);
  for (const row of rows) {
    for (const part of splitFeatureBlob(row.value)) {
      if (part) return part;
    }
  }
  for (const line of linesFromAttributes(product)) {
    if (line) return line;
  }
  return null;
}
