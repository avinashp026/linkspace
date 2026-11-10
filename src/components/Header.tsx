
"use client";

import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/logout/actions";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  Save,
  Send,
  EyeOff,
  UserRound,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Settings,
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
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const isBusy = isSaving || isPublishing;

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

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
    } catch (error) {
      console.error("Unable to sign out:", error);
      setIsLoggingOut(false);
    }
  };

  const openLogoutDialog = () => {
    setIsAccountMenuOpen(false);
    setIsLogoutDialogOpen(true);
  };

  const closeLogoutDialog = () => {
    if (isLoggingOut) return;
    setIsLogoutDialogOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 shrink-0 border-b border-border bg-card/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 w-full max-w-[1440px] items-center justify-between gap-3 px-3 sm:px-6 lg:px-10">
          <span className="shrink-0 text-xl font-bold tracking-tight text-foreground">
            LinkSpace
          </span>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 text-[13px] text-muted lg:flex">
              <span
                className={`h-2 w-2 rounded-full ${
                  hasUnsavedChanges ? "bg-warning" : "bg-success"
                }`}
              />
              <span>
                {hasUnsavedChanges
                  ? "Unsaved changes"
                  : "All changes saved"}
              </span>
              <span className="mx-1">·</span>
              <span>{isPublished ? "Published" : "Draft"}</span>
            </div>

            <span
              className={`h-2 w-2 rounded-full sm:mr-1 lg:hidden ${
                hasUnsavedChanges ? "bg-warning" : "bg-success"
              }`}
              title={
                hasUnsavedChanges
                  ? "Unsaved changes"
                  : "All changes saved"
              }
              aria-label={
                hasUnsavedChanges
                  ? "Unsaved changes"
                  : "All changes saved"
              }
            />

            <button
              type="button"
              onClick={onSave}
              disabled={isBusy || !hasUnsavedChanges}
              aria-label={isSaving ? "Saving changes" : "Save changes"}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition hover:bg-muted-background disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:gap-2 sm:px-4"
            >
              <Save size={17} strokeWidth={1.8} />
              <span className="hidden text-sm font-medium sm:inline">
                {isSaving ? "Saving..." : "Save"}
              </span>
            </button>

            <button
              type="button"
              onClick={onPublishToggle}
              disabled={isBusy}
              aria-label={isPublished ? "Unpublish page" : "Publish page"}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:gap-2 sm:px-4"
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

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={toggleAccountMenu}
                aria-expanded={isAccountMenuOpen}
                aria-haspopup="menu"
                aria-label="Account menu"
                className="hidden h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-foreground transition hover:bg-muted-background sm:flex"
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

              <button
                type="button"
                onClick={toggleAccountMenu}
                aria-expanded={isAccountMenuOpen}
                aria-haspopup="menu"
                aria-label={isAccountMenuOpen ? "Close menu" : "Open menu"}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition hover:bg-muted-background sm:hidden"
              >
                {isAccountMenuOpen ? (
                  <X size={20} strokeWidth={1.8} />
                ) : (
                  <Menu size={20} strokeWidth={1.8} />
                )}
              </button>

              {isAccountMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-xl"
                >
                  <div className="flex items-center gap-3 px-3 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted-background">
                      <UserRound size={17} className="text-muted" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Your account
                      </p>
                      <p className="text-xs text-muted">
                        Manage your account
                      </p>
                    </div>
                  </div>

                  <div className="my-1 h-px bg-border" />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      window.location.href = "/account";
                    }}
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground transition hover:bg-muted-background"
                  >
                    <Settings size={17} />
                    Account settings
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={openLogoutDialog}
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-danger transition hover:bg-danger-bg"
                  >
                    <LogOut size={17} strokeWidth={1.8} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {(saveError || publishError) && (
          <div className="mx-auto w-full max-w-[1440px] space-y-1 px-3 pb-3 sm:px-6 lg:px-10">
            {saveError && (
              <p role="alert" className="text-[13px] text-danger">
                {saveError}
              </p>
            )}

            {publishError && (
              <p role="alert" className="text-[13px] text-danger">
                {publishError}
              </p>
            )}
          </div>
        )}
      </header>

      <ConfirmDialog
        isOpen={isLogoutDialogOpen}
        title="Sign out of LinkSpace?"
        description="Are you sure you want to sign out of your account? You will need to log in again to access your editor."
        confirmText="Sign out"
        cancelText="Stay logged in"
        variant="danger"
        isLoading={isLoggingOut}
        onConfirm={handleLogout}
        onCancel={closeLogoutDialog}
      />
    </>
  );
};

export default Header;
