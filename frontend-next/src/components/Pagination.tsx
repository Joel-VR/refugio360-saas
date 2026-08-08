import Link from "next/link";
import type { PageInfo } from "@/lib/api";

interface PaginationProps {
  page: PageInfo;
  buildHref: (pageNumber: number) => string;
  itemLabel?: string;
}

export function Pagination({ page, buildHref, itemLabel = "items" }: PaginationProps) {
  if (page.lastPage <= 1) return null;

  return (
    <div className="flex items-center justify-between text-sm text-slate-custom-700">
      <Link
        href={buildHref(Math.max(1, page.currentPage - 1))}
        className={`rounded-full border border-slate-custom-50 px-4 py-2 transition ${
          page.currentPage <= 1
            ? "pointer-events-none opacity-40"
            : "hover:bg-slate-custom-50"
        }`}
      >
        ← Anterior
      </Link>
      <span>Página {page.currentPage} de {page.lastPage} · {page.total} {itemLabel}</span>
      <Link
        href={buildHref(Math.min(page.lastPage, page.currentPage + 1))}
        className={`rounded-full border border-slate-custom-50 px-4 py-2 transition ${
          page.currentPage >= page.lastPage
            ? "pointer-events-none opacity-40"
            : "hover:bg-slate-custom-50"
        }`}
      >
        Siguiente →
      </Link>
    </div>
  );
}
