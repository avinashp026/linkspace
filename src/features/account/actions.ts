
"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { validateUsername } from "@/utils/validation";

type ActionResult = {
  success: boolean;
  error: string;
};

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secretKey) {
    throw new Error("Supabase server configuration is missing.");
  }

  return createSupabaseClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export async function updateUsername(
  username: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Please log in again." };
  }

  const normalizedUsername = username.trim();
  const validationError = validateUsername(normalizedUsername);

  if (validationError) {
    return { success: false, error: validationError };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ username: normalizedUsername })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "That username is already taken." };
    }

    console.error("Username update failed:", error.message);
    return { success: false, error: "Unable to update your username." };
  }

  return { success: true, error: "" };
}

export async function updatePassword(
  password: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Please log in again." };
  }

  if (password.length < 8) {
    return {
      success: false,
      error: "Password must be at least 8 characters.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error("Password update failed:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, error: "" };
}

export async function deleteAccount(): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Please log in again." };
  }

  try {
    const admin = createAdminClient();

    const { error: deleteError } =
      await admin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error("Account deletion failed:", deleteError.message);
      return {
        success: false,
        error: "Unable to delete your account. Please try again.",
      };
    }

    await supabase.auth.signOut();

    return { success: true, error: "" };
  } catch (error) {
    console.error("Account deletion failed:", error);

    return {
      success: false,
      error: "Unable to delete your account. Please try again.",
    };
  }
}
