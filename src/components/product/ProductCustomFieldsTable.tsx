import type { CustomFieldRow } from "@/lib/miva-custom-fields";

type Props = {
  rows: CustomFieldRow[];
  title?: string;
};

export default function ProductCustomFieldsTable({
  rows,
  title = "Specifications",
}: Props) {
  if (rows.length === 0) return null;

  return (
    <section className="border-t border-[#E8E0D8] pt-10" aria-label={title}>
      <h2 className="font-heading text-xl font-extrabold tracking-wider text-[#1A1A1A] sm:text-2xl">
        {title}
      </h2>
      <div className="mt-6 overflow-hidden rounded-lg border border-[#E8E0D8]">
        <table className="w-full text-left text-sm">
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.code}
                className="border-b border-[#E8E0D8] last:border-0 odd:bg-[#FAFAFA]"
              >
                <th
                  scope="row"
                  className="w-[40%] max-w-md px-4 py-3 font-heading text-xs font-bold uppercase tracking-wider text-[#6B6B6B] sm:px-6 sm:py-3.5"
                >
                  {row.label}
                </th>
                <td className="px-4 py-3 text-sm text-[#1A1A1A] sm:px-6 sm:py-3.5">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
