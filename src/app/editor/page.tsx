
import EditorPage from "@/features/editor/EditorPage";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  DEFAULT_APPEARANCE,
  type AppearanceData,
  type ThemeName,
} from "@/features/editor/types";

const isThemeName = (value: string): value is ThemeName => {
  return ["minimal", "dark", "soft", "bold"].includes(value);
};

const Page = async () => {
  const supabase = await createClient();

  // 1. Verify the authenticated user.
  const { data, error } = await supabase.auth.getClaims();

  const userId = data?.claims?.sub;

  if (error || typeof userId !== "string") {
    redirect("/login");
  }

  // 2. Load the user's profile and appearance settings.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
        username,
        display_name,
        bio,
        is_published,
        theme,
        background_color,
        text_color,
        button_color,
        button_text_color,
        accent_color
      `,
    )
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("Unable to load profile:", profileError.message);
    throw new Error("Unable to load your profile.");
  }

  // 3. Load the user's links if a profile exists.
  let initialLinks: {
    id: string;
    title: string;
    url: string;
  }[] = [];

  if (profile) {
    const { data: links, error: linksError } = await supabase
      .from("links")
      .select("id, title, url, position")
      .eq("profile_id", userId)
      .order("position", { ascending: true });

    if (linksError) {
      console.error("Unable to load links:", linksError.message);
      throw new Error("Unable to load your links.");
    }

    initialLinks = (links ?? []).map((link) => ({
      id: link.id,
      title: link.title,
      url: link.url,
    }));
  }

  // 4. Convert database fields to our frontend types.
  const initialProfile = profile
    ? {
        username: profile.username,
        displayName: profile.display_name,
        bio: profile.bio ?? "",
      }
    : {
        username: "",
        displayName: "",
        bio: "",
      };

  // 5. Convert database appearance fields to camelCase.
  const initialAppearance: AppearanceData = profile
    ? {
        theme: isThemeName(profile.theme)
          ? profile.theme
          : DEFAULT_APPEARANCE.theme,
        backgroundColor:
          profile.background_color ??
          DEFAULT_APPEARANCE.backgroundColor,
        textColor: profile.text_color ?? DEFAULT_APPEARANCE.textColor,
        buttonColor:
          profile.button_color ?? DEFAULT_APPEARANCE.buttonColor,
        buttonTextColor:
          profile.button_text_color ??
          DEFAULT_APPEARANCE.buttonTextColor,
        accentColor:
          profile.accent_color ?? DEFAULT_APPEARANCE.accentColor,
      }
    : DEFAULT_APPEARANCE;

  return (
    <EditorPage
      initialProfile={initialProfile}
      initialLinks={initialLinks}
      initialIsPublished={profile?.is_published ?? false}
      initialAppearance={initialAppearance}
    />
  );
};

export default Page;
