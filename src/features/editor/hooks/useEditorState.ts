"use client";

import { useState, type ComponentProps } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";

import {
  DEFAULT_APPEARANCE,
  type AppearanceData,
  type LinkData,
  type ProfileData,
} from "../types";

import {
  validateLink,
  type LinkActionResult,
} from "../editor-utils";

type UseEditorStateProps = {
  initialProfile: ProfileData;
  initialLinks: LinkData[];
  initialAppearance: AppearanceData;
};

type DragEndEvent = Parameters<
  NonNullable<ComponentProps<typeof DragDropProvider>["onDragEnd"]>
>[0];

export function useEditorState({
  initialProfile,
  initialLinks,
  initialAppearance,
}: UseEditorStateProps) {
  const [profileData, setProfileData] =
    useState<ProfileData>(initialProfile);

  const [links, setLinks] = useState<LinkData[]>(initialLinks);

  const [appearance, setAppearance] = useState<AppearanceData>({
    ...DEFAULT_APPEARANCE,
    ...initialAppearance,
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const [showLinkForm, setShowLinkForm] = useState(false);

  const [linkInfo, setLinkInfo] = useState({
    title: "",
    url: "",
  });

  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    JSON.stringify({
      profileData: initialProfile,
      links: initialLinks,
      appearance: initialAppearance,
    }),
  );

  const currentSnapshot = JSON.stringify({
    profileData,
    links,
    appearance,
  });

  const hasUnsavedChanges = currentSnapshot !== savedSnapshot;

  const handleProfileFieldChange = (
    field: string,
    value: string,
  ) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarChange = (avatarUrl: string | null) => {
    setProfileData((prev) => ({
      ...prev,
      avatarUrl,
    }));
  };

  const addLink = async (
    title: string,
    url: string,
  ): Promise<LinkActionResult> => {
    const result = validateLink(title, url);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    const newLink: LinkData = {
      id: crypto.randomUUID(),
      title: result.title,
      url: result.url,
    };

    setLinks((prev) => [...prev, newLink]);

    return {
      success: true,
      error: "",
    };
  };

  const updateLink = async (
    id: string,
    title: string,
    url: string,
  ): Promise<LinkActionResult> => {
    const result = validateLink(title, url);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    setLinks((prev) =>
      prev.map((link) =>
        link.id === id
          ? {
              ...link,
              title: result.title,
              url: result.url,
            }
          : link,
      ),
    );

    cancelEditing();

    return {
      success: true,
      error: "",
    };
  };

  const cancelEditing = () => {
    setEditingId(null);
    setLinkInfo({ title: "", url: "" });
    setShowLinkForm(false);
  };

  const startEditingLink = (link: LinkData) => {
    setEditingId(link.id);

    setLinkInfo({
      title: link.title,
      url: link.url,
    });

    setShowLinkForm(true);
  };

  const startAddingLink = () => {
    setEditingId(null);
    setLinkInfo({ title: "", url: "" });
    setShowLinkForm(true);
  };

  const deleteLink = async (
    id: string,
  ): Promise<LinkActionResult> => {
    setLinks((prev) => prev.filter((link) => link.id !== id));

    if (editingId === id) {
      cancelEditing();
    }

    return {
      success: true,
      error: "",
    };
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.canceled) {
      return;
    }

    const { source } = event.operation;

    if (!isSortable(source)) {
      return;
    }

    const { initialIndex, index } = source;

    if (initialIndex === index) {
      return;
    }

    setLinks((prev) => {
      const reordered = [...prev];
      const [movedLink] = reordered.splice(initialIndex, 1);

      if (!movedLink) {
        return prev;
      }

      reordered.splice(index, 0, movedLink);

      return reordered;
    });
  };

  // Called after the current version has been saved successfully.
  const markAsSaved = (snapshot: string) => {
    setSavedSnapshot(snapshot);
  };

  return {
    profileData,
    links,
    appearance,
    setAppearance,

    editingId,
    linkInfo,
    setLinkInfo,
    showLinkForm,
    setShowLinkForm,

    currentSnapshot,
    hasUnsavedChanges,
    markAsSaved,

    handleProfileFieldChange,
    handleAvatarChange,

    addLink,
    updateLink,
    deleteLink,
    handleDragEnd,

    startEditingLink,
    startAddingLink,
    cancelEditing,
  };
}