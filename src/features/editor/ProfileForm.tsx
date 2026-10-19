import type { ProfileData } from "./types";

type ProfileFormProps = {
  profileData: ProfileData
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ProfileForm = ({profileData, handleChange}: ProfileFormProps) => {
  return (
    <div>
      <form action="">
            <input name="displayName" type="text" value={profileData.displayName} onChange={handleChange}/>
            <textarea name="bio" id="" value={profileData.bio} onChange={handleChange}></textarea>
        </form>
    </div>
  )
}

export default ProfileForm