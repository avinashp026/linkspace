
"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { LinkData } from "../types";
import SortableLink from "../SortableLink";

type LinkActionResult = {
  success: boolean;
  error: string;
};

type LinksEditorProps = {
  links: LinkData[];
  onEdit: (link: LinkData) => void;
  onDelete: (id: string) => void;
  addLink: (title: string, url: string) => Promise<LinkActionResult>;
  updateLink: (
    id: string,
    title: string,
    url: string,
  ) => Promise<LinkActionResult>;
  editingId: string | null;
  linkInfo: { title: string; url: string };
  setLinkInfo: Dispatch<SetStateAction<{ title: string; url: string }>>;
  showLinkForm: boolean;
  setShowLinkForm: Dispatch<SetStateAction<boolean>>;
  cancelEditing: () => void;
  startAddingLink: () => void;
};

export default function LinksEditor({
  links,
  onEdit,
  onDelete,
  addLink,
  updateLink,
  editingId,
  linkInfo,
  setLinkInfo,
  showLinkForm,
  setShowLinkForm,
  cancelEditing,
  startAddingLink,
}: LinksEditorProps) {
  const [linkError, setLinkError] = useState("");

  const handleLinkInfoChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;

    setLinkInfo((previous) => ({
      ...previous,
      [name]: value,
    }));

    setLinkError("");
  };

  const handleSubmitLink = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setLinkError("");

    const result =
      editingId !== null
        ? await updateLink(editingId, linkInfo.title, linkInfo.url)
        : await addLink(linkInfo.title, linkInfo.url);

    if (!result.success) {
      setLinkError(result.error);
      return;
    }

    setLinkInfo({ title: "", url: "" });
    setLinkError("");
    setShowLinkForm(false);
  };

  const handleEdit = (link: LinkData) => {
    onEdit(link);
    setLinkError("");
  };

  const handleCancel = () => {
    cancelEditing();
    setShowLinkForm(false);
    setLinkError("");
  };

  const inputClass =
    "min-h-11 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-ring/20";

  const labelClass = "mb-2 block text-sm font-medium text-foreground";

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Your links
          </h2>
          <p className="mt-1 text-sm text-muted">
            Add and organize the links you want to share.
          </p>
        </div>

        <span className="text-sm text-muted">
          {links.length} {links.length === 1 ? "link" : "links"}
        </span>
      </div>

      {showLinkForm && (
        <form
          onSubmit={handleSubmitLink}
          className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-foreground">
              {editingId !== null ? "Edit link" : "Add a link"}
            </h3>

            <button
              type="button"
              onClick={handleCancel}
              className="min-h-11 rounded-lg px-3 text-sm font-medium text-primary transition hover:bg-muted-background"
            >
              Cancel
            </button>
          </div>

          <div>
            <label htmlFor="link-title" className={labelClass}>
              Title
            </label>

            <input
              id="link-title"
              name="title"
              type="text"
              value={linkInfo.title}
              onChange={handleLinkInfoChange}
              placeholder="My portfolio"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="link-url" className={labelClass}>
              URL
            </label>

            <input
              id="link-url"
              name="url"
              type="text"
              inputMode="url"
              value={linkInfo.url}
              onChange={handleLinkInfoChange}
              placeholder="https://example.com"
              className={inputClass}
              required
            />
          </div>

          {linkError && (
            <p className="text-sm text-danger" role="alert">
              {linkError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="min-h-11 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted-background"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="min-h-11 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-700"
            >
              {editingId !== null ? "Save changes" : "Add link"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {links.map((link, index) => (
          <SortableLink
            key={link.id}
            link={link}
            index={index}
            onEdit={handleEdit}
            onDelete={onDelete}
          />
        ))}

        {links.length === 0 && !showLinkForm && (
          <div className="rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center">
            <p className="font-medium text-foreground">
              No links added yet
            </p>
            <p className="mt-1 text-sm text-muted">
              Add your first link to get started.
            </p>
          </div>
        )}

        {!showLinkForm && (
          <button
            type="button"
            onClick={startAddingLink}
            className="flex min-h-12 w-full items-center justify-center rounded-xl border border-dashed border-border text-sm font-medium text-primary transition hover:border-primary hover:bg-primary-50"
          >
            + Add a link
          </button>
        )}
      </div>
    </section>
  );
}
