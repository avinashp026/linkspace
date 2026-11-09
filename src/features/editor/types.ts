export type ProfileData = {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl?: string | null;
};

export type LinkData = {
  id: string;
  title: string;
  url: string;
};

export type ThemeName = "minimal" | "dark" | "soft" | "bold";

export type GradientName =
  | "none"
  | "sunset"
  | "ocean"
  | "lavender"
  | "mint"
  | "peach"
  | "midnight";

export type AppearanceData = {
  theme: ThemeName;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  accentColor: string;
  backgroundGradient: GradientName;
};

export const DEFAULT_APPEARANCE: AppearanceData = {
  theme: "minimal",
  backgroundColor: "#FFFFFF",
  textColor: "#1D1D1F",
  buttonColor: "#1D1D1D",
  buttonTextColor: "#FFFFFF",
  accentColor: "#0071E3",
  backgroundGradient: "none",
};
