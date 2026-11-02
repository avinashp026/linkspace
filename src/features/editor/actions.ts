"use server"

import { createClient } from "@/lib/supabase/server";
import { validateUsername } from "@/utils/validation";

export const saveProfile = async (profileData: {
    username: string;
    displayName: string;
    bio: string;
}) => {
    // 1. Validate the input on the server

    const username = profileData.username.trim();
    const displayName = profileData.displayName.trim();
    const bio = profileData.bio.trim();

    const usernameError = validateUsername(username);

    if(usernameError){
        return {
            success: false,
            error: usernameError
        }
    }


    if(!displayName){
        return {
            success: false,
            error: "Displat name is required"
        }
    }

    // 2. Create an authenticated supabase client.
    const supabase = await createClient();

    // 3. Verify the signed-in user
    const {
        data: {user},
        error: authError,
    } = await supabase.auth.getUser();

    if(authError || !user){
        return {
            success: false,
            error: "You must be signed in to save your profile",
        }
    }

    // 4. Create or update the user's profile
    const {error} = await supabase.from("profiles").upsert({
        id: user.id,
        username,
        display_name: displayName,
        bio,
        updated_at: new Date().toISOString(),
    },
    {
        onConflict: "id"
    }
)

if(error) {
    console.error("Profile save failed:", error);

    if(error.code === "23505"){
        return {
            success: false,
            error: "This username is already taken. Please choose another."
        };
    }

    return {
        success: false,
        error: "Unable to save your profile. Please try again.",
    }
}

return {
    success: true,
    error: "",
};
}