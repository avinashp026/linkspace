"use client";

import { useState } from "react";
import ProfileForm from "./ProfileForm";
import ProfilePreview from "./ProfilePreview";
import type { LinkData, ProfileData } from "./types";
import Container from "@/components/Container";
import Header from "@/components/Header";

const EditorPage = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: "Sam",
    bio: "Hey, I am a frontend developer",
  });
  const [links, setLinks] = useState<LinkData[]>([
    {
      id: "1", title: "Github", url: "https://github.com"
    },
    {
      id: "2", title: "Portfolio", url: "https://example.com",
    }
  ])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  // Create a new link
  const addLink = (title: string, url: string) => {
   const trimmedTitle = title.trim();
   const trimmedUrl = url.trim();

   if(!trimmedTitle || !trimmedUrl){
    return {
      success: false,
      error: "Please enter both a title and a URL"
    };
   }

   let parsedUrl: URL;

   try {
    parsedUrl = new URL(trimmedUrl);
   }catch {
    return {
      success: false,
      error: "Enter a valid URL, including https://."
    };
   }

   if(!['http:', "https:"].includes(parsedUrl.protocol)){
    return {
      success: false,
      error: "Onlu HTTP and HTTPS links are allowed.",
    };
   }
   

  const newLink: LinkData = {
    id: crypto.randomUUID(),
    title: trimmedTitle,
    url: parsedUrl.href
  }

    setLinks((prev) => [...prev, newLink])

    return {success: true, error: ""};
  }

  console.log(profileData);
  return (
    <>
      <Header/>
    <Container>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="">
        <ProfileForm profileData={profileData} handleChange={handleChange} addLink={addLink}/>
      </div>

      <div className="">
        <ProfilePreview profileData={profileData} links={links} />
      </div>
    </div>
    </Container>
    </>
  );
};

export default EditorPage;
