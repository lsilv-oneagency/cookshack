import type { MivaProduct } from "@/types/miva";
import type { CustomFieldRow } from "@/lib/miva-custom-fields";

/**
 * Miva `productshippingrules` (ondemand) often carries package L/W/H in inches.
 */
export function getProductDimensionRows(product: MivaProduct): CustomFieldRow[] {
  const r = product.productshippingrules;
  if (!r || typeof r !== "object") return [];
  const { length: len, width, height } = r;
  if (!len && !width && !height) return [];
  const parts: string[] = [];
  if (len) parts.push(`L ${len}″`);
  if (width) parts.push(`W ${width}″`);
  if (height) parts.push(`H ${height}″`);
  if (parts.length === 0) return [];
  return [
    {
      code: "package_dimensions",
      label: "Package dimensions (in.)",
      value: parts.join(" × "),
    },
  ];
}
