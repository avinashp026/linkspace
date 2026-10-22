import { useState } from "react";
import type { ProfileData } from "./types";

type AddLinkResult = {
  success: boolean;
  error: string;
}

type ProfileFormProps = {
  profileData: ProfileData;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  addLink: (title: string, url: string) => AddLinkResult;
};

const ProfileForm = ({
  profileData,
  handleChange,
  addLink,
}: ProfileFormProps) => {
  const [linkError, setLinkError] = useState("");
  const [linkInfo, setLinkInfo] = useState({
    title: "",
    url: "",
  });
  const handleLinkInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLinkInfo((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleAddLink = () => {
    const result = addLink(linkInfo.title, linkInfo.url);

    if(!result.success){
      setLinkError(result.error);
      return
    }

    setLinkInfo({title: "", url: ""});
    setLinkError("");
  }
  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold">Your Profile</h3>
      <form action="" className="mt-2 flex flex-col gap-4">
        <div className="flex flex-col">
          <label htmlFor="displayName" className="text-sm text-slate-700">
            Display Name
          </label>
          <input
            name="displayName"
            id="displayName"
            type="text"
            value={profileData.displayName}
            onChange={handleChange}
            className="border border-slate-600 rounded-md px-2 py-1 mt-1"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="bio" className="text-sm text-slate-700">
            Bio
          </label>
          <textarea
            name="bio"
            id="bio"
            value={profileData.bio}
            onChange={handleChange}
            className="border border-slate-600 rounded-md px-2 py-1 mt-1 resize-none"
          ></textarea>
        </div>

        <div>
          <p className="text-sm text-slate-700">Add a link</p>
          <input
            type="text"
            name="title"
            value={linkInfo.title}
            onChange={handleLinkInfoChange}
            placeholder="Title"
            className="border border-slate-600 rounded-md px-2 py-1 mt-1 w-full"
          />
          <input
            type="text"
            name="url"
            value={linkInfo.url}
            onChange={handleLinkInfoChange}
            placeholder="Link"
            className="border border-slate-600 rounded-md px-2 py-1 mt-1 w-full"
          />
          {
            linkError && (
              <p className="mt-2 text-sm text-red-600" role="alert">{linkError}</p>
            )
          }
          <button
            type="button"
            onClick={handleAddLink}
            className="border rounded-md px-2 py-1 bg-blue-400"
          >
            Add link
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
