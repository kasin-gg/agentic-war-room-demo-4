'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoDirector } from '../useDemoDirector';
import { Clock, Moon, ShieldAlert, Wifi, WifiOff } from 'lucide-react';

export default function PhaseClock() {
  const { clock, phase, scenario } = useDemoDirector();
  const { humanTeamLabel } = scenario;

  const isRewindFlashback = phase >= 1 && phase <= 4;
  const isOnline = phase === 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="backdrop-blur-xl bg-slate-950/85 border border-cyan-500/20 rounded-xl p-3 shadow-2xl font-mono select-none"
    >
      <div className="flex items-center gap-3">
        {/* Clock icon with pulse */}
        <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center shrink-0">
          <Clock className={`w-4 h-4 ${isRewindFlashback ? 'text-amber-400 animate-spin' : 'text-cyan-400'}`} style={{ animationDuration: '8s' }} />
        </div>

        {/* Digital Time display with flip animation */}
        <div>
          <div className="flex items-baseline gap-1.5">
            <AnimatePresence mode="wait">
              <motion.span
                key={clock}
                initial={{ opacity: 0, y: isRewindFlashback && phase === 1 ? -15 : 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: isRewindFlashback && phase === 1 ? 15 : -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.4, ease: 'backOut' }}
                className={`text-2xl font-bold tracking-widest tabular-nums ${
                  isRewindFlashback ? 'text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]' : 'text-white'
                }`}
              >
                {clock}
              </motion.span>
            </AnimatePresence>
            <span className="text-[10px] font-bold text-slate-400">ICT</span>
          </div>

          <div className="text-[9px] font-semibold tracking-wider text-slate-400 flex items-center gap-1">
            {phase === 0 ? (
              <span>NORMAL MORNING BASELINE</span>
            ) : isRewindFlashback ? (
              <span className="text-amber-300/90 flex items-center gap-1">
                <Moon className="w-2.5 h-2.5" /> OVERNIGHT FLASHBACK
              </span>
            ) : (
              <span className="text-emerald-400">RESOLUTION COMPLETED</span>
            )}
          </div>
        </div>

        {/* Human Team Status Badge */}
        <div className="ml-2 border-l border-slate-800 pl-3">
          <div className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">
            HUMAN STATUS
          </div>
          {isOnline ? (
            <div className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1 mt-0.5 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span>{humanTeamLabel}: ONLINE</span>
            </div>
          ) : (
            <div className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded flex items-center gap-1 mt-0.5">
              <WifiOff className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>{humanTeamLabel}: OFFLINE</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
