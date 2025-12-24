import { Play, Pause, Next, Prev } from "@/icons/PlayerIcons";
import { usePlayerStore } from "@/store/playerStore";

export function PlayerControls() {
  const { isPlaying, setIsPlaying, currentMusic, setCurrentMusic } =
    usePlayerStore((state) => state);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    const { songs, song } = currentMusic;
    const currentIndex = songs.findIndex((s) => s.id === song?.id);
    const nextSong = songs[currentIndex + 1] || songs[0];
    setCurrentMusic({ ...currentMusic, song: nextSong });
  };

  const handlePrev = () => {
    const { songs, song } = currentMusic;
    const currentIndex = songs.findIndex((s) => s.id === song?.id);
    const prevSong = songs[currentIndex - 1] || songs[songs.length - 1];
    setCurrentMusic({ ...currentMusic, song: prevSong });
  };

  return (
    <div className="flex gap-4 items-center justify-center">
      <button onClick={handlePrev} className="hover:opacity-100 opacity-70">
        <Prev />
      </button>
      <button onClick={handlePlayPause} className="bg-white rounded-full p-2">
        {isPlaying ? <Pause className={"fill-black"} /> : <Play className={"fill-black"} />}
      </button>
      <button onClick={handleNext} className="hover:opacity-100 opacity-70">
        <Next />
      </button>
    </div>
  );
}
