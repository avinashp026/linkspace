
"use client";

import { GripVertical, Pencil, Trash2 } from "lucide-react";
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
      className={`flex min-w-0 items-center gap-2 rounded-xl border bg-card py-2 pl-2 pr-1.5 transition ${
        isDragging
          ? "border-primary opacity-70 shadow-lg"
          : "border-border"
      }`}
    >
      <button
        ref={handleRef}
        type="button"
        aria-label={`Drag ${link.title} to reorder`}
        className="flex size-11 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-muted transition hover:bg-muted-background hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="size-5" aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {link.title}
        </p>
        <p className="truncate text-xs text-muted">
          {link.url}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onEdit(link)}
        aria-label={`Edit ${link.title}`}
        className="flex size-11 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-muted-background hover:text-foreground"
      >
        <Pencil className="size-4" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={() => onDelete(link.id)}
        aria-label={`Delete ${link.title}`}
        className="flex size-11 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-danger-bg hover:text-danger"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
};

export default SortableLink;
