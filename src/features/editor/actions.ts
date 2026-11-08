"use server";

import { createClient } from "@/lib/supabase/server";
import { validateUsername } from "@/utils/validation";
import type { AppearanceData } from "./types";

// Types for the Editor Profile and links input
type EditorProfileInput = {
  username: string;
  displayName: string;
  bio: string;
};

type EditorLinkInput = {
  id: string;
  title: string;
  url: string;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_LINKS = 20;
const MAX_DISPLAY_NAME_LENGTH = 50;
const MAX_BIO_LENGTH = 160;
const MAX_LINK_TITLE_LENGTH = 40;
const MAX_URL_LENGTH = 2048;

// Appearance Validation

type EditorAppearanceInput = AppearanceData;
const ALLOWED_THEMES = ["minimal", "dark", "soft", "bold"];
const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

export const saveProfile = async (profileData: {
  username: string;
  displayName: string;
  bio: string;
}) => {
  // 1. Validate the input on the server

  const username = profileData.username.trim();
  const displayName = profileData.displayName.trim();
  const bio = profileData.bio.trim();

  const usernameError = validateUsername(username);

  if (usernameError) {
    return {
      success: false,
      error: usernameError,
    };
  }

  if (!displayName) {
    return {
      success: false,
      error: "Displat name is required",
    };
  }

  // 2. Create an authenticated supabase client.
  const supabase = await createClient();

  // 3. Verify the signed-in user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be signed in to save your profile",
    };
  }

  // 4. Create or update the user's profile
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      username,
      display_name: displayName,
      bio,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "id",
    },
  );

  if (error) {
    console.error("Profile save failed:", error);

    if (error.code === "23505") {
      return {
        success: false,
        error: "This username is already taken. Please choose another.",
      };
    }

    return {
      success: false,
      error: "Unable to save your profile. Please try again.",
    };
  }

  return {
    success: true,
    error: "",
  };
};

export const createLink = async (linkData: { title: string; url: string }) => {
  const title = linkData.title.trim();
  const url = linkData.url.trim();

  if (!title || !url) {
    return {
      success: false as const,
      error: "Please enter both a title and a URL.",
    };
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    return {
      success: false as const,
      error: "Enter a valid URL, including https://.",
    };
  }

  if (!["https:", "https:"].includes(parsedUrl.protocol)) {
    return {
      success: false as const,
      error: "Only HTTP and HTTPS links are allowed.",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false as const,
      error: "You must be signed in to create a link.",
    };
  }

  const { data, error } = await supabase
    .from("links")
    .insert({
      profile_id: user.id,
      title,
      url: parsedUrl.href,
    })
    .select("id, title, url")
    .single();

  if (error) {
    console.error("Link creation failed:", error);

    return {
      success: false as const,
      error: "Unable to save your link. Please try again.",
    };
  }

  return {
    success: true as const,
    link: data,
  };
};

export const updateLink = async (
  linkId: string,
  linkData: {
    title: string;
    url: string;
  },
) => {
  const title = linkData.title.trim();
  const url = linkData.url.trim();

  if (!linkId || !title || !url) {
    return {
      success: false as const,
      error: "Please provide a valid link, title, and URL",
    };
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    return {
      success: false as const,
      error: "Enter a valid URL, including https://.",
    };
  }

  if (!["https:", "https:"].includes(parsedUrl.protocol)) {
    return {
      success: false as const,
      error: "Only HTTP and HTTPS links are allowed.",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false as const,
      error: "You must be signed in to update a link.",
    };
  }

  const { data, error } = await supabase
    .from("links")
    .update({
      title,
      url: parsedUrl.href,
    })
    .eq("id", linkId)
    .eq("profile_id", user.id)
    .select("id, title, url")
    .single();

  if (error) {
    console.error("Link update failed:", error);

    return {
      success: false as const,
      error: "Unable to update your link. Please try again.",
    };
  }

  return {
    success: true as const,
    link: data,
  };
};

export const deleteLink = async (linkId: string) => {
  if (!linkId) {
    return {
      success: false as const,
      error: "Invalid link.",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false as const,
      error: "You must be signed in to delete a link.",
    };
  }

  const { data, error } = await supabase
    .from("links")
    .delete()
    .eq("id", linkId)
    .eq("profile_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Link deletion failed:", error);

    return {
      success: false as const,
      error: "Unable to delete your link. Please try again.",
    };
  }

  if (!data) {
    return {
      success: false as const,
      error: "Link not found or you do not have permission to delete it.",
    };
  }

  return {
    success: true as const,
    error: "",
  };
};

export const saveLinkOrder = async (linkIds: string[]) => {
  if (!Array.isArray(linkIds) || new Set(linkIds).size !== linkIds.length) {
    return {
      success: false as const,
      error: "Invalid link order.",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false as const,
      error: "You must be signed in to reorder links.",
    };
  }

  for (const [position, id] of linkIds.entries()) {
    const { data, error } = await supabase
      .from("links")
      .update({ position })
      .eq("id", id)
      .eq("profile_id", user.id)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      console.error("Link ordering failed:", error);

      return {
        success: false as const,
        error: "Unable to save your link order. Please try again.",
      };
    }
  }

  return {
    success: true as const,
    error: "",
  };
};

export const setProfilePublished = async (isPublished: boolean) => {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false as const,
      error: "You must be signed in to publish your profile.",
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select("is_published")
    .maybeSingle();

  if (error) {
    console.error("Publication update failed:", error);

    return {
      success: false as const,
      error: "Unable to update publication status. Please try again.",
    };
  }

  if (!data) {
    return {
      success: false as const,
      error: "Please save your profile before publishing it.",
    };
  }

  return {
    success: true as const,
    isPublished: data.is_published,
  };
};

