
import { logout } from "@/app/logout/actions";

type HeaderProps = {
  isPublished: boolean;
  isPublishing: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  saveError: string;
  publishError: string;
  onSave: () => void;
  onPublishToggle: () => void;
};

const Header = ({
  isPublished,
  isPublishing,
  isSaving,
  hasUnsavedChanges,
  saveError,
  publishError,
  onSave,
  onPublishToggle,
}: HeaderProps) => {
  const isBusy = isSaving || isPublishing;

  return (
    <header className="sticky top-0 z-30 border-b border-[#E8E8ED] bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex min-h-14 max-w-[1120px] items-center justify-between gap-3 px-4 sm:min-h-16 sm:px-8">
        <span className="shrink-0 text-[19px] font-semibold tracking-tight text-[#1D1D1F]">
          LinkSpace
        </span>

        <div className="flex items-center gap-2 sm:gap-5">
          <div className="hidden text-[13px] text-[#6E6E73] sm:block">
            <span>{isPublished ? "Published" : "Draft"}</span>
            <span className="mx-2">·</span>
            <span>
              {hasUnsavedChanges ? "Unsaved changes" : "Saved"}
            </span>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="h-10 cursor-pointer rounded-full border border-[#E8E8ED] px-3 text-sm font-medium text-[#1D1D1F] transition hover:bg-[#F5F5F7] active:scale-[0.98] sm:px-4"
            >
              Sign out
            </button>
          </form>

          <button
            type="button"
            onClick={onSave}
            disabled={isBusy || !hasUnsavedChanges}
            className="h-10 cursor-pointer rounded-full border border-[#E8E8ED] px-4 text-sm font-medium text-[#1D1D1F] transition hover:bg-[#F5F5F7] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:px-5 sm:text-[15px]"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            onClick={onPublishToggle}
            disabled={isBusy}
            className="h-10 cursor-pointer rounded-full bg-[#1D1D1F] px-4 text-sm font-medium text-white transition hover:bg-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:px-5 sm:text-[15px]"
          >
            {isPublishing
              ? isPublished
                ? "Unpublishing..."
                : "Publishing..."
              : isPublished
                ? "Unpublish"
                : "Publish"}
          </button>
        </div>
      </div>

      {(saveError || publishError) && (
        <div className="mx-auto max-w-[1120px] px-4 pb-3 sm:px-8">
          {saveError && (
            <p className="text-sm text-red-600">{saveError}</p>
          )}
          {publishError && (
            <p className="text-sm text-red-600">{publishError}</p>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
