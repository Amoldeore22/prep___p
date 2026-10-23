"use client";

import React, { useState } from "react";
import { ExternalLink, AlertCircle, Play } from "lucide-react";
import { getEmbedUrl } from "@/lib/video-utils";

export { getEmbedUrl };

interface VideoPlayerProps {
  url: string;
  title: string;
  className?: string;
}

export default function VideoPlayer({ url, title, className = "" }: VideoPlayerProps) {
  const [hasError, setHasError] = useState(false);
  const embed = getEmbedUrl(url);

  if (embed.type === "invalid" || hasError) {
    return (
      <div
        className={`aspect-video w-full rounded-xl bg-[#1A1B1E] border border-[#2C2E33] flex flex-col items-center justify-center p-6 text-center text-zinc-400 ${className}`}
      >
        <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
        <p className="text-xs font-medium text-zinc-300">Unable to embed preview</p>
        <p className="text-[11px] text-zinc-500 mb-3 max-w-xs truncate">{url}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF5722] hover:bg-[#ea580c] text-white text-xs font-semibold transition"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Watch Video</span>
          <ExternalLink className="w-3 h-3 ml-0.5" />
        </a>
      </div>
    );
  }

  if (embed.type === "direct") {
    return (
      <div className={`aspect-video w-full rounded-xl overflow-hidden bg-black border border-[#2C2E33] ${className}`}>
        <video
          src={embed.url}
          controls
          className="w-full h-full object-contain"
          onError={() => setHasError(true)}
        >
          Your browser does not support HTML video playback.
        </video>
      </div>
    );
  }

  return (
    <div className={`aspect-video w-full rounded-xl overflow-hidden bg-black border border-[#2C2E33] relative shadow-lg ${className}`}>
      <iframe
        src={embed.url}
        title={title}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onError={() => setHasError(true)}
      />
    </div>
  );
}
