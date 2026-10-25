"use client";

import { useSyncExternalStore } from "react";

import ProfilePreview from "@/features/editor/ProfilePreview";
import type {
  LinkData,
  ProfileData,
} from "@/features/editor/types";
import Link from "next/link";

type SavedEditorData = {
  profileData: ProfileData;
  links: LinkData[];
};

const STORAGE_KEY = "linkspace-editor-data";

const DEFAULT_PROFILE: SavedEditorData = {
  profileData: {
    displayName: "Sam",
    bio: "Hey, I am a frontend developer",
  },
  links: [
    { id: "1", title: "Github", url: "https://github.com" },
    { id: "2", title: "Portfolio", url: "https://example.com" },
  ],
};

const isSavedEditorData = (value: unknown): value is SavedEditorData => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const data = value as Record<string, unknown>;

  if (
    typeof data.profileData !== "object" ||
    data.profileData === null ||
    !Array.isArray(data.links)
  ) {
    return false;
  }

  const profile = data.profileData as Record<string, unknown>;

  return (
    typeof profile.displayName === "string" &&
    typeof profile.bio === "string" &&
    data.links.every((link: unknown) => {
      if (typeof link !== "object" || link === null) {
        return false;
      }

      const item = link as Record<string, unknown>;

      return (
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.url === "string"
      );
    })
  );
};

const getSnapshot = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const getServerSnapshot = (): null => null;

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
  };
};

export default function PublicProfilePage() {
  const storedData = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  let savedData: SavedEditorData | null = null;

  if (storedData) {
    try {
      const parsed: unknown = JSON.parse(storedData);

      if (isSavedEditorData(parsed)) {
        savedData = parsed;
      }
    } catch {
      savedData = null;
    }
  }

  if (storedData === null) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#FBFBFD]">
        <p className="text-sm text-[#6E6E73]">
          Loading profile...
        </p>
      </main>
    );
  }

  if (!savedData) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-[#FBFBFD] px-6 text-center">
        <h1 className="text-2xl font-semibold text-[#1D1D1F]">
          Profile not found
        </h1>

        <p className="mt-2 text-sm text-[#6E6E73]">
          This profile has no valid saved data in this browser.
        </p>

        <Link
          href="/editor"
          className="mt-6 rounded-xl bg-[#0071E3] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0062C4]"
        >
          Open editor
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh justify-center bg-[#FBFBFD] px-4 py-8 sm:items-center sm:py-10">
      <div className="w-full max-w-[380px] overflow-hidden rounded-[32px] border border-[#E8E8ED] bg-white shadow-sm">
        <ProfilePreview
          profileData={savedData.profileData}
          links={savedData.links}
        />
      </div>
    </main>
  );
}