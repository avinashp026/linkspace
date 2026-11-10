export type LinkActionResult =
  | { success: true; error: "" }
  | { success: false; error: string };

export type ValidatedLink =
  | { success: true; title: string; url: string }
  | { success: false; error: string };

export function validateLink(
  title: string,
  url: string,
): ValidatedLink {
  const trimmedTitle = title.trim();
  const trimmedUrl = url.trim();

  if (!trimmedTitle || !trimmedUrl) {
    return {
      success: false,
      error: "Please enter both a title and a URL.",
    };
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(trimmedUrl);
  } catch {
    return {
      success: false,
      error: "Enter a valid URL, including https://.",
    };
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return {
      success: false,
      error: "Only HTTP and HTTPS links are allowed.",
    };
  }

  return {
    success: true,
    title: trimmedTitle,
    url: parsedUrl.href,
  };
}