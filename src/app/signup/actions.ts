"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");

  if (
    typeof emailValue !== "string" ||
    typeof passwordValue !== "string"
  ) {
    redirect("/signup?error=invalid-input");
  }

  const email = emailValue.trim().toLowerCase();
  const password = passwordValue;

  if (!email || password.length < 8) {
    redirect("/signup?error=invalid-input");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/confirm`,
    },
  });

  if (error) {
    console.error("Signup failed:", error.message);
    redirect("/signup?error=signup-failed");
  }

  redirect("/signup/check-email");
}