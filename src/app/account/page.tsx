
import { redirect } from "next/navigation";
import AccountSettings from "@/features/account/AccountSettings";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Unable to load account settings:", profileError.message);
    throw new Error("Unable to load your account settings.");
  }

  return (
    <AccountSettings
      email={user.email ?? ""}
      initialUsername={profile?.username ?? ""}
    />
  );
}
