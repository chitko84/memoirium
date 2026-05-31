import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

const AUDIO_SRC = "/audio/museum-ambient.mp3";

export function MuseumAudioControl({ className = "" }: { className?: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMissing, setIsMissing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playError, setPlayError] = useState("");

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.34;
  }, []);

  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio || !isReady || isMissing) return;

    setPlayError("");

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setPlayError("Audio could not be started.");
    }
  };

  const label = isMissing ? "Add audio file" : isPlaying ? "Pause ambience" : "Play ambience";
  const disabled = isMissing || !isReady;

  return (
    <div className={`inline-flex flex-col items-start gap-2 ${className}`}>
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        preload="metadata"
        loop
        onCanPlay={() => {
          setIsReady(true);
          setIsMissing(false);
        }}
        onError={() => {
          setIsReady(false);
          setIsMissing(true);
          setIsPlaying(false);
        }}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
      <button
        type="button"
        onClick={() => void toggleAudio()}
        disabled={disabled}
        className="inline-flex items-center justify-center gap-2 border border-[var(--gold-primary)]/35 bg-black/35 px-4 py-2 text-sm text-[var(--gold-secondary)] backdrop-blur transition-colors hover:border-[var(--gold-primary)] hover:text-[var(--gold-primary)] disabled:cursor-not-allowed disabled:opacity-60"
        aria-pressed={isPlaying}
      >
        {isMissing ? <VolumeX size={16} /> : isPlaying ? <Pause size={16} /> : <Play size={16} />}
        <span>{label}</span>
        {!isMissing && <Volume2 size={15} className="opacity-70" />}
      </button>
      {isMissing && (
        <p className="max-w-xs text-xs text-[var(--text-secondary)]">
          Place an ambient MP3 at public/audio/museum-ambient.mp3 to enable sound.
        </p>
      )}
      {playError && <p className="text-xs text-red-200">{playError}</p>}
    </div>
  );
}
