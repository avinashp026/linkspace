
"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import type { LinkData } from "./types";

type SortableLinkProps = {
  link: LinkData;
  index: number;
  onEdit: (link: LinkData) => void;
  onDelete: (id: string) => void;
};

const SortableLink = ({
  link,
  index,
  onEdit,
  onDelete,
}: SortableLinkProps) => {
  const { ref, handleRef, isDragging } = useSortable({
    id: link.id,
    index,
  });

    return (
    <div
      ref={ref}
      className={`flex min-w-0 items-center gap-2 rounded-[14px] border bg-white py-2 pl-3 pr-1.5 transition ${
        isDragging
          ? "border-[#0071E3]/40 opacity-70 shadow-lg"
          : "border-[#E8E8ED]"
      }`}
    >
      <button
        ref={handleRef}
        type="button"
        aria-label={`Drag ${link.title} to reorder`}
        className="flex h-11 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-[#A1A1A6] hover:text-[#6E6E73] active:cursor-grabbing"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
          <path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" />
        </svg>
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium leading-5">{link.title}</p>
        <p className="truncate text-[13px] leading-[18px] text-[#6E6E73]">{link.url}</p>
      </div>

      <button
        type="button"
        onClick={() => onEdit(link)}
        aria-label={`Edit ${link.title}`}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#6E6E73] transition hover:bg-[#F5F5F7] hover:text-[#1D1D1F]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 20h4L19 9l-4-4L4 16v4z" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => onDelete(link.id)}
        aria-label={`Delete ${link.title}`}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#6E6E73] transition hover:bg-red-50 hover:text-[#D70015]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 7h14M10 11v6M14 11v6M7 7l1 12h8l1-12M9 7V4h6v3" />
        </svg>
      </button>
    </div>
  );
};

export default SortableLink;
