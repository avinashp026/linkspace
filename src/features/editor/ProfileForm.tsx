"use client";

import { useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { LinkData, ProfileData } from "./types";
import { validateUsername } from "@/utils/validation";
import { createClient } from "@/lib/supabase/client";
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
  onAvatarChange: (url: string | null) => void;
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

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const ProfileForm = ({
  profileData,
  handleChange,
  onAvatarChange,
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
  const [usernameError, setUsernameError] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError("");

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setAvatarError("Choose a JPG, PNG, or WebP image.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError("Your profile picture must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please sign in again before uploading a picture.");
      }

      const extensionByType: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      };
      const extension = extensionByType[file.type];
      const filePath = `${user.id}/avatar/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Avatar upload failed:", uploadError.message);
        throw new Error("Unable to upload your picture. Please try again.");
      }

      const { data } = supabase.storage
        .from("profile-assets")
        .getPublicUrl(filePath);

      onAvatarChange(data.publicUrl);
    } catch (error) {
      setAvatarError(
        error instanceof Error ? error.message : "Avatar upload failed.",
      );
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleUsernameBlur = () => {
    const error = validateUsername(profileData.username);
    setUsernameError(error ?? "");
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    setUsernameError("");
  };

  const handleLinkInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLinkInfo((prev) => ({ ...prev, [name]: value }));
    setLinkError("");
  };

  const handleSubmitLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
    "h-11 w-full rounded-xl border border-[#D2D2D7] bg-white px-3.5 text-base text-[#1D1D1F] outline-none transition placeholder:text-[#8E8E93] focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/15 sm:text-[15px]";
  const labelClass = "mb-1.5 block text-[13px] text-[#6E6E73]";

  return (
    <div className="flex flex-col gap-10">
      <section className="rounded-[18px] border border-[#E8E8ED] bg-white p-4 sm:p-6">
        <div className="mb-5 flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 sm:h-16 sm:w-16">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#E8E8ED] text-xl font-semibold text-[#515154] sm:text-2xl">
              {profileData.avatarUrl ? (
                <img
                  src={profileData.avatarUrl}
                  alt="Profile picture preview"
                  className="h-full w-full object-cover"
                />
              ) : profileData.displayName ? (
                profileData.displayName[0].toUpperCase()
              ) : (
                "U"
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold">Profile</p>
            <p className="text-[13px] text-[#6E6E73]">Make your page yours.</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarUpload}
                className="sr-only"
                aria-label="Choose profile picture"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="rounded-lg border border-[#D2D2D7] px-3 py-2 text-xs font-medium text-[#1D1D1F] transition hover:bg-[#F5F5F7] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploadingAvatar
                  ? "Uploading…"
                  : profileData.avatarUrl
                    ? "Change picture"
                    : "Upload picture"}
              </button>
              {profileData.avatarUrl && (
                <button
                  type="button"
                  onClick={() => onAvatarChange(null)}
                  className="px-2 py-2 text-xs font-medium text-[#D70015] hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
            {avatarError && (
              <p role="alert" className="mt-2 text-xs text-[#D70015]">
                {avatarError}
              </p>
            )}
            <p className="mt-1 text-[11px] text-[#86868B]">
              JPG, PNG, or WebP · Up to 5 MB
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="username" className={labelClass}>
              Username
            </label>
            <div className="flex h-11 items-center rounded-xl border border-[#D2D2D7] bg-white px-3.5 focus-within:border-[#0071E3] focus-within:ring-4 focus-within:ring-[#0071E3]/15">
              <span className="mr-1 shrink-0 text-[15px] text-[#8E8E93]">
                linkspace.app/
              </span>
              <input
                id="username"
                name="username"
                type="text"
                value={profileData.username}
                onChange={handleUsernameChange}
                onBlur={handleUsernameBlur}
                placeholder="yourname"
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent text-base text-[#1D1D1F] outline-none sm:text-[15px]"
              />
            </div>
            {usernameError ? (
              <p role="alert" className="mt-1.5 text-xs text-[#D70015]">
                {usernameError}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-[#6E6E73]">
                Use 3–30 lowercase letters and numbers.
              </p>
            )}
          </div>
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
