// components/audio/AudioPlayerProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

interface AudioTrack {
  id: string;
  title: string;
  url: string;
}

interface AudioContextValue {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  playTrack: (track: AudioTrack) => void;
  pause: () => void;
}

const AudioContext = createContext<AudioContextValue | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playTrack = useCallback((track: AudioTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  return (
    <AudioContext.Provider value={{ currentTrack, isPlaying, playTrack, pause }}>
      {children}
      {/* Eenvoudige placeholder voor echte audio player */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 text-sm">
            <div className="truncate">
              <p className="truncate text-neutral-200">{currentTrack.title}</p>
              <p className="text-xs text-neutral-400">Audio tour</p>
            </div>
            <button
              type="button"
              className="rounded-full border border-neutral-600 px-3 py-1 text-xs text-neutral-100"
              onClick={pause}
            >
              Pauze
            </button>
          </div>
        </div>
      )}
    </AudioContext.Provider>
  );
}

export function useAudioPlayer() {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  }
  return ctx;
}
