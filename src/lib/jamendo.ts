const JAMENDO_CLIENT_ID = import.meta.env.PUBLIC_JAMENDO_CLIENT_ID;

export interface JamendoTrack {
  id: string;
  name: string;
  artist_name: string;
  album_name: string;
  album_image: string;
  audio: string;
  audiodownload: string;
  duration: number;
}

export async function searchTracks(query: string): Promise<JamendoTrack[]> {
  try {
    const response = await fetch(
      `https://api.jamendo.com/v3.0/tracks/?` +
        `client_id=${JAMENDO_CLIENT_ID}&` +
        `format=json&` +
        `limit=20&` +
        `search=${encodeURIComponent(query)}&` +
        `audioformat=mp32&` +
        `include=musicinfo`
    );

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error searching Jamendo:", error);
    return [];
  }
}

export async function getPopularTracks(
  genre?: string
): Promise<JamendoTrack[]> {
  try {
    const genreParam = genre ? `&fuzzytags=${genre}` : "";

    const response = await fetch(
      `https://api.jamendo.com/v3.0/tracks/?` +
        `client_id=${JAMENDO_CLIENT_ID}&` +
        `format=json&` +
        `limit=20&` +
        `order=popularity_total${genreParam}&` +
        `audioformat=mp32&` +
        `include=musicinfo`
    );

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error getting popular tracks:", error);
    return [];
  }
}

export async function getTracksByTag(tag: string): Promise<JamendoTrack[]> {
  try {
    const response = await fetch(
      `https://api.jamendo.com/v3.0/tracks/?` +
        `client_id=${JAMENDO_CLIENT_ID}&` +
        `format=json&` +
        `limit=20&` +
        `fuzzytags=${encodeURIComponent(tag)}&` +
        `audioformat=mp32`
    );

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error getting tracks by tag:", error);
    return [];
  }
}

export function convertJamendoToSong(track: JamendoTrack, index: number) {
  return {
    id: index + 1,
    albumId: 999,
    title: track.name,
    image: track.album_image,
    artists: [track.artist_name],
    album: track.album_name,
    duration: formatDuration(track.duration),
    externalUrl: track.audio,
  };
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
