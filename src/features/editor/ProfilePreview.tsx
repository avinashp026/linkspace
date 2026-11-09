import type { AppearanceData, LinkData, ProfileData } from "./types";

type ProfilePreviewProps = {
  profileData: ProfileData;
  links: LinkData[];
  appearance: AppearanceData;
};

const ProfilePreview = ({
  profileData,
  links,
  appearance,
}: ProfilePreviewProps) => {
  return (
    <div
      className="flex min-h-full flex-col items-center px-5 pb-5 pt-10 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pt-12 lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden"
      style={{
        backgroundColor: appearance.backgroundColor,
        color: appearance.textColor,
      }}
    >
      <div
        className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full text-[28px] font-semibold"
        style={{
          backgroundColor: appearance.accentColor,
          color: appearance.buttonTextColor,
        }}
      >
        {profileData.avatarUrl ? (
          <img
            src={profileData.avatarUrl}
            alt={`${profileData.displayName || "Profile"} profile picture`}
            className="h-full w-full object-cover"
          />
        ) : profileData.displayName ? (
          profileData.displayName[0].toUpperCase()
        ) : (
          "U"
        )}
      </div>
      <h2 className="mt-3 max-w-full break-words text-center text-xl font-semibold">
        {profileData.displayName || "Your name"}
      </h2>
      {profileData.bio && (
        <p
          className="mt-1 max-w-full whitespace-pre-wrap break-words text-center text-[13px] leading-5"
          style={{ opacity: 0.7 }}
        >
          {profileData.bio}
        </p>
      )}
      <div className="mt-6 flex w-full flex-col gap-2.5">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 w-full items-center justify-center rounded-[14px] px-3 py-2.5 text-center text-[15px] font-medium transition hover:opacity-85 focus-visible:outline-none focus-visible:ring-2"
            style={{
              backgroundColor: appearance.buttonColor,
              color: appearance.buttonTextColor,
              outlineColor: appearance.accentColor,
            }}
          >
            <span className="break-words">{link.title}</span>
          </a>
        ))}
      </div>
      {links.length === 0 && (
        <p className="mt-8 text-center text-[13px]" style={{ opacity: 0.6 }}>
          Your links will appear here.
        </p>
      )}
      <div
        className="mt-auto pt-6 text-[10px] font-medium tracking-widest"
        style={{ opacity: 0.6 }}
      >
        LINKSPACE
      </div>
    </div>
  );
};

export default ProfilePreview;
