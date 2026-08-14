"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────

interface Track {
  id: number;
  title: string;
  artist: string;
  film: string;
  year: number;
  duration: number; // in seconds
  audioSrc: string; // primary local path
  audioFallbackSrc: string; // secondary format
  coverUrl: string;
}

// ─── Authentic Track List ──────────────────────────────────────────────────
const tracks: Track[] = [
  {
    id: 1,
    title: "Jana Gana Mana",
    artist: "Rabindranath Tagore",
    film: "National Anthem (Orchestral)",
    year: 1950,
    duration: 64,
    audioSrc: "/audio/jana_gana_mana.m4a",
    audioFallbackSrc: "/audio/jana_gana_mana.ogg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_India.svg/320px-Flag_of_India.svg.png",
  },
  {
    id: 2,
    title: "Jana Gana Mana (Vocal)",
    artist: "National Vocal Choir",
    film: "National Anthem of India",
    year: 1950,
    duration: 52,
    audioSrc: "/audio/jana_gana_mana_vocal.m4a",
    audioFallbackSrc: "/audio/jana_gana_mana_vocal.ogg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_India.svg/320px-Flag_of_India.svg.png",
  },
  {
    id: 3,
    title: "Vande Mataram",
    artist: "Pt. Vishwa Mohan Bhatt",
    film: "Mohan Veena Instrumental",
    year: 1882,
    duration: 145,
    audioSrc: "/audio/vande_mataram.m4a",
    audioFallbackSrc: "/audio/vande_mataram.ogg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_India.svg/320px-Flag_of_India.svg.png",
  },
  {
    id: 4,
    title: "Sare Jahan Se Achha",
    artist: "Muhammad Iqbal",
    film: "Patriotic Symphony",
    year: 1904,
    duration: 30,
    audioSrc: "/audio/sare_jahan_se_achha.m4a",
    audioFallbackSrc: "/audio/sare_jahan_se_achha.ogg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_India.svg/320px-Flag_of_India.svg.png",
  },
];

// ─── Format helpers ───────────────────────────────────────────────────────

