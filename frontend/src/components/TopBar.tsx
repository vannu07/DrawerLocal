"use client";

import React, { useState } from "react";

export default function TopBar() {
  const [search, setSearch] = useState("");

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950/60 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Search & Filter */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors, categories, amounts..."
            className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
          />
        </div>
      </div>

      {/* Top right actions */}
      <div className="flex items-center gap-4">
        {/* Quick status */}
        <div className="hidden sm:flex items-center gap-2 text-xs bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>FastAPI Engine: <strong className="text-zinc-200 font-medium">Ready</strong></span>
        </div>

        {/* Action Button: Export */}
        <a
          href="http://localhost:8000/api/v1/documents/export?format=csv"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </a>

        {/* Profile / Hacktoberfest week badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold text-zinc-950">
            DL
          </div>
          <div className="hidden md:block text-left text-xs">
            <div className="font-semibold text-zinc-200">Freelancer Workspace</div>
            <div className="text-[10px] text-zinc-500">Tax Year 2026</div>
          </div>
        </div>
      </div>
    </header>
  );
}
