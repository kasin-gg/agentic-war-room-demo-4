'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoDirector } from '../useDemoDirector';
import AgentThoughtStream from './AgentThoughtStream';
import { Bot, ChevronDown, ChevronUp, Layers, Cpu } from 'lucide-react';

export default function SwarmPanel() {
  const director = useDemoDirector();
  const { agents, phase } = director;
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const activeCount = agents.filter((a) => a.active).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
      className="absolute top-16 right-16 z-[160] w-[420px] pointer-events-auto font-mono select-none"
    >
      {/* Container header bar */}
      <div className="backdrop-blur-xl bg-slate-950/85 border border-cyan-500/20 rounded-xl p-3 shadow-2xl mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center">
            <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wider flex items-center gap-2">
              <span>MULTI-AGENT REASONING SWARM</span>
            </div>
            <div className="text-[9px] text-cyan-300/80 font-semibold tracking-widest uppercase">
              {phase === 0 || phase === 1
                ? 'SENTINEL TELEMETRY ACTIVE'
                : phase >= 3
                ? 'SWARM MOBILIZED · DUAL-HUB REROUTE'
                : 'STANDBY DISPATCH'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30 tabular-nums">
            {activeCount}/5 ACTIVE
          </span>
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors"
            title={isCollapsed ? 'Expand Swarm Rail' : 'Collapse Swarm Rail'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Stack of 5 Agent Thought Stream Panels */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2.5 max-h-[calc(100vh-160px)] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800"
          >
            {agents.map((agent) => (
              <AgentThoughtStream key={agent.id} agent={agent} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
