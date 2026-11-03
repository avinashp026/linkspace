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
