
import { Suspense } from "react";
import ProfilePreview from "@/features/editor/ProfilePreview";
import { LinkData, ProfileData } from "@/features/editor/types";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type PublicProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

async function PublicProfileContent({
  params,
}: PublicProfilePageProps) {
  const { username } = await params;

  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio")
    .eq("username", username)
    .maybeSingle();

  if (profileError) {
    console.error("Unable to load public profile:", profileError.message);
    throw new Error("Unable to load this profile");
  }

  if (!profile) {
    notFound();
  }

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
  };

  const links: LinkData[] = (databaseLinks ?? []).map((link) => ({
    id: link.id,
    title: link.title,
    url: link.url,
  }));

  return (
    <main className="flex min-h-dvh justify-center bg-[#FBFBFD] px-4 py-8 sm:items-center sm:py-10">
      <div className="w-full max-w-[380px] overflow-hidden rounded-[32px] border border-[#E8E8ED] bg-white shadow-sm">
        <ProfilePreview profileData={profileData} links={links} />
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
