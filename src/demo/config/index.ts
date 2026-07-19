import { Scenario } from './types';
import { supplyChainScenario } from './scenario.supplychain';

/**
 * Central demo configuration flags.
 * These are the presenter-facing switches referenced across the tasks
 * (state machine, swarm graph toggle, debug overlay, live-data degradation).
 */

// The active scenario the whole demo runs against.
// Swap to the banking scenario here once it is authored.
export const ACTIVE_SCENARIO: Scenario = supplyChainScenario;

// Swarm topology graph: shown by default, toggleable at runtime with 'g'.
export const SHOW_SWARM_GRAPH = true;

// Task-1 debug overlay (WarRoomDirector panel). Hidden by default for a clean
// stage; flip to true (or run in development) to see the raw state readout.
export const SHOW_DEBUG_OVERLAY =
  process.env.NODE_ENV !== 'production' && false;

// When true, the demo keyboard reclaims Osiris's 'r' and 'g' keys (reset /
// graph toggle). When false, only demo-only keys (SPACE/Y/K) are claimed so
// Osiris keeps 'r' (fly-to-world) and 'g' (projection) outside a presentation.
export const DEMO_MODE = true;

// The scripted spine never depends on live feeds; this flag documents that the
// ambient Osiris data is decorative and may be disabled without breaking the demo.
export const USE_LIVE_DATA = true;
