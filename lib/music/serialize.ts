import type { Music } from "../db/schema";

export function serializeMusic(track: Music) {
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    mood: track.mood,
    duration: track.duration,
    audioUrl: track.audioUrl,
    previewUrl: track.previewUrl,
    isActive: track.isActive,
    createdAt: track.createdAt.toISOString(),
    updatedAt: track.updatedAt.toISOString(),
  };
}
