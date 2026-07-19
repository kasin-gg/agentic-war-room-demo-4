/**
 * Shared playback state for a single agent's scripted typewriter stream.
 *
 * The typewriter engine that produces these values now lives inside the
 * singleton director store (see useDemoDirector.ts) so it runs exactly once
 * globally rather than once per subscribing component. This module remains the
 * canonical home of the type so existing imports keep working.
 */
export interface AgentPlaybackState {
  revealedLinesCount: number;
  currentLineText: string;
  dataResultShown: boolean;
  isComplete: boolean;
}
