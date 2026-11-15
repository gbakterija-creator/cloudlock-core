import React from 'react';

export default function DownloadsPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6 selection:bg-neutral-800">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold text-lg">
            CL
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white">CloudLock Alati & Integracije</h1>
            <p className="text-xs text-neutral-400">Automatizirane skripte i uslužni programi za produkciju</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-neutral-200">DaVinci Resolve Auto-Configurator</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Automatski montira Z: disk i preusmjerava CacheClip / Proxy na lokalni SSD.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-mono uppercase bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded">Windows (.bat)</span>
                <span className="text-[10px] text-neutral-500">v1.0 • 1-Click Setup</span>
              </div>
            </div>

            <a
              href="/downloads/CloudLock_Setup_DaVinci.bat"
              download="CloudLock_Setup_DaVinci.bat"
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-white text-black text-xs font-semibold rounded-lg hover:bg-neutral-200 active:scale-95 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Preuzmi
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
          <span>Trebate pomoć oko postavljanja?</span>
          <a href="/studio" className="text-neutral-400 hover:text-white transition-colors underline underline-offset-4">
            Povratak u Studio
          </a>
        </div>
      </div>
    </main>
  );
}