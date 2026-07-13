'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Database, Terminal, Shield, Cpu, Activity } from 'lucide-react';
import { AgentConfig } from '../config/types';
import { AgentPlaybackState } from '../useScriptPlayer';

interface AgentThoughtStreamProps {
  agent: AgentConfig & {
    active: boolean;
    playback: AgentPlaybackState;
  };
}

export default function AgentThoughtStream({ agent }: AgentThoughtStreamProps) {
  const { id, name, role, accentColor, script, dataResult, active, playback } = agent;
  const { revealedLinesCount, currentLineText, dataResultShown, isComplete } = playback;
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll console body to bottom as lines stream
  useEffect(() => {
    if (active && consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [active, revealedLinesCount, currentLineText]);

  // Visual state computation
  const isDone = isComplete && (!dataResult || dataResultShown);
  const isQueryingData = isComplete && Boolean(dataResult) && !dataResultShown;

  return (
    <motion.div
      initial={{ opacity: 0.4, scale: 0.98 }}
      animate={{
        opacity: active ? 1 : 0.45,
        scale: active ? 1 : 0.98,
        borderColor: active
          ? isDone
            ? 'rgba(0, 255, 128, 0.4)'
            : `${accentColor}66`
          : 'rgba(255, 255, 255, 0.08)',
      }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="rounded-xl backdrop-blur-xl bg-slate-950/85 border p-3 font-mono text-slate-100 shadow-xl select-none transition-shadow duration-300"
      style={{
        boxShadow: active
          ? `0 0 20px ${accentColor}22, inset 0 0 15px ${accentColor}11`
          : 'none',
      }}
    >
      {/* ── PANEL HEADER ── */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor: isDone
                ? '#00FF80'
                : active
                ? accentColor
                : '#4B5563',
              boxShadow: active
                ? `0 0 10px ${isDone ? '#00FF80' : accentColor}`
                : 'none',
            }}
          />
          <div>
            <div className="text-xs font-bold tracking-wide text-white flex items-center gap-1.5">
              <span>{name}</span>
            </div>
            <div className="text-[9px] text-slate-400 font-medium truncate max-w-[200px]">
              {role}
            </div>
          </div>
        </div>

        {/* Status indicator tag */}
        <div className="text-right">
          {isDone ? (
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> COMPLETE
            </span>
          ) : active ? (
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 animate-pulse"
              style={{
                color: accentColor,
                backgroundColor: `${accentColor}15`,
                border: `1px solid ${accentColor}40`,
              }}
            >
              <Cpu className="w-3 h-3" /> THINKING...
            </span>
          ) : (
            <span className="text-[9px] font-semibold text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              DORMANT
            </span>
          )}
        </div>
      </div>

      {/* ── CONSOLE STREAMING BODY ── */}
      <div className="space-y-1 text-[11px] leading-relaxed max-h-[110px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1">
        {/* Render fully typed previous lines */}
        {script.slice(0, revealedLinesCount).map((line, idx) => (
          <div key={idx} className="text-slate-300 flex items-start gap-1">
            <span className="text-slate-600 select-none mr-0.5">&gt;</span>
            <span>{line}</span>
          </div>
        ))}

        {/* Render active line currently typing */}
        {active && !isComplete && (
          <div className="text-slate-100 flex items-start gap-1 font-semibold">
            <span className="select-none mr-0.5" style={{ color: accentColor }}>
              &gt;
            </span>
            <span>
              {currentLineText}
              <span
                className="inline-block w-1.5 h-3.5 ml-0.5 bg-cyan-400 animate-pulse align-middle"
                style={{ backgroundColor: accentColor }}
              />
            </span>
          </div>
        )}

        {/* Visual Lookup Delay Shimmer ("querying...") */}
        <AnimatePresence>
          {isQueryingData && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 py-1 px-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-cyan-300 flex items-center gap-2 font-mono"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>QUERYING ENTERPRISE KNOWLEDGE LATTICE...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hardcoded Data Result Landing */}
        <AnimatePresence>
          {dataResultShown && dataResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="mt-2 p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-[11px] font-bold text-emerald-300 flex items-center gap-2 shadow-lg"
            >
              <Database className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="truncate">
                <span className="text-[9px] text-emerald-400/80 block font-semibold uppercase tracking-wider">
                  CONFIRMED QUERY RESULT
                </span>
                <span>{dataResult}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={consoleEndRef} />
      </div>
    </motion.div>
  );
}
