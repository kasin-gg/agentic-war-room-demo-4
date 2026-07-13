'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoDirector } from '../useDemoDirector';
import { Moon, TrendingUp, TrendingDown, Minus, ShieldAlert, CheckCircle2, AlertTriangle, Package, Clock, Users } from 'lucide-react';

export default function OperationsDashboard() {
  const director = useDemoDirector();
  const { scenario, metrics, phase, clock: scenarioClock, isHolding } = director;

  // Real-time ticking ICT clock for Phase 0
  const [liveIctTime, setLiveIctTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Formatter for ICT (Asia/Bangkok)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Bangkok',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setLiveIctTime(new Intl.DateTimeFormat('en-GB', options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Micro-climbing revenue pulse for Phase 0 calm morning
  const [revenuePulse, setRevenuePulse] = useState<number>(metrics.revenueTotal);

  useEffect(() => {
    if (phase === 0) {
      const pulseInterval = setInterval(() => {
        setRevenuePulse((prev) => parseFloat((prev + 0.001).toFixed(3)));
      }, 2500);
      return () => clearInterval(pulseInterval);
    } else {
      setRevenuePulse(metrics.revenueTotal);
    }
  }, [phase, metrics.revenueTotal]);

  // Display clock: real-time in Phase 0, scenario timestamp in Phase 1+
  const displayClock = phase === 0 ? `${liveIctTime} ICT` : `${scenarioClock} ICT`;

  // Severity color maps
  const headlineColor =
    metrics.otifStatus === 'healthy'
      ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30'
      : metrics.otifStatus === 'warning'
      ? 'text-amber-400 bg-amber-950/60 border-amber-500/30'
      : 'text-red-400 bg-red-950/60 border-red-500/30';

  const otifTextColor =
    metrics.otifStatus === 'healthy'
      ? 'text-emerald-400'
      : metrics.otifStatus === 'warning'
      ? 'text-amber-400'
      : 'text-red-400';

  const promisesAtRisk = metrics.promisesTotal - metrics.promisesKept;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="absolute top-16 left-6 z-[150] w-[460px] pointer-events-auto rounded-xl backdrop-blur-xl bg-slate-950/80 border border-cyan-500/20 shadow-2xl p-4 font-mono text-slate-100 select-none"
    >
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cyan-400 tracking-wider">
              {scenario.metrics.companyName.toUpperCase()}
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
              {scenario.metrics.hqLabel}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 tracking-widest mt-0.5">
            GLOBAL OPERATIONS DASHBOARD
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5 font-bold text-sm text-cyan-300 tabular-nums">
            <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            {displayClock}
          </div>
          {phase > 0 && (
            <div className="text-[9px] text-amber-400/90 font-semibold tracking-wide">
              FLASHBACK INCIDENT TIMELINE
            </div>
          )}
        </div>
      </div>

      {/* ── HEADLINE STATUS BANNER ── */}
      <div
        className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-bold mb-3 ${headlineColor}`}
      >
        <div className="flex items-center gap-2">
          {metrics.otifStatus === 'healthy' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : metrics.otifStatus === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
          )}
          <span>{metrics.opsHeadline}</span>
        </div>
        <span className="text-[9px] tracking-widest uppercase opacity-75">
          {phase === 0 ? 'STATUS NOMINAL' : `PHASE ${phase}`}
        </span>
      </div>

      {/* ── MAIN METRICS GRID (2-COLUMN) ── */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* LEFT COLUMN: Revenue Pulse (Monetary) */}
        <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wider mb-1 flex items-center justify-between">
              <span>GLOBAL REVENUE</span>
              <span className="text-emerald-400 text-[9px] font-bold">TODAY</span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-white tabular-nums">
                ${phase === 0 ? revenuePulse.toFixed(2) : metrics.revenueTotal.toFixed(2)}M
              </span>
              <span
                className={`text-[10px] font-bold flex items-center ${
                  metrics.revenueTrend === 'up'
                    ? 'text-emerald-400'
                    : metrics.revenueTrend === 'down'
                    ? 'text-red-400'
                    : 'text-slate-400'
                }`}
              >
                {metrics.revenueTrend === 'up' ? (
                  <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                ) : metrics.revenueTrend === 'down' ? (
                  <TrendingDown className="w-3 h-3 mr-0.5 inline" />
                ) : (
                  <Minus className="w-3 h-3 mr-0.5 inline" />
                )}
                {metrics.revenueDeltaPct >= 0 ? '+' : ''}
                {metrics.revenueDeltaPct}%
              </span>
            </div>
          </div>

          {/* Regional breakdown */}
          <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1.5">
            {metrics.revenueByRegion.map((region) => {
              const isAsleep = region.asleep;
              const isCritical = region.status === 'critical';
              const isWarning = region.status === 'warning';

              return (
                <div
                  key={region.id}
                  className={`flex items-center justify-between text-[10px] transition-colors duration-300 ${
                    isAsleep
                      ? 'opacity-40 text-slate-400'
                      : isCritical
                      ? 'text-red-400 font-bold bg-red-950/40 px-1 rounded border border-red-500/30'
                      : isWarning
                      ? 'text-amber-400 font-semibold'
                      : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span>{region.label}</span>
                    {isAsleep && (
                      <span className="text-[8px] text-cyan-300/70 bg-cyan-950/60 px-1 rounded flex items-center gap-0.5" title="Timezone quiet hours">
                        <Moon className="w-2.5 h-2.5" /> QUIET
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 font-mono tabular-nums">
                    <span>${region.value.toFixed(2)}M</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Fulfillment Health (Non-Monetary STAR METRIC) */}
        <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wider mb-1 flex items-center justify-between">
              <span>FULFILLMENT HEALTH</span>
              <span className="text-cyan-400 text-[9px] font-bold">OTIF %</span>
            </div>

            {/* OTIF STAR METRIC DISPLAY */}
            <div className="flex items-baseline justify-between">
              <motion.div
                key={metrics.otif}
                initial={{ scale: 0.95, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className={`text-3xl font-black tabular-nums tracking-tight ${otifTextColor}`}
              >
                {metrics.otif.toFixed(1)}%
              </motion.div>

              <div className="text-[9px] text-slate-400 text-right">
                <div>TARGET: <span className="text-slate-200 font-bold">98.0%</span></div>
                <div className="text-[8px] opacity-75">SLA BENCHMARK</div>
              </div>
            </div>
          </div>

          {/* Operational detail chips */}
          <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1 text-[10px]">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">ACTIVE SHIPMENTS:</span>
              <span className="font-bold tabular-nums">{metrics.activeShipments.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">IN-TRANSIT VALUE:</span>
              <span className="font-bold text-cyan-300 tabular-nums">${metrics.inTransitValue}M</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">AVG LEAD TIME:</span>
              <span className="font-bold tabular-nums">{metrics.avgLeadTimeDays} days</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">SUPPLIER HEALTH:</span>
              <span
                className={`font-bold tabular-nums ${
                  metrics.supplierHealthPct < 60
                    ? 'text-red-400'
                    : metrics.supplierHealthPct < 90
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {metrics.supplierHealthPct}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── HUMAN COUNTER: PROMISES KEPT TODAY ── */}
      <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-[10px] text-slate-400 font-semibold tracking-wider">
              PROMISES KEPT TODAY
            </div>
            <div className="font-bold text-white tabular-nums">
              {metrics.promisesKept.toLocaleString()} / {metrics.promisesTotal.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Human framing gut-punch gap during incident phases */}
        <AnimatePresence mode="wait">
          {promisesAtRisk > 0 ? (
            <motion.div
              key="at-risk-gap"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-right bg-red-950/60 border border-red-500/40 px-2.5 py-1 rounded text-[10px]"
            >
              <div className="text-red-400 font-bold flex items-center justify-end gap-1">
                <Users className="w-3 h-3" />
                {promisesAtRisk} ACCOUNTS AT RISK
              </div>
              <div className="text-[8px] text-red-300/80">SLA DISRUPTION IMMINENT</div>
            </motion.div>
          ) : (
            <motion.div
              key="promises-ok"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-right text-[10px] text-emerald-400 font-bold"
            >
              ✓ 100% SLA COMPLIANCE
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
