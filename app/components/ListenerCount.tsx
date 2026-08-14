"use client";

import { useState, useEffect, useRef } from "react";

export default function ListenerCount() {
  const [count, setCount] = useState(0);
  const targetRef = useRef(0);

  useEffect(() => {
    // Simulated listener count — slowly drifts around a base
    const base = 200 + Math.floor(Math.random() * 300);
    targetRef.current = base;
    setCount(base);

    const drift = setInterval(() => {
      targetRef.current += Math.floor(Math.random() * 7) - 3; // -3 to +3
      if (targetRef.current < 800) targetRef.current = 800;
      if (targetRef.current > 2000) targetRef.current = 2000;
      setCount(targetRef.current);
    }, 5000);

    return () => clearInterval(drift);
  }, []);

  if (count === 0) return null;

  return (
    <div className="flex items-center gap-1.5 text-white/60 text-xs font-medium select-none">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
      </span>
      <span className="tabular-nums">{count.toLocaleString("en-IN")}</span>
      <span className="hidden sm:inline">listening</span>
    </div>
  );
}
