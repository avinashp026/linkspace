"use client";

import { useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { Palette, UserRound } from "lucide-react";

import ProfileForm from "./ProfileForm";
import ProfilePreview from "./ProfilePreview";
import {
  DEFAULT_APPEARANCE,
  type AppearanceData,
  type LinkData,
  type ProfileData,
  type ThemeName,
  type GradientName,
} from "./types";
import Header from "@/components/Header";
import { saveAllEditorData, setProfilePublished } from "./actions";

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
  initialAppearance: AppearanceData;
};

type WorkspaceTab = "content" | "appearance";

const THEME_PRESETS: Record<ThemeName, AppearanceData> = {
  minimal: {
    theme: "minimal",
    backgroundColor: "#FFFFFF",
    textColor: "#1D1D1F",
    buttonColor: "#1D1D1F",
    buttonTextColor: "#FFFFFF",
    accentColor: "#0071E3",
    backgroundGradient: "none",
    gradientColor1: "#FFFFFF",
    gradientColor2: "#FFFFFF",
    gradientDirection: "diagonal",
  },
  dark: {
    theme: "dark",
    backgroundColor: "#111827",
    textColor: "#F9FAFB",
    buttonColor: "#374151",
    buttonTextColor: "#FFFFFF",
    accentColor: "#A78BFA",
    backgroundGradient: "none",
    gradientColor1: "#FFFFFF",
    gradientColor2: "#FFFFFF",
    gradientDirection: "diagonal",
  },
  soft: {
    theme: "soft",
    backgroundColor: "#FFF7ED",
    textColor: "#44403C",
    buttonColor: "#FED7AA",
    buttonTextColor: "#7C2D12",
    accentColor: "#F97316",
    backgroundGradient: "none",
    gradientColor1: "#FFFFFF",
    gradientColor2: "#FFFFFF",
    gradientDirection: "diagonal",
  },
  bold: {
    theme: "bold",
    backgroundColor: "#FDF2F8",
    textColor: "#831843",
    buttonColor: "#BE185D",
    buttonTextColor: "#FFFFFF",
    accentColor: "#7C3AED",
    backgroundGradient: "none",
    gradientColor1: "#FFFFFF",
    gradientColor2: "#FFFFFF",
    gradientDirection: "diagonal",
  },
};

const COLOR_CONTROLS: {
  key: keyof Omit<
    AppearanceData,
    | "theme"
    | "backgroundGradient"
    | "gradientColor1"
    | "gradientColor2"
    | "gradientDirection"
  >;
  label: string;
  description: string;
}[] = [
  {
    key: "backgroundColor",
    label: "Page background",
    description: "The main background behind your profile.",
  },
  {
    key: "textColor",
    label: "Text",
    description: "Your name and profile description.",
  },
  {
    key: "buttonColor",
    label: "Button",
    description: "The background of your profile links.",
  },
  {
    key: "buttonTextColor",
    label: "Button text",
    description: "The text shown inside your link buttons.",
  },
  {
    key: "accentColor",
    label: "Accent",
    description: "Your profile avatar and focus accents.",
  },
];

const GRADIENT_PRESETS: {
  name: string;
  value: GradientName;
  css: string;
  color1: string;
  color2: string;
}[] = [
  {
    name: "Solid color",
    value: "none",
    css: "linear-gradient(135deg, #FFFFFF, #FFFFFF)",
    color1: "#FFFFFF",
    color2: "#FFFFFF",
  },
  {
    name: "Sunset",
    value: "sunset",
    css: "linear-gradient(135deg, #ff9a9e, #fad0c4)",
    color1: "#FF9A9E",
    color2: "#FAD0C4",
  },
  {
    name: "Ocean",
    value: "ocean",
    css: "linear-gradient(135deg, #2193b0, #6dd5ed)",
    color1: "#2193B0",
    color2: "#6DD5ED",
  },
  {
    name: "Lavender",
    value: "lavender",
    css: "linear-gradient(135deg, #c471f5, #fa71cd)",
    color1: "#C471F5",
    color2: "#FA71CD",
  },
  {
    name: "Mint",
    value: "mint",
    css: "linear-gradient(135deg, #11998e, #a8e6cf)",
    color1: "#11998E",
    color2: "#A8E6CF",
  },
  {
    name: "Peach",
    value: "peach",
    css: "linear-gradient(135deg, #ffb88c, #de6262)",
    color1: "#FFB88C",
    color2: "#DE6262",
  },
  {
    name: "Midnight",
    value: "midnight",
    css: "linear-gradient(135deg, #232526, #414345)",
    color1: "#232526",
    color2: "#414345",
  },
];

