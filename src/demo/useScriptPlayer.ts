import { useState, useEffect, useRef, useCallback } from 'react';
import { AgentConfig } from './config/types';

export interface AgentPlaybackState {
  revealedLinesCount: number;
  currentLineText: string;
  dataResultShown: boolean;
  isComplete: boolean;
}

export function useScriptPlayer(
  agents: AgentConfig[],
  activeAgentIds: Set<string>,
  timing: { typeSpeedMs: number; lineDelayMs: number },
  isResetting: boolean
) {
  const [playback, setPlayback] = useState<Record<string, AgentPlaybackState>>({});
  const activeAgentIdsRef = useRef(activeAgentIds);
  activeAgentIdsRef.current = activeAgentIds;

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  // When reset is triggered, clear playback immediately
  useEffect(() => {
    if (isResetting) {
      clearAllTimers();
      setPlayback({});
    }
  }, [isResetting, clearAllTimers]);

  // Handle agent activation and typewriter playback
  useEffect(() => {
    if (isResetting) return;

    agents.forEach((agent) => {
      const isActive = activeAgentIds.has(agent.id);

      if (isActive && !playback[agent.id]) {
        // Initialize state for newly activated agent
        setPlayback((prev) => {
          if (prev[agent.id]) return prev;
          return {
            ...prev,
            [agent.id]: {
              revealedLinesCount: 0,
              currentLineText: '',
              dataResultShown: false,
              isComplete: false,
            },
          };
        });

        // Start typewriter sequence
        let lineIdx = 0;
        let charIdx = 0;

        const typeNextChar = () => {
          if (!activeAgentIdsRef.current.has(agent.id)) return;

          const currentLine = agent.script[lineIdx];
          if (!currentLine) {
            // Script finished
            setPlayback((prev) => ({
              ...prev,
              [agent.id]: {
                ...prev[agent.id],
                revealedLinesCount: agent.script.length,
                currentLineText: '',
                isComplete: true,
              },
            }));

            // If agent has dataResult, trigger visual "querying..." delay before showing result
            if (agent.dataResult) {
              const dataTimer = setTimeout(() => {
                setPlayback((prev) => ({
                  ...prev,
                  [agent.id]: {
                    ...prev[agent.id],
                    dataResultShown: true,
                  },
                }));
              }, 1000);
              timersRef.current.push(dataTimer);
            }
            return;
          }

          if (charIdx <= currentLine.length) {
            const partialText = currentLine.slice(0, charIdx);
            setPlayback((prev) => ({
              ...prev,
              [agent.id]: {
                ...prev[agent.id],
                revealedLinesCount: lineIdx,
                currentLineText: partialText,
              },
            }));
            charIdx++;
            const charTimer = setTimeout(typeNextChar, timing.typeSpeedMs);
            timersRef.current.push(charTimer);
          } else {
            // Line finished, wait lineDelayMs before next line
            lineIdx++;
            charIdx = 0;
            const lineTimer = setTimeout(typeNextChar, timing.lineDelayMs);
            timersRef.current.push(lineTimer);
          }
        };

        const startTimer = setTimeout(typeNextChar, 100);
        timersRef.current.push(startTimer);
      }
    });
  }, [activeAgentIds, agents, timing, isResetting, playback]);

  return { playback, clearAllTimers };
}
