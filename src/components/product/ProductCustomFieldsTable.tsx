import type { CustomFieldRow } from "@/lib/miva-custom-fields";

type Props = {
  rows: CustomFieldRow[];
  title?: string;
};

export default function ProductCustomFieldsTable({
  rows,
  title = "Product information",
}: Props) {
  if (rows.length === 0) return null;

  return (
    <section
      className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"
      aria-label={title}
    >
      <h2 className="text-lg font-bold text-[#0F1111] sm:text-xl">{title}</h2>
      <div className="mt-2 h-0.5 w-12 bg-[#D52324]" aria-hidden />
      <div className="mt-5 overflow-hidden rounded border border-neutral-200">
        <table className="w-full text-left text-sm">
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.code}
                className="border-b border-neutral-200 last:border-0 odd:bg-[#F7F8F8]"
              >
                <th
                  scope="row"
                  className="w-[40%] max-w-md px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-[#565959] sm:px-5 sm:py-3"
                >
                  {row.label}
                </th>
                <td className="px-4 py-2.5 text-sm text-[#0F1111] sm:px-5 sm:py-3">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
