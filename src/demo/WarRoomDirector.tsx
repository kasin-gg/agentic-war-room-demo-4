'use client';

import React, { useEffect } from 'react';
import { useDemoDirector } from './useDemoDirector';

export default function WarRoomDirector() {
  const director = useDemoDirector();
  const { advance, approve, hold, reset, awaitingApproval } = director;

  // Global Keyboard listener for demo controls (SPACE, Y, K, R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing inside input elements
      const targetTag = (e.target as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(targetTag)) return;

      const key = e.key.toLowerCase();

      if (e.code === 'Space') {
        e.preventDefault();
        advance();
      } else if (key === 'y') {
        e.preventDefault();
        approve();
      } else if (key === 'k') {
        e.preventDefault();
        hold();
      } else if (key === 'r') {
        e.preventDefault();
        reset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [advance, approve, hold, reset]);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] p-4 rounded-xl backdrop-blur-md bg-black/80 border border-cyan-500/30 text-mono text-xs w-[440px] shadow-2xl space-y-3 font-mono">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-bold text-cyan-300 tracking-wider">
            DEMO DIRECTOR DEBUG OVERLAY
          </span>
        </div>
        <span className="text-[10px] text-gray-400 bg-gray-800/80 px-2 py-0.5 rounded border border-gray-700">
          {director.scenario.id.toUpperCase()}
        </span>
      </div>

      {/* Phase & Clock info */}
      <div className="grid grid-cols-2 gap-2 bg-gray-900/60 p-2 rounded border border-gray-800">
        <div>
          <span className="text-gray-400 text-[10px]">PHASE:</span>{' '}
          <span className="font-bold text-amber-400">
            Phase {director.phase} ({director.phaseKey})
          </span>
        </div>
        <div>
          <span className="text-gray-400 text-[10px]">CLOCK:</span>{' '}
          <span className="font-bold text-cyan-300">{director.clock} ICT</span>
        </div>
        <div className="col-span-2">
          <span className="text-gray-400 text-[10px]">HEADLINE:</span>{' '}
          <span
            className={`font-semibold ${
              director.metrics.otifStatus === 'healthy'
                ? 'text-emerald-400'
                : director.metrics.otifStatus === 'warning'
                ? 'text-amber-400'
                : 'text-red-400'
            }`}
          >
            {director.metrics.opsHeadline}
          </span>
        </div>
      </div>

      {/* Metrics overview */}
      <div className="grid grid-cols-3 gap-2 text-[11px] bg-gray-900/40 p-2 rounded">
        <div>
          <div className="text-[10px] text-gray-400">REVENUE</div>
          <div className="font-bold text-white">
            ${director.metrics.revenueTotal}M{' '}
            <span
              className={
                director.metrics.revenueTrend === 'up'
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              }
            >
              ({director.metrics.revenueDeltaPct >= 0 ? '+' : ''}
              {director.metrics.revenueDeltaPct}%)
            </span>
          </div>
        </div>
        <div>
          <div className="text-[10px] text-gray-400">OTIF</div>
          <div
            className={`font-bold ${
              director.metrics.otifStatus === 'healthy'
                ? 'text-emerald-400'
                : director.metrics.otifStatus === 'warning'
                ? 'text-amber-400'
                : 'text-red-400'
            }`}
          >
            {director.metrics.otif}%
          </div>
        </div>
        <div>
          <div className="text-[10px] text-gray-400">PROMISES</div>
          <div className="font-bold text-white">
            {director.metrics.promisesKept} / {director.metrics.promisesTotal}
          </div>
        </div>
      </div>

      {/* Dialogue line preview */}
      <div className="bg-gray-900/80 p-2 rounded border border-gray-800/80 text-[10px] text-gray-300 leading-tight">
        <span className="text-cyan-400 font-bold">NARRATOR:</span> &ldquo;
        {director.dialogue}&rdquo;
      </div>

      {/* Agents typewriter status */}
      <div className="space-y-1.5 pt-1">
        <div className="text-[10px] text-gray-400 font-bold">
          SWARM AGENTS PLAYBACK STATUS:
        </div>
        {director.agents.map((agent) => (
          <div
            key={agent.id}
            className="flex items-center justify-between text-[10px] bg-gray-900/50 px-2 py-1 rounded"
          >
            <div className="flex items-center gap-1.5 truncate max-w-[240px]">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: agent.active
                    ? agent.accentColor
                    : '#4B5563',
                }}
              />
              <span
                className={agent.active ? 'text-white' : 'text-gray-500'}
              >
                {agent.name}
              </span>
            </div>
            <div className="text-gray-400 font-mono">
              {agent.playback.revealedLinesCount}/{agent.script.length} lines
              {agent.playback.dataResultShown && (
                <span className="ml-1 text-emerald-400">✓ Result</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Gate status & Keyboard keymap buttons */}
      <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
        <div className="text-[10px]">
          STATUS:{' '}
          {awaitingApproval ? (
            <span className="text-amber-400 font-bold animate-pulse">
              AWAITING COO APPROVAL (Y)
            </span>
          ) : (
            <span className="text-emerald-400">STATE READY</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={advance}
            className="px-1.5 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-[10px] text-cyan-300 border border-gray-700"
            title="Advance phase (SPACE)"
          >
            SPACE
          </button>
          <button
            onClick={approve}
            className="px-1.5 py-0.5 rounded bg-emerald-900/60 hover:bg-emerald-800 text-[10px] text-emerald-300 border border-emerald-700"
            title="Approve (Y)"
          >
            Y
          </button>
          <button
            onClick={hold}
            className="px-1.5 py-0.5 rounded bg-amber-900/60 hover:bg-amber-800 text-[10px] text-amber-300 border border-amber-700"
            title="Hold (K)"
          >
            K
          </button>
          <button
            onClick={reset}
            className="px-1.5 py-0.5 rounded bg-red-900/60 hover:bg-red-800 text-[10px] text-red-300 border border-red-700"
            title="Reset (R)"
          >
            R
          </button>
        </div>
      </div>
    </div>
  );
}
