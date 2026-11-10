
"use client";

export type MobileView = "edit" | "preview";

type MobileViewSwitcherProps = {
  activeView: MobileView;
  onViewChange: (view: MobileView) => void;
};

export default function MobileViewSwitcher({
  activeView,
  onViewChange,
}: MobileViewSwitcherProps) {
  return (
    <div className="sticky top-0 z-40 -mx-4 mb-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:hidden">
      <div className="grid h-11 grid-cols-2 rounded-xl bg-muted-background p-1">
        {(["edit", "preview"] as const).map((view) => (
          <button
            key={view}
            type="button"
            onClick={() => onViewChange(view)}
            aria-pressed={activeView === view}
            className={`min-h-9 rounded-lg text-sm font-medium capitalize transition ${
              activeView === view
                ? "bg-card text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {view}
          </button>
        ))}
      </div>
    </div>
  );
}
