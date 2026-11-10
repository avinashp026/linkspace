
"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import type {
  AppearanceData,
  GradientName,
  ThemeName,
} from "../types";

type AppearanceEditorProps = {
  appearance: AppearanceData;
  setAppearance: Dispatch<SetStateAction<AppearanceData>>;
};

const THEME_PRESETS: Record<ThemeName, AppearanceData> = {
  minimal: {
    theme: "minimal",
    backgroundColor: "#FFFFFF",
    textColor: "#1D1D1F",
    buttonColor: "#1D1D1F",
    buttonTextColor: "#FFFFFF",
    accentColor: "#0071E3",
    backgroundGradient: "none",
    gradientColor1: "#FFFFFF",
    gradientColor2: "#FFFFFF",
    gradientDirection: "diagonal",
  },
  dark: {
    theme: "dark",
    backgroundColor: "#111827",
    textColor: "#F9FAFB",
    buttonColor: "#374151",
    buttonTextColor: "#FFFFFF",
    accentColor: "#A78BFA",
    backgroundGradient: "none",
    gradientColor1: "#FFFFFF",
    gradientColor2: "#FFFFFF",
    gradientDirection: "diagonal",
  },
  soft: {
    theme: "soft",
    backgroundColor: "#FFF7ED",
    textColor: "#44403C",
    buttonColor: "#FED7AA",
    buttonTextColor: "#7C2D12",
    accentColor: "#F97316",
    backgroundGradient: "none",
    gradientColor1: "#FFFFFF",
    gradientColor2: "#FFFFFF",
    gradientDirection: "diagonal",
  },
  bold: {
    theme: "bold",
    backgroundColor: "#FDF2F8",
    textColor: "#831843",
    buttonColor: "#BE185D",
    buttonTextColor: "#FFFFFF",
    accentColor: "#7C3AED",
    backgroundGradient: "none",
    gradientColor1: "#FFFFFF",
    gradientColor2: "#FFFFFF",
    gradientDirection: "diagonal",
  },
};

const COLOR_CONTROLS: {
  key: keyof Omit<
    AppearanceData,
    | "theme"
    | "backgroundGradient"
    | "gradientColor1"
    | "gradientColor2"
    | "gradientDirection"
  >;
  label: string;
  description: string;
}[] = [
  {
    key: "backgroundColor",
    label: "Page background",
    description: "The main background behind your profile.",
  },
  {
    key: "textColor",
    label: "Text",
    description: "Your name and profile description.",
  },
  {
    key: "buttonColor",
    label: "Button",
    description: "The background of your profile links.",
  },
  {
    key: "buttonTextColor",
    label: "Button text",
    description: "The text shown inside your link buttons.",
  },
  {
    key: "accentColor",
    label: "Accent",
    description: "Your profile avatar and focus accents.",
  },
];

const GRADIENT_PRESETS: {
  name: string;
  value: GradientName;
  css: string;
  color1: string;
  color2: string;
}[] = [
  {
    name: "Solid color",
    value: "none",
    css: "linear-gradient(135deg, #FFFFFF, #FFFFFF)",
    color1: "#FFFFFF",
    color2: "#FFFFFF",
  },
  {
    name: "Sunset",
    value: "sunset",
    css: "linear-gradient(135deg, #ff9a9e, #fad0c4)",
    color1: "#FF9A9E",
    color2: "#FAD0C4",
  },
  {
    name: "Ocean",
    value: "ocean",
    css: "linear-gradient(135deg, #2193b0, #6dd5ed)",
    color1: "#2193B0",
    color2: "#6DD5ED",
  },
  {
    name: "Lavender",
    value: "lavender",
    css: "linear-gradient(135deg, #c471f5, #fa71cd)",
    color1: "#C471F5",
    color2: "#FA71CD",
  },
  {
    name: "Mint",
    value: "mint",
    css: "linear-gradient(135deg, #11998e, #a8e6cf)",
    color1: "#11998E",
    color2: "#A8E6CF",
  },
  {
    name: "Peach",
    value: "peach",
    css: "linear-gradient(135deg, #ffb88c, #de6262)",
    color1: "#FFB88C",
    color2: "#DE6262",
  },
  {
    name: "Midnight",
    value: "midnight",
    css: "linear-gradient(135deg, #232526, #414345)",
    color1: "#232526",
    color2: "#414345",
  },
];

