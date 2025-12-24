import { Play, Pause } from "@/icons/PlayerIcons";
import { usePlayerStore } from "@/store/playerStore";
import { useEffect, useRef, useState } from "react";
import { SliderDemo } from "./Slider";
import {
  VolumeFull,
  VolumeLow,
  VolumeMedium,
  VolumeSilenced,
} from "@/icons/VolumeIcons";
import { PlayerControls } from "./PlayerControls";

const CurrentSong = ({ image, title, artists }) => {
  return (
    <div className="flex items-center gap-5 relative overflow-hidden">
      <picture className="w-16 h-16 bg-zinc-800 rounded-md shadow-lg overflow-hidden">
        <img src={image} alt={title} />
      </picture>

      <div className="flex flex-col">
        <h3 className="font-semibold text-sm block">{title}</h3>
        <span className="text-xs opacity-80">{artists?.join(", ")}</span>
      </div>
    </div>
  );
};

const SongControl = ({ audio }) => {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    audio.current.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      audio.current.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  const handleTimeUpdate = () => {
    setCurrentTime(audio?.current?.currentTime);
  };

  const formatTime = (time = 0) => {
    if (time == null || isNaN(time)) return `0:00`;

    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60);

    console.log(time);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const duration = audio?.current?.duration ?? 0;

  return (
    <div className="flex gap-x-3 text-xs pt-2 items-center">
      <span className="opacity-50">{formatTime(currentTime)}</span>
      <SliderDemo
        defaultValue={[0]}
        value={[currentTime]}
        max={audio?.current?.duration ?? 0}
        min={0}
        className="w-100 bg-white rounded-md hover:bg-green-400 cursor-pointer"
        onValueChange={(value) => {
          audio.current.currentTime = value;
        }}
      />
      <span className="opacity-50">{formatTime(duration)}</span>
    </div>
  );
};

const VolumeControl = () => {
  const volume = usePlayerStore((state) => state.volume);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const previousVolumeRef = useRef(volume);

  const isVolumeSilenced = volume < 0.1;

  const handleVolume = () => {
    if (isVolumeSilenced) {
      setVolume(previousVolumeRef.current);
    } else {
      previousVolumeRef.current = volume;
      setVolume(0);
    }
  };

  const getVolumeIcon = () => {
    if (volume < 0.1) return <VolumeSilenced />;
    if (volume < 0.4) return <VolumeLow />;
    if (volume < 0.7) return <VolumeMedium />;
    return <VolumeFull />;
  };

  return (
    <div className="flex justify-center gap-x-2 items-center">
      <button
        className="opacity-70 hover:opacity-100 transition"
        onClick={handleVolume}
      >
        {getVolumeIcon()}
      </button>
      <SliderDemo
        defaultValue={[100]}
        value={[volume * 100]}
        max={100}
        min={0}
        className="w-23.75 bg-white rounded-md hover:bg-green-400 cursor-pointer"
        onValueChange={(value) => {
          const [newVolume] = value;
          const volumeValue = newVolume / 100;
          setVolume(volumeValue);
        }}
      />
    </div>
  );
};

export function Player() {
  const { currentMusic, isPlaying, setIsPlaying, volume, setCurrentMusic } =
    usePlayerStore((state) => state);
  const audioRef = useRef();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((error) => {
        console.log("Playback prevented:", error);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      const state = usePlayerStore.getState();
      const { songs, song } = state.currentMusic;
      const { repeatMode, isShuffle } = state;

      if (!songs || songs.length === 0) return;

      if (repeatMode === 2) {
        audio.currentTime = 0;
        audio.play();
        return;
      }

      const currentIndex = songs.findIndex((s) => s.id === song?.id);
      let nextSong;

      if (isShuffle) {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * songs.length);
        } while (randomIndex === currentIndex && songs.length > 1);
        nextSong = songs[randomIndex];
      } else {
        nextSong = songs[currentIndex + 1];
      }

      if (nextSong) {
        state.setCurrentMusic({ ...state.currentMusic, song: nextSong });
      } else if (repeatMode === 1) {
        state.setCurrentMusic({ ...state.currentMusic, song: songs[0] });
      } else {
        state.setIsPlaying(false);
      }
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, []);

  useEffect(() => {
    const { song, playlist } = currentMusic;
    const audio = audioRef.current;

    if (song && audio) {
      const src = `/music/${playlist?.id}/0${song.id}.mp3`;

      const currentSrc = audio.src;
      const newSrc = window.location.origin + src;

      if (currentSrc !== newSrc) {
        audio.src = src;
        audio.volume = volume;
        audio.load();

        audio.addEventListener(
          "canplay",
          () => {
            setIsPlaying(true);
            audio.play().catch((error) => {
              console.log("Playback prevented:", error);
            });
          },
          { once: true }
        );
      }
    }
  }, [currentMusic]);

  const handleClick = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex flex-row justify-between w-full px-1 z-50">
      <div className="w-50">
        <CurrentSong {...currentMusic.song} />
      </div>

      <div className="grid place-content-center gap-4 flex-1 max-w-180.5">
        <PlayerControls />
        <SongControl audio={audioRef} />
      </div>

      <div className="grid place-content-center w-50">
        <VolumeControl />
      </div>

      <audio ref={audioRef} />
    </div>
  );
}
