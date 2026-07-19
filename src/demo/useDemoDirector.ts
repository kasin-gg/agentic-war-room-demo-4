import { useSyncExternalStore, useMemo } from 'react';
import { ACTIVE_SCENARIO, SHOW_SWARM_GRAPH } from './config';
import { Scenario, ScenarioArc } from './config/types';
import { AgentPlaybackState } from './useScriptPlayer';

/**
 * Singleton demo director store.
 *
 * The entire demo is driven by ONE shared brain. Every component subscribes to
 * this module-level store via `useDemoDirector()` (a thin useSyncExternalStore
 * wrapper), so pressing a key advances a single source of truth and all hero
 * visuals move together. The scripted typewriter engine lives here too, so it
 * runs exactly once globally rather than once per subscribing component.
 *
 * Determinism: identical playback every run. All content is config-driven from
 * the active scenario; there is no network/AI/DB anywhere.
 */

const scenario: Scenario = ACTIVE_SCENARIO;
const SENTINEL_ID = 'agent-sentinel';
const SPECIALIST_KICK_BASE_MS = 100; // initial delay before the first agent types
const RESET_WINDOW_MS = 50;

interface StoreState {
  phaseIndex: number;
  isHolding: boolean;
  isResetting: boolean;
  showGraph: boolean;
  playback: Record<string, AgentPlaybackState>;
}

const INITIAL_STATE: StoreState = {
  phaseIndex: 0,
  isHolding: false,
  isResetting: false,
  showGraph: SHOW_SWARM_GRAPH,
  playback: {},
};

// The frozen server snapshot (components are ssr:false, this just avoids warnings).
const SERVER_STATE: StoreState = Object.freeze({ ...INITIAL_STATE });

let state: StoreState = { ...INITIAL_STATE };
const listeners = new Set<() => void>();

// --- Typewriter engine (imperative, single global owner) ---
const timers: ReturnType<typeof setTimeout>[] = [];
const kicked = new Set<string>(); // agent ids whose playback has been started this run

function pushTimer(t: ReturnType<typeof setTimeout>) {
  timers.push(t);
}

function clearAllTimers() {
  timers.forEach((t) => clearTimeout(t));
  timers.length = 0;
}

function emit() {
  listeners.forEach((l) => l());
}

function setState(patch: Partial<StoreState>) {
  state = { ...state, ...patch };
  emit();
}

function setPlayback(id: string, patch: Partial<AgentPlaybackState>) {
  const prev: AgentPlaybackState =
    state.playback[id] || {
      revealedLinesCount: 0,
      currentLineText: '',
      dataResultShown: false,
      isComplete: false,
    };
  setState({ playback: { ...state.playback, [id]: { ...prev, ...patch } } });
}

function kickAgent(agentId: string, startDelayMs: number) {
  if (kicked.has(agentId)) return; // idempotent — safe against key-mash / re-entry
  const agent = scenario.agents.find((a) => a.id === agentId);
  if (!agent) return;
  kicked.add(agentId);

  // Initialize playback state for the newly activated agent.
  setPlayback(agentId, {
    revealedLinesCount: 0,
    currentLineText: '',
    dataResultShown: false,
    isComplete: false,
  });

  let lineIdx = 0;
  let charIdx = 0;

  const typeNextChar = () => {
    if (!kicked.has(agentId)) return; // reset() cleared the run — stop cleanly

    const currentLine = agent.script[lineIdx];
    if (currentLine === undefined) {
      // Script finished
      setPlayback(agentId, {
        revealedLinesCount: agent.script.length,
        currentLineText: '',
        isComplete: true,
      });
      // Brief "querying..." delay before the hardcoded data result lands (visual only).
      if (agent.dataResult) {
        pushTimer(
          setTimeout(() => {
            if (!kicked.has(agentId)) return;
            setPlayback(agentId, { dataResultShown: true });
          }, 1000)
        );
      }
      return;
    }

    if (charIdx <= currentLine.length) {
      setPlayback(agentId, {
        revealedLinesCount: lineIdx,
        currentLineText: currentLine.slice(0, charIdx),
      });
      charIdx++;
      pushTimer(setTimeout(typeNextChar, scenario.timing.typeSpeedMs));
    } else {
      lineIdx++;
      charIdx = 0;
      pushTimer(setTimeout(typeNextChar, scenario.timing.lineDelayMs));
    }
  };

  pushTimer(setTimeout(typeNextChar, startDelayMs));
}

// Kick playback for every agent that should be active at the current phase.
// Idempotent, so calling it repeatedly (e.g. on key-mash) never double-plays.
function kickAgentsForCurrentPhase() {
  const p = state.phaseIndex;
  const staggerMs = scenario.timing.staggerMs ?? 200;

  // Sentinel monitors from phase 0.
  if (p >= 0) kickAgent(SENTINEL_ID, SPECIALIST_KICK_BASE_MS);

  // The four specialists mobilize at phase 3 in a staggered cascade so the
  // panels + swarm graph read as one coordinated team, not a simultaneous flash.
  if (p >= 3) {
    const specialists = scenario.agents.filter((a) => a.id !== SENTINEL_ID);
    specialists.forEach((a, i) =>
      kickAgent(a.id, SPECIALIST_KICK_BASE_MS + i * staggerMs)
    );
  }
}

// --- Actions ---
function advance() {
  if (state.isResetting) return; // ignore input mid-transition
  if (state.phaseIndex >= 4) return; // stops at 4 awaiting approval
  setState({ phaseIndex: state.phaseIndex + 1 });
  kickAgentsForCurrentPhase();
}

function approve() {
  if (state.isResetting) return;
  if (state.phaseIndex !== 4) return;
  setState({ phaseIndex: 5, isHolding: false });
  kickAgentsForCurrentPhase();
}

