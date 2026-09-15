"use client";

export default function LivePulse({ label = "LIVE" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="live-dot relative inline-flex rounded-full h-3 w-3 bg-green-500" />
      </span>
      <span className="text-xs font-bold tracking-widest text-green-400 uppercase">
        {label}
      </span>
    </div>
  );
}
