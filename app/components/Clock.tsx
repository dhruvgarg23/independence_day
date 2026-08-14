"use client";

import { useState, useEffect } from "react";

export default function Clock() {
  const [time, setTime] = useState<{ hours: string; minutes: string; period: string } | null>(null);

  useEffect(() => {
    function tick() {
      const formatter = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const raw = formatter.format(new Date());
      // raw is like "11:30 pm"
      const match = raw.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
      if (match) {
        setTime({
          hours: match[1],
          minutes: match[2],
          period: match[3].toUpperCase(),
        });
      }
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) {
    return <div className="h-5" aria-hidden />;
  }

  return (
    <div className="flex items-baseline gap-0.5 text-white/90 tabular-nums font-medium text-sm tracking-wide select-none">
      <span>{time.hours}</span>
      <span className="animate-blink">:</span>
      <span>{time.minutes}</span>
      <span className="ml-1 text-[10px] text-white/50 font-normal">{time.period}</span>
      <span className="ml-1.5 text-[10px] text-white/40 font-normal">IST</span>
    </div>
  );
}
