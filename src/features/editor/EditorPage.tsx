
"use client";

import { useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";

import ProfileForm from "./ProfileForm";
import ProfilePreview from "./ProfilePreview";
import type { LinkData, ProfileData } from "./types";
import Container from "@/components/Container";
import Header from "@/components/Header";

type LinkActionResult =
  | { success: true; error: "" }
  | { success: false; error: string };

type ValidatedLink =
  | { success: true; title: string; url: string }
  | { success: false; error: string };

const EditorPage = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: "Sam",
    bio: "Hey, I am a frontend developer",
  });

  const [links, setLinks] = useState<LinkData[]>([
    { id: "1", title: "Github", url: "https://github.com" },
    { id: "2", title: "Portfolio", url: "https://example.com" },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);

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

  const addLink = (
    title: string,
    url: string,
  ): LinkActionResult => {
    const result = validateLink(title, url);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const newLink: LinkData = {
      id: crypto.randomUUID(),
      title: result.title,
      url: result.url,
    };

    setLinks((prev) => [...prev, newLink]);

    return { success: true, error: "" };
  };

  const updateLink = (
    id: string,
    title: string,
    url: string,
  ): LinkActionResult => {
    const result = validateLink(title, url);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    setLinks((prev) =>
      prev.map((link) =>
        link.id === id
          ? { ...link, title: result.title, url: result.url }
          : link,
      ),
    );

    setEditingId(null);

    return { success: true, error: "" };
  };

  const startEditingLink = (link: LinkData) => {
    setEditingId(link.id);
    setLinkInfo({
      title: link.title,
      url: link.url,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setLinkInfo({ title: "", url: "" });
  };

  const deleteLink = (id: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));

    if (editingId === id) {
      cancelEditing();
    }
  };

  return (
    <>
      <Header />

      <Container>
        <div className="grid grid-cols-1 gap-6 py-8 lg:grid-cols-2 lg:gap-8">
          <div>
            <ProfileForm
              profileData={profileData}
              handleChange={handleChange}
              addLink={addLink}
              updateLink={updateLink}
              editingId={editingId}
              linkInfo={linkInfo}
              setLinkInfo={setLinkInfo}
              cancelEditing={cancelEditing}
            />
          </div>

          <DragDropProvider
            onDragEnd={(event) => {
              if (event.canceled) return;

              const { source } = event.operation;

              if (!isSortable(source)) return;

              const { initialIndex, index } = source;

              if (initialIndex === index) return;

              setLinks((prev) => {
                const reorderedLinks = [...prev];
                const [movedLink] = reorderedLinks.splice(
                  initialIndex,
                  1,
                );

                if (!movedLink) return prev;

                reorderedLinks.splice(index, 0, movedLink);

                return reorderedLinks;
              });
            }}
          >
            <ProfilePreview
              profileData={profileData}
              links={links}
              onEdit={startEditingLink}
              deleteLink={deleteLink}
            />
          </DragDropProvider>
        </div>
      </Container>
    </>
  );
};

export default EditorPage;