export default function AppearanceEditor({
  appearance,
  setAppearance,
}: AppearanceEditorProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

function handleResetColors() {
  setAppearance({ ...THEME_PRESETS[appearance.theme] });
  setShowResetConfirm(false);
}
  return (
    <div className="pb-10">
      <div className="mb-7">
        <h2 className="text-xl font-semibold tracking-tight">
          Make it yours
        </h2>
        <p className="mt-1 max-w-[480px] text-sm leading-6 text-muted">
          Choose a starting theme, then fine-tune the colors. Your preview
          updates as you make changes.
        </p>
      </div>

      <section className="mb-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold">Choose a theme</h3>
          <p className="mt-1 text-[13px] text-muted">
            Selecting a theme applies its color palette. You can customize
            every color below.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              { name: "Minimal", value: "minimal" },
              { name: "Dark", value: "dark" },
              { name: "Soft", value: "soft" },
              { name: "Bold", value: "bold" },
            ] as const
          ).map((theme) => {
            const preset = THEME_PRESETS[theme.value];
            const isSelected = appearance.theme === theme.value;

            return (
              <button
                key={theme.value}
                type="button"
                onClick={() => setAppearance({ ...preset })}
                aria-pressed={isSelected}
                className={`rounded-xl p-2 text-left transition ${
                  isSelected
                    ? "ring-2 ring-primary ring-offset-2"
                    : "border border-border hover:border-gray-400"
                }`}
              >
                <div
                  className="flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-lg border border-black/5 p-3"
                  style={{ backgroundColor: preset.backgroundColor }}
                >
                  <div
                    className="h-8 w-8 rounded-full"
                    style={{ backgroundColor: preset.accentColor }}
                  />
                  <div
                    className="h-3 w-full rounded-full"
                    style={{ backgroundColor: preset.buttonColor }}
                  />
                  <div
                    className="h-3 w-full rounded-full"
                    style={{ backgroundColor: preset.buttonColor }}
                  />
                  <div
                    className="h-3 w-3/4 rounded-full"
                    style={{ backgroundColor: preset.buttonColor }}
                  />
                </div>

                <div className="flex items-center justify-between px-1 pt-2">
                  <span className="text-[13px] font-medium">
                    {theme.name}
                  </span>
                  {isSelected && (
                    <span className="text-[11px] font-medium text-primary">
                      Selected
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold">Background gradients</h3>
          <p className="mt-1 text-[13px] text-muted">
            Choose a gradient for your profile background, or return to your
            solid background color.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {GRADIENT_PRESETS.map((gradient) => {
            const selected =
              appearance.backgroundGradient === gradient.value;

            return (
              <button
                key={gradient.value}
                type="button"
                onClick={() =>
                  setAppearance((current) => ({
                    ...current,
                    backgroundGradient: gradient.value,
                    gradientColor1: gradient.color1,
                    gradientColor2: gradient.color2,
                    gradientDirection: "diagonal",
                  }))
                }
                aria-pressed={selected}
                className={`overflow-hidden rounded-xl text-left transition ${
                  selected
                    ? "ring-2 ring-primary ring-offset-2"
                    : "border border-border hover:border-gray-400"
                }`}
              >
                <span
                  className="block h-16 w-full"
                  style={{
                    background:
                      gradient.value === "none"
                        ? appearance.backgroundColor
                        : gradient.css,
                  }}
                />
                <span className="flex items-center justify-between px-3 py-2 text-[13px] font-medium">
                  {gradient.name}
                  {selected && (
                    <span className="text-primary">Selected</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-5">
          <h3 className="text-base font-semibold">Customize colors</h3>
          <p className="mt-1 text-[13px] text-muted">
            Use the color picker or enter a hex color value.
          </p>
        </div>

        <div className="mb-6 rounded-xl bg-muted-background p-4">
          <h4 className="mb-3 text-sm font-semibold">Custom gradient</h4>

          <div className="space-y-4">
            {(
              [
                { key: "gradientColor1", label: "First color" },
                { key: "gradientColor2", label: "Second color" },
              ] as const
            ).map((color) => (
              <div
                key={color.key}
                className="flex items-center justify-between gap-4"
              >
                <label
                  htmlFor={color.key}
                  className="text-[13px] font-medium"
                >
                  {color.label}
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">
                    {appearance[color.key].toUpperCase()}
                  </span>
                  <input
                    id={color.key}
                    type="color"
                    value={appearance[color.key]}
                    onChange={(event) =>
                      setAppearance((current) => ({
                        ...current,
                        [color.key]: event.target.value.toUpperCase(),
                      }))
                    }
                    className="h-10 w-11 cursor-pointer rounded-lg border border-input bg-card p-1"
                  />
                </div>
              </div>
            ))}

            <div>
              <label
                htmlFor="gradient-direction"
                className="mb-2 block text-[13px] font-medium"
              >
                Gradient direction
              </label>

              <select
                id="gradient-direction"
                value={appearance.gradientDirection}
                onChange={(event) =>
                  setAppearance((current) => ({
                    ...current,
                    gradientDirection: event.target.value as
                      | "diagonal"
                      | "horizontal"
                      | "vertical",
                  }))
                }
                className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
              >
                <option value="diagonal">Diagonal</option>
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {COLOR_CONTROLS.map((control) => (
            <div
              key={control.key}
              className="flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <label
                  htmlFor={`appearance-${control.key}`}
                  className="text-sm font-medium"
                >
                  {control.label}
                </label>
                <p className="mt-1 text-xs leading-5 text-muted">
                  {control.description}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden text-xs tabular-nums text-muted sm:inline">
                  {appearance[control.key].toUpperCase()}
                </span>
                <input
                  id={`appearance-${control.key}`}
                  type="color"
                  value={appearance[control.key]}
                  onChange={(event) =>
                    setAppearance((current) => ({
                      ...current,
                      [control.key]: event.target.value.toUpperCase(),
                    }))
                  }
                  aria-label={`${control.label} color`}
                  className="h-10 w-11 cursor-pointer rounded-lg border border-input bg-card p-1"
                />
              </div>
            </div>
          ))}
        </div>

        <button
  type="button"
  onClick={() => setShowResetConfirm(true)}
  className="mt-6 border-t border-border pt-4 text-[13px] font-medium text-primary transition hover:text-primary-700"
>
  Reset colors to this theme
</button>

<ConfirmDialog
  isOpen={showResetConfirm}
  title="Reset theme colors?"
  description="This will restore the default colors for your currently selected theme. Your other appearance settings will remain unchanged."
  confirmText="Reset colors"
  cancelText="Keep current colors"
  onConfirm={handleResetColors}
  onCancel={() => setShowResetConfirm(false)}
/>
      </section>
    </div>
  );
}
