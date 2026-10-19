"use client"

import { useState } from "react";
import ProfileForm from "./ProfileForm";
import ProfilePreview from "./ProfilePreview";
import type { ProfileData } from "./types";



const EditorPage = () => {

    const [profileData, setProfileData] = useState<ProfileData>({
         displayName: "Sam",
        bio: "Hey, I am a frontend developer"
    })
    

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target
        setProfileData((prev) => {
           return {
            ...prev, [name]: value
        }})
    }
    
    console.log(profileData);
  return (
    <div className="flex gap-4 p-4">
        <div className="border border-slate-400">
        <ProfileForm profileData={profileData} handleChange={handleChange}/>
        </div>

        <div className="border border-rose-400">
        <ProfilePreview profileData={profileData}/>
        </div>
    </div>
  )
}

export default EditorPage