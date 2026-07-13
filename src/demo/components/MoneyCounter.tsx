'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoDirector } from '../useDemoDirector';
import { DollarSign, ShieldAlert, ShieldCheck, TrendingDown, TrendingUp } from 'lucide-react';

export default function MoneyCounter() {
  const { money, phase } = useDemoDirector();
  const { atRiskValue, recoveredValue, atRiskLabel, recoveredLabel } = money;

  // Counter animation value state
  const [displayedValue, setDisplayedValue] = useState<number>(atRiskValue);

  const isExposed = phase >= 2 && phase < 5;
  const isRecovered = phase === 5;
  const isVisible = phase >= 2;

  // Count animation logic on phase 5 transition
  useEffect(() => {
    if (isRecovered) {
      let current = atRiskValue;
      const target = recoveredValue;
      const step = (current - target) / 15;
      const interval = setInterval(() => {
        current -= step;
        if (current <= target) {
          setDisplayedValue(target);
          clearInterval(interval);
        } else {
          setDisplayedValue(Math.round(current));
        }
      }, 40);
      return () => clearInterval(interval);
    } else {
      setDisplayedValue(atRiskValue);
    }
  }, [phase, isRecovered, atRiskValue, recoveredValue]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: isRecovered ? [1, 1.12, 1] : 1,
        }}
        transition={{
          duration: 0.5,
          ease: [0.34, 1.56, 0.64, 1],
        }}
        className={`backdrop-blur-2xl border rounded-2xl p-4 font-mono select-none shadow-2xl flex items-center gap-4 transition-all duration-500 ${
          isRecovered
            ? 'bg-emerald-950/90 border-emerald-500/50 shadow-[0_0_35px_rgba(16,185,129,0.4)]'
            : 'bg-red-950/90 border-red-500/50 shadow-[0_0_35px_rgba(239,68,68,0.4)]'
        }`}
      >
        {/* Animated Icon Badge */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-500 ${
            isRecovered
              ? 'bg-emerald-900/80 border border-emerald-400/50 text-emerald-300'
              : 'bg-red-900/80 border border-red-400/50 text-red-300 animate-pulse'
          }`}
        >
          {isRecovered ? (
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-7 h-7 text-red-400" />
          )}
        </div>

        {/* Hero Number & Label */}
        <div>
          <div className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5">
            {isRecovered ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> CAPTURED VALUE PROTECTED
              </span>
            ) : (
              <span className="text-red-400 flex items-center gap-1 animate-pulse">
                <TrendingDown className="w-3 h-3" /> CRITICAL EXPOSURE DETECTED
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-1">
            <span
              className={`text-3xl md:text-4xl font-extrabold tracking-tight tabular-nums transition-colors duration-500 ${
                isRecovered
                  ? 'text-emerald-300 drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]'
                  : 'text-red-300 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]'
              }`}
            >
              ${displayedValue}M
            </span>
            <span
              className={`text-xs font-semibold ${
                isRecovered ? 'text-emerald-400/90' : 'text-red-400/90'
              }`}
            >
              USD
            </span>
          </div>

          <div className="text-[10px] font-semibold text-slate-300 mt-0.5 max-w-[260px]">
            {isRecovered ? recoveredLabel : atRiskLabel}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
