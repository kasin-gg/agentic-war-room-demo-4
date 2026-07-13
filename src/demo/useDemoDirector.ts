import { useState, useCallback, useMemo } from 'react';
import { supplyChainScenario } from './config/scenario.supplychain';
import { Scenario, ScenarioArc } from './config/types';
import { useScriptPlayer } from './useScriptPlayer';

export function useDemoDirector(scenario: Scenario = supplyChainScenario) {
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const phaseKey = (`p${phaseIndex}` as 'p0' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5');

  // Active agent IDs based on phase
  const activeAgentIds = useMemo(() => {
    const set = new Set<string>();
    if (phaseIndex >= 0) {
      set.add('agent-sentinel');
    }
    if (phaseIndex >= 3) {
      set.add('agent-sourcing');
      set.add('agent-logistics');
      set.add('agent-finance');
      set.add('agent-comms');
    }
    return set;
  }, [phaseIndex]);

  // Playback helper for typewriter scripts
  const { playback, clearAllTimers } = useScriptPlayer(
    scenario.agents,
    activeAgentIds,
    scenario.timing,
    isResetting
  );

  // Compute node status per phase
  const nodes = useMemo(() => {
    return scenario.nodes.map((node) => {
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

      return {
        ...node,
        status,
      };
    });
  }, [scenario.nodes, phaseIndex]);

  // Compute arcs per phase
  const arcs = useMemo<ScenarioArc[]>(() => {
    if (phaseIndex <= 1) {
      return [
        {
          id: 'arc-hq-disrupted',
          source: 'node-hq-bangkok',
          target: scenario.disruptedNodeId,
          style: 'healthy',
        },
        {
          id: 'arc-disrupted-dest',
          source: scenario.disruptedNodeId,
          target: 'node-destination-apex',
          style: 'healthy',
        },
      ];
    }

    if (phaseIndex === 2) {
      return [
        {
          id: 'arc-hq-disrupted',
          source: 'node-hq-bangkok',
          target: scenario.disruptedNodeId,
          style: 'critical',
        },
        {
          id: 'arc-disrupted-dest',
          source: scenario.disruptedNodeId,
          target: 'node-destination-apex',
          style: 'critical',
        },
      ];
    }

    if (phaseIndex === 3 || phaseIndex === 4) {
      return [
        {
          id: 'arc-hq-disrupted',
          source: 'node-hq-bangkok',
          target: scenario.disruptedNodeId,
          style: 'critical',
        },
        {
          id: 'arc-candidate-alpha',
          source: 'node-reroute-alpha',
          target: 'node-destination-apex',
          style: 'candidate',
        },
        {
          id: 'arc-candidate-beta',
          source: 'node-reroute-beta',
          target: 'node-destination-apex',
          style: 'candidate',
        },
      ];
    }

    // Phase 5 (Resolution)
    return [
      {
        id: 'arc-hq-reroute-alpha',
        source: 'node-hq-bangkok',
        target: 'node-reroute-alpha',
        style: 'reroute',
      },
      {
        id: 'arc-hq-reroute-beta',
        source: 'node-hq-bangkok',
        target: 'node-reroute-beta',
        style: 'reroute',
      },
      {
        id: 'arc-reroute-alpha-dest',
        source: 'node-reroute-alpha',
        target: 'node-destination-apex',
        style: 'reroute',
      },
      {
        id: 'arc-reroute-beta-dest',
        source: 'node-reroute-beta',
        target: 'node-destination-apex',
        style: 'reroute',
      },
    ];
  }, [phaseIndex, scenario.disruptedNodeId]);

  // Current phase metrics snapshot
  const currentMetrics = scenario.metrics.phases[phaseKey];

  // Current dialogue line
  const currentDialogue = scenario.dialogue[phaseKey];

  // Current clock
  const currentClock = scenario.clock[phaseKey];

  // Actions
  const advance = useCallback(() => {
    setPhaseIndex((prev) => {
      if (prev < 4) return prev + 1; // stops at 4 awaiting approval
      return prev;
    });
  }, []);

  const approve = useCallback(() => {
    setPhaseIndex((prev) => {
      if (prev === 4) return 5;
      return prev;
    });
    setIsHolding(false);
  }, []);

  const hold = useCallback(() => {
    if (phaseIndex === 4) {
      setIsHolding(true);
    }
  }, [phaseIndex]);

  const reset = useCallback(() => {
    setIsResetting(true);
    clearAllTimers();
    setPhaseIndex(0);
    setIsHolding(false);
    setTimeout(() => setIsResetting(false), 50);
  }, [clearAllTimers]);

  return {
    scenario,
    phase: phaseIndex,
    phaseKey,
    clock: currentClock,
    metrics: currentMetrics,
    nodes,
    arcs,
    agents: scenario.agents.map((agent) => ({
      ...agent,
      active: activeAgentIds.has(agent.id),
      playback: playback[agent.id] || {
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
    dialogue: currentDialogue,
    advance,
    approve,
    hold,
    reset,
  };
}
