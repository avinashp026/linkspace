
"use client";

import { useState } from "react";
import ProfileForm from "./ProfileForm";
import ProfilePreview from "./ProfilePreview";
import type { LinkData, ProfileData } from "./types";
import Container from "@/components/Container";
import Header from "@/components/Header";

type LinkActionResult = { success: true; error: "" }
  | { success: false; error: string };

type ValidatedLink = { success: true; title: string; url: string }
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

  // The unsaved values currently shown in the link form.
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

  // Shared validation for adding and editing links.
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

  // Add a new link.
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

  // Update an existing link.
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

  // Load the selected link into the form.
  const startEditingLink = (link: LinkData) => {
    setEditingId(link.id);

    setLinkInfo({
      title: link.title,
      url: link.url,
    });
  };

  // Cancel editing without changing the saved link.
  const cancelEditing = () => {
    setEditingId(null);
    setLinkInfo({ title: "", url: "" });
  };

  const deleteLink = (id: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));

    // If the deleted link is being edited, reset the form.
    if(editingId === id){
      cancelEditing();
    }
  };

  return (
    <>
      <Header />

      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <ProfileForm
              profileData={profileData}
              handleChange={handleChange}
              addLink={addLink}
              updateLink={updateLink}
              editingId={editingId}
              setEditingId={setEditingId}
              linkInfo={linkInfo}
              setLinkInfo={setLinkInfo}
              cancelEditing={cancelEditing}
            />
          </div>

          <div>
            <ProfilePreview
              profileData={profileData}
              links={links}
              onEdit={startEditingLink}
              deleteLink={deleteLink}
            />
          </div>
        </div>
      </Container>
    </>
  );
};

export default EditorPage;
