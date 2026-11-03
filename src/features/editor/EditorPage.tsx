
"use client";

import { useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";

import ProfileForm from "./ProfileForm";
import ProfilePreview from "./ProfilePreview";
import type { LinkData, ProfileData } from "./types";
import Header from "@/components/Header";
import { createLink, updateLink as updateLinkAction, deleteLink as deleteLinkAction, saveLinkOrder } from "./actions";

type LinkActionResult =
  | { success: true; error: "" }
  | { success: false; error: string };

type ValidatedLink =
  | { success: true; title: string; url: string }
  | { success: false; error: string };

type EditorPageProps = {
  initialProfile: ProfileData;
  initialLinks: LinkData[];
};

const EditorPage = ({
  initialProfile,
  initialLinks,
}: EditorPageProps) => {
  const [profileData, setProfileData] =
    useState<ProfileData>(initialProfile);

  const [links, setLinks] = useState<LinkData[]>(initialLinks);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [showLinkForm, setShowLinkForm] = useState(false);

  const [linkInfo, setLinkInfo] = useState({
    title: "",
    url: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateLink = (
    title: string,
    url: string,
  ): ValidatedLink => {
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

  const addLink = async (
    title: string,
    url: string,
  ): Promise<LinkActionResult> => {
    // Validate before sending the request
    const result = validateLink(title, url);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Save the link in Supabase
    const savedLink = await createLink({
      title: result.title,
      url: result.url
    })

    if(!savedLink.success) {
      return {
        success: false,
        error: savedLink.error
      }
    }

    // Update the preview using the actual database record
    setLinks((prev) => [...prev, savedLink.link])

    return {
      success: true,
      error: ""
    }
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

  const updatedLink = await updateLinkAction(id, {
    title: result.title,
    url: result.url,
  });

  if (!updatedLink.success) {
    return {
      success: false,
      error: updatedLink.error,
    };
  }

  setLinks((prev) =>
    prev.map((link) =>
      link.id === id ? updatedLink.link : link,
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
    setMobileTab("edit");

    requestAnimationFrame(() => {
      document.getElementById("link-title")?.focus();
    });
  };

  const deleteLink = async (id: string): Promise<LinkActionResult> => {
  const result = await deleteLinkAction(id);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  setLinks((prev) => prev.filter((link) => link.id !== id));

  if (editingId === id) {
    cancelEditing();
  }

  return {
    success: true,
    error: "",
  };
};

  const handleDragEnd = async (
  event: Parameters<
    NonNullable<
      React.ComponentProps<typeof DragDropProvider>["onDragEnd"]
    >
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

  // Create the new order without changing the current state yet.
  const reordered = [...links];

  const [movedLink] = reordered.splice(initialIndex, 1);

  if (!movedLink) {
    return;
  }

  reordered.splice(index, 0, movedLink);

  // Save the new order in Supabase.
  const result = await saveLinkOrder(
    reordered.map((link) => link.id),
  );

  if (!result.success) {
    console.error("Unable to save link order:", result.error);
    return;
  }

  // Update the UI after Supabase confirms success.
  setLinks(reordered);
};

  return (
    <div className="min-h-dvh bg-[#FBFBFD] text-[#1D1D1F] lg:flex lg:h-dvh lg:flex-col lg:overflow-hidden">
      <Header />

      <main className="mx-auto w-full max-w-[1120px] px-4 pb-32 pt-4 sm:px-8 lg:min-h-0 lg:flex-1 lg:pb-0 lg:pt-0">
        {/* Mobile Edit / Preview toggle */}
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

        {/* Editor and preview panes */}
        <div className="grid grid-cols-1 gap-x-[72px] lg:h-full lg:grid-cols-[minmax(0,1fr)_340px] lg:grid-rows-[minmax(0,1fr)]">
          {/* Editor */}
          <section
            className={`min-w-0 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pb-16 lg:pr-3 lg:pt-12 ${
              mobileTab === "edit" ? "block" : "hidden lg:block"
            }`}
          >
            <h1 className="mb-5 hidden text-[32px] font-semibold tracking-tight lg:block">
              Your page
            </h1>

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
          </section>

          {/* Live preview */}
          <aside
            className={`flex-col items-center gap-4 lg:flex lg:h-full lg:justify-center lg:py-6 ${
              mobileTab === "preview" ? "flex" : "hidden"
            }`}
          >
            <span className="hidden text-[13px] font-medium tracking-[0.6px] text-[#6E6E73] lg:block">
              LIVE PREVIEW
            </span>

            <div className="min-h-[520px] w-full overflow-hidden rounded-3xl border border-[#E8E8ED] bg-white lg:h-[clamp(420px,calc(100dvh-14rem),640px)] lg:min-h-0 lg:w-[300px] lg:rounded-[44px] lg:border-6 lg:border-[#1D1D1F]">
              <ProfilePreview
                profileData={profileData}
                links={links}
              />
            </div>

            <p className="text-[13px] text-[#6E6E73]">
              linkspace.app/{profileData.username || "yourname"}
            </p>
          </aside>
        </div>
      </main>

      {/* Mobile Add button */}
      {mobileTab === "edit" && (
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
