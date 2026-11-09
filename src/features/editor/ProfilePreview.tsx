
import type { AppearanceData, LinkData, ProfileData } from "./types";

type ProfilePreviewProps = {
  profileData: ProfileData;
  links: LinkData[];
  appearance: AppearanceData;
};

const GRADIENT_DIRECTIONS: Record<
  AppearanceData["gradientDirection"],
  string
> = {
  diagonal: "135deg",
  horizontal: "90deg",
  vertical: "180deg",
};

const ProfilePreview = ({
  profileData,
  links,
  appearance,
}: ProfilePreviewProps) => {
  const backgroundImage =
    appearance.backgroundGradient === "none"
      ? undefined
      : `linear-gradient(
          ${GRADIENT_DIRECTIONS[appearance.gradientDirection]},
          ${appearance.gradientColor1},
          ${appearance.gradientColor2}
        )`;

  return (
    <div
      className="flex min-h-full flex-col items-center px-5 pb-5 pt-10 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pt-12 lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden"
      style={{
        backgroundColor: appearance.backgroundColor,
        backgroundImage,
        color: appearance.textColor,
      }}
    >
      {profileData.avatarUrl ? (
        <img
          src={profileData.avatarUrl}
          alt={`${profileData.displayName || profileData.username}'s profile`}
          className="mb-4 h-24 w-24 rounded-full object-cover"
        />
      ) : (
        <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-black/10 text-3xl font-semibold">
          {(profileData.displayName || profileData.username || "?")
            .charAt(0)
            .toUpperCase()}
        </div>
      )}

      <h1 className="text-center text-xl font-semibold">
        {profileData.displayName || profileData.username || "Your Name"}
      </h1>

      {profileData.bio && (
        <p className="mt-2 max-w-xs text-center text-sm opacity-80">
          {profileData.bio}
        </p>
      )}

      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 items-center justify-center rounded-xl px-4 py-3 text-center text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              backgroundColor: appearance.buttonColor,
              color: appearance.buttonTextColor,
            }}
          >
            {link.title || "Untitled link"}
          </a>
        ))}

        {links.length === 0 && (
          <p className="py-6 text-center text-sm opacity-50">
            Your links will appear here
          </p>
        )}
      </div>

      <div className="mt-auto pt-10 text-xs font-semibold tracking-widest opacity-40">
        LINKSPACE
      </div>
    </div>
  );
};

export default ProfilePreview;
