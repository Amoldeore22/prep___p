export function getEmbedUrl(rawUrl: string): {
  type: "youtube" | "vimeo" | "direct" | "iframe" | "invalid";
  url: string;
} {
  if (!rawUrl || typeof rawUrl !== "string") return { type: "invalid", url: "" };
  const trimmed = rawUrl.trim();

  // YouTube watch / shorts / embed / youtu.be
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?.*v=|v\/|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: "youtube",
      url: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
    };
  }

  // Vimeo
  const vimeoMatch = trimmed.match(
    /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/
  );
  if (vimeoMatch && vimeoMatch[3]) {
    return {
      type: "vimeo",
      url: `https://player.vimeo.com/video/${vimeoMatch[3]}`,
    };
  }

  // Direct video file (.mp4, .webm, .ogg, .mov)
  if (/\.(mp4|webm|ogg|mov)($|\?)/i.test(trimmed)) {
    return {
      type: "direct",
      url: trimmed,
    };
  }

  // Generic valid web URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return {
      type: "iframe",
      url: trimmed,
    };
  }

  return { type: "invalid", url: trimmed };
}
