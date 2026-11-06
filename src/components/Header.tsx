
"use client";

import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/logout/actions";
import {
  Save,
  Send,
  Eye,
  EyeOff,
  UserRound,
  ChevronDown,
  Menu,
  X,
  LogOut,
} from "lucide-react";

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
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isBusy = isSaving || isPublishing;

  // Close the account menu when clicking outside or pressing Escape.
  useEffect(() => {
    const handleOutsideClick = (event: PointerEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const toggleAccountMenu = () => {
    setIsAccountMenuOpen((prev) => !prev);
  };

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-[#E8E8ED] bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[64px] w-full max-w-[1440px] items-center justify-between gap-3 px-3 sm:px-6 lg:px-10">

        {/* Brand */}
        <span className="shrink-0 text-[19px] font-bold tracking-[-0.7px] text-[#1D1D1F] sm:text-[21px]">
          LinkSpace
        </span>

        {/* Header actions */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Save status - desktop */}
          <div className="hidden items-center gap-2 text-[13px] text-[#6E6E73] lg:flex">
            <span
              className={`h-2 w-2 rounded-full ${
                hasUnsavedChanges ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />
            <span>
              {hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}
            </span>
            <span className="mx-1 text-[#D2D2D7]">·</span>
            <span>{isPublished ? "Published" : "Draft"}</span>
          </div>

          {/* Mobile save status indicator */}
          <span
            className={`h-2 w-2 rounded-full sm:mr-1 lg:hidden ${
              hasUnsavedChanges ? "bg-amber-500" : "bg-emerald-500"
            }`}
            title={hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}
            aria-label={
              hasUnsavedChanges ? "Unsaved changes" : "All changes saved"
            }
          />

          {/* Save button */}
          <button
            type="button"
            onClick={onSave}
            disabled={isBusy || !hasUnsavedChanges}
            aria-label={isSaving ? "Saving changes" : "Save changes"}
            title="Save changes"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#E5E5EA] bg-white text-[#1D1D1F] transition hover:bg-[#F5F5F7] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-auto sm:gap-2 sm:px-4"
          >
            <Save size={17} strokeWidth={1.8} />
            <span className="hidden text-sm font-medium sm:inline">
              {isSaving ? "Saving..." : "Save"}
            </span>
          </button>

          {/* Publish / Unpublish button */}
          <button
            type="button"
            onClick={onPublishToggle}
            disabled={isBusy}
            aria-label={isPublished ? "Unpublish page" : "Publish page"}
            title={isPublished ? "Unpublish page" : "Publish page"}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-[#1D1D1F] text-white transition hover:bg-black active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-auto sm:gap-2 sm:px-4"
          >
            {isPublished ? (
              <EyeOff size={17} strokeWidth={1.8} />
            ) : (
              <Send size={17} strokeWidth={1.8} />
            )}

            <span className="hidden text-sm font-medium sm:inline">
              {isPublishing
                ? isPublished
                  ? "Unpublishing..."
                  : "Publishing..."
                : isPublished
                  ? "Unpublish"
                  : "Publish"}
            </span>
          </button>

          {/* Account menu - desktop and mobile */}
          <div className="relative" ref={menuRef}>

            {/* Desktop account button */}
            <button
              type="button"
              onClick={toggleAccountMenu}
              aria-expanded={isAccountMenuOpen}
              aria-haspopup="menu"
              aria-label="Account menu"
              className="hidden h-10 cursor-pointer items-center gap-2 rounded-xl border border-[#E5E5EA] bg-white px-3 text-[#1D1D1F] transition hover:bg-[#F5F5F7] sm:flex"
            >
              <UserRound size={17} strokeWidth={1.8} />
              <span className="text-sm font-medium">Account</span>
              <ChevronDown
                size={15}
                className={`transition-transform ${
                  isAccountMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Mobile hamburger button */}
            <button
              type="button"
              onClick={toggleAccountMenu}
              aria-expanded={isAccountMenuOpen}
              aria-haspopup="menu"
              aria-label={isAccountMenuOpen ? "Close menu" : "Open menu"}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#E5E5EA] bg-white text-[#1D1D1F] transition hover:bg-[#F5F5F7] active:scale-[0.97] sm:hidden"
            >
              {isAccountMenuOpen ? (
                <X size={20} strokeWidth={1.8} />
              ) : (
                <Menu size={20} strokeWidth={1.8} />
              )}
            </button>

            {/* Dropdown menu */}
            {isAccountMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 overflow-hidden rounded-2xl border border-[#E8E8ED] bg-white p-2 shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
              >
                <div className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F1F4]">
                      <UserRound
                        size={17}
                        className="text-[#55555A]"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1D1D1F]">
                        Your account
                      </p>
                      <p className="text-xs text-[#86868B]">
                        Manage your session
                      </p>
                    </div>
                  </div>
                </div>

                <div className="my-1 h-px bg-[#EEEEF1]" />

                <form action={logout}>
                  <button
                    type="submit"
                    role="menuitem"
                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut size={17} strokeWidth={1.8} />
                    Sign out
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action errors */}
      {(saveError || publishError) && (
        <div className="mx-auto w-full max-w-[1440px] space-y-1 px-3 pb-3 sm:px-6 lg:px-10">
          {saveError && (
            <p role="alert" className="text-[13px] text-red-600">
              {saveError}
            </p>
          )}

          {publishError && (
            <p role="alert" className="text-[13px] text-red-600">
              {publishError}
            </p>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
