"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");

  // Validate that both fields contain strings.
  if (
    typeof emailValue !== "string" ||
    typeof passwordValue !== "string"
  ) {
    redirect("/login?error=invalid-input");
  }

  const email = emailValue.trim().toLowerCase();
  const password = passwordValue;

  // Reject empty values.
  if (!email || !password) {
    redirect("/login?error=invalid-input");
  }

  // Create a Supabase client that works with the user's server-side session.
  const supabase = await createClient();

  // Ask Supabase to verify the email and password.
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // If authentication fails, return the user to the login page.
  if (error) {
    console.error("Login failed:", error.message);
    redirect("/login?error=login-failed");
  }

  // Successful login: send the user to the editor.
  redirect("/editor");
}