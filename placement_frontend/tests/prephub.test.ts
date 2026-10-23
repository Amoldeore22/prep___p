import { describe, it, expect } from "vitest";
import { getEmbedUrl } from "../src/lib/video-utils";

describe("Prep Hub Video Embed Parser", () => {
  it("should parse standard YouTube watch URLs", () => {
    const result = getEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(result.type).toBe("youtube");
    expect(result.url).toContain("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });

  it("should parse shortened youtu.be URLs", () => {
    const result = getEmbedUrl("https://youtu.be/dQw4w9WgXcQ");
    expect(result.type).toBe("youtube");
    expect(result.url).toContain("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });

  it("should parse YouTube Shorts URLs", () => {
    const result = getEmbedUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ");
    expect(result.type).toBe("youtube");
    expect(result.url).toContain("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });

  it("should parse Vimeo URLs", () => {
    const result = getEmbedUrl("https://vimeo.com/76979871");
    expect(result.type).toBe("vimeo");
    expect(result.url).toContain("https://player.vimeo.com/video/76979871");
  });

  it("should detect direct MP4 video files", () => {
    const result = getEmbedUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
    expect(result.type).toBe("direct");
    expect(result.url).toBe("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
  });

  it("should handle empty or invalid URLs gracefully", () => {
    expect(getEmbedUrl("").type).toBe("invalid");
    expect(getEmbedUrl("not-a-valid-url").type).toBe("invalid");
  });
});
