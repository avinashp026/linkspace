"use client";

import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle, Trash2, UserRound } from "lucide-react";
import type { ProfileData } from "../types";
import { validateUsername } from "@/utils/validation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

type ProfileEditorProps = {
  profileData: ProfileData;
  handleChange: (field: string, value: string) => void;
  onAvatarChange: (url: string | null) => void;
};

export default function ProfileEditor({
  profileData,
  handleChange,
  onAvatarChange,
}: ProfileEditorProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [usernameError, setUsernameError] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleUsernameBlur = () => {
    const result = validateUsername(profileData.username);

    setUsernameError(result || "");
  };

  const handleUsernameChange = (value: string) => {
    handleChange("username", value.toLowerCase());
    setUsernameError("");
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setAvatarError("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setAvatarError("Please upload a JPEG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > maxSize) {
      setAvatarError("Your image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Please sign in again before uploading an image.");
      }

      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      const extension =
        fileExtension === "jpg" ||
        fileExtension === "jpeg" ||
        fileExtension === "png" ||
        fileExtension === "webp"
          ? fileExtension
          : "jpg";

      const filePath = `${user.id}/avatar/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("profile-assets")
        .getPublicUrl(filePath);

      onAvatarChange(data.publicUrl);
    } catch (error) {
      console.error("Avatar upload failed:", error);

      setAvatarError(
        error instanceof Error
          ? error.message
          : "Something went wrong while uploading your image.",
      );
    } finally {
      setIsUploadingAvatar(false);

      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = () => {
    onAvatarChange(null);
    setAvatarError("");
  };

  const inputClass =
    "w-full min-w-0 rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-ring/20";

  const labelClass = "mb-2 block text-sm font-medium text-foreground";

  return (
    <section className="space-y-8">
      {/* Profile photo */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Profile photo
          </h2>
          <p className="mt-1 text-sm text-muted">
            Add a photo so people can recognise your page.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted-background">
            {profileData.avatarUrl ? (
              <Image
                src={profileData.avatarUrl}
                alt="Profile avatar"
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <UserRound className="size-9 text-muted" aria-hidden="true" />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
              aria-label="Choose profile photo"
            />

            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploadingAvatar ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <ImagePlus className="size-4" />
              )}

              {isUploadingAvatar ? "Uploading..." : "Upload photo"}
            </button>

            {profileData.avatarUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={isUploadingAvatar}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted-background disabled:opacity-60"
              >
                <Trash2 className="size-4" />
                Remove
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-muted">
          JPEG, PNG or WebP. Maximum file size: 5 MB.
        </p>

        {avatarError && (
          <p className="text-sm text-danger" role="alert">
            {avatarError}
          </p>
        )}
      </div>

      <div className="border-t border-border" />

      {/* Profile information */}
      <div className="space-y-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Profile information
          </h2>
          <p className="mt-1 text-sm text-muted">
            Tell people who you are and what your page is about.
          </p>
        </div>

        {/* Username */}
        <div>
          <label htmlFor="profile-username" className={labelClass}>
            Username
          </label>

          <div className="flex min-w-0 items-center overflow-hidden rounded-lg border border-input bg-card focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20">
            <span className="shrink-0 border-r border-border bg-muted-background px-3 py-2.5 text-sm text-muted">
              linkspace.com/
            </span>

            <input
              id="profile-username"
              type="text"
              value={profileData.username}
              onChange={(event) => handleUsernameChange(event.target.value)}
              onBlur={handleUsernameBlur}
              maxLength={30}
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground outline-none"
              placeholder="yourname"
              aria-invalid={Boolean(usernameError)}
              aria-describedby="username-help username-error"
            />
          </div>

          <p id="username-help" className="mt-2 text-xs text-muted">
            Use 3–30 lowercase letters or numbers.
          </p>

          {usernameError && (
            <p
              id="username-error"
              className="mt-1 text-sm text-danger"
              role="alert"
            >
              {usernameError}
            </p>
          )}
        </div>

        {/* Display name */}
        <div>
          <label htmlFor="profile-display-name" className={labelClass}>
            Display name
          </label>

          <input
            id="profile-display-name"
            type="text"
            value={profileData.displayName}
            onChange={(event) =>
              handleChange("displayName", event.target.value)
            }
            maxLength={50}
            className={inputClass}
            placeholder="Your name"
          />

          <p className="mt-2 text-xs text-muted">
            This is the name visitors will see on your profile.
          </p>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="profile-bio" className={labelClass}>
            Bio
          </label>

          <textarea
            id="profile-bio"
            value={profileData.bio ?? ""}
            onChange={(event) => handleChange("bio", event.target.value)}
            maxLength={160}
            rows={4}
            className={`${inputClass} resize-y`}
            placeholder="Tell visitors a little about yourself..."
          />

          <p className="mt-2 text-right text-xs text-muted">
            {(profileData.bio ?? "").length}/160
          </p>
        </div>
      </div>
    </section>
  );
}
