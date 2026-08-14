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

// ─── Authentic Track List (Downloaded Local Audio) ─────────────────────────
const tracks: Track[] = [
  {
    id: 1,
    title: "Jana Gana Mana (Orchestral)",
    artist: "Rabindranath Tagore",
    film: "National Anthem of India",
    year: 1950,
    duration: 64,
    audioSrc: "/audio/jana_gana_mana.m4a",
    audioFallbackSrc: "/audio/jana_gana_mana.ogg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_India.svg/320px-Flag_of_India.svg.png",
  },
  {
    id: 2,
    title: "Jana Gana Mana (Vocal Chorus)",
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
    title: "Vande Mataram (Mohan Veena)",
    artist: "Pt. Vishwa Mohan Bhatt",
    film: "National Song (Raag Desh)",
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

// Mini animated equalizer icon for active playing track
function LiveEqualizer() {
  return (
    <div className="flex items-end gap-[2px] h-3.5 w-3.5 justify-center">
      <span className="w-[3px] bg-accent rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-full shadow-[0_0_6px_rgba(255,153,51,0.6)]" />
      <span className="w-[3px] bg-accent rounded-full animate-[pulse_0.4s_ease-in-out_infinite_0.2s] h-2/3 shadow-[0_0_6px_rgba(255,153,51,0.6)]" />
      <span className="w-[3px] bg-accent rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.4s] h-4/5 shadow-[0_0_6px_rgba(255,153,51,0.6)]" />
    </div>
  );
}

// Seek bar with direct scrubbing and touch support
function SeekBar({
  progress,
  duration,
  onSeek,
}: {
  progress: number;
  duration: number;
  onSeek: (fraction: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const handlePointer = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect || duration <= 0) return;
      const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      onSeek(fraction);
    },
    [duration, onSeek]
  );

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div
      ref={trackRef}
      className="relative w-full h-6 flex items-center cursor-pointer touch-none group"
      onPointerDown={handlePointer}
    >
      <div className="absolute inset-0" />
      <div className="relative w-full h-[3px] rounded-full bg-white/15 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-75"
          style={{
            width: `${pct}%`,
            boxShadow: "0 0 8px rgba(255, 153, 51, 0.6)",
          }}
        />
      </div>
      <div
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-md pointer-events-none"
        style={{ left: `calc(${pct}% - 6px)` }}
      />
    </div>
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
      // If primary format fails, try fallback
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

    // Initial source
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
        // Fallback to ogg if m4a fails
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
    (fraction: number) => {
      const audio = audioRef.current;
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

  return (
    <div className="w-full flex flex-col items-center safe-bottom px-4 pb-4 sm:px-6 sm:pb-6 relative">
      {/* ═══════════ CLOSEABLE SONG SELECTION PANEL ═══════════ */}
      {isPlaylistOpen && (
        <div
          ref={playlistPanelRef}
          className="w-full max-w-sm sm:max-w-xl mb-3 glass rounded-[26px] sm:rounded-3xl p-4 sm:p-5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 duration-200 z-30"
          role="dialog"
          aria-label="Song Selection Playlist"
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 text-accent flex items-center justify-center text-xs shadow-inner">
                🎵
              </span>
              <div>
                <h3 className="text-white text-sm font-semibold tracking-wide flex items-center gap-2">
                  Choose Song
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent px-1.5 py-0.5 rounded bg-accent/15 border border-accent/25">
                    {tracks.length} Tracks
                  </span>
                </h3>
                <p className="text-white/50 text-[11px] mt-0.5">
                  Independence Day Patriotic Classics
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsPlaylistOpen(false)}
              className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-150"
              aria-label="Close playlist"
              title="Close panel"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Smooth Scrollable Song List */}
          <div className="smooth-scroll flex flex-col gap-1.5 max-h-56 sm:max-h-64 overflow-y-auto overscroll-contain pr-1">
            {tracks.map((track, idx) => {
              const isSelected = trackIndex === idx;

              return (
                <button
                  key={track.id}
                  ref={isSelected ? activeTrackItemRef : null}
                  onClick={() => selectSong(idx)}
                  className={`w-full flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl text-left transition-all duration-200 group cursor-pointer ${
                    isSelected
                      ? "bg-accent/15 border border-accent/35 shadow-sm text-white"
                      : "bg-white/[0.03] hover:bg-white/[0.10] border border-white/[0.06] hover:border-white/20 text-white/80 hover:text-white hover:translate-x-0.5"
                  }`}
                >
                  {/* Track number or Equalizer */}
                  <div className="w-6 flex items-center justify-center flex-shrink-0">
                    {isSelected && isPlaying ? (
                      <LiveEqualizer />
                    ) : (
                      <span
                        className={`text-xs font-mono font-semibold transition-colors ${
                          isSelected ? "text-accent" : "text-white/40 group-hover:text-white/80"
                        }`}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    )}
                  </div>

                  {/* Track Details */}
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`text-xs sm:text-sm font-medium truncate transition-colors ${
                        isSelected ? "text-accent font-semibold" : "text-white group-hover:text-white/95"
                      }`}
                    >
                      {track.title}
                    </h4>
                    <p className="text-[11px] text-white/50 truncate mt-0.5">
                      {track.artist} • {track.film}
                    </p>
                  </div>

                  {/* Duration & Status */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] font-mono text-white/40 tabular-nums">
                      {formatTime(track.duration)}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(255,153,51,0.8)] animate-pulse" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════ UNIFIED RESPONSIVE GLASS PLAYER ═══════════ */}
      <div className="glass w-full max-w-sm sm:max-w-xl rounded-[26px] sm:rounded-full p-4 sm:p-3 sm:pr-5 transition-all duration-300 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full">
          
          {/* Row 1 on Mobile / Left on Desktop: Vinyl Disc + Title on Mobile */}
          <div className="flex items-center gap-3 sm:gap-4 sm:flex-shrink-0">
            {/* Spinning Vinyl Disc (64px on mobile, 80px on desktop) */}
            <div
              className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 cursor-pointer select-none"
              onClick={togglePlay}
              role="button"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden relative shadow-lg bg-black/80 border border-white/20"
                style={{
                  animation: "spin 8s linear infinite",
                  animationPlayState: isPlaying ? "running" : "paused",
                }}
              >
                {/* Outer vinyl rim shine */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.12) 60deg, transparent 120deg, rgba(255,255,255,0.12) 240deg, transparent 300deg)",
                  }}
                />

                {/* Grooves */}
                <div className="absolute inset-[3px] rounded-full border border-white/10" />
                <div className="absolute inset-[7px] rounded-full border border-white/5" />
                <div className="absolute inset-[11px] rounded-full border border-white/10" />
                <div className="absolute inset-[15px] rounded-full border border-white/5" />

                {/* Center label (Tiranga Art) */}
                <div className="absolute inset-[18px] sm:inset-[22px] rounded-full overflow-hidden border border-white/30 shadow-inner flex items-center justify-center bg-gradient-to-br from-[#FF9933] via-white to-[#138808]">
                  <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-[#000080] flex items-center justify-center shadow-sm">
                    <div className="w-1 h-1 rounded-full bg-white/90" />
                  </div>
                </div>

                {/* Center spindle hole */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#0a0a0a] border border-white/40 shadow-inner pointer-events-none" />
              </div>

              {/* Glowing play indicator badge */}
              {isPlaying && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-accent flex items-center justify-center shadow-lg border border-black/50 animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              )}
            </div>

            {/* Mobile-only Track Info (Next to Vinyl) */}
            <div className="sm:hidden flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-accent font-semibold flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                Patriotic Radio
              </p>
              <h2 className="text-white text-sm font-semibold truncate leading-tight mt-0.5">
                {currentTrack.title}
              </h2>
              <p className="text-white/60 text-xs truncate mt-0.5">
                {currentTrack.artist}
              </p>
            </div>
          </div>

          {/* Center Column: Track Info (Desktop) + Progress Bar + Time */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1 sm:gap-1.5">
            {/* Desktop Track Info */}
            <div className="hidden sm:flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-white text-sm font-semibold truncate">
                  {currentTrack.title}
                </h2>
                <p className="text-white/50 text-xs truncate mt-0.5">
                  {currentTrack.artist} • {currentTrack.film} ({currentTrack.year})
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <span className="text-white/70 text-xs font-mono tabular-nums">
                  {formatTime(progress)} / {formatTime(effectiveDuration)}
                </span>
              </div>
            </div>

            {/* Seek Bar */}
            <SeekBar
              progress={progress}
              duration={effectiveDuration}
              onSeek={handleSeek}
            />

            {/* Mobile Time Display */}
            <div className="sm:hidden flex items-center justify-between text-[11px] font-mono text-white/50 -mt-1">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(effectiveDuration)}</span>
            </div>
          </div>

          {/* Right Controls: Playlist Toggle, Prev, Play/Pause, Next */}
          <div className="flex items-center justify-center sm:justify-end gap-1.5 sm:gap-2 flex-shrink-0 pt-1 sm:pt-0 border-t border-white/10 sm:border-t-0">
            {/* Playlist / Song Choice Trigger */}
            <button
              data-playlist-trigger
              onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
              className={`p-2.5 sm:p-2 rounded-full transition-all duration-150 active:scale-95 ${
                isPlaylistOpen
                  ? "bg-accent text-black font-bold shadow-md shadow-accent/20"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
              aria-label="Choose song from playlist"
              title="Choose song playlist"
            >
              <PlaylistIcon />
            </button>

            {/* Previous */}
            <button
              onClick={prevTrack}
              className="p-2.5 sm:p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-150"
              aria-label="Previous track"
            >
              <PrevIcon />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="p-3 sm:p-3 rounded-full bg-accent text-black hover:bg-[#ffaa44] active:scale-95 transition-all duration-150 shadow-lg shadow-accent/30 flex items-center justify-center font-bold"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
            </button>

            {/* Next */}
            <button
              onClick={nextTrack}
              className="p-2.5 sm:p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-150"
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
