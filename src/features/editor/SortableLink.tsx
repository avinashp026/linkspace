
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
      className={`flex items-center justify-between gap-3 border rounded-md p-3 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <button
        ref={handleRef}
        type="button"
        aria-label={`Reorder ${link.title}`}
        title="Drag to reorder"
        className="cursor-grab touch-none rounded-md border px-2 py-1 active:cursor-grabbing"
      >
        ⠿
      </button>

      <div className="flex flex-1 flex-col min-w-0">
        <p className="text-sm text-slate-800 font-medium">
          {link.title}
        </p>

        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-sm text-slate-700 break-all"
        >
          {link.url}
        </a>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onEdit(link)}
          className="border rounded-md px-3 py-1"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete(link.id)}
          className="border border-red-300 text-red-600 rounded-md px-3 py-1"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default SortableLink;
