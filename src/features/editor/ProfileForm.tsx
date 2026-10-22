
import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { LinkData, ProfileData } from "./types";

type LinkActionResult = {
  success: boolean;
  error: string;
};

type ProfileFormProps = {
  profileData: ProfileData;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  addLink: (title: string, url: string) => LinkActionResult;
  updateLink: (
    id: string,
    title: string,
    url: string,
  ) => LinkActionResult;
  editingId: string | null;
  setEditingId: Dispatch<SetStateAction<string | null>>;
  links: LinkData[];
};

const ProfileForm = ({
  profileData,
  handleChange,
  addLink,
  updateLink,
  editingId,
  setEditingId,
  links,
}: ProfileFormProps) => {
  const [linkError, setLinkError] = useState("");

  const [linkInfo, setLinkInfo] = useState({
    title: "",
    url: "",
  });

  // Find the link currently being edited.
  const editingLink = links.find((link) => link.id === editingId);

  // Load the selected link into the inputs.
  useEffect(() => {
    if (editingLink) {
      setLinkInfo({
        title: editingLink.title,
        url: editingLink.url,
      });
      setLinkError("");
    } else if (editingId === null) {
      setLinkInfo({ title: "", url: "" });
      setLinkError("");
    }
  }, [editingId, editingLink]);

  // Handle profile input changes.
  const handleLinkInfoChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;

    setLinkInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add a new link or save edits to an existing link.
  const handleSubmitLink = () => {
    let result: LinkActionResult;

    if (editingId !== null) {
      result = updateLink(
        editingId,
        linkInfo.title,
        linkInfo.url,
      );
    } else {
      result = addLink(linkInfo.title, linkInfo.url);
    }

    if (!result.success) {
      setLinkError(result.error);
      return;
    }

    setLinkInfo({ title: "", url: "" });
    setLinkError("");
  };

  // Cancel editing and clear the form.
  const handleCancelEdit = () => {
    setEditingId(null);
    setLinkInfo({ title: "", url: "" });
    setLinkError("");
  };

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold">Your Profile</h3>

      <form
        className="mt-2 flex flex-col gap-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="flex flex-col">
          <label
            htmlFor="displayName"
            className="text-sm text-slate-700"
          >
            Display Name
          </label>

          <input
            name="displayName"
            id="displayName"
            type="text"
            value={profileData.displayName}
            onChange={handleChange}
            className="border border-slate-600 rounded-md px-2 py-1 mt-1"
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="bio"
            className="text-sm text-slate-700"
          >
            Bio
          </label>

          <textarea
            name="bio"
            id="bio"
            value={profileData.bio}
            onChange={handleChange}
            className="border border-slate-600 rounded-md px-2 py-1 mt-1 resize-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-slate-700">
            {editingId !== null ? "Edit link" : "Add a link"}
          </p>

          <input
            type="text"
            name="title"
            value={linkInfo.title}
            onChange={handleLinkInfoChange}
            placeholder="Title"
            aria-label="Link title"
            className="border border-slate-600 rounded-md px-2 py-1 w-full"
          />

          <input
            type="text"
            name="url"
            value={linkInfo.url}
            onChange={handleLinkInfoChange}
            placeholder="https://example.com"
            aria-label="Link URL"
            className="border border-slate-600 rounded-md px-2 py-1 w-full"
          />

          {linkError && (
            <p
              className="text-sm text-red-600"
              role="alert"
            >
              {linkError}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSubmitLink}
              className="border rounded-md px-3 py-1 bg-blue-400"
            >
              {editingId !== null ? "Save changes" : "Add link"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="border rounded-md px-3 py-1"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
