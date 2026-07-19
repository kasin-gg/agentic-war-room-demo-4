'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoDirector } from '../useDemoDirector';
import { Network, ShieldAlert, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface SwarmNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  active: boolean;
}

// Fixed, hand-placed layout: hub (index 0) centered, specialists around it.
// Deterministic and cheaper than a live force sim (Task 6 Part B).
const POSITIONS: { x: number; y: number }[] = [
  { x: 180, y: 130 }, // hub (Sentinel)
  { x: 80, y: 70 },
  { x: 280, y: 70 },
  { x: 80, y: 190 },
  { x: 280, y: 190 },
];

// Link topology by node index (hub → specialists + a couple specialist bridges).
const LINK_PAIRS: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [1, 2],
  [2, 3],
];

export default function SwarmGraph() {
  const { phase, agents, showGraph } = useDemoDirector();
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Visibility is owned by the shared store (toggled with 'g' via DemoKeyboard).
  if (!showGraph) return null;

  // Nodes derived from config.agents — labels/colors/active all config-driven,
  // so the graph mobilizes in the SAME staggered cascade as the agent panels.
  const nodes: SwarmNode[] = agents.slice(0, POSITIONS.length).map((agent, i) => ({
    id: agent.id,
    label: agent.name.split(' ')[0].toUpperCase(),
    x: POSITIONS[i].x,
    y: POSITIONS[i].y,
    color: agent.accentColor,
    active: agent.active,
  }));

  const isRogueActive = phase === 3;
  const isRogueQuarantined = phase >= 4;
  const isResolved = phase === 5;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="absolute bottom-16 left-16 z-[160] w-[360px] backdrop-blur-xl bg-slate-950/85 border border-cyan-500/30 rounded-2xl p-3 shadow-2xl font-mono select-none pointer-events-auto"
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center">
            <Network className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
              <span>SWARM TOPOLOGY NETWORK</span>
              <span className="text-[9px] font-normal text-slate-500">[G] TOGGLE</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRogueActive ? (
            <span className="text-[8px] font-bold text-red-400 bg-red-950 border border-red-500/50 px-1.5 py-0.5 rounded animate-pulse flex items-center gap-1">
              <ShieldAlert className="w-2.5 h-2.5" /> ROGUE LOOP ANOMALY
            </span>
          ) : isResolved ? (
            <span className="text-[8px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-500/50 px-1.5 py-0.5 rounded flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> SYNCHRONIZED
            </span>
          ) : (
            <span className="text-[8px] font-bold text-cyan-300 bg-cyan-950 border border-cyan-500/40 px-1.5 py-0.5 rounded">
              MESH ACTIVE
            </span>
          )}

          <button
            onClick={() => setIsMinimized((prev) => !prev)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            title={isMinimized ? 'Expand Graph' : 'Minimize Graph'}
          >
            {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* SVG Canvas Graph Visualization */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative w-full h-[220px] bg-slate-900/60 rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center"
          >
            <svg className="w-full h-full" viewBox="0 0 360 220">
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Network Links */}
              {LINK_PAIRS.map(([sIdx, tIdx], idx) => {
                const sNode = nodes[sIdx];
                const tNode = nodes[tIdx];
                if (!sNode || !tNode) return null;
                // A link lights only when both endpoints are active, so links
                // reveal in the same staggered cascade as the nodes.
                const isLinkActive = sNode.active && tNode.active;

                return (
                  <g key={idx}>
                    <line
                      x1={sNode.x}
                      y1={sNode.y}
                      x2={tNode.x}
                      y2={tNode.y}
                      stroke={
                        isResolved
                          ? '#00FF80'
                          : isLinkActive
                          ? 'rgba(0, 229, 255, 0.4)'
                          : 'rgba(255, 255, 255, 0.08)'
                      }
                      strokeWidth={isLinkActive ? 1.5 : 1}
                      strokeDasharray={isLinkActive ? '4 4' : 'none'}
                    />

                    {/* Message pulse dot along active links */}
                    {isLinkActive && (
                      <circle r="2.5" fill={isResolved ? '#00FF80' : '#00E5FF'}>
                        <animateMotion
                          path={`M ${sNode.x} ${sNode.y} L ${tNode.x} ${tNode.y}`}
                          dur={`${2 + (idx % 3) * 0.5}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </g>
                );
              })}

              {/* Rogue Loop Thread & Recursive Circuit */}
              {(isRogueActive || isRogueQuarantined) && (
                <g>
                  {/* Arc connection to Sentinel */}
                  <line
                    x1="180"
                    y1="130"
                    x2="180"
                    y2="45"
                    stroke={isRogueQuarantined ? '#475569' : '#EF4444'}
                    strokeWidth="2"
                    strokeDasharray={isRogueActive ? '3 3' : 'none'}
                  />

                  {/* Frantic looping recursive circle */}
                  <circle
                    cx="180"
                    cy="45"
                    r="12"
                    fill="none"
                    stroke={isRogueQuarantined ? '#475569' : '#EF4444'}
                    strokeWidth="2"
                    filter={isRogueActive ? 'url(#glow)' : undefined}
                    className={isRogueActive ? 'animate-ping' : ''}
                    style={{ animationDuration: '1.2s' }}
                  />

                  <circle
                    cx="180"
                    cy="45"
                    r="8"
                    fill={isRogueQuarantined ? '#334155' : '#DC2626'}
                  />

                  {/* Rogue Pulse */}
                  {isRogueActive && (
                    <circle r="3" fill="#FF8A80">
                      <animateMotion
                        path="M 180 130 L 180 45 L 180 130"
                        dur="0.6s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  <text
                    x="180"
                    y="25"
                    textAnchor="middle"
                    fill={isRogueQuarantined ? '#64748B' : '#EF4444'}
                    fontSize="8"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {isRogueQuarantined ? 'ISOLATED' : 'ROGUE THREAD'}
                  </text>
                </g>
              )}

              {/* Swarm Agent Nodes */}
              {nodes.map((node) => {
                const isNodeActive = node.active;

                const nodeColor = isResolved
                  ? '#00FF80'
                  : isNodeActive
                  ? node.color
                  : '#475569';

                return (
                  <g key={node.id} className="cursor-pointer">
                    {/* Glowing aura */}
                    {isNodeActive && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="16"
                        fill={nodeColor}
                        opacity="0.15"
                        filter="url(#glow)"
                      />
                    )}

                    {/* Outer border ring */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="12"
                      fill="#0F172A"
                      stroke={nodeColor}
                      strokeWidth="2"
                    />

                    {/* Core dot */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="5"
                      fill={nodeColor}
                    />

                    {/* Label */}
                    <text
                      x={node.x}
                      y={node.y + 22}
                      textAnchor="middle"
                      fill={isNodeActive ? '#E2E8F0' : '#64748B'}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
