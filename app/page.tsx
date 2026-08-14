import Clock from "./components/Clock";
import ListenerCount from "./components/ListenerCount";
import SocialLinks from "./components/SocialLinks";
import Player from "./components/Player";

export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col items-center justify-between overflow-hidden">
      {/* ── Fixed background ── */}
      <div className="fixed inset-0 -z-20 hero-bg bg-cover bg-center" />
      {/* Gradient overlay */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-b from-black/35 via-transparent to-black/80" />

      {/* ── Grain overlay ── */}
      <div
        className="fixed inset-0 -z-10 grain opacity-30 pointer-events-none"
        style={{ mixBlendMode: "overlay" }}
      />

      {/* ── Top row ── */}
      <div className="w-full flex items-start justify-between safe-top safe-left safe-right px-4 pt-4 sm:px-6 sm:pt-6 z-10">
        {/* Clock — top left */}
        <Clock />
        {/* Listener count — top centre */}
        <ListenerCount />
        {/* Social links — top right */}
        <SocialLinks />
      </div>

      {/* Spacer pushes player down */}
      <div className="flex-1" />

      {/* ── Player — bottom anchored ── */}
      <div className="w-full max-w-2xl z-10">
        <Player />
      </div>
    </main>
  );
}