function hold() {
  if (state.phaseIndex === 4) setState({ isHolding: true });
}

function reset() {
  clearAllTimers();
  kicked.clear();
  // Pristine phase 0, with a brief isResetting window that blocks input and lets
  // subscribers flush cleanly. showGraph is intentionally sticky across resets.
  setState({
    phaseIndex: 0,
    isHolding: false,
    isResetting: true,
    playback: {},
  });
  pushTimer(
    setTimeout(() => {
      setState({ isResetting: false });
      kickAgentsForCurrentPhase(); // replay the Sentinel from a clean slate
    }, RESET_WINDOW_MS)
  );
}

function toggleGraph() {
  setState({ showGraph: !state.showGraph });
}

// --- External store plumbing ---
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return SERVER_STATE;
}

// Start the Sentinel immediately on module load (client-only; components are ssr:false).
if (typeof window !== 'undefined') {
  kickAgentsForCurrentPhase();
}

// Stable action bundle (referentially constant across renders).
export const directorActions = { advance, approve, hold, reset, toggleGraph };

type PhaseKey = 'p0' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5';

// Derive the full reactive view from a raw snapshot. Only recomputed when the
// snapshot reference changes (i.e. on real state change) via useMemo in the hook.
function computeDerived(snap: StoreState) {
  const { phaseIndex, isHolding, showGraph, playback } = snap;
  const phaseKey = (`p${phaseIndex}` as PhaseKey);

  const activeAgentIds = new Set<string>();
  activeAgentIds.add(SENTINEL_ID);
  if (phaseIndex >= 3) {
    scenario.agents.forEach((a) => {
      if (a.id !== SENTINEL_ID) activeAgentIds.add(a.id);
    });
  }

  const nodes = scenario.nodes.map((node) => {
    let status: 'healthy' | 'warning' | 'critical' | 'offline' | 'candidate' = 'healthy';
    if (node.role === 'disrupted') {
      if (phaseIndex >= 5) status = 'offline';
      else if (phaseIndex >= 2) status = 'critical';
      else if (phaseIndex === 1) status = 'warning';
      else status = 'healthy';
    } else if (node.role === 'hub') {
      if (phaseIndex >= 5) status = 'healthy';
      else if (phaseIndex >= 3) status = 'candidate';
      else status = 'healthy';
    } else if (node.role === 'hq') {
      status = 'healthy';
    }
    return { ...node, status };
  });

  const arcs: ScenarioArc[] = computeArcs(phaseIndex);

  return {
    scenario,
    phase: phaseIndex,
    phaseKey,
    clock: scenario.clock[phaseKey],
    metrics: scenario.metrics.phases[phaseKey],
    nodes,
    arcs,
    agents: scenario.agents.map((agent) => ({
      ...agent,
      // Active membership is deterministic per phase; the playback entry only
      // exists once the agent has been kicked, so the glow reveals in the same
      // staggered cascade as the typing.
      active: activeAgentIds.has(agent.id) && Boolean(playback[agent.id]),
      playback:
        playback[agent.id] || {
          revealedLinesCount: 0,
          currentLineText: '',
          dataResultShown: false,
          isComplete: false,
        },
    })),
    money: {
      ...scenario.money,
      isExposed: phaseIndex >= 2 && phaseIndex < 5,
      isRecovered: phaseIndex === 5,
    },
    countdown: scenario.countdown,
    awaitingApproval: phaseIndex === 4,
    isHolding,
    showGraph,
    dialogue: scenario.dialogue[phaseKey],
    ...directorActions,
  };
}

function computeArcs(phaseIndex: number): ScenarioArc[] {
  if (phaseIndex <= 1) {
    return [
      { id: 'arc-hq-disrupted', source: 'node-hq-bangkok', target: scenario.disruptedNodeId, style: 'healthy' },
      { id: 'arc-disrupted-dest', source: scenario.disruptedNodeId, target: 'node-destination-apex', style: 'healthy' },
    ];
  }
  if (phaseIndex === 2) {
    return [
      { id: 'arc-hq-disrupted', source: 'node-hq-bangkok', target: scenario.disruptedNodeId, style: 'critical' },
      { id: 'arc-disrupted-dest', source: scenario.disruptedNodeId, target: 'node-destination-apex', style: 'critical' },
    ];
  }
  if (phaseIndex === 3 || phaseIndex === 4) {
    return [
      { id: 'arc-hq-disrupted', source: 'node-hq-bangkok', target: scenario.disruptedNodeId, style: 'critical' },
      { id: 'arc-candidate-alpha', source: 'node-reroute-alpha', target: 'node-destination-apex', style: 'candidate' },
      { id: 'arc-candidate-beta', source: 'node-reroute-beta', target: 'node-destination-apex', style: 'candidate' },
    ];
  }
  // Phase 5 (Resolution)
  return [
    { id: 'arc-hq-reroute-alpha', source: 'node-hq-bangkok', target: 'node-reroute-alpha', style: 'reroute' },
    { id: 'arc-hq-reroute-beta', source: 'node-hq-bangkok', target: 'node-reroute-beta', style: 'reroute' },
    { id: 'arc-reroute-alpha-dest', source: 'node-reroute-alpha', target: 'node-destination-apex', style: 'reroute' },
    { id: 'arc-reroute-beta-dest', source: 'node-reroute-beta', target: 'node-destination-apex', style: 'reroute' },
  ];
}

/**
 * Subscribe to the shared demo director. Every component gets the SAME state.
 * Returns the same shape it always has, plus `showGraph` and `toggleGraph`.
 */
export function useDemoDirector() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => computeDerived(snap), [snap]);
}
