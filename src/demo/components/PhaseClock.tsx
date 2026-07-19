'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Moon, Rewind, Wifi, WifiOff } from 'lucide-react';
import { useDemoDirector } from '../useDemoDirector';

// ── Time helpers (Bangkok / ICT) ──
const fmtHHMM = (min: number) => {
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};
const toMin = (hhmm: string) => {
  const [h, m] = (hhmm || '00:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};
const bangkokParts = () => {
  const p = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => Number(p.find((x) => x.type === t)?.value ?? 0);
  return { h: get('hour'), m: get('minute'), s: get('second') };
};

export default function PhaseClock() {
  const { clock, phase, scenario } = useDemoDirector();
  const { humanTeamLabel } = scenario;

  const [display, setDisplay] = useState<string>('--:--');
  const [isRewinding, setIsRewinding] = useState<boolean>(false);
  const timersRef = useRef<ReturnType<typeof setInterval>[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearInterval(t));
    timersRef.current = [];
  };

  // Single clock: live real time at the calm open, winds BACK to the incident
  // time on the flashback, then holds the near-frozen crisis timeline.
  useEffect(() => {
    clearTimers();
    setIsRewinding(false);

    if (phase === 0) {
      // Live ticking Bangkok time (HH:MM:SS) — "this is happening now".
      const tick = () => {
        const { h, m, s } = bangkokParts();
        setDisplay(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      };
      tick();
      timersRef.current.push(setInterval(tick, 1000));
      return clearTimers;
    }

    if (phase === 1) {
      // Wind the SAME clock backward from live "now" to the incident time (04:02).
      const { h, m } = bangkokParts();
      const startMin = h * 60 + m;
      const targetMin = toMin(clock); // scenario p1 time
      const FRAMES = 45;
      const DURATION = 1600;
      let f = 0;
      setIsRewinding(true);
      const id = setInterval(() => {
        f++;
        const t = f / FRAMES;
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        setDisplay(fmtHHMM(startMin + (targetMin - startMin) * eased));
        if (f >= FRAMES) {
          clearInterval(id);
          setDisplay(fmtHHMM(targetMin));
          setIsRewinding(false);
        }
      }, DURATION / FRAMES);
      timersRef.current.push(id);
      return clearTimers;
    }

    // Phases 2–5: the near-frozen incident timeline is rendered directly from
    // config (see render below), so no timers/state are needed here.
    return clearTimers;
  }, [phase, clock]);

  const isFlashback = phase >= 1 && phase <= 4;
  const isOnline = phase === 0 || phase === 5;

  const timeColor = isRewinding
    ? 'text-amber-400 drop-shadow-[0_0_14px_rgba(251,191,36,0.6)]'
    : phase === 0
    ? 'text-white'
    : isFlashback
    ? 'text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]'
    : 'text-emerald-300 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="backdrop-blur-xl bg-slate-950/85 border border-cyan-500/20 rounded-xl p-3 shadow-2xl font-mono select-none"
    >
      <div className="flex items-center gap-3">
        {/* Clock / rewind icon */}
        <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center shrink-0">
          {isRewinding ? (
            <Rewind className="w-4 h-4 text-amber-400 animate-pulse" />
          ) : (
            <Clock
              className={`w-4 h-4 ${isFlashback ? 'text-amber-400 animate-spin' : 'text-cyan-400'}`}
              style={{ animationDuration: '8s' }}
            />
          )}
        </div>

        {/* Time display */}
        <div>
          <div className="flex items-baseline gap-1.5">
            <AnimatePresence mode="wait">
              <motion.span
                key={phase}
                initial={{ opacity: 0, y: phase === 1 ? -15 : 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: phase === 1 ? 15 : -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.4, ease: 'backOut' }}
                className={`text-2xl font-bold tracking-widest tabular-nums ${timeColor}`}
              >
                {phase >= 2 ? clock : display}
              </motion.span>
            </AnimatePresence>
            <span className="text-[10px] font-bold text-slate-400">ICT</span>
          </div>

          <div className="text-[9px] font-semibold tracking-wider text-slate-400 flex items-center gap-1">
            {isRewinding ? (
              <span className="text-amber-300/90 flex items-center gap-1">
                <Rewind className="w-2.5 h-2.5" /> REWINDING TO 04:02
              </span>
            ) : phase === 0 ? (
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                LIVE · NORMAL MORNING
              </span>
            ) : isFlashback ? (
              <span className="text-amber-300/90 flex items-center gap-1">
                <Moon className="w-2.5 h-2.5" /> OVERNIGHT FLASHBACK
              </span>
            ) : (
              <span className="text-emerald-400">RESOLUTION COMPLETED</span>
            )}
          </div>
        </div>

        {/* Human team status */}
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
