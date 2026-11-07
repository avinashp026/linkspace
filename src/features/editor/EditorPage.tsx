
"use client";

import { useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { Palette, UserRound } from "lucide-react";

import ProfileForm from "./ProfileForm";
import ProfilePreview from "./ProfilePreview";
import type { LinkData, ProfileData } from "./types";
import Header from "@/components/Header";
import {
  saveAllEditorData,
  setProfilePublished,
} from "./actions";

type LinkActionResult =
  | { success: true; error: "" }
  | { success: false; error: string };

type ValidatedLink =
  | { success: true; title: string; url: string }
  | { success: false; error: string };

type EditorPageProps = {
  initialProfile: ProfileData;
  initialLinks: LinkData[];
  initialIsPublished: boolean;
};

type WorkspaceTab = "content" | "appearance";

const EditorPage = ({
  initialProfile,
  initialLinks,
  initialIsPublished,
}: EditorPageProps) => {
  const [profileData, setProfileData] =
    useState<ProfileData>(initialProfile);

  const [links, setLinks] = useState<LinkData[]>(initialLinks);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [activeWorkspace, setActiveWorkspace] =
    useState<WorkspaceTab>("content");
  const [showLinkForm, setShowLinkForm] = useState(false);

  const [isPublished, setIsPublished] = useState(initialIsPublished);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [saveError, setSaveError] = useState("");
  const [publishError, setPublishError] = useState("");

  const [linkInfo, setLinkInfo] = useState({
    title: "",
    url: "",
  });

  // Represents the last version successfully saved to Supabase.
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    JSON.stringify({
      profileData: initialProfile,
      links: initialLinks,
    }),
  );

  const currentSnapshot = JSON.stringify({
    profileData,
    links,
  });

  const hasUnsavedChanges = currentSnapshot !== savedSnapshot;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateLink = (title: string, url: string): ValidatedLink => {
    const trimmedTitle = title.trim();
    const trimmedUrl = url.trim();

    if (!trimmedTitle || !trimmedUrl) {
      return {
        success: false,
        error: "Please enter both a title and a URL.",
      };
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(trimmedUrl);
    } catch {
      return {
        success: false,
        error: "Enter a valid URL, including https://.",
      };
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return {
        success: false,
        error: "Only HTTP and HTTPS links are allowed.",
      };
    }

    return {
      success: true,
      title: trimmedTitle,
      url: parsedUrl.href,
    };
  };

  // Add a link to local state. It will be saved when the user clicks Save.
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

  // Update a link in local state. No database request happens here.
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

    setEditingId(null);
    setLinkInfo({ title: "", url: "" });
    setShowLinkForm(false);

    return {
      success: true,
      error: "",
    };
  };

  const startEditingLink = (link: LinkData) => {
    setEditingId(link.id);

    setLinkInfo({
      title: link.title,
      url: link.url,
    });

    setShowLinkForm(true);
    setActiveWorkspace("content");
    setMobileTab("edit");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setLinkInfo({ title: "", url: "" });
    setShowLinkForm(false);
  };

  const startAddingLink = () => {
    setEditingId(null);
    setLinkInfo({ title: "", url: "" });
    setShowLinkForm(true);
    setActiveWorkspace("content");
    setMobileTab("edit");

    requestAnimationFrame(() => {
      document.getElementById("link-title")?.focus();
    });
  };

  // Delete a link from local state. The deletion is persisted on Save.
  const deleteLink = async (id: string): Promise<LinkActionResult> => {
    setLinks((prev) => prev.filter((link) => link.id !== id));

    if (editingId === id) {
      cancelEditing();
    }

    return {
      success: true,
      error: "",
    };
  };

  // Reordering also changes local state only.
  const handleDragEnd = (
    event: Parameters<
      NonNullable<React.ComponentProps<typeof DragDropProvider>["onDragEnd"]>
    >[0],
  ) => {
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

  // Save the current profile and complete link list to Supabase.
  const saveCurrentData = async (): Promise<boolean> => {
    setIsSaving(true);
    setSaveError("");

    try {
      const result = await saveAllEditorData(profileData, links);

      if (!result.success) {
        setSaveError(result.error);
        return false;
      }

      setSavedSnapshot(currentSnapshot);

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

  const workspaceTabs = [
    {
      id: "content" as const,
      label: "Content",
      icon: UserRound,
    },
    {
      id: "appearance" as const,
      label: "Appearance",
      icon: Palette,
    },
  ];

  return (
    <div className="min-h-dvh bg-[#FBFBFD] text-[#1D1D1F] lg:flex lg:h-dvh lg:flex-col lg:overflow-hidden">
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
        {/* Mobile Editor / Preview switch */}
        <div className="mb-5 lg:hidden">
          <div className="grid h-11 grid-cols-2 rounded-xl bg-[#EEEEF1] p-[3px]">
            {(["edit", "preview"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMobileTab(tab)}
                aria-pressed={mobileTab === tab}
                className={`rounded-[10px] text-[15px] font-medium capitalize transition ${
                  mobileTab === tab
                    ? "bg-white text-[#1D1D1F] shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
                    : "text-[#515154]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Editor workspace and live preview */}
        <div className="grid grid-cols-1 lg:h-full lg:grid-cols-[minmax(0,1fr)_380px] lg:grid-rows-[minmax(0,1fr)] lg:gap-x-12">
          {/* Left editor panel */}
          <section
            className={`min-w-0 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pb-16 lg:pr-3 ${
              mobileTab === "edit" ? "block" : "hidden lg:block"
            }`}
          >
            {/* Workspace heading */}
            <div className="mb-7 pt-2 lg:pt-10">
              <h1 className="text-[28px] font-semibold tracking-[-1px] sm:text-[32px]">
                Your page
              </h1>
              <p className="mt-1 text-[14px] text-[#6E6E73]">
                Build and customize your LinkSpace profile.
              </p>
            </div>

            {/* Content / Appearance navigation */}
            <div className="mb-8 flex border-b border-[#E8E8ED]">
              {workspaceTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeWorkspace === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveWorkspace(tab.id)}
                    aria-pressed={isActive}
                    className={`relative flex items-center gap-2 px-4 pb-3 text-[14px] font-medium transition first:pl-1 ${
                      isActive
                        ? "text-[#1D1D1F]"
                        : "text-[#86868B] hover:text-[#424245]"
                    }`}
                  >
                    <Icon size={17} strokeWidth={1.8} />
                    {tab.label}

                    {isActive && (
                      <span className="absolute inset-x-0 bottom-[-1px] h-[2px] rounded-full bg-[#0071E3]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Content workspace */}
            {activeWorkspace === "content" && (
              <DragDropProvider onDragEnd={handleDragEnd}>
                <ProfileForm
                  profileData={profileData}
                  handleChange={handleChange}
                  links={links}
                  onEdit={startEditingLink}
                  onDelete={deleteLink}
                  addLink={addLink}
                  updateLink={updateLink}
                  editingId={editingId}
                  linkInfo={linkInfo}
                  setLinkInfo={setLinkInfo}
                  showLinkForm={showLinkForm}
                  setShowLinkForm={setShowLinkForm}
                  cancelEditing={cancelEditing}
                  startAddingLink={startAddingLink}
                />
              </DragDropProvider>
            )}

            {/* Appearance workspace - theme controls come next */}
            {activeWorkspace === "appearance" && (
              <div className="pb-10">
                <div className="mb-7">
                  <h2 className="text-[20px] font-semibold tracking-tight">
                    Make it yours
                  </h2>
                  <p className="mt-1 max-w-[480px] text-[14px] leading-6 text-[#6E6E73]">
                    Choose a visual style for your page and customize its
                    colors, backgrounds, and buttons.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E8E8ED] bg-white p-6 sm:p-8">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F2F6FF] text-[#0071E3]">
                    <Palette size={21} strokeWidth={1.8} />
                  </div>

                  <h3 className="text-[17px] font-semibold">
                    Your page, your style
                  </h3>

                  <p className="mt-2 max-w-[420px] text-[14px] leading-6 text-[#6E6E73]">
                    We're preparing four carefully designed themes, with
                    options to personalize your page colors and appearance.
                    Your live preview will update as you customize it.
                  </p>

                  <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      {
                        name: "Minimal",
                        background: "bg-[#F5F5F7]",
                        card: "bg-white",
                      },
                      {
                        name: "Dark",
                        background: "bg-[#242424]",
                        card: "bg-[#414141]",
                      },
                      {
                        name: "Soft",
                        background: "bg-[#F5EDE7]",
                        card: "bg-[#FFF9F4]",
                      },
                      {
                        name: "Bold",
                        background: "bg-[#E9E9FF]",
                        card: "bg-[#FFFFFF]",
                      },
                    ].map((theme) => (
                      <div key={theme.name}>
                        <div
                          className={`flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-xl border border-[#E8E8ED] p-3 ${theme.background}`}
                        >
                          <div className="h-8 w-8 rounded-full bg-[#B8B8C0]" />
                          <div
                            className={`h-3 w-full rounded-full ${theme.card}`}
                          />
                          <div
                            className={`h-3 w-full rounded-full ${theme.card}`}
                          />
                          <div
                            className={`h-3 w-3/4 rounded-full ${theme.card}`}
                          />
                        </div>
                        <p className="mt-2 text-center text-[12px] font-medium text-[#6E6E73]">
                          {theme.name}
                        </p>
                      </div>
                    ))}
                  </div>

                  <p className="mt-6 border-t border-[#E8E8ED] pt-4 text-[12px] text-[#86868B]">
                    Theme selection and customization will be enabled in the
                    next step.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Live preview - always visible on desktop */}
          <aside
            className={`flex-col items-center gap-4 lg:flex lg:h-full lg:justify-center lg:py-6 ${
              mobileTab === "preview" ? "flex" : "hidden"
            }`}
          >
            <span className="hidden text-[13px] font-medium tracking-[0.6px] text-[#6E6E73] lg:block">
              LIVE PREVIEW
            </span>

            <div className="min-h-[520px] w-full overflow-hidden rounded-3xl border border-[#E8E8ED] bg-white lg:h-[clamp(420px,calc(100dvh-14rem),640px)] lg:min-h-0 lg:w-[300px] lg:rounded-[44px] lg:border-[6px] lg:border-[#1D1D1F]">
              <ProfilePreview profileData={profileData} links={links} />
            </div>

            <p className="text-[13px] text-[#6E6E73]">
              linkspace.app/{profileData.username || "yourname"}
            </p>
          </aside>
        </div>
      </main>

      {/* Mobile Add Link action - only shown in Content */}
      {mobileTab === "edit" && activeWorkspace === "content" && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#E8E8ED] bg-white/90 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            onClick={startAddingLink}
            className="h-[50px] w-full rounded-[14px] bg-[#0071E3] text-base font-medium text-white transition hover:bg-[#0062C4] active:scale-[0.99]"
          >
            Add link
          </button>
        </div>
      )}
    </div>
  );
};

export default EditorPage;
