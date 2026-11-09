import { Suspense } from "react";
import ProfilePreview from "@/features/editor/ProfilePreview";
import {
  DEFAULT_APPEARANCE,
  type AppearanceData,
  type LinkData,
  type ProfileData,
  type ThemeName,
} from "@/features/editor/types";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type PublicProfilePageProps = { params: Promise<{ username: string }> };
const ALLOWED_THEMES: ThemeName[] = ["minimal", "dark", "soft", "bold"];

async function PublicProfileContent({ params }: PublicProfilePageProps) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      `id, username, display_name, bio, avatar_url, theme, background_color, text_color, button_color, button_text_color, accent_color`,
    )
    .eq("username", username)
    .maybeSingle();

  if (profileError) {
    console.error("Unable to load public profile:", profileError.message);
    throw new Error("Unable to load this profile");
  }
  if (!profile) notFound();

  const { data: databaseLinks, error: linksError } = await supabase
    .from("links")
    .select("id, title, url")
    .eq("profile_id", profile.id)
    .order("position", { ascending: true });

  if (linksError) {
    console.error("Unable to load public links:", linksError.message);
    throw new Error("Unable to load public links");
  }

  const profileData: ProfileData = {
    username: profile.username,
    displayName: profile.display_name,
    bio: profile.bio ?? "",
    avatarUrl: profile.avatar_url ?? null,
  };
  const links: LinkData[] = (databaseLinks ?? []).map((link) => ({
    id: link.id,
    title: link.title,
    url: link.url,
  }));
  const theme: ThemeName = ALLOWED_THEMES.includes(profile.theme as ThemeName)
    ? (profile.theme as ThemeName)
    : DEFAULT_APPEARANCE.theme;
  const appearance: AppearanceData = {
    theme,
    backgroundColor:
      profile.background_color ?? DEFAULT_APPEARANCE.backgroundColor,
    textColor: profile.text_color ?? DEFAULT_APPEARANCE.textColor,
    buttonColor: profile.button_color ?? DEFAULT_APPEARANCE.buttonColor,
    buttonTextColor:
      profile.button_text_color ?? DEFAULT_APPEARANCE.buttonTextColor,
    accentColor: profile.accent_color ?? DEFAULT_APPEARANCE.accentColor,
  };

  return (
    <main className="flex min-h-dvh justify-center bg-[#FBFBFD] px-4 py-8 sm:items-center sm:py-10">
      <div className="w-full max-w-[380px] overflow-hidden rounded-[32px] border border-[#E8E8ED] bg-white shadow-sm">
        <ProfilePreview
          profileData={profileData}
          links={links}
          appearance={appearance}
        />
      </div>
    </main>
  );
}

function ProfileLoading() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#FBFBFD] px-4 py-8">
      <div className="h-96 w-full max-w-[380px] animate-pulse rounded-[32px] bg-gray-200" />
    </main>
  );
}

export default function PublicProfilePage(props: PublicProfilePageProps) {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <PublicProfileContent params={props.params} />
    </Suspense>
  );
}
