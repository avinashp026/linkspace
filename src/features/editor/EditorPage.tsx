"use client";

import { useState } from "react";
import ProfileForm from "./ProfileForm";
import ProfilePreview from "./ProfilePreview";
import type { ProfileData } from "./types";
import Container from "@/components/Container";
import Header from "@/components/Header";

const EditorPage = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: "Sam",
    bio: "Hey, I am a frontend developer",
  });

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

  console.log(profileData);
  return (
    <>
      <Header/>
    <Container>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="">
        <ProfileForm profileData={profileData} handleChange={handleChange} />
      </div>

      <div className="">
        <ProfilePreview profileData={profileData} />
      </div>
    </div>
    </Container>
    </>
  );
};

export default EditorPage;
