'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoDirector } from '../useDemoDirector';
import { AlertCircle, AlertOctagon, CheckCircle2, Bot, Lock, ShieldCheck } from 'lucide-react';

export default function IncidentBanner() {
  const { phase, scenario } = useDemoDirector();

  const getBannerState = () => {
    switch (phase) {
      case 0:
        return {
          bg: 'bg-emerald-950/70 border-emerald-500/30 text-emerald-300',
          icon: ShieldCheck,
          iconColor: 'text-emerald-400',
          badge: 'NOMINAL',
          badgeBg: 'bg-emerald-900/60 border-emerald-500/40 text-emerald-300',
          title: 'GLOBAL OPERATIONS NOMINAL — ALL HUBS ONLINE',
        };
      case 1:
        return {
          bg: 'bg-amber-950/80 border-amber-500/40 text-amber-300',
          icon: AlertCircle,
          iconColor: 'text-amber-400 animate-pulse',
          badge: 'SIGNAL DETECTED',
          badgeBg: 'bg-amber-900/80 border-amber-500/50 text-amber-200',
          title: 'EARLY TELEMETRY TREMOR — OTIF DEGRADATION DETECTED AT 04:02',
        };
      case 2:
        return {
          bg: 'bg-red-950/90 border-red-500/60 text-red-200 shadow-[0_0_25px_rgba(239,68,68,0.35)]',
          icon: AlertOctagon,
          iconColor: 'text-red-400 animate-bounce',
          badge: 'CRITICAL INCIDENT [SIMULATION]',
          badgeBg: 'bg-red-900/90 border-red-400/60 text-red-100 font-bold',
          title: 'MERIDIAN PORT HUB OFFLINE — SUPPLY LINE SEVERED',
        };
      case 3:
        return {
          bg: 'bg-cyan-950/85 border-cyan-500/50 text-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.3)]',
          icon: Bot,
          iconColor: 'text-cyan-400 animate-spin',
          badge: 'SWARM RESPONDING',
          badgeBg: 'bg-cyan-900/80 border-cyan-400/50 text-cyan-200',
          title: 'SWARM MOBILIZED — SYNTHESIZING DUAL-HUB REROUTE PLAN',
        };
      case 4:
        return {
          bg: 'bg-amber-950/90 border-amber-500/60 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.35)]',
          icon: Lock,
          iconColor: 'text-amber-400 animate-pulse',
          badge: 'AUTHORIZATION REQUIRED',
          badgeBg: 'bg-amber-900/90 border-amber-400/60 text-amber-100 font-bold',
          title: 'RECOMMENDED REROUTE COMPLETE — AWAITING EXECUTIVE SIGN-OFF',
        };
      case 5:
        return {
          bg: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.35)]',
          icon: CheckCircle2,
          iconColor: 'text-emerald-400',
          badge: 'INCIDENT RESOLVED',
          badgeBg: 'bg-emerald-900/90 border-emerald-400/60 text-emerald-100 font-bold',
          title: 'REROUTE EXECUTED — $44M PROTECTED · OTIF RESTORED TO 97%',
        };
      default:
        return null;
    }
  };

  const state = getBannerState();
  if (!state) return null;

  const IconComponent = state.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase}
        initial={{ opacity: 0, y: -15, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.96 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`backdrop-blur-xl border rounded-xl px-4 py-2 font-mono text-xs shadow-xl flex items-center gap-3 select-none transition-all duration-300 ${state.bg}`}
      >
        <IconComponent className={`w-4 h-4 shrink-0 ${state.iconColor}`} />

        <div className="flex items-center gap-2 overflow-hidden">
          <span className={`text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded border uppercase shrink-0 ${state.badgeBg}`}>
            {state.badge}
          </span>
          <span className="font-semibold tracking-wide truncate max-w-[480px]">
            {state.title}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
