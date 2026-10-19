import type { ProfileData } from "./types"

type ProfilePreviewProps = {
    profileData: ProfileData
}
const ProfilePreview = ({profileData}: ProfilePreviewProps) => {
  return (
    <div>
        <h1 className="text-2xl font-semibold">Preview Field</h1>
        <h3>{profileData.displayName}</h3>
        <p>{profileData.bio}</p>
    </div>
  )
}

export default ProfilePreview