"use server";

import { createClient } from "@/lib/supabase/server";
import { validateUsername } from "@/utils/validation";

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

export const updateLink = async (linkId: string, linkData: {
    title: string;
    url: string;
},) => {
    const title = linkData.title.trim();
    const url = linkData.url.trim();

    if(!linkId || !title || !url){
        return {
            success: false as const,
            error: "Please provide a valid link, title, and URL",
        }
    }

    let parsedUrl: URL;

    try {
        parsedUrl = new URL(url);
    } catch {
        return {
            success: false as const,
            error: 'Enter a valid URL, including https://.'
        };
    }

    if(!["https:", "https:"].includes(parsedUrl.protocol)) {
        return {
            success: false as const,
            error: "Only HTTP and HTTPS links are allowed."
        }
    }

    const supabase = await createClient();

    const {data: {user}, error: authError} = await supabase.auth.getUser();

    if(authError || !user){
        return {
            success: false as const,
            error: "You must be signed in to update a link."
        }
    }

    const {data, error} = await supabase.from("links").update({
        title,
        url: parsedUrl.href
    }).eq("id", linkId).eq("profile_id", user.id).select("id, title, url").single();

    if(error) {
        console.error("Link update failed:", error)

        return {
            success: false as const,
            error: "Unable to update your link. Please try again."
        }
    }

    return {
        success: true as const,
        link: data,
    };
}

export const deleteLink = async (linkId: string) => {
  if(!linkId) {
    return {
      success: false as const,
      error: "Invalid link."
    }
  }

  const supabase = await createClient();

  const {
    data: {user},
    error: authError
  } = await supabase.auth.getUser();

  if(authError || !user){
    return {
      success: false as const,
      error: "You must be signed in to delete a link."
    }
  }

  const {data, error} = await supabase.from("links").delete().eq("id", linkId).eq("profile_id", user.id).select("id").maybeSingle();

  if(error) {
    console.error("Link deletion failed:", error);

    return {
      success: false as const,
      error: "Unable to delete your link. Please try again."
    }
  }

  if(!data) {
    return {
      success: false as const,
      error: "Link not found or you do not have permission to delete it."
    };
  }

  return {
    success: true as const,
    error: ""
  };
}

export const saveLinkOrder = async (linkIds: string[]) => {
  if(!Array.isArray(linkIds) || new Set(linkIds).size !== linkIds.length) {
    return {
      success: false as const,
      error: "Invalid link order."
    }
  }

  const supabase = await createClient();

  const {data: {user}, error: authError} = await supabase.auth.getUser();

  if(authError || !user) {
    return {
      success: false as const,
      error: 'You must be signed in to reorder links.'
    }
  }

  for(const [position, id] of linkIds.entries()) {
    const {data, error} = await supabase.from("links").update({position}).eq("id", id).eq("profile_id", user.id).select("id").maybeSingle();

     if(error || !data){
      console.error("Link ordering failed:", error)

      return {
        success: false as const,
        error: "Unable to save your link order. Please try again."
      };
     }
  }

  return {
    success: true as const,
    error: "",
  };

 
}

export const setProfilePublished = async (isPublished: boolean) => {
  const supabase = await createClient();

  const {
    data: {user},
    error: authError
  } = await supabase.auth.getUser();

  if(authError || !user) {
    return {
      success: false as const,
      error: "You must be signed in to publish your profile."
    }
  }

  const {data, error} = await supabase
  .from("profiles")
  .update({
    is_published: isPublished,
    updated_at: new Date().toISOString(),
  }).eq("id", user.id).select("is_published").maybeSingle();

  
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
}

export const saveAllEditorData = async (profileData: {
  username: string,
  displayName: string,
  bio: string
}, links: {
  id: string,
  title: string,
  url: string
}[]) => {
  //  Valid profile information
  const username = profileData.username.trim();
  const displayName = profileData.displayName.trim();
  const bio = profileData.bio.trim();

  const usernameError = validateUsername(username);

  if(usernameError){
    return {
      success: false as const,
      error: usernameError
    }
  }

  if(!displayName) {
    return {
      success: false as const,
      error: "Display name is required"
    }
  }

  if(!Array.isArray(links)){
    return {
      success: false as const,
      error: "Invalid links data"
    }
  }

  // Validate all links
  const validatedLinks = [];

  for (const [position, link] of links.entries()) {
    const title = link.title.trim();
    const url = link.url.trim();

    if (!link.id || !title || !url) {
      return {
        success: false as const,
        error: "Every link must have a valid ID, title and URL.",
      };
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      return {
        success: false as const,
        error: `Invalid URL for "${title}".`,
      };
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return {
        success: false as const,
        error: `Only HTTP and HTTPS links are allowed for "${title}".`,
      };
    }

    validatedLinks.push({
      id: link.id,
      title,
      url: parsedUrl.href,
      position,
    });
  }

  // Prevent duplicate link IDs.
  const linkIds = validatedLinks.map((link) => link.id);

  if (new Set(linkIds).size !== linkIds.length) {
    return {
      success: false as const,
      error: "Duplicate links were detected.",
    };
  }

  // 3. Verify authentication.
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false as const,
      error: "You must be signed in to save your changes.",
    };
  }

  // 4. Save the profile.
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        username,
        display_name: displayName,
        bio,
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

  // 5. Retrieve existing links belonging to this user.
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

  // 6. Delete links that no longer exist in the editor.
  const currentIds = new Set(linkIds);

  for (const existingLink of existingLinks ?? []) {
    if (!currentIds.has(existingLink.id)) {
      const { error } = await supabase
        .from("links")
        .delete()
        .eq("id", existingLink.id)
        .eq("profile_id", user.id);

      if (error) {
        console.error("Link deletion failed:", error);

        return {
          success: false as const,
          error: "Unable to remove an existing link.",
        };
      }
    }
  }

  // 7. Insert new links and update existing links.
  if (validatedLinks.length > 0) {
    const rows = validatedLinks.map((link) => ({
      ...link,
      profile_id: user.id,
    }));

    const { error: linksError } = await supabase
      .from("links")
      .upsert(rows, { onConflict: "id" });

    if (linksError) {
      console.error("Links save failed:", linksError);

      return {
        success: false as const,
        error: "Unable to save your links.",
      };
    }
  }

  return {
    success: true as const,
    error: "",
  };
}
