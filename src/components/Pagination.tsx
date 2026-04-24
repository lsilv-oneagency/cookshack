"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface PaginationProps {
  total: number;
  count: number;
  offset: number;
}

export default function Pagination({ total, count, offset }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(total / count);
  const currentPage = Math.floor(offset / count) + 1;

  if (totalPages <= 1) return null;

  const navigate = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("offset", String((page - 1) * count));
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (currentPage <= 4) return i + 1;
    if (currentPage >= totalPages - 3) return totalPages - 6 + i;
    return currentPage - 3 + i;
  });

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-12" aria-label="Pagination">
      <button
        onClick={() => navigate(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded text-[#6B6B6B] hover:text-[#D52324] hover:bg-white border border-transparent hover:border-[#E8E0D8] disabled:opacity-30 disabled:cursor-not-allowed transition"
        aria-label="Previous"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => navigate(page)}
          className={`w-9 h-9 rounded text-sm font-heading font-bold tracking-wide transition ${
            page === currentPage
              ? "bg-[#D52324] text-white"
              : "text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-white border border-transparent hover:border-[#E8E0D8]"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => navigate(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded text-[#6B6B6B] hover:text-[#D52324] hover:bg-white border border-transparent hover:border-[#E8E0D8] disabled:opacity-30 disabled:cursor-not-allowed transition"
        aria-label="Next"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}
