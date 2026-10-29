/**
 * Build an appropriately sized Cloudinary avatar URL without dropping the
 * asset version segment. Leave valid non-Cloudinary HTTP(S) URLs unchanged.
 */
export function getAvatarImageUrl(url: string | null | undefined, width: number): string | null {
  if (!url) return null;
  if (url.startsWith("/") && !url.startsWith("//")) return url;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
  if (parsed.hostname !== "res.cloudinary.com") return parsed.href;

  const marker = "/upload/";
  const uploadIndex = parsed.pathname.indexOf(marker);
  if (uploadIndex < 0) return parsed.href;

  const safeWidth = Math.max(24, Math.min(256, Math.round(Number.isFinite(width) ? width : 96)));
  const transformation = `w_${safeWidth},h_${safeWidth},c_fill,g_face,f_auto,q_auto`;
  const prefix = parsed.pathname.slice(0, uploadIndex + marker.length);
  const segments = parsed.pathname.slice(uploadIndex + marker.length).split("/").filter(Boolean);
  if (segments.length === 0) return parsed.href;

  // Cloudinary's version segment must stay after transformations.
  const versionIndex = segments.findIndex((segment) => /^v\d+$/.test(segment));
  if (versionIndex >= 0) {
    const version = segments[versionIndex];
    const assetPath = segments.slice(versionIndex + 1).join("/");
    if (!assetPath) return parsed.href;
    parsed.pathname = `${prefix}${transformation}/${version}/${assetPath}`;
    return parsed.href;
  }

  // Avoid stacking transformations on an unversioned URL that's already transformed.
  const first = segments[0] ?? "";
  if (first.includes(",") || /^(?:a|b|c|d|e|f|fl|g|h|if|ki|l|o|q|r|t|u|vc|w|x|y|z)_/.test(first)) {
    return parsed.href;
  }

  parsed.pathname = `${prefix}${transformation}/${segments.join("/")}`;
  return parsed.href;
}