function formatTime(s: number): string {
  if (isNaN(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// ─── Icons ────────────────────────────────────────────────────────────────

function PrevIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z" />
    </svg>
  );
}

function PlayIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function PlaylistIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ─── Main Player Component ───────────────────────────────────────────────

export default function Player() {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playlistPanelRef = useRef<HTMLDivElement | null>(null);
  const activeTrackItemRef = useRef<HTMLButtonElement | null>(null);

  const trackIndexRef = useRef(trackIndex);
  trackIndexRef.current = trackIndex;

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentTrack = tracks[trackIndex];

  // Initialize HTML5 Audio
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      const next = (trackIndexRef.current + 1) % tracks.length;
      setTrackIndex(next);
      playTrack(next);
    };

    const onError = () => {
      const track = tracks[trackIndexRef.current];
      if (audio.src.endsWith(".m4a") && track.audioFallbackSrc) {
        audio.src = track.audioFallbackSrc;
        audio.play().catch(() => {});
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    audio.src = currentTrack.audioSrc;

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audioRef.current = null;
    };
  }, []);

  // Smooth auto-scroll active track into view when playlist opens
  useEffect(() => {
    if (isPlaylistOpen && activeTrackItemRef.current) {
      activeTrackItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [isPlaylistOpen, trackIndex]);

  // Close panel on Escape key or outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPlaylistOpen) {
        setIsPlaylistOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        isPlaylistOpen &&
        playlistPanelRef.current &&
        !playlistPanelRef.current.contains(e.target as Node)
      ) {
        const target = e.target as HTMLElement;
        if (!target.closest("[data-playlist-trigger]")) {
          setIsPlaylistOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPlaylistOpen]);

  const playTrack = useCallback((index: number, seekTo: number = 0) => {
    const audio = audioRef.current;
    if (!audio) return;

    const track = tracks[index];
    const src = track.audioSrc;

    if (audio.src !== window.location.origin + src && !audio.src.endsWith(src)) {
      audio.src = src;
    }

    if (seekTo > 0) {
      audio.currentTime = seekTo;
    }

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(() => {
        if (track.audioFallbackSrc) {
          audio.src = track.audioFallbackSrc;
          audio
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        }
      });
  }, []);

  const selectSong = useCallback((index: number) => {
    setTrackIndex(index);
    setProgress(0);
    playTrack(index, 0);
  }, [playTrack]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      playTrack(trackIndex, audio.currentTime);
    }
  }, [isPlaying, playTrack, trackIndex]);

  const nextTrack = useCallback(() => {
    const next = (trackIndexRef.current + 1) % tracks.length;
    setTrackIndex(next);
    setProgress(0);
    if (isPlayingRef.current) {
      playTrack(next, 0);
    } else if (audioRef.current) {
      audioRef.current.src = tracks[next].audioSrc;
    }
  }, [playTrack]);

  const prevTrack = useCallback(() => {
    const prev = (trackIndexRef.current - 1 + tracks.length) % tracks.length;
    setTrackIndex(prev);
    setProgress(0);
    if (isPlayingRef.current) {
      playTrack(prev, 0);
    } else if (audioRef.current) {
      audioRef.current.src = tracks[prev].audioSrc;
    }
  }, [playTrack]);

  const handleSeek = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const audio = audioRef.current;
      const rect = e.currentTarget.getBoundingClientRect();
      const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const totalDur = duration || currentTrack.duration;
      const seekTo = fraction * totalDur;
      setProgress(seekTo);
      if (audio) {
        audio.currentTime = seekTo;
        if (!isPlaying) {
          playTrack(trackIndex, seekTo);
        }
      }
    },
    [currentTrack.duration, duration, isPlaying, playTrack, trackIndex]
  );

  // ── Media Session Integration ──
  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: `${currentTrack.film} (${currentTrack.year})`,
        artwork: [
          {
            src: currentTrack.coverUrl,
            sizes: "512x512",
            type: "image/png",
          },
        ],
      });

      navigator.mediaSession.setActionHandler("play", () => {
        if (audioRef.current) {
          audioRef.current.play();
          setIsPlaying(true);
        }
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      });
      navigator.mediaSession.setActionHandler("previoustrack", prevTrack);
      navigator.mediaSession.setActionHandler("nexttrack", nextTrack);
    }
  }, [currentTrack, nextTrack, prevTrack]);

  const effectiveDuration = duration || currentTrack.duration;
  const progressPercent = effectiveDuration > 0 ? (progress / effectiveDuration) * 100 : 0;

  return (
    <div className="w-full flex flex-col items-center safe-bottom px-4 pb-4 sm:px-6 sm:pb-6 relative">
      {/* ═══════════ MINIMALIST SONG SELECTION PANEL (MATCHING REFERENCE) ═══════════ */}
      {isPlaylistOpen && (
        <div
          ref={playlistPanelRef}
          className="w-full max-w-lg sm:max-w-xl mb-3 rounded-[26px] p-3 sm:p-4 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 duration-200 z-30 border border-white/10"
          style={{
            background: "rgba(18, 18, 22, 0.92)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
          }}
          role="dialog"
          aria-label="Song Selection Playlist"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-1.5 mb-1 border-b border-white/5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">
              Queue • {tracks.length} Songs
            </span>
            <button
              onClick={() => setIsPlaylistOpen(false)}
              className="p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Minimal Clean Track List */}
          <div className="smooth-scroll flex flex-col gap-1 max-h-60 sm:max-h-72 overflow-y-auto overscroll-contain pr-1">
            {tracks.map((track, idx) => {
              const isSelected = trackIndex === idx;

              return (
                <button
                  key={track.id}
                  ref={isSelected ? activeTrackItemRef : null}
                  onClick={() => selectSong(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                    isSelected
                      ? "bg-white/[0.08] text-accent"
                      : "hover:bg-white/[0.04] text-white/80 hover:text-white"
                  }`}
                >
                  {/* Left: Number + Title */}
                  <div className="flex items-center gap-3.5 min-w-0 pr-2">
                    <span
                      className={`text-xs font-mono w-4 text-center flex-shrink-0 ${
                        isSelected ? "text-accent font-bold" : "text-white/40 group-hover:text-white/60"
                      }`}
                    >
                      {idx + 1}
                    </span>

                    <span
                      className={`text-sm truncate ${
                        isSelected
                          ? "text-accent font-semibold"
                          : "text-white/90 group-hover:text-white font-normal"
                      }`}
                    >
                      {track.title}
                    </span>
                  </div>

                  {/* Right: Artist / Film */}
                  <span
                    className={`text-xs truncate flex-shrink-0 text-right ${
                      isSelected
                        ? "text-accent/80 font-medium"
                        : "text-white/40 group-hover:text-white/60"
                    }`}
                  >
                    {track.film || track.artist}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════ SLEEK PLAYER BAR (MATCHING REFERENCE) ═══════════ */}
      <div
        className="w-full max-w-lg sm:max-w-xl rounded-[28px] p-3 sm:p-3.5 px-4 sm:px-5 transition-all duration-300 shadow-2xl border border-white/10"
        style={{
          background: "rgba(18, 18, 22, 0.92)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
        }}
      >
        <div className="flex items-center gap-3.5 sm:gap-4 w-full">
          {/* Circular Vinyl Art Thumbnail */}
          <div
            className="relative flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 cursor-pointer select-none"
            onClick={togglePlay}
            role="button"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden relative shadow-lg bg-black/90 border border-white/20"
              style={{
                animation: "spin 8s linear infinite",
                animationPlayState: isPlaying ? "running" : "paused",
              }}
            >
              {/* Outer vinyl shine */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.15) 60deg, transparent 120deg, rgba(255,255,255,0.15) 240deg, transparent 300deg)",
                }}
              />
              {/* Grooves */}
              <div className="absolute inset-[3px] rounded-full border border-white/10" />
              <div className="absolute inset-[7px] rounded-full border border-white/5" />
              {/* Center Tiranga Label */}
              <div className="absolute inset-[13px] sm:inset-[15px] rounded-full overflow-hidden border border-white/30 shadow-inner flex items-center justify-center bg-gradient-to-br from-[#FF9933] via-white to-[#138808]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#000080]" />
              </div>
              {/* Center spindle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-black border border-white/50 pointer-events-none" />
            </div>
          </div>

          {/* Track Info (Title & Artist) + Sleek Progress Line */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
            <div className="min-w-0">
              <h2 className="text-white text-sm font-semibold truncate leading-tight">
                {currentTrack.title}
              </h2>
              <p className="text-white/50 text-xs truncate mt-0.5 font-normal">
                {currentTrack.artist} • {currentTrack.film}
              </p>
            </div>

            {/* Sleek Progress Line */}
            <div
              className="relative w-full h-3 flex items-center cursor-pointer touch-none group"
              onPointerDown={handleSeek}
            >
              <div className="relative w-full h-[3px] rounded-full bg-white/15 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-white transition-[width] duration-75"
                  style={{
                    width: `${progressPercent}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Controls: Playlist, Prev, Play/Pause (White Circular Button), Next */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Playlist Toggle */}
            <button
              data-playlist-trigger
              onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
              className={`p-2 rounded-full transition-all duration-150 active:scale-95 ${
                isPlaylistOpen
                  ? "bg-white/20 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
              aria-label="Queue list"
              title="Song queue"
            >
              <PlaylistIcon />
            </button>

            {/* Prev */}
            <button
              onClick={prevTrack}
              className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              aria-label="Previous track"
            >
              <PrevIcon />
            </button>

            {/* Play/Pause Button (Matching White Circular Design from Reference) */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-black hover:bg-white/90 active:scale-95 transition-all duration-150 shadow-lg flex items-center justify-center font-bold flex-shrink-0"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
            </button>

            {/* Next */}
            <button
              onClick={nextTrack}
              className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              aria-label="Next track"
            >
              <NextIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
