import type { CustomFieldRow } from "@/lib/miva-custom-fields";

type Props = {
  sku?: string;
  weightLbs?: number;
  /** First few custom fields — typical “Brand / Material / …” in reference layouts */
  customRows: CustomFieldRow[];
  maxCustom?: number;
};

export default function ProductBuyBoxAttributes({
  sku,
  weightLbs,
  customRows,
  maxCustom = 4,
}: Props) {
  const rows: { label: string; value: string }[] = [];
  if (sku) rows.push({ label: "SKU", value: sku });
  if (weightLbs != null && weightLbs > 0) rows.push({ label: "Weight", value: `${weightLbs} lbs` });
  for (const r of customRows.slice(0, maxCustom)) {
    rows.push({ label: r.label, value: r.value });
  }

  if (rows.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.label}-${row.value}`} className="border-b border-neutral-200 last:border-0">
              <th
                scope="row"
                className="w-[38%] px-3 py-2 font-heading text-xs font-bold uppercase tracking-wide text-[#6B6B6B] sm:px-4"
              >
                {row.label}
              </th>
              <td className="px-3 py-2 text-[#1A1A1A] sm:px-4">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
