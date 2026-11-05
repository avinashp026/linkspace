
import EditorPage from "@/features/editor/EditorPage";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const Page = async () => {
  const supabase = await createClient();

  // 1. Verify the authenticated user.
  const { data, error } = await supabase.auth.getClaims();

  const userId = data?.claims?.sub;

  if (error || typeof userId !== "string") {
    redirect("/login");
  }

  // 2. Load the user's profile.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username, display_name, bio, is_published")
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

  return (
    <EditorPage
      initialProfile={initialProfile}
      initialLinks={initialLinks}
      initialIsPublished={profile?.is_published ?? false}
    />
  );
};

export default Page;