const EditorPage = ({
  initialProfile,
  initialLinks,
  initialIsPublished,
  initialAppearance,
}: EditorPageProps) => {
  const [profileData, setProfileData] = useState<ProfileData>(initialProfile);

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

  const [appearance, setAppearance] = useState<AppearanceData>({
    ...DEFAULT_APPEARANCE,
    ...initialAppearance,
  });

  // Represents the last version successfully saved to Supabase.
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (avatarUrl: string | null) => {
    setProfileData((prev) => ({
      ...prev,
      avatarUrl,
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
      const result = await saveAllEditorData(profileData, links, appearance);

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
                  onAvatarChange={handleAvatarChange}
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

            {/* Appearance workspace */}
            {activeWorkspace === "appearance" && (
              <div className="pb-10">
                <div className="mb-7">
                  <h2 className="text-[20px] font-semibold tracking-tight">
                    Make it yours
                  </h2>
                  <p className="mt-1 max-w-[480px] text-[14px] leading-6 text-[#6E6E73]">
                    Choose a starting theme, then fine-tune the colors. Your
                    preview updates as you make changes.
                  </p>
                </div>

                <section className="mb-6 rounded-2xl border border-[#E8E8ED] bg-white p-5 sm:p-6">
                  <div className="mb-4">
                    <h3 className="text-[16px] font-semibold">
                      Choose a theme
                    </h3>
                    <p className="mt-1 text-[13px] text-[#6E6E73]">
                      Selecting a theme applies its color palette. You can
                      customize every color below.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {(
                      [
                        { name: "Minimal", value: "minimal" },
                        { name: "Dark", value: "dark" },
                        { name: "Soft", value: "soft" },
                        { name: "Bold", value: "bold" },
                      ] as const
                    ).map((theme) => {
                      const preset = THEME_PRESETS[theme.value];
                      const isSelected = appearance.theme === theme.value;

                      return (
                        <button
                          key={theme.value}
                          type="button"
                          onClick={() => setAppearance({ ...preset })}
                          aria-pressed={isSelected}
                          className={`rounded-xl p-2 text-left transition ${
                            isSelected
                              ? "ring-2 ring-[#0071E3] ring-offset-2"
                              : "border border-[#E8E8ED] hover:border-[#B8B8C0]"
                          }`}
                        >
                          <div
                            className="flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-lg border border-black/5 p-3"
                            style={{
                              backgroundColor: preset.backgroundColor,
                            }}
                          >
                            <div
                              className="h-8 w-8 rounded-full"
                              style={{ backgroundColor: preset.accentColor }}
                            />
                            <div
                              className="h-3 w-full rounded-full"
                              style={{ backgroundColor: preset.buttonColor }}
                            />
                            <div
                              className="h-3 w-full rounded-full"
                              style={{ backgroundColor: preset.buttonColor }}
                            />
                            <div
                              className="h-3 w-3/4 rounded-full"
                              style={{ backgroundColor: preset.buttonColor }}
                            />
                          </div>
                          <div className="flex items-center justify-between px-1 pt-2">
                            <span className="text-[13px] font-medium">
                              {theme.name}
                            </span>
                            {isSelected && (
                              <span className="text-[11px] font-medium text-[#0071E3]">
                                Selected
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="mb-6 rounded-2xl border border-[#E8E8ED] bg-white p-5 sm:p-6">
                  <div className="mb-4">
                    <h3 className="text-[16px] font-semibold">
                      Background gradients
                    </h3>
                    <p className="mt-1 text-[13px] text-[#6E6E73]">
                      Choose a gradient for your profile background, or return
                      to your solid background color.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {GRADIENT_PRESETS.map((gradient) => {
                      const selected =
                        appearance.backgroundGradient === gradient.value;
                      return (
                        <button
                          key={gradient.value}
                          type="button"
                          onClick={() =>
                            setAppearance((current) => ({
                              ...current,
                              backgroundGradient: gradient.value,
                              gradientColor1: gradient.color1,
                              gradientColor2: gradient.color2,
                              gradientDirection: "diagonal",
                            }))
                          }
                          aria-pressed={selected}
                          className={`overflow-hidden rounded-xl text-left transition ${
                            selected
                              ? "ring-2 ring-[#0071E3] ring-offset-2"
                              : "border border-[#E8E8ED] hover:border-[#B8B8C0]"
                          }`}
                        >
                          <span
                            className="block h-16 w-full"
                            style={{
                              background:
                                gradient.value === "none"
                                  ? appearance.backgroundColor
                                  : gradient.css,
                            }}
                          />
                          <span className="flex items-center justify-between px-3 py-2 text-[13px] font-medium">
                            {gradient.name}
                            {selected && (
                              <span className="text-[#0071E3]">Selected</span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="rounded-2xl border border-[#E8E8ED] bg-white p-5 sm:p-6">
                  <div className="mb-5">
                    <h3 className="text-[16px] font-semibold">
                      Customize colors
                    </h3>
                    <p className="mt-1 text-[13px] text-[#6E6E73]">
                      Use the color picker or enter a hex color value.
                    </p>
                  </div>

                    
<div className="mb-6 rounded-xl bg-[#F7F7F9] p-4">
  <h4 className="mb-3 text-[14px] font-semibold">
    Custom gradient
  </h4>

  <div className="space-y-4">
    {([
      { key: "gradientColor1", label: "First color" },
      { key: "gradientColor2", label: "Second color" },
    ] as const
  ).map((color) => (
      <div
        key={color.key}
        className="flex items-center justify-between gap-4"
      >
        <label
          htmlFor={color.key}
          className="text-[13px] font-medium"
        >
          {color.label}
        </label>

        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#6E6E73]">
            {appearance[color.key].toUpperCase()}
          </span>

          <input
            id={color.key}
            type="color"
            value={appearance[color.key]}
            onChange={(event) =>
              setAppearance((current) => ({
                ...current,
                [color.key]: event.target.value.toUpperCase(),
              }))
            }
            className="h-10 w-11 cursor-pointer rounded-lg border border-[#E5E5EA] bg-white p-1"
          />
        </div>
      </div>
    ))}

    <div>
      <label
        htmlFor="gradient-direction"
        className="mb-2 block text-[13px] font-medium"
      >
        Gradient direction
      </label>

      <select
        id="gradient-direction"
        value={appearance.gradientDirection}
        onChange={(event) =>
          setAppearance((current) => ({
            ...current,
            gradientDirection: event.target.value as
              | "diagonal"
              | "horizontal"
              | "vertical",
          }))
        }
        className="h-11 w-full rounded-lg border border-[#E5E5EA] bg-white px-3 text-[14px] outline-none focus:border-[#0071E3]"
      >
        <option value="diagonal">Diagonal</option>
        <option value="horizontal">Horizontal</option>
        <option value="vertical">Vertical</option>
      </select>
    </div>
  </div>
</div>

                  <div className="space-y-5">
                    {COLOR_CONTROLS.map((control) => (
                      
                      <div
                        key={control.key}
                        className="flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <label
                            htmlFor={`appearance-${control.key}`}
                            className="text-[14px] font-medium"
                          >
                            {control.label}
                          </label>
                          <p className="mt-1 text-[12px] leading-5 text-[#86868B]">
                            {control.description}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <span className="hidden text-[12px] tabular-nums text-[#6E6E73] sm:inline">
                            {appearance[control.key].toUpperCase()}
                          </span>
                          <input
                            id={`appearance-${control.key}`}
                            type="color"
                            value={appearance[control.key]}
                            onChange={(event) =>
                              setAppearance((current) => ({
                                ...current,
                                [control.key]: event.target.value.toUpperCase(),
                              }))
                            }
                            aria-label={`${control.label} color`}
                            className="h-10 w-11 cursor-pointer rounded-lg border border-[#E5E5EA] bg-white p-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setAppearance({ ...THEME_PRESETS[appearance.theme] })
                    }
                    className="mt-6 border-t border-[#E8E8ED] pt-4 text-[13px] font-medium text-[#0071E3] transition hover:text-[#0062C4]"
                  >
                    Reset colors to this theme
                  </button>
                </section>
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
              <ProfilePreview
                profileData={profileData}
                links={links}
                appearance={appearance}
              />
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
