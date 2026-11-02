import EditorPage from "@/features/editor/EditorPage";
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation";
import page from "../page";

const Page = async () => {
  const supabase = await createClient();

  // 1. Verfiy the authenticated users
  const { data, error } = await supabase.auth.getClaims();

  const userId = data?.claims?.sub;

  if(error || typeof userId !== "string"){
    redirect("/login");
  }

    // 2. Load the user's profile
    const {data: profile, error: profileError} = await supabase.from("profiles").select("username, display_name, bio").eq("id", userId).maybeSingle();

  if(profileError) {
    console.error("Unable to load profile:", profileError.message);
    throw new Error("Unable to load your profile.");
  }

  // 3. Convert database column names to TS property names
  const initialProfile = profile ? {
    username: profile.username,
    displayName: profile.display_name,
    bio: profile.bio ?? "",
  } : {
    username: "",
    displayName: "",
    bio: "",
  };
    
  return <EditorPage initialProfile={initialProfile}/>
}

export default Page