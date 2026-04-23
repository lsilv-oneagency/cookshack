"use client";

const SORT_OPTIONS = [
  { value: "name", label: "Name A–Z" },
  { value: "name:d", label: "Name Z–A" },
  { value: "price", label: "Price: Low to High" },
  { value: "price:d", label: "Price: High to Low" },
];

interface Props {
  value: string;
}

export default function SortSelect({ value }: Props) {
  return (
    <select
      id="sort"
      defaultValue={value}
      onChange={(e) => {
        const url = new URL(window.location.href);
        url.searchParams.set("sort", e.target.value);
        url.searchParams.delete("offset");
        window.location.href = url.toString();
      }}
      className="text-sm border border-[#D4C8BE] rounded px-3 py-1.5 bg-white text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#E85D05]"
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
