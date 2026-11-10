
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Mail, Trash2, UserRound } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  updateUsername,
  updatePassword,
  deleteAccount,
} from "./actions";

type AccountSettingsProps = {
  email: string;
  initialUsername: string;
};

export default function AccountSettings({
  email,
  initialUsername,
}: AccountSettingsProps) {
  const router = useRouter();

  const [username, setUsername] = useState(initialUsername);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [usernameError, setUsernameError] = useState("");
  const [usernameSuccess, setUsernameSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  async function handleUsernameSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setUsernameError("");
    setUsernameSuccess("");
    setIsSavingUsername(true);

    try {
      const result = await updateUsername(username);

      if (!result.success) {
        setUsernameError(result.error);
        return;
      }

      setUsernameSuccess("Username updated successfully.");
      setUsername(username.trim());
      router.refresh();
    } catch {
      setUsernameError("Something went wrong. Please try again.");
    } finally {
      setIsSavingUsername(false);
    }
  }

  async function handlePasswordSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    setIsSavingPassword(true);

    try {
      const result = await updatePassword(newPassword);

      if (!result.success) {
        setPasswordError(result.error);
        return;
      }

      setPasswordSuccess("Password changed successfully.");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError("Something went wrong. Please try again.");
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    setDeleteError("");

    try {
      const result = await deleteAccount();

      if (!result.success) {
        setDeleteError(result.error);
        setIsDeleting(false);
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch {
      setDeleteError("Unable to delete your account. Please try again.");
      setIsDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <button
          type="button"
          onClick={() => router.push("/editor")}
          className="mb-8 inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-medium text-muted transition hover:text-foreground"
        >
          <ArrowLeft size={17} />
          Back to editor
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Account settings
          </h1>
          <p className="mt-2 text-sm text-muted">
            Manage your account information and security.
          </p>
        </div>

        {/* Account information */}
        <section className="mb-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted-background">
              <UserRound size={19} />
            </div>
            <div>
              <h2 className="font-semibold">Account information</h2>
              <p className="text-xs text-muted">
                Your account details
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="account-email"
              className="mb-2 block text-sm font-medium"
            >
              Email address
            </label>
            <div className="relative">
              <Mail
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                id="account-email"
                type="email"
                value={email}
                readOnly
                className="h-11 w-full rounded-xl border border-input bg-muted-background pl-10 pr-3 text-sm text-muted outline-none"
              />
            </div>
            <p className="mt-2 text-xs text-muted">
              Your email address is managed by your authentication provider.
            </p>
          </div>
        </section>

        {/* Username */}
        <section className="mb-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="font-semibold">Username</h2>
            <p className="mt-1 text-sm text-muted">
              Your username determines your public LinkSpace URL.
            </p>
          </div>

          <form onSubmit={handleUsernameSubmit}>
            <label
              htmlFor="account-username"
              className="mb-2 block text-sm font-medium"
            >
              Username
            </label>

            <div className="flex min-w-0 items-center rounded-xl border border-input bg-card focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20">
              <span className="shrink-0 pl-3 text-sm text-muted">
                linkspace.com/
              </span>
              <input
                id="account-username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                minLength={3}
                maxLength={30}
                autoComplete="username"
                spellCheck={false}
                required
                className="h-11 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
              />
            </div>

            {usernameError && (
              <p role="alert" className="mt-2 text-sm text-danger">
                {usernameError}
              </p>
            )}

            {usernameSuccess && (
              <p role="status" className="mt-2 text-sm text-success">
                {usernameSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={
                isSavingUsername ||
                username.trim() === initialUsername
              }
              className="mt-4 min-h-11 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSavingUsername ? "Saving..." : "Save username"}
            </button>
          </form>
        </section>

        {/* Password */}
        <section className="mb-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted-background">
              <Lock size={19} />
            </div>
            <div>
              <h2 className="font-semibold">Change password</h2>
              <p className="text-xs text-muted">
                Choose a strong password for your account.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="new-password"
                className="mb-2 block text-sm font-medium"
              >
                New password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                placeholder="At least 8 characters"
                className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-medium"
              >
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                placeholder="Enter your password again"
                className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
              />
            </div>

            {passwordError && (
              <p role="alert" className="text-sm text-danger">
                {passwordError}
              </p>
            )}

            {passwordSuccess && (
              <p role="status" className="text-sm text-success">
                {passwordSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={isSavingPassword || !newPassword || !confirmPassword}
              className="min-h-11 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSavingPassword ? "Updating..." : "Update password"}
            </button>
          </form>
        </section>

        {/* Delete account */}
        <section className="rounded-2xl border border-danger/30 bg-card p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger-bg text-danger">
              <Trash2 size={19} />
            </div>
            <div>
              <h2 className="font-semibold text-danger">
                Delete account
              </h2>
              <p className="text-xs text-muted">
                Permanently remove your LinkSpace account.
              </p>
            </div>
          </div>

          <p className="mb-5 text-sm leading-6 text-muted">
            Deleting your account permanently removes your profile and all
            your links. This action cannot be undone.
          </p>

          {deleteError && (
            <p role="alert" className="mb-4 text-sm text-danger">
              {deleteError}
            </p>
          )}

          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            className="min-h-11 rounded-xl border border-danger px-5 text-sm font-medium text-danger transition hover:bg-danger-bg"
          >
            Delete my account
          </button>
        </section>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Permanently delete your account?"
        description="Your profile and all associated links will be permanently deleted. This action cannot be undone."
        confirmText="Delete account"
        cancelText="Keep my account"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteAccount}
        onCancel={() => {
          if (!isDeleting) setShowDeleteDialog(false);
        }}
      />
    </main>
  );
}
