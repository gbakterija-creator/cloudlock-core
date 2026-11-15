"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  CheckCircle2, 
  Terminal, 
  ShieldCheck, 
  HardDrive, 
  Activity, 
  ArrowLeft, 
  Copy, 
  Check, 
  Loader2, 
  AlertCircle 
} from "lucide-react";

function StudioContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(!!sessionId);
  const [sessionData, setSessionData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    fetch(`/api/checkout/session?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setSessionData(data);
        }
      })
      .catch((err) => console.error("Error fetching session:", err))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const copyMountCommand = () => {
    navigator.clipboard.writeText("cloudlock mount --drive Z: --cluster eu-central-1");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-[#D4D4D8] font-mono selection:bg-neutral-200 selection:text-black">
      {/* Background Grid Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.035]" 
        style={{
          backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />

      {/* Navigacija */}
      <nav className="border-b border-neutral-800 bg-[#070709]/90 backdrop-blur sticky top-0 z-50 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-neutral-500 hover:text-white transition flex items-center gap-1">
              <ArrowLeft size={13} />
              <span>RETURN_HOME</span>
            </Link>
            <span className="text-neutral-700">/</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 animate-pulse" />
              <span className="font-bold tracking-widest text-white uppercase">CLOUDLOCK STUDIO // CONTROLLER</span>
            </div>
          </div>
          <div className="text-[10px] text-neutral-500 font-mono">SYS_BUILD: 2026.11 // PROD</div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12 relative z-10 space-y-8">
        {/* Provjera u tijeku */}
        {loading && (
          <div className="border border-neutral-800 bg-[#0C0C0E] p-12 text-center space-y-3">
            <Loader2 size={24} className="animate-spin text-emerald-400 mx-auto" />
            <div className="text-sm font-bold text-white uppercase">Verifying Provisioning Session...</div>
            <p className="text-xs text-neutral-500">Contacting Stripe billing engine and allocating storage shards.</p>
          </div>
        )}

        {/* Uspješna aktivacija preko Stripe sesije */}
        {!loading && sessionData && (
          <div className="border-2 border-emerald-500/80 bg-[#0A120E] p-8 shadow-2xl relative">
            <div className="absolute -top-3 left-6 bg-[#070709] px-3 text-[10px] text-emerald-400 uppercase tracking-widest border border-emerald-800">
              ACTIVATION COMPLETED // PILOT INITIALIZED
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-emerald-950">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase mb-1">
                  <CheckCircle2 size={16} />
                  <span>Subscription Provisioned Successfully</span>
                </div>
                <h1 className="text-2xl font-bold text-white uppercase">{sessionData.planName}</h1>
                <p className="text-xs text-neutral-400 mt-1">
                  Account bound to: <strong className="text-white">{sessionData.customerEmail}</strong>
                </p>
              </div>

              <div className="text-left md:text-right">
                <span className="text-[10px] text-neutral-500 uppercase block">Billing Status</span>
                <span className="text-lg font-bold text-emerald-400">14-Day Free Pilot Active</span>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  Renewal rate: €{sessionData.amountTotal} / month
                </div>
              </div>
            </div>

            {/* Brze upute za Windows klijent */}
            <div className="pt-6 space-y-4">
              <div className="text-xs font-bold text-white uppercase">Step 1: Mount Drive Z:\ in Windows</div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Run the following command in PowerShell (Administrator) to start the local VFS daemon and mount your cloud volume:
              </p>

              <div className="bg-[#070709] border border-neutral-800 p-3 flex items-center justify-between text-xs font-mono">
                <code className="text-emerald-400">cloudlock mount --drive Z: --cluster eu-central-1</code>
                <button 
                  onClick={copyMountCommand} 
                  className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white transition flex items-center gap-1 text-[11px]"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copied ? "COPIED" : "COPY"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Normalni prikaz Studija ako posjetitelj uđe bez session_id */}
        {!loading && !sessionData && (
          <div className="border border-neutral-800 bg-[#0C0C0E] p-8 relative">
            <div className="absolute -top-3 left-6 bg-[#070709] px-3 text-[10px] text-neutral-500 uppercase tracking-widest border border-neutral-800">
              VFS ENGINE STATUS // DIAGNOSTIC MODE
            </div>

            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800">
              <div>
                <h1 className="text-xl font-bold text-white uppercase">CloudLock VFS Node Inspector</h1>
                <p className="text-xs text-neutral-400">Local daemon telemetry and shard synchronization monitor.</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-amber-400 text-[11px] font-bold">READY FOR PAIRING</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="border border-neutral-800 bg-[#070709] p-4">
                <div className="text-neutral-500 text-[10px] uppercase mb-1">Assigned Virtual Target</div>
                <div className="text-white font-bold text-sm">Z:\ (Windows Drive)</div>
                <div className="text-emerald-400 text-[10px] mt-2">I/O Intercept: WinFsp Driver</div>
              </div>
              <div className="border border-neutral-800 bg-[#070709] p-4">
                <div className="text-neutral-500 text-[10px] uppercase mb-1">Local NVMe Cache Staging</div>
                <div className="text-white font-bold text-sm">BYOD Path // C:\.cloudlock\cache</div>
                <div className="text-neutral-400 text-[10px] mt-2">Write-Back Buffer: Active</div>
              </div>
              <div className="border border-neutral-800 bg-[#070709] p-4">
                <div className="text-neutral-500 text-[10px] uppercase mb-1">Security &amp; Encryption</div>
                <div className="text-white font-bold text-sm">AES-256-GCM Zero-Knowledge</div>
                <div className="text-emerald-400 text-[10px] mt-2">Client-Side Keys Only</div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-xs text-neutral-400">
                Want to activate full cloud streaming with unlimited cold storage?
              </div>
              <Link 
                href="/#pricing" 
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase text-xs tracking-wider transition"
              >
                Provision Pilot License &gt;
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070709] flex items-center justify-center text-xs font-mono text-neutral-500">
        <Loader2 size={16} className="animate-spin text-emerald-400 mr-2" />
        INITIALIZING STUDIO...
      </div>
    }>
      <StudioContent />
    </Suspense>
  );
}