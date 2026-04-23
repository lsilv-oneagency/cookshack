"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchForm({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search smokers, grills, accessories, sauces..."
          className="w-full pl-5 pr-14 py-4 text-base bg-white border border-[#D4C8BE] rounded focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent transition text-[#1A1A1A] placeholder-[#9A9A9A]"
          autoFocus
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#E85D04] text-white rounded flex items-center justify-center hover:bg-[#C44A00] transition"
          aria-label="Search"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </form>
  );
}
