"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Terminal, 
  Activity, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Server, 
  Lock, 
  Database, 
  HardDrive, 
  FileCheck2, 
  Package, 
  Laptop, 
  CheckCircle2, 
  Clock, 
  Loader2
} from "lucide-react";

export default function LandingPage() {
  const [activeTb, setActiveTb] = useState(2);
  const [archiveTb, setArchiveTb] = useState(10);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSent, setWaitlistSent] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  // Kalkulacija troškova
  const activeCost = 29 + Math.max(0, activeTb - 1) * 20;
  const archiveCost = archiveTb * 5;
  const monthlySubscription = activeCost + archiveCost;
  const hardwareNasCost = Math.round(activeTb * 45 + archiveTb * 15 + 85);

  const handleCheckout = async () => {
    setLoadingCheckout(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeTb, archiveTb }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Please configure your STRIPE_SECRET_KEY in Vercel environment variables.");
      }
    } catch (err) {
      alert("Error initiating checkout. Check connection.");
    } finally {
      setLoadingCheckout(false);
    }
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail) return;
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: waitlistEmail }),
      });
      setWaitlistSent(true);
    } catch {
      setWaitlistSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-[#D4D4D8] font-mono selection:bg-neutral-200 selection:text-black">
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.035]" 
        style={{
          backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />

      {/* Top Navigacija */}
      <nav className="border-b border-neutral-800 bg-[#070709]/90 backdrop-blur sticky top-0 z-50 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 animate-pulse" />
              <span className="font-bold tracking-widest text-white uppercase">CLOUDLOCK // VFS-CORE</span>
            </div>
            <span className="hidden md:inline text-neutral-600 font-mono">SYS_VER: 2.4.1_PROD // WIN64</span>
          </div>

          <div className="hidden lg:flex items-center gap-6 text-[11px] text-neutral-400">
            <a href="#how-it-works" className="hover:text-white transition">HOW IT WORKS</a>
            <a href="#deployment" className="hover:text-white transition">SOFTWARE &amp; HARDWARE</a>
            <a href="#comparison" className="hover:text-white transition">COMPARISON</a>
            <a href="#pricing" className="hover:text-white transition">CALCULATOR</a>
            <a href="#legal" className="hover:text-white transition">SECURITY &amp; DPA</a>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/studio" 
              className="px-3 py-1.5 border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white transition flex items-center gap-1.5"
            >
              <Terminal size={12} className="text-emerald-400" />
              <span>TEST DRIVE Z:\</span>
            </Link>
            <a 
              href="#pricing" 
              className="px-4 py-1.5 bg-neutral-200 hover:bg-white text-black font-semibold uppercase tracking-wider transition"
            >
              Activate System
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-10 space-y-16">
        {/* Hero Section */}
        <section className="border border-neutral-800 bg-[#0C0C0E] p-8 md:p-12 relative">
          <div className="absolute -top-3 left-6 bg-[#070709] px-3 text-[10px] text-neutral-500 uppercase tracking-widest border border-neutral-800">
            SYSTEM SPECIFICATION // CREATIVE WORKFLOW STORAGE
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 text-[10px] uppercase text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 mb-4">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                Available Now on Windows // Native Virtual File System
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6 uppercase leading-tight font-sans">
                Your Multi-Cloud Storage. <br className="hidden md:inline" />
                Mounted as a Local Drive Z:\ in Windows.
              </h1>
              <p className="text-neutral-400 text-xs md:text-sm leading-relaxed mb-8 max-w-2xl font-mono">
                Eliminate slow cloud sync and expensive on-prem NAS arrays. CloudLock mounts drive <strong>Z:\</strong> directly into Windows Explorer. Scrub, edit, and render 4K/8K RAW footage at local NVMe speeds while files are sharded across distributed EU object storage in the background.
              </p>

              <div className="flex flex-wrap gap-4 text-xs">
                <a 
                  href="#pricing" 
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-wider transition flex items-center gap-2"
                >
                  <span>Start 14-Day Free Pilot</span>
                  <ArrowRight size={14} />
                </a>
                <Link 
                  href="/studio" 
                  className="px-6 py-3 border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white transition flex items-center gap-2"
                >
                  <Activity size={14} className="text-emerald-400" />
                  <span>Inspect Drive Z:\</span>
                </Link>
              </div>
            </div>

            {/* Hardware Telemetry Mock Panel */}
            <div className="lg:col-span-4 border border-neutral-800 bg-[#070709] p-5 text-xs space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-neutral-800 text-[10px] text-neutral-500 uppercase">
                <span>System Status</span>
                <span className="text-emerald-400 font-bold">OPERATIONAL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Mount Target:</span>
                <span className="text-neutral-200 font-bold">Z:\ (Windows Explorer)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">NLE Compatibility:</span>
                <span className="text-neutral-200">Premiere, DaVinci, Blender, Nuke</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Security Layer:</span>
                <span className="text-neutral-200">Zero-Knowledge (Client-Side Key)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Distributed Parity:</span>
                <span className="text-neutral-200">Reed-Solomon (4+2 Multi-Node)</span>
              </div>
              <div className="pt-2 border-t border-neutral-800 text-[11px] text-emerald-400 flex items-center gap-2">
                <CheckCircle2 size={13} />
                <span>Zero system disk C:\ overhead</span>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="border border-neutral-800 bg-[#0C0C0E] p-8 md:p-12 relative">
          <div className="absolute -top-3 left-6 bg-[#070709] px-3 text-[10px] text-neutral-500 uppercase tracking-widest border border-neutral-800">
            ENGINEERING WORKFLOW // HOW IT OPERATES
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="border border-neutral-800 bg-[#070709] p-6 flex flex-col justify-between">
              <div>
                <span className="text-neutral-600 font-bold text-sm block mb-2">[01]</span>
                <h3 className="text-white font-bold uppercase mb-2">Native Windows Drive Mount</h3>
                <p className="text-neutral-400 leading-relaxed">
                  The desktop agent maps a dedicated virtual volume into Windows. No web portals to learn. Access all studio projects directly from standard file pickers and desktop applications.
                </p>
              </div>
              <div className="mt-6 text-[10px] text-neutral-500 border-t border-neutral-800 pt-2 uppercase">
                Appears as a Standard Internal Drive
              </div>
            </div>

            <div className="border border-neutral-800 bg-[#070709] p-6 flex flex-col justify-between">
              <div>
                <span className="text-emerald-500 font-bold text-sm block mb-2">[02]</span>
                <h3 className="text-white font-bold uppercase mb-2">Sparse On-Demand Streaming</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Never download an entire 80 GB camera master. As you scrub through a timeline in Premiere or DaVinci, only the specific byte ranges and frames currently in view are pulled into the local cache.
                </p>
              </div>
              <div className="mt-6 text-[10px] text-emerald-500 border-t border-neutral-800 pt-2 uppercase">
                Zero Waiting for Downloads
              </div>
            </div>

            <div className="border border-neutral-800 bg-[#070709] p-6 flex flex-col justify-between">
              <div>
                <span className="text-sky-400 font-bold text-sm block mb-2">[03]</span>
                <h3 className="text-white font-bold uppercase mb-2">Write-Back NVMe Staging</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Render directly to Z:\ at maximum NVMe write speeds (2000+ MB/s). The system stages data locally and asynchronously encrypts and shards chunks across cloud nodes without locking your editor.
                </p>
              </div>
              <div className="mt-6 text-[10px] text-sky-400 border-t border-neutral-800 pt-2 uppercase">
                Continuous Background Protection
              </div>
            </div>
          </div>
        </section>

        {/* Deployment Options */}
        <section id="deployment" className="border border-neutral-800 bg-[#0C0C0E] p-8 md:p-12 relative">
          <div className="absolute -top-3 left-6 bg-[#070709] px-3 text-[10px] text-neutral-500 uppercase tracking-widest border border-neutral-800">
            DEPLOYMENT CHOICES // BRING-YOUR-OWN-DRIVE OR DEDICATED HARDWARE
          </div>

          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-white uppercase mb-2">
              Select Your Local NVMe Staging Setup
            </h2>
            <p className="text-neutral-400 text-xs">
              To deliver ultra-low latency, CloudLock requires a fast local NVMe cache folder. You can leverage an existing SSD drive on your workstation, or reserve our upcoming tactical hardware accelerator.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option A: BYOD */}
            <div className="border-2 border-emerald-500/80 bg-[#0A120E] p-6 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase text-white">
                    <Laptop size={16} className="text-emerald-400" />
                    <span>Option A // Software License (BYOD)</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500 text-black font-bold px-2 py-0.5 uppercase">
                    AVAILABLE NOW
                  </span>
                </div>

                <div className="text-2xl font-bold text-white mb-2">€0 <span className="text-xs text-neutral-500 font-normal">hardware cost</span></div>
                <p className="text-xs text-neutral-300 mb-6 leading-relaxed">
                  Best for freelance artists and studios with available internal PCIe M.2 slots or high-speed portable SSDs. Map any local path as your staging cache.
                </p>

                <ul className="space-y-2.5 text-xs text-neutral-300 border-t border-neutral-800 pt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>Utilize your existing high-speed local storage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>Instant digital activation in under 60 seconds</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>Pay only for active cloud storage and deep vault archiving</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-mono">14-Day Free Pilot Included</span>
                <a 
                  href="#pricing"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase text-[11px] transition"
                >
                  Configure Storage &gt;
                </a>
              </div>
            </div>

            {/* Option B: Tactical Pod */}
            <div className="border border-neutral-800 bg-[#070709] p-6 flex flex-col justify-between relative overflow-hidden opacity-90">
              <div className="absolute top-0 right-0 bg-neutral-800 text-neutral-300 text-[10px] font-bold px-3 py-1 uppercase tracking-wider flex items-center gap-1.5 border-b border-l border-neutral-700">
                <Clock size={11} className="text-amber-400" />
                <span>COMING SOON // Q1 2027</span>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-neutral-300 mb-4 pt-1">
                  <Package size={16} className="text-amber-400" />
                  <span>CloudLock Tactical Accelerator Pod</span>
                </div>

                <div className="text-2xl font-bold text-neutral-400 mb-2">
                  ~€349 <span className="text-xs text-neutral-500 font-normal">one-time (Pre-Order)</span>
                </div>
                <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                  Turnkey, field-ready hardware for production teams. CNC milled aerospace-grade aluminum with integrated thermal fins, IP67 resistance, factory-tested 2TB NVMe, and 40 Gbps USB4 throughput.
                </p>

                <ul className="space-y-2.5 text-xs text-neutral-400 border-t border-neutral-800 pt-4">
                  <li className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span><strong>2 TB PCIe 4.0 NVMe</strong> pre-installed with zero thermal throttling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span><strong>USB4 / Thunderbolt 4 (40 Gbps)</strong> — single cable plug &amp; play</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>Ships in custom Pelican-style waterproof hard case with foam</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-neutral-800">
                {waitlistSent ? (
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-800 text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    <span>You are on the list! We will notify you when hardware ships.</span>
                  </div>
                ) : (
                  <form onSubmit={handleWaitlistSubmit} className="flex gap-2">
                    <input 
                      type="email" 
                      placeholder="Enter work email for priority access..."
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      required
                      className="bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs text-white placeholder-neutral-500 flex-1 focus:outline-none focus:border-neutral-400"
                    />
                    <button 
                      type="submit"
                      className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase transition whitespace-nowrap"
                    >
                      Join Waitlist
                    </button>
                  </form>
                )}
                <div className="text-[10px] text-neutral-500 mt-2">
                  * First 50 reservations receive a 20% early-adopter hardware discount.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Calculator */}
        <section id="pricing" className="border border-neutral-800 bg-[#0C0C0E] p-8 md:p-12 relative">
          <div className="absolute -top-3 left-6 bg-[#070709] px-3 text-[10px] text-neutral-500 uppercase tracking-widest border border-neutral-800">
            PROVISIONING CALCULATOR // FLEXIBLE SUBSCRIPTION
          </div>

          <div className="max-w-3xl mx-auto space-y-8">
            <div className="border border-neutral-800 bg-[#070709] p-4 text-xs flex items-center justify-between">
              <div>
                <span className="text-neutral-500 uppercase block text-[10px]">Active Deployment Model:</span>
                <span className="font-bold text-emerald-400">Software License (Bring Your Own Local NVMe)</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">Hardware: €0</span>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-3">
                <span className="text-white uppercase font-bold">1. Active Work Volume (Drive Z:\ for Current Projects)</span>
                <span className="text-emerald-400 font-bold text-sm bg-[#070709] px-2 py-0.5 border border-neutral-800">{activeTb} TB</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={activeTb} 
                onChange={(e) => setActiveTb(parseInt(e.target.value))}
                className="w-full accent-emerald-500 bg-neutral-800 h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-600 mt-1">
                <span>1 TB (Solo Freelance)</span>
                <span>4 TB (Studio Post Team)</span>
                <span>20 TB (Enterprise Production)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-3">
                <span className="text-white uppercase font-bold">2. Deep Vault Archive (Cold Long-Term Storage)</span>
                <span className="text-sky-400 font-bold text-sm bg-[#070709] px-2 py-0.5 border border-neutral-800">{archiveTb} TB</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="50" 
                step="5"
                value={archiveTb} 
                onChange={(e) => setArchiveTb(parseInt(e.target.value))}
                className="w-full accent-sky-500 bg-neutral-800 h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-600 mt-1">
                <span>0 TB</span>
                <span>25 TB</span>
                <span>50 TB</span>
              </div>
            </div>

            {/* Summary & Checkout Button */}
            <div className="border border-neutral-800 bg-[#070709] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Your Monthly Total:</div>
                <div className="text-3xl font-bold text-white mt-1">
                  €{monthlySubscription} <span className="text-xs text-neutral-500 font-normal">/ month + VAT</span>
                </div>
                <div className="text-[11px] text-emerald-400 mt-1">
                  Estimated monthly savings vs. on-prem NAS maintenance: ~€{Math.max(0, hardwareNasCost - monthlySubscription)}/mo
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={loadingCheckout}
                className="w-full md:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase text-xs tracking-wider transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingCheckout ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Connecting Stripe...</span>
                  </>
                ) : (
                  <>
                    <span>Start 14-Day Free Pilot</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Legal & Security */}
        <section id="legal" className="border border-neutral-800 bg-[#0C0C0E] p-8 md:p-12 relative">
          <div className="absolute -top-3 left-6 bg-[#070709] px-3 text-[10px] text-neutral-500 uppercase tracking-widest border border-neutral-800">
            ENTERPRISE SECURITY // EU COMPLIANCE (GDPR &amp; DPA)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-neutral-400">
            <div>
              <h4 className="text-white font-bold uppercase mb-2 flex items-center gap-2">
                <Lock size={14} className="text-emerald-400" /> Client-Side Encryption
              </h4>
              <p className="leading-relaxed">
                All data is encrypted locally on your workstation using AES-256-GCM before transmission. Encryption keys never leave your facility. CloudLock engineers have zero visibility into your assets.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold uppercase mb-2 flex items-center gap-2">
                <Server size={14} className="text-sky-400" /> European Data Sovereignty
              </h4>
              <p className="leading-relaxed">
                Storage shards are hosted across ISO-27001 certified facilities in Germany and the Netherlands. Fully compliant with GDPR data protection laws and strict studio non-disclosure agreements.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold uppercase mb-2 flex items-center gap-2">
                <FileCheck2 size={14} className="text-amber-400" /> Automated DPA &amp; VAT Invoicing
              </h4>
              <p className="leading-relaxed">
                Corporate accounts receive automated VAT/reverse-charge invoices and an instantly executable Data Processing Agreement (DPA) managed via the Stripe billing engine.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-neutral-600 font-mono">
          <div>CLOUDLOCK VFS // VIRTUAL FILE SYSTEM FOR PROFESSIONAL CREATIVE WORKFLOWS.</div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/studio" className="hover:text-neutral-400">STUDIO CONTROLLER</Link>
            <span className="hover:text-neutral-400 cursor-pointer">TERMS OF SERVICE</span>
            <span className="hover:text-neutral-400 cursor-pointer">PRIVACY POLICY</span>
            <span className="hover:text-neutral-400 cursor-pointer">SLA: 99.9%</span>
          </div>
        </footer>
      </main>
    </div>
  );
}