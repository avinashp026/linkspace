
"use client";

import type { LinkData, ProfileData } from "./types";
import SortableLink from "./SortableLink";

type ProfilePreviewProps = {
  profileData: ProfileData;
  links: LinkData[];
  onEdit: (link: LinkData) => void;
  deleteLink: (id: string) => void;
};

const ProfilePreview = ({
  profileData,
  links,
  onEdit,
  deleteLink,
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
          {links.map((link, index) => (
            <SortableLink
              key={link.id}
              link={link}
              index={index}
              onEdit={onEdit}
              onDelete={deleteLink}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePreview;
