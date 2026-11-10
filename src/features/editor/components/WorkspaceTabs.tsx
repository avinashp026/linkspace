
"use client";

import { Link2, Palette, UserRound } from "lucide-react";

export type WorkspaceTab = "profile" | "links" | "appearance";

type WorkspaceTabsProps = {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
};

const tabs = [
  {
    id: "profile",
    label: "Profile",
    icon: UserRound,
  },
  {
    id: "links",
    label: "Links",
    icon: Link2,
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
  },
] as const;

export default function WorkspaceTabs({
  activeTab,
  onTabChange,
}: WorkspaceTabsProps) {
  return (
    <div className="sticky top-[69px] z-30 -mx-4 border-b border-border bg-background/95 px-4 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:backdrop-blur-none">
      <div className="flex overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-pressed={isActive}
              className={`relative flex min-h-12 shrink-0 items-center gap-2 px-4 pb-3 text-sm font-medium transition first:pl-1 ${
                isActive
                  ? "text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Icon size={17} strokeWidth={1.8} />
              {tab.label}

              {isActive && (
                <span className="absolute inset-x-0 bottom-[-1px] h-0.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
