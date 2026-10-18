"use client";

import React, { useState } from "react";

export default function BadgeMode() {
  const [demoMode, setDemoMode] = useState(true);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg shadow-emerald-950/30 text-xs">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span className="font-medium text-emerald-300">
        Local Gemma 3 Engine
      </span>
      <span className="text-emerald-500/60">|</span>
      <span className="text-zinc-400">Zero Cloud Egress</span>
      <button
        onClick={() => setDemoMode(!demoMode)}
        className="ml-1 text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded transition-colors"
      >
        {demoMode ? "Demo Mode" : "Live Local"}
      </button>
    </div>
  );
}
