
import { Suspense } from "react";
import { redirect } from "next/navigation";
import AccountSettings from "@/features/account/AccountSettings";
import { createClient } from "@/lib/supabase/server";

async function AccountContent() {
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
    console.error("Unable to load account profile:", profileError.message);
    throw new Error("Unable to load account settings.");
  }

  return (
    <AccountSettings
      email={user.email ?? ""}
      initialUsername={profile?.username ?? ""}
    />
  );
}

function AccountFallback() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl animate-pulse space-y-6">
        <div className="h-8 w-48 rounded-lg bg-muted-background" />
        <div className="h-36 rounded-xl bg-muted-background" />
        <div className="h-44 rounded-xl bg-muted-background" />
        <div className="h-36 rounded-xl bg-muted-background" />
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountFallback />}>
      <AccountContent />
    </Suspense>
  );
}