export const saveAllEditorData = async (
  profileData: EditorProfileInput,
  links: EditorLinkInput[],
  appearance: EditorAppearanceInput,
) => {
  // 1. Authenticate the user first

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false as const,
      error: "You must be signed in to save your changes",
    };
  }

  // 2. Validate the profile input
  if (
    !profileData ||
    typeof profileData.username !== "string" ||
    typeof profileData.bio !== "string" ||
    typeof profileData.displayName !== "string"
  ) {
    return {
      success: false as const,
      error: "Invalid profile data",
    };
  }

  const username = profileData.username.trim();
  const displayName = profileData.displayName.trim();
  const bio = profileData.bio.trim();

  const usernameError = validateUsername(username);

  if (usernameError) {
    return {
      success: false as const,
      error: usernameError,
    };
  }

  if (!displayName || displayName.length > MAX_DISPLAY_NAME_LENGTH) {
    return {
      success: false as const,
      error: `Display name must be between 1 and ${MAX_DISPLAY_NAME_LENGTH} characters.`,
    };
  }

  if (bio.length > MAX_BIO_LENGTH) {
    return {
      success: false as const,
      error: `Bio lenght cannot exceed ${MAX_BIO_LENGTH}`,
    };
  }

  // 3. Validate appearance settings
  if (
    !appearance ||
    typeof appearance !== "object" ||
    !ALLOWED_THEMES.includes(appearance.theme) ||
    !HEX_COLOR_REGEX.test(appearance.backgroundColor) ||
    !HEX_COLOR_REGEX.test(appearance.textColor) ||
    !HEX_COLOR_REGEX.test(appearance.buttonColor) ||
    !HEX_COLOR_REGEX.test(appearance.buttonTextColor) ||
    !HEX_COLOR_REGEX.test(appearance.accentColor)
  ) {
    return {
      success: false as const,
      error: "Invalid appearance settings.",
    };
  }

  // 4. validate the links collection
  if (!Array.isArray(links) || links.length > MAX_LINKS) {
    return {
      success: false as const,
      error: `You can add a maximum of ${MAX_LINKS} links.`,
    };
  }

  const validatedLinks: {
    id: string;
    title: string;
    url: string;
    position: number;
  }[] = [];

  for (const [position, link] of links.entries()) {
    if (
      !link ||
      typeof link.id !== "string" ||
      typeof link.title !== "string" ||
      typeof link.url !== "string"
    ) {
      return {
        success: false as const,
        error: "Invalid link data.",
      };
    }

    const id = link.id.trim();
    const title = link.title.trim();
    const url = link.url.trim();

    if (!UUID_REGEX.test(id)) {
      return {
        success: false as const,
        error: "Invalid link ID.",
      };
    }

    if (!title || title.length > MAX_LINK_TITLE_LENGTH) {
      return {
        success: false as const,
        error: `Link titles must be between 1 and ${MAX_LINK_TITLE_LENGTH} characters.`,
      };
    }

    if (!url || url.length > MAX_URL_LENGTH) {
      return {
        success: false as const,
        error: "Please provide a valid URL.",
      };
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      return {
        success: false as const,
        error: `Invalid URL for "${title}". Include https:// or http://.`,
      };
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return {
        success: false as const,
        error: `Only HTTP and HTTPS links are allowed for "${title}".`,
      };
    }

    validatedLinks.push({
      id,
      title,
      url: parsedUrl.href,
      position,
    });
  }

  // 4. Reject duplicate IDs.
  const incomingIds = validatedLinks.map((link) => link.id);

  if (new Set(incomingIds).size !== incomingIds.length) {
    return {
      success: false as const,
      error: "Duplicate links were detected.",
    };
  }

  // 5. Retrieve the IDs of links owned by the authenticated user.
  const { data: existingLinks, error: fetchError } = await supabase
    .from("links")
    .select("id")
    .eq("profile_id", user.id);

  if (fetchError) {
    console.error("Existing links retrieval failed:", fetchError);

    return {
      success: false as const,
      error: "Unable to retrieve your existing links.",
    };
  }

  const ownedIds = new Set((existingLinks ?? []).map((link) => link.id));

  const incomingIdSet = new Set(incomingIds);

  // 6. Separate updates from new inserts.
  const linksToUpdate = validatedLinks.filter((link) => ownedIds.has(link.id));

  const linksToInsert = validatedLinks.filter((link) => !ownedIds.has(link.id));

  // 7. Save the profile.
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      username,
      display_name: displayName,
      bio,

      // Appearance settings
      theme: appearance.theme,
      background_color: appearance.backgroundColor,
      text_color: appearance.textColor,
      button_color: appearance.buttonColor,
      button_text_color: appearance.buttonTextColor,
      accent_color: appearance.accentColor,

      
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (profileError) {
    console.error("Profile save failed:", profileError);

    if (profileError.code === "23505") {
      return {
        success: false as const,
        error: "This username is already taken.",
      };
    }

    return {
      success: false as const,
      error: "Unable to save your profile.",
    };
  }

  // 8. Update only links already owned by this user.
  for (const link of linksToUpdate) {
    const { data, error } = await supabase
      .from("links")
      .update({
        title: link.title,
        url: link.url,
        position: link.position,
      })
      .eq("id", link.id)
      .eq("profile_id", user.id)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      console.error("Link update failed:", error);

      return {
        success: false as const,
        error: "Unable to update your links.",
      };
    }
  }

  // 9. Insert new links.
  if (linksToInsert.length > 0) {
    const rows = linksToInsert.map((link) => ({
      ...link,
      profile_id: user.id,
    }));

    const { error: insertError } = await supabase.from("links").insert(rows);

    if (insertError) {
      console.error("New links insertion failed:", insertError);

      return {
        success: false as const,
        error: "Unable to add your new links.",
      };
    }
  }

  // 10. Delete links removed from the editor.
  const linksToDelete = (existingLinks ?? []).filter(
    (link) => !incomingIdSet.has(link.id),
  );

  for (const link of linksToDelete) {
    const { error } = await supabase
      .from("links")
      .delete()
      .eq("id", link.id)
      .eq("profile_id", user.id);

    if (error) {
      console.error("Link deletion failed:", error);

      return {
        success: false as const,
        error: "Unable to remove an existing link.",
      };
    }
  }

  return {
    success: true as const,
    error: "",
  };
};
