"use client";

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
      <option value="name">Name A–Z</option>
      <option value="name:d">Name Z–A</option>
      <option value="price">Price: Low to High</option>
      <option value="price:d">Price: High to Low</option>
    </select>
  );
}
