import { describe, expect, it } from "vitest";
import { getAvatarImageUrl } from "./avatar-url";

describe("getAvatarImageUrl", () => {
  it("preserves Cloudinary asset versions", () => {
    expect(getAvatarImageUrl(
      "https://res.cloudinary.com/demo/image/upload/v1723456789/eah/avatars/user.webp",
      64,
    )).toBe(
      "https://res.cloudinary.com/demo/image/upload/w_64,h_64,c_fill,g_face,f_auto,q_auto/v1723456789/eah/avatars/user.webp",
    );
  });

  it("optimizes unversioned raw Cloudinary assets", () => {
    expect(getAvatarImageUrl(
      "https://res.cloudinary.com/demo/image/upload/eah/avatars/user.webp",
      48,
    )).toBe(
      "https://res.cloudinary.com/demo/image/upload/w_48,h_48,c_fill,g_face,f_auto,q_auto/eah/avatars/user.webp",
    );
  });

  it("does not stack transforms on an already transformed URL", () => {
    const url = "https://res.cloudinary.com/demo/image/upload/w_300,c_fill/eah/avatars/user.webp";
    expect(getAvatarImageUrl(url, 48)).toBe(url);
  });

  it("leaves valid non-Cloudinary HTTP(S) URLs unchanged", () => {
    const url = "https://cdn.example.com/avatars/user.jpg";
    expect(getAvatarImageUrl(url, 96)).toBe(url);
  });

  it("allows safe local paths and rejects unsafe or malformed URLs", () => {
    expect(getAvatarImageUrl("/avatars/default.webp", 96)).toBe("/avatars/default.webp");
    expect(getAvatarImageUrl("javascript:alert(1)", 96)).toBeNull();
    expect(getAvatarImageUrl("not-a-url", 96)).toBeNull();
    expect(getAvatarImageUrl("//bad.example/avatar.png", 96)).toBeNull();
  });

  it("clamps transform size", () => {
    expect(getAvatarImageUrl("https://res.cloudinary.com/demo/image/upload/v12/user.png", 1000))
      .toContain("w_256,h_256");
  });
});
