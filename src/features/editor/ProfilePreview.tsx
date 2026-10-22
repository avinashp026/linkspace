import type { LinkData, ProfileData } from "./types";

type ProfilePreviewProps = {
  profileData: ProfileData;
  links: LinkData[];
};
const ProfilePreview = ({ profileData, links }: ProfilePreviewProps) => {
  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold">Live Preview</h3>
      <div className="flex flex-col items-center mt-2 border border-slate-400 rounded-xl p-4">
        <div className="h-12 w-12 bg-slate-400 flex items-center justify-center rounded-full">
            <div>{profileData.displayName ? profileData.displayName[0] : "U"}</div>
        </div>
      <h3 className="font-semibold text-lg mt-1">{profileData.displayName}</h3>
      <p className="text-slate-700 text-sm">{profileData.bio}</p>

      <div className="w-full flex mt-2 gap-1">
        {links.map(link => (
          <a href={link.url} target="_blank" key={link.id} className="border border-slate-800 rounded-sm px-1 py-0.5 text-sm">{link.title}</a>
        ))}
      </div>
      </div>
    </div>
  );
};

export default ProfilePreview;
