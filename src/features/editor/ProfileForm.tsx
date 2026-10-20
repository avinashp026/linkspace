import type { ProfileData } from "./types";

type ProfileFormProps = {
  profileData: ProfileData;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
};

const ProfileForm = ({ profileData, handleChange }: ProfileFormProps) => {
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
            type="text"
            value={profileData.displayName}
            onChange={handleChange}
            className="border border-slate-600 rounded-md px-2 py-1 mt-1"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="displayName" className="text-sm text-slate-700">
            Bio
          </label>
          <textarea
            name="bio"
            id=""
            value={profileData.bio}
            onChange={handleChange}
            className="border border-slate-600 rounded-md px-2 py-1 mt-1 resize-none"
          ></textarea>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
