
import type { LinkData, ProfileData } from "./types";

type ProfilePreviewProps = {
  profileData: ProfileData;
  links: LinkData[];
  onEdit: (link: LinkData) => void;
};

const ProfilePreview = ({
  profileData,
  links,
  onEdit,
}: ProfilePreviewProps) => {
  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold">Live Preview</h3>

      <div className="flex flex-col items-center mt-2 border border-slate-400 rounded-xl p-4">
        <div className="h-12 w-12 bg-slate-400 flex items-center justify-center rounded-full">
          <div>
            {profileData.displayName
              ? profileData.displayName[0].toUpperCase()
              : "U"}
          </div>
        </div>

        <h3 className="font-semibold text-lg mt-1">
          {profileData.displayName}
        </h3>

        <p className="text-slate-700 text-sm">
          {profileData.bio}
        </p>

        <div className="w-full flex flex-col mt-2 gap-2">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between gap-3 border rounded-md p-3"
            >
              <div className="flex flex-col min-w-0">
                <p className="text-sm text-slate-800 font-medium">
                  {link.title}
                </p>

                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-sm text-slate-700 break-all"
                >
                  {link.url}
                </a>
              </div>

              <button
                type="button"
                onClick={() => onEdit(link)}
                className="border rounded-md px-3 py-1"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePreview;
