import EditorPage from "@/features/editor/EditorPage"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation";

const Page = async () => {
  const supabase = await createClient();

  const {data, error} = await supabase.auth.getClaims();

  if(error || !data?.claims?.sub){
    redirect("/login");
  }



  return (
    <EditorPage/>
  )
}

export default Page