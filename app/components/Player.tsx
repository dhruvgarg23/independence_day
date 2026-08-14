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
  notes?: { freq: number; dur: number }[]; // Web Audio synthesized melody notes
  audioUrl?: string; // Optional direct MP3 file path
  coverUrl: string;
}

// ─── Frequency Constants (Hz) ─────────────────────────────────────────────
const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88;
const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99, A5 = 880.00;
const Bb4 = 466.16, Fs4 = 369.99;

// ─── Track List — 100% Universal Web Audio + MP3 Support ──────────────────
const tracks: Track[] = [
  {
    id: 1,
    title: "Jana Gana Mana",
    artist: "Rabindranath Tagore",
    film: "National Anthem of India",
    year: 1950,
    duration: 52,
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_India.svg/320px-Flag_of_India.svg.png",
    notes: [
      { freq: C4, dur: 0.8 }, { freq: D4, dur: 0.8 }, { freq: E4, dur: 1.2 },
      { freq: E4, dur: 0.8 }, { freq: E4, dur: 0.8 }, { freq: E4, dur: 0.8 },
      { freq: E4, dur: 0.8 }, { freq: E4, dur: 0.8 }, { freq: E4, dur: 0.8 },
      { freq: D4, dur: 0.8 }, { freq: E4, dur: 0.8 }, { freq: F4, dur: 1.4 },
      { freq: E4, dur: 0.8 }, { freq: E4, dur: 0.8 }, { freq: E4, dur: 1.0 },
      { freq: D4, dur: 0.8 }, { freq: D4, dur: 0.8 }, { freq: D4, dur: 1.0 },
      { freq: C4, dur: 0.8 }, { freq: D4, dur: 0.8 }, { freq: C4, dur: 1.2 },
      { freq: B4 / 2, dur: 0.8 }, { freq: C4, dur: 0.8 }, { freq: D4, dur: 1.0 },
      { freq: E4, dur: 0.8 }, { freq: E4, dur: 0.8 }, { freq: E4, dur: 1.2 },
      { freq: D4, dur: 0.8 }, { freq: E4, dur: 0.8 }, { freq: F4, dur: 1.2 },
      { freq: E4, dur: 0.8 }, { freq: F4, dur: 0.8 }, { freq: G4, dur: 1.4 },
      { freq: G4, dur: 0.8 }, { freq: G4, dur: 0.8 }, { freq: F4, dur: 0.8 },
      { freq: E4, dur: 0.8 }, { freq: D4, dur: 0.8 }, { freq: F4, dur: 1.2 },
      { freq: E4, dur: 0.8 }, { freq: E4, dur: 0.8 }, { freq: D4, dur: 0.8 },
      { freq: D4, dur: 0.8 }, { freq: C4, dur: 0.8 }, { freq: D4, dur: 0.8 }, { freq: C4, dur: 1.6 },
      // Jaya he
      { freq: G4, dur: 0.9 }, { freq: G4, dur: 0.9 }, { freq: G4, dur: 0.9 }, { freq: G4, dur: 1.2 },
      { freq: A4, dur: 0.9 }, { freq: A4, dur: 0.9 }, { freq: A4, dur: 0.9 }, { freq: G4, dur: 1.2 },
      { freq: F4, dur: 0.9 }, { freq: E4, dur: 0.9 }, { freq: D4, dur: 0.9 }, { freq: F4, dur: 1.2 },
      { freq: E4, dur: 0.9 }, { freq: D4, dur: 0.9 }, { freq: C4, dur: 2.4 }
    ],
  },
  {
    id: 2,
    title: "Vande Mataram",
    artist: "Bankim Chandra Chattopadhyay",
    film: "National Song (Raag Desh)",
    year: 1882,
    duration: 46,
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_India.svg/320px-Flag_of_India.svg.png",
    notes: [
      { freq: D4, dur: 1.0 }, { freq: F4, dur: 1.0 }, { freq: G4, dur: 1.4 },
      { freq: G4, dur: 1.0 }, { freq: A4, dur: 1.0 }, { freq: G4, dur: 1.4 },
      { freq: F4, dur: 1.0 }, { freq: D4, dur: 1.0 }, { freq: F4, dur: 1.0 }, { freq: G4, dur: 2.0 },
      { freq: B4, dur: 1.0 }, { freq: C5, dur: 1.0 }, { freq: D5, dur: 1.6 },
      { freq: C5, dur: 1.0 }, { freq: B4, dur: 1.0 }, { freq: A4, dur: 1.2 },
      { freq: G4, dur: 1.0 }, { freq: F4, dur: 1.0 }, { freq: G4, dur: 2.2 },
      { freq: D4, dur: 1.0 }, { freq: F4, dur: 1.0 }, { freq: G4, dur: 1.2 },
      { freq: A4, dur: 1.0 }, { freq: B4, dur: 1.0 }, { freq: A4, dur: 1.2 },
      { freq: G4, dur: 1.0 }, { freq: F4, dur: 1.0 }, { freq: D4, dur: 2.4 },
      { freq: F4, dur: 1.0 }, { freq: G4, dur: 1.0 }, { freq: A4, dur: 1.2 },
      { freq: B4, dur: 1.0 }, { freq: C5, dur: 1.0 }, { freq: D5, dur: 1.6 },
      { freq: C5, dur: 1.0 }, { freq: B4, dur: 1.0 }, { freq: A4, dur: 1.2 },
      { freq: G4, dur: 2.8 }
    ],
  },
  {
    id: 3,
    title: "Sare Jahan Se Achha",
    artist: "Muhammad Iqbal",
    film: "Patriotic Symphony",
    year: 1904,
    duration: 40,
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_India.svg/320px-Flag_of_India.svg.png",
    notes: [
      { freq: C4, dur: 0.9 }, { freq: D4, dur: 0.9 }, { freq: E4, dur: 1.2 },
      { freq: F4, dur: 0.9 }, { freq: G4, dur: 1.4 }, { freq: G4, dur: 1.0 },
      { freq: A4, dur: 1.0 }, { freq: G4, dur: 1.2 }, { freq: F4, dur: 1.0 }, { freq: E4, dur: 1.6 },
      { freq: D4, dur: 1.0 }, { freq: E4, dur: 1.0 }, { freq: F4, dur: 1.2 },
      { freq: G4, dur: 1.0 }, { freq: A4, dur: 1.0 }, { freq: B4, dur: 1.4 },
      { freq: C5, dur: 1.4 }, { freq: B4, dur: 1.0 }, { freq: A4, dur: 1.2 }, { freq: G4, dur: 2.0 },
      { freq: F4, dur: 1.0 }, { freq: E4, dur: 1.0 }, { freq: D4, dur: 1.2 },
      { freq: C4, dur: 1.0 }, { freq: D4, dur: 1.0 }, { freq: E4, dur: 1.2 }, { freq: C4, dur: 2.6 }
    ],
  },
  {
    id: 4,
    title: "Ae Mere Watan Ke Logon",
    artist: "Lata Mangeshkar & C. Ramchandra",
    film: "National Tribute",
    year: 1963,
    duration: 44,
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_India.svg/320px-Flag_of_India.svg.png",
    notes: [
      { freq: G4, dur: 1.1 }, { freq: C5, dur: 1.1 }, { freq: B4, dur: 1.1 }, { freq: A4, dur: 1.4 },
      { freq: G4, dur: 1.1 }, { freq: A4, dur: 1.1 }, { freq: G4, dur: 1.1 }, { freq: F4, dur: 1.8 },
      { freq: F4, dur: 1.0 }, { freq: A4, dur: 1.0 }, { freq: G4, dur: 1.0 }, { freq: F4, dur: 1.4 },
      { freq: E4, dur: 1.0 }, { freq: F4, dur: 1.0 }, { freq: E4, dur: 1.0 }, { freq: D4, dur: 2.0 },
      { freq: D4, dur: 1.0 }, { freq: G4, dur: 1.0 }, { freq: F4, dur: 1.0 }, { freq: E4, dur: 1.4 },
      { freq: D4, dur: 1.0 }, { freq: E4, dur: 1.0 }, { freq: D4, dur: 1.0 }, { freq: C4, dur: 2.6 }
    ],
  },
];

// ─── Format helpers ───────────────────────────────────────────────────────

function formatTime(s: number): string {
  if (isNaN(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// ─── Sub-components (module scope — never remount) ────────────────────────

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

// ─── Main Player (Universal Web Audio Engine) ─────────────────────────────

export default function Player() {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<{ osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode }[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedProgressRef = useRef<number>(0);

  const trackIndexRef = useRef(trackIndex);
  trackIndexRef.current = trackIndex;

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentTrack = tracks[trackIndex];

  // ── Web Audio Engine ─────────────────────────────────────────────────

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const stopAudio = useCallback(() => {
    activeNodesRef.current.forEach(({ osc1, osc2, gain }) => {
      try {
        gain.gain.setValueAtTime(0, audioCtxRef.current?.currentTime || 0);
        osc1.stop();
        osc2.stop();
        osc1.disconnect();
        osc2.disconnect();
        gain.disconnect();
      } catch {}
    });
    activeNodesRef.current = [];

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTrackPlayback = useCallback((track: Track, fromOffsetSeconds: number = 0) => {
    stopAudio();

    const ctx = getAudioContext();
    if (!track.notes || track.notes.length === 0) return;

    // Calculate total duration from note lengths
    const totalNoteDuration = track.notes.reduce((sum, n) => sum + n.dur, 0);
    setDuration(totalNoteDuration);

    const now = ctx.currentTime;
    startTimeRef.current = now - fromOffsetSeconds;

    let noteStartTime = 0;

    track.notes.forEach((note) => {
      const noteEndTime = noteStartTime + note.dur;

      // Only schedule notes that occur after current offset
      if (noteEndTime > fromOffsetSeconds) {
        const scheduleAt = Math.max(now, now + (noteStartTime - fromOffsetSeconds));
        const effectiveDur = note.dur * 0.92;

        // Acoustic Harmonics (Flute & Sitar Tone)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const subOsc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Fundamental Sine
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(note.freq, scheduleAt);

        // Warm Triangle 2nd Harmonic
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(note.freq * 2, scheduleAt);

        // Tanpura Warmth Sub
        subOsc.type = "sine";
        subOsc.frequency.setValueAtTime(note.freq * 0.5, scheduleAt);

        // Volume Envelope
        const masterVol = 0.28;
        gainNode.gain.setValueAtTime(0.001, scheduleAt);
        gainNode.gain.exponentialRampToValueAtTime(masterVol, scheduleAt + 0.08); // Gentle Attack
        gainNode.gain.setValueAtTime(masterVol * 0.85, scheduleAt + effectiveDur * 0.7); // Sustain
        gainNode.gain.exponentialRampToValueAtTime(0.0001, scheduleAt + effectiveDur); // Gentle Release

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        subOsc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(scheduleAt);
        osc2.start(scheduleAt);
        subOsc.start(scheduleAt);

        const stopAt = scheduleAt + effectiveDur + 0.05;
        osc1.stop(stopAt);
        osc2.stop(stopAt);
        subOsc.stop(stopAt);

        activeNodesRef.current.push({ osc1, osc2, gain: gainNode });
      }

      noteStartTime += note.dur;
    });

    setIsPlaying(true);

    // Real-time Progress Timer
    timerRef.current = setInterval(() => {
      const currentElapsed = ctx.currentTime - startTimeRef.current;
      if (currentElapsed >= totalNoteDuration) {
        stopAudio();
        // Advance to next track
        const next = (trackIndexRef.current + 1) % tracks.length;
        setTrackIndex(next);
        pausedProgressRef.current = 0;
        setProgress(0);
        startTrackPlayback(tracks[next], 0);
      } else {
        setProgress(currentElapsed);
        pausedProgressRef.current = currentElapsed;
      }
    }, 100);
  }, [getAudioContext, stopAudio]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      startTrackPlayback(tracks[trackIndex], pausedProgressRef.current);
    }
  }, [isPlaying, startTrackPlayback, stopAudio, trackIndex]);

  const nextTrack = useCallback(() => {
    const next = (trackIndexRef.current + 1) % tracks.length;
    setTrackIndex(next);
    pausedProgressRef.current = 0;
    setProgress(0);
    if (isPlayingRef.current) {
      startTrackPlayback(tracks[next], 0);
    }
  }, [startTrackPlayback]);

  const prevTrack = useCallback(() => {
    const prev = (trackIndexRef.current - 1 + tracks.length) % tracks.length;
    setTrackIndex(prev);
    pausedProgressRef.current = 0;
    setProgress(0);
    if (isPlayingRef.current) {
      startTrackPlayback(tracks[prev], 0);
    }
  }, [startTrackPlayback]);

  const handleSeek = useCallback(
    (fraction: number) => {
      const totalDur = duration || currentTrack.duration;
      const seekTo = fraction * totalDur;
      setProgress(seekTo);
      pausedProgressRef.current = seekTo;
      if (isPlaying) {
        startTrackPlayback(currentTrack, seekTo);
      }
    },
    [currentTrack, duration, isPlaying, startTrackPlayback]
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
        startTrackPlayback(tracks[trackIndexRef.current], pausedProgressRef.current);
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        stopAudio();
        setIsPlaying(false);
      });
      navigator.mediaSession.setActionHandler("previoustrack", prevTrack);
      navigator.mediaSession.setActionHandler("nexttrack", nextTrack);
    }
  }, [currentTrack, nextTrack, prevTrack, startTrackPlayback, stopAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  const effectiveDuration = duration || currentTrack.duration;

  return (
    <div className="w-full flex flex-col items-center safe-bottom px-4 pb-4 sm:px-6 sm:pb-6">
      {/* ═══════════ UNIFIED RESPONSIVE GLASS PLAYER ═══════════ */}
      <div className="glass w-full max-w-sm sm:max-w-xl rounded-[26px] sm:rounded-full p-4 sm:p-3 sm:pr-5 transition-all duration-300">
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
                {/* Vinyl Grooves Texture */}
                <div
                  className="absolute inset-0 rounded-full opacity-60 pointer-events-none"
                  style={{
                    background: "repeating-radial-gradient(circle, #333 0px, #1a1a1a 2px, #0a0a0a 4px)",
                  }}
                />

                {/* Album Art Label in the Center */}
                <div className="absolute inset-3 sm:inset-4 rounded-full overflow-hidden border border-white/30 shadow-inner">
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />
                </div>
              </div>

              {/* Center Spindle hole */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-black ring-2 ring-white/50 pointer-events-none z-10" />
            </div>

            {/* Mobile-only Track Info beside Vinyl */}
            <div className="flex-1 min-w-0 sm:hidden">
              <div className="text-[15px] font-semibold text-white truncate leading-tight">
                {currentTrack.title}
              </div>
              <div className="text-[12.5px] text-white/70 truncate leading-tight">
                {currentTrack.artist}
              </div>
              <div className="text-[11px] text-white/40 truncate leading-tight">
                {currentTrack.film} ({currentTrack.year})
              </div>
            </div>
          </div>

          {/* Desktop Center: Title, Artist, Seek Bar, Time */}
          <div className="hidden sm:flex flex-1 min-w-0 flex-col gap-1">
            <div className="flex flex-col">
              <span className="text-[15px] font-semibold text-white truncate leading-tight">
                {currentTrack.title}
              </span>
              <span className="text-[12.5px] text-white/70 truncate leading-tight">
                {currentTrack.artist} · {currentTrack.film} ({currentTrack.year})
              </span>
            </div>
            <SeekBar
              progress={progress}
              duration={effectiveDuration}
              onSeek={handleSeek}
            />
            <div className="flex justify-between text-[10.5px] text-white/40 tabular-nums -mt-1">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(effectiveDuration)}</span>
            </div>
          </div>

          {/* Desktop Right: Transport */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <button
              onClick={prevTrack}
              className="p-2 text-white/60 hover:text-white transition-colors cursor-pointer"
              aria-label="Previous track"
            >
              <PrevIcon />
            </button>
            <button
              onClick={togglePlay}
              className="p-2 text-white hover:text-accent transition-colors cursor-pointer"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button
              onClick={nextTrack}
              className="p-2 text-white/60 hover:text-white transition-colors cursor-pointer"
              aria-label="Next track"
            >
              <NextIcon />
            </button>
          </div>

          {/* Mobile-only Row 2: Full-width Seek Bar */}
          <div className="sm:hidden w-full">
            <SeekBar
              progress={progress}
              duration={effectiveDuration}
              onSeek={handleSeek}
            />
          </div>

          {/* Mobile-only Row 3: Elapsed/duration + Transport */}
          <div className="sm:hidden flex items-center justify-between w-full">
            <div className="text-[10.5px] text-white/40 tabular-nums flex gap-1">
              <span>{formatTime(progress)}</span>
              <span>/</span>
              <span>{formatTime(effectiveDuration)}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={prevTrack}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
                aria-label="Previous track"
              >
                <PrevIcon />
              </button>
              <button
                onClick={togglePlay}
                className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-white ring-1 ring-white/25 cursor-pointer"
                style={{
                  background: "linear-gradient(to bottom, #FF9933, #E67300)",
                  boxShadow: "0 4px 16px rgba(255, 153, 51, 0.4)",
                }}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
              </button>
              <button
                onClick={nextTrack}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
                aria-label="Next track"
              >
                <NextIcon />
              </button>
            </div>

            <div className="w-12" />
          </div>

        </div>
      </div>
    </div>
  );
}
