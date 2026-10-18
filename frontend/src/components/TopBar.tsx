"use client";

import React, { useState } from "react";

export default function TopBar() {
  const [search, setSearch] = useState("");

  return (
    <header className="h-16 border-b border-zinc-800 bg-[#090a0f]/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Search & Filter */}
      <div className="flex items-center gap-3 w-80 md:w-96">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500">
            <svg className="w-4 h-4 shrink-0" width="16" height="16" style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search receipts, vendors, amounts..."
            className="w-full bg-[#11131a] border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
          />
        </div>
      </div>

      {/* Top right actions */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Quick status */}
        <div className="hidden sm:flex items-center gap-2 text-xs bg-[#11131a] border border-zinc-800 px-3 py-1.5 rounded-xl text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>FastAPI Engine: <strong className="text-zinc-200 font-medium">Online</strong></span>
        </div>

        {/* Profile / Hacktoberfest week badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-zinc-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-xs font-black text-zinc-950 shrink-0">
            DL
          </div>
          <div className="hidden md:block text-left text-xs">
            <div className="font-semibold text-zinc-200">Freelancer Vault</div>
            <div className="text-[10px] text-zinc-500">Tax Year 2026</div>
          </div>
        </div>
      </div>
    </header>
  );
}
