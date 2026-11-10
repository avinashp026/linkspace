"use client";

import { useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";

import Header from "@/components/Header";

import ProfileEditor from "./components/ProfileEditor";
import LinksEditor from "./components/LinksEditor";
import AppearanceEditor from "./components/AppearanceEditor";

import MobileViewSwitcher, {
  type MobileView,
} from "./components/MobileViewSwitcher";

import WorkspaceTabs, {
  type WorkspaceTab,
} from "./components/WorkspaceTabs";

import ProfilePreview from "./ProfilePreview";

import type {
  AppearanceData,
  LinkData,
  ProfileData,
} from "./types";

import { saveAllEditorData, setProfilePublished } from "./actions";
import { useEditorState } from "./hooks/useEditorState";

type EditorPageProps = {
  initialProfile: ProfileData;
  initialLinks: LinkData[];
  initialIsPublished: boolean;
  initialAppearance: AppearanceData;
};

const EditorPage = ({
  initialProfile,
  initialLinks,
  initialIsPublished,
  initialAppearance,
}: EditorPageProps) => {
  const {
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
  } = useEditorState({
    initialProfile,
    initialLinks,
    initialAppearance,
  });

  // Page navigation state
  const [mobileTab, setMobileTab] = useState<MobileView>("edit");

  const [activeWorkspace, setActiveWorkspace] =
    useState<WorkspaceTab>("profile");

  // Save and publishing state
  const [isPublished, setIsPublished] = useState(initialIsPublished);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [saveError, setSaveError] = useState("");
  const [publishError, setPublishError] = useState("");

  const saveCurrentData = async (): Promise<boolean> => {
    setIsSaving(true);
    setSaveError("");

    try {
      const result = await saveAllEditorData(
        profileData,
        links,
        appearance,
      );

      if (!result.success) {
        setSaveError(result.error);
        return false;
      }

      markAsSaved(currentSnapshot);

      return true;
    } catch {
      setSaveError("Something went wrong while saving your changes.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (isSaving || isPublishing) {
      return;
    }

    await saveCurrentData();
  };

  const handlePublishToggle = async () => {
    if (isSaving || isPublishing) {
      return;
    }

    setIsPublishing(true);
    setPublishError("");
    setSaveError("");

    try {
      // Unpublishing does not save or discard pending editor changes.
      if (isPublished) {
        const result = await setProfilePublished(false);

        if (!result.success) {
          setPublishError(result.error);
          return;
        }

        setIsPublished(false);
        return;
      }

      // Publishing must first save all pending edits.
      if (hasUnsavedChanges) {
        const saved = await saveCurrentData();

        if (!saved) {
          setPublishError(
            "Your changes could not be saved, so your page was not published.",
          );
          return;
        }
      }

      const result = await setProfilePublished(true);

      if (!result.success) {
        setPublishError(
          `Your changes were saved, but publishing failed: ${result.error}`,
        );
        return;
      }

      setIsPublished(true);
    } catch {
      setPublishError("Something went wrong while updating your page.");
    } finally {
      setIsPublishing(false);
    }
  };

  // These wrappers coordinate editor operations with page navigation.
  const handleStartEditingLink = (link: LinkData) => {
    startEditingLink(link);
    setActiveWorkspace("links");
    setMobileTab("edit");
  };

  const handleStartAddingLink = () => {
    startAddingLink();
    setActiveWorkspace("links");
    setMobileTab("edit");

    requestAnimationFrame(() => {
      document.getElementById("link-title")?.focus();
    });
  };

  return (
    <div className="min-h-dvh bg-background text-foreground lg:flex lg:h-dvh lg:flex-col lg:overflow-hidden">
      <Header
        isPublished={isPublished}
        isPublishing={isPublishing}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        saveError={saveError}
        publishError={publishError}
        onSave={handleSave}
        onPublishToggle={handlePublishToggle}
      />

      <main className="mx-auto w-full max-w-[1440px] px-4 pb-32 pt-4 sm:px-8 lg:min-h-0 lg:flex-1 lg:overflow-hidden lg:px-10 lg:pb-0 lg:pt-0">
        <MobileViewSwitcher
          activeView={mobileTab}
          onViewChange={setMobileTab}
        />

        <div className="grid grid-cols-1 lg:h-full lg:grid-cols-[minmax(0,1fr)_380px] lg:grid-rows-[minmax(0,1fr)] lg:gap-x-12">
          {/* Editor panel */}
          <section
            className={`editor-scroll min-w-0 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pb-16 lg:pr-3 ${
              mobileTab === "edit" ? "block" : "hidden lg:block"
            }`}
          >
            <div className="mb-3 flex min-w-0 items-center justify-between gap-3 pt-2 lg:mb-4 lg:pt-10">
              <h1 className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
                Your page
              </h1>

              <span className="shrink-0 text-xs text-muted sm:text-sm">
                Edit your LinkSpace profile
              </span>
            </div>

            <WorkspaceTabs
              activeTab={activeWorkspace}
              onTabChange={setActiveWorkspace}
            />

            {activeWorkspace === "profile" && (
              <ProfileEditor
                profileData={profileData}
                handleChange={handleProfileFieldChange}
                onAvatarChange={handleAvatarChange}
              />
            )}

            {activeWorkspace === "links" && (
              <DragDropProvider onDragEnd={handleDragEnd}>
                <LinksEditor
                  links={links}
                  onEdit={handleStartEditingLink}
                  onDelete={deleteLink}
                  addLink={addLink}
                  updateLink={updateLink}
                  editingId={editingId}
                  linkInfo={linkInfo}
                  setLinkInfo={setLinkInfo}
                  showLinkForm={showLinkForm}
                  setShowLinkForm={setShowLinkForm}
                  cancelEditing={cancelEditing}
                  startAddingLink={handleStartAddingLink}
                />
              </DragDropProvider>
            )}

            {activeWorkspace === "appearance" && (
              <AppearanceEditor
                appearance={appearance}
                setAppearance={setAppearance}
              />
            )}
          </section>

          {/* Live preview */}
          <aside
            className={`flex-col items-center gap-4 lg:flex lg:h-full lg:justify-center lg:py-6 ${
              mobileTab === "preview" ? "flex" : "hidden"
            }`}
          >
            <span className="hidden text-[13px] font-medium tracking-wide text-muted lg:block">
              LIVE PREVIEW
            </span>

            <div className="min-h-[520px] w-full overflow-hidden rounded-3xl border border-border bg-card lg:h-[clamp(480px,calc(100dvh-11rem),700px)] lg:min-h-0 lg:w-[270px] lg:rounded-[44px] lg:border-[6px] lg:border-gray-900">
              <ProfilePreview
                profileData={profileData}
                links={links}
                appearance={appearance}
              />
            </div>

            <p className="max-w-full truncate text-[13px] text-muted">
              linkspace.app/{profileData.username || "yourname"}
            </p>
          </aside>
        </div>
      </main>

      {/* Mobile Add Link action */}
      {mobileTab === "edit" && activeWorkspace === "links" && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/90 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            onClick={handleStartAddingLink}
            className="min-h-12 w-full rounded-xl bg-primary px-4 py-3 text-base font-medium text-primary-foreground transition hover:bg-primary-700 active:scale-[0.99]"
          >
            Add link
          </button>
        </div>
      )}
    </div>
  );
};

export default EditorPage;