'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoDirector } from '../useDemoDirector';
import {
  CheckCircle2,
  PauseCircle,
  Smartphone,
  Sparkles,
  Lock,
  Clock,
  FileCheck2,
} from 'lucide-react';

export default function ApprovalCard() {
  const { awaitingApproval, isHolding, approve, hold, scenario, clock, countdown } =
    useDemoDirector();
  const { approvalRole, money, resolutionBadges } = scenario;

  // Derive the plan copy from config so it works for any scenario.
  const disruptedLabel =
    scenario.nodes.find((n) => n.id === scenario.disruptedNodeId)?.label ?? 'Primary Hub';
  const rerouteLabel =
    scenario.rerouteNodeIds
      .map((id) => scenario.nodes.find((n) => n.id === id)?.label)
      .filter(Boolean)
      .join(' & ') || 'Alternate Hubs';

  if (!awaitingApproval) return null;

  return (
    <AnimatePresence>
      {/* Dim Scrim Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] bg-slate-950/65 backdrop-blur-md flex items-center justify-center p-4 font-mono select-none"
      >
        {/* Smartphone Push Notification Card Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="w-full max-w-lg rounded-3xl bg-slate-900/95 border-2 border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.35)] overflow-hidden text-white"
        >
          {/* Phone Notification Top Status Bar */}
          <div className="bg-slate-950/80 px-5 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="font-bold tracking-wider text-slate-200">
                CRITICAL ACTION REQUIRED
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-300">
              <Clock className="w-3.5 h-3.5" />
              <span>{clock} ICT</span>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Header / Addressed To */}
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400/90 flex items-center gap-1 mb-1">
                <Lock className="w-3 h-3" /> EXECUTIVE GOVERNANCE GATEWAY
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                APPROVAL REQUIRED — {approvalRole.toUpperCase()}
              </h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Swarm has synthesized and validated a zero-downtime dual-hub reroute plan.
              </p>
            </div>

            {/* Proposed Swarm Plan Card */}
            <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 space-y-3">
              <div className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>RECOMMENDED DISPATCH PLAN</span>
              </div>

              <div className="text-xs space-y-1.5 text-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Target Disrupted Hub:</span>
                  <span className="font-bold text-red-400">{disruptedLabel} (Offline)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Reroute Corridors:</span>
                  <span className="font-semibold text-cyan-300">
                    {rerouteLabel}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Economic Protection:</span>
                  <span className="font-extrabold text-emerald-400 text-sm">
                    {money.recoveredLabel}
                  </span>
                </div>
              </div>

              {/* Countdown timer support if provided */}
              {countdown !== null && (
                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-amber-400 font-bold">
                  <span>EXECUTIVE DEADLINE:</span>
                  <span>{countdown}s REMAINING</span>
                </div>
              )}
            </div>

            {/* Pre-Approval Reassurance Badges */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>PRE-APPROVED COMPLIANCE VERIFICATIONS</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {resolutionBadges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center gap-1 shadow-sm"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Hold Banner Warning if in Holding state */}
            {isHolding && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-xl bg-amber-950/80 border border-amber-500/50 text-xs text-amber-200 flex items-center gap-2"
              >
                <PauseCircle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                <span>
                  Holding execution — swarm preparing alternate contingency options. Press{' '}
                  <strong className="text-white">Approve [Y]</strong> when ready.
                </span>
              </motion.div>
            )}

            {/* Interactive Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={approve}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>APPROVE DISPATCH [Y]</span>
              </button>

              <button
                onClick={hold}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
              >
                <PauseCircle className="w-4 h-4 text-slate-400" />
                <span>HOLD [K]</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
