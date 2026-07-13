'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoDirector } from '../useDemoDirector';
import { CheckCircle2, ShieldCheck, Sun, ArrowRight, RotateCcw } from 'lucide-react';

export default function OutroCard() {
  const { phase, scenario, reset } = useDemoDirector();
  const { outro, money, resolutionBadges } = scenario;

  const [showDelayedOutro, setShowDelayedOutro] = useState<boolean>(false);

  // Delay arrival into Phase 5 so hero money flip and green map land first
  useEffect(() => {
    if (phase === 5) {
      const timer = setTimeout(() => setShowDelayedOutro(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowDelayedOutro(false);
    }
  }, [phase]);

  if (!showDelayedOutro) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[250] w-full max-w-xl backdrop-blur-2xl bg-slate-900/95 border-2 border-emerald-500/50 rounded-3xl p-6 font-mono text-white shadow-[0_0_60px_rgba(16,185,129,0.35)] select-none"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center">
              <Sun className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold tracking-wider text-emerald-300">
                {outro.title.toUpperCase()}
              </div>
              <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest">
                AUTOMATED CRISIS RESOLUTION BRIEFING
              </div>
            </div>
          </div>

          <div className="text-xs font-extrabold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/40 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>INCIDENT RESOLVED</span>
          </div>
        </div>

        {/* Executive Body Summary */}
        <div className="py-4 space-y-3">
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {outro.body}
          </p>

          <div className="rounded-xl bg-slate-950/80 border border-emerald-500/30 p-3 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">PROTECTED REVENUE CAPTURE:</span>
            <span className="text-lg font-extrabold text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
              {money.recoveredLabel}
            </span>
          </div>

          {/* Compliance & Audit Badges */}
          <div className="flex items-center gap-2 pt-1">
            {resolutionBadges.map((badge, idx) => (
              <span
                key={idx}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Outro Kicker & Reset Control */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-sm font-extrabold tracking-widest text-emerald-300 uppercase flex items-center gap-2">
            <span>{outro.footer}</span>
          </div>

          <button
            onClick={reset}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs text-slate-300 font-bold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>REPLAY DEMO [R]</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
