'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoDirector } from '../useDemoDirector';
import { Globe2, ShieldCheck, Radar, ChevronRight } from 'lucide-react';

/**
 * Global Twin cold-open overlay.
 *
 * Renders only during the intro stage (before the crisis arc). It frames the
 * spinning live globe with a title lockup + KPI strip (beat 0), then an
 * "always-on swarm" coverage line + agent watch legend (beat 1). The globe,
 * its real live entities, and the coverage reticles are driven by page.tsx;
 * this component is pointer-events-none chrome so the presenter can still drag
 * the map underneath.
 */
export default function GlobalTwinIntro() {
  const { introActive, introStep, intro, agents } = useDemoDirector();

  if (!introActive || !intro) return null;

  const isSweep = introStep >= 1;

  return (
    <div className="fixed inset-0 z-[250] pointer-events-none select-none font-mono flex flex-col items-center justify-start pt-[9vh]">
      {/* Title lockup */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="flex flex-col items-center text-center px-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[11px] tracking-[0.35em] text-emerald-300 font-bold uppercase">
            LIVE · REAL-WORLD DATA
          </span>
        </div>

        <h1
          className="text-4xl md:text-5xl font-extrabold tracking-tight text-white flex items-center gap-3"
          style={{ textShadow: '0 0 30px rgba(0,229,255,0.35)' }}
        >
          <Globe2 className="w-9 h-9 text-[var(--cyan-primary)]" />
          {intro.title}
        </h1>

        <p className="mt-3 text-sm md:text-base text-[var(--text-secondary)] max-w-2xl leading-relaxed">
          {intro.subtitle}
        </p>
      </motion.div>

      {/* KPI strip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
        className="mt-7 flex flex-wrap items-stretch justify-center gap-3 px-6"
      >
        {intro.kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="glass-panel rounded-xl px-5 py-3 min-w-[150px] text-center backdrop-blur-xl bg-slate-950/70 border border-[var(--border-primary)]"
          >
            <div className="text-2xl font-extrabold text-[var(--cyan-primary)] tabular-nums tracking-tight">
              {kpi.value}
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
              {kpi.label}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Beat 1: swarm coverage sweep framing */}
      <AnimatePresence>
        {isSweep && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mt-6 flex flex-col items-center gap-3 px-6"
          >
            <div className="flex items-center gap-2 text-[12px] tracking-[0.25em] uppercase font-bold text-[var(--cyan-primary)]">
              <Radar className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
              <span>Scanning all regions</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> ALL NOMINAL
              </span>
            </div>

            {/* Agents on-watch legend */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-950/70 border border-slate-700/60 px-2.5 py-1 backdrop-blur-md"
                >
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: agent.accentColor, boxShadow: `0 0 8px ${agent.accentColor}` }}
                  />
                  <span className="text-[10px] font-semibold text-slate-200 tracking-wide">
                    {agent.name.split(' ')[0].toUpperCase()}
                  </span>
                  <span className="text-[8px] text-emerald-400/80 uppercase tracking-wider">on watch</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Presenter continue hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-[12vh] flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase text-[var(--text-muted)]"
      >
        <kbd className="px-2 py-1 rounded bg-slate-900/80 border border-slate-700 text-slate-200 not-italic">
          SPACE
        </kbd>
        <span>{isSweep ? 'descend into operations' : 'continue'}</span>
      </motion.div>
    </div>
  );
}
