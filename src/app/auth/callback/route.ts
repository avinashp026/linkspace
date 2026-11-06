import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    if(!code) {
        return NextResponse.redirect(
            new URL("/login?error=oauth-callback-failed", request.url)
        )
    }

    const supabase = await createClient();

    const {error} = await supabase.auth.exchangeCodeForSession(code);

    if(error) {
        console.error("Google sign-in failed", error.message);

        return NextResponse.redirect(
            new URL("/login?error=oauth-callback-failed", request.url)
        )
    }

    return NextResponse.redirect(new URL("/editor", request.url))


}