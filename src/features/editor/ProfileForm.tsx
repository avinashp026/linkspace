
"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { LinkData, ProfileData } from "./types";
import SortableLink from "./SortableLink";

type LinkActionResult = {
  success: boolean;
  error: string;
};

type ProfileFormProps = {
  profileData: ProfileData;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  links: LinkData[];
  onEdit: (link: LinkData) => void;
  onDelete: (id: string) => void;
  addLink: (title: string, url: string) => LinkActionResult;
  updateLink: (
    id: string,
    title: string,
    url: string,
  ) => LinkActionResult;
  editingId: string | null;
  linkInfo: {
    title: string;
    url: string;
  };
  setLinkInfo: Dispatch<
    SetStateAction<{ title: string; url: string }>
  >;
  showLinkForm: boolean;
  setShowLinkForm: Dispatch<SetStateAction<boolean>>;
  cancelEditing: () => void;
  startAddingLink: () => void;
};

const ProfileForm = ({
  profileData,
  handleChange,
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
}: ProfileFormProps) => {
  const [linkError, setLinkError] = useState("");

  const handleLinkInfoChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;

    setLinkInfo((prev) => ({
      ...prev,
      [name]: value,
    }));

    setLinkError("");
  };

  const handleSubmitLink = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result =
      editingId !== null
        ? updateLink(editingId, linkInfo.title, linkInfo.url)
        : addLink(linkInfo.title, linkInfo.url);

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
    "h-11 w-full rounded-xl border border-[#D2D2D7] bg-white px-3.5 text-base text-[#1D1D1F] outline-none transition placeholder:text-[#8E8E93] focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/15 sm:text-[15px]";
  const labelClass = "mb-1.5 block text-[13px] text-[#6E6E73]";

  return (
    <div className="flex flex-col gap-10">
      {/* Profile */}
      <section className="rounded-[18px] border border-[#E8E8ED] bg-white p-4 sm:p-6">
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#E8E8ED] text-xl font-semibold text-[#515154] sm:h-16 sm:w-16 sm:text-2xl">
            {profileData.displayName
              ? profileData.displayName[0].toUpperCase()
              : "U"}
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold">Profile</p>
            <p className="text-[13px] text-[#6E6E73]">Make your page yours.</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="displayName" className={labelClass}>
              Display name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              value={profileData.displayName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="bio" className={labelClass}>
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={profileData.bio}
              onChange={handleChange}
              rows={3}
              className={`${inputClass} h-auto resize-none py-3`}
            />
          </div>
        </div>
      </section>

      {/* Links */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-tight sm:text-[22px]">
            Links
          </h2>
          <span className="text-[13px] text-[#6E6E73]">Drag to reorder</span>
        </div>

        {showLinkForm && (
          <form
            onSubmit={handleSubmitLink}
            className="mb-3 rounded-[18px] border border-[#E8E8ED] bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold">
                {editingId !== null ? "Edit link" : "Add a link"}
              </h3>
              <button
                type="button"
                onClick={handleCancel}
                className="h-11 px-2 text-[15px] text-[#0071E3]"
              >
                Cancel
              </button>
            </div>

            <div className="flex flex-col gap-4">
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
                />
              </div>

              {linkError && (
                <p role="alert" className="text-[13px] text-[#D70015]">
                  {linkError}
                </p>
              )}

              <button
                type="submit"
                className="h-11 rounded-xl bg-[#0071E3] text-[15px] font-medium text-white transition hover:bg-[#0062C4]"
              >
                {editingId !== null ? "Save changes" : "Add link"}
              </button>
            </div>
          </form>
        )}

        <div className="flex flex-col gap-2.5">
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
            <p className="py-6 text-center text-[15px] text-[#6E6E73]">
              No links yet. Add your first one.
            </p>
          )}

          <button
            type="button"
            onClick={startAddingLink}
            className="hidden h-14 rounded-[14px] border-[1.5px] border-dashed border-[#C7C7CC] text-[15px] font-medium text-[#0071E3] transition hover:border-[#0071E3] hover:bg-[#0071E3]/5 lg:block"
          >
            + Add a link
          </button>
        </div>
      </section>
    </div>
  );
};

export default ProfileForm;
