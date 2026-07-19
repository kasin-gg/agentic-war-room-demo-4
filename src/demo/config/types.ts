export interface ScenarioNode {
  id: string;
  name: string;
  role: 'hq' | 'disrupted' | 'hub' | 'destination';
  coords: [number, number]; // [longitude, latitude]
  label: string;
}

export interface ScenarioArc {
  id: string;
  source: string;
  target: string;
  style: 'healthy' | 'critical' | 'candidate' | 'reroute';
}

export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  accentColor: string; // e.g. '#00BCD4', '#00FF80', '#FF9500', '#E91E63', '#9C27B0'
  script: string[];
  dataResult?: string;
}

export interface RegionRevenue {
  id: string;
  label: string;
  value: number; // in Millions
  trend: 'up' | 'flat' | 'down';
  asleep?: boolean;
  status?: 'healthy' | 'warning' | 'critical';
}

export interface MetricsSnapshot {
  revenueTotal: number;
  revenueDeltaPct: number;
  revenueTrend: 'up' | 'flat' | 'down';
  revenueByRegion: RegionRevenue[];
  otif: number;
  otifStatus: 'healthy' | 'warning' | 'critical';
  activeShipments: number;
  inTransitValue: number;
  avgLeadTimeDays: number;
  supplierHealthPct: number;
  promisesKept: number;
  promisesTotal: number;
  opsHeadline?: string;
}

export interface ScenarioMetrics {
  hqLabel: string;
  hqTimezone: string;
  companyName: string;
  phases: Record<'p0' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5', MetricsSnapshot>;
}

export interface IntroKpi {
  label: string;
  value: string;
}

export interface IntroCoveragePoint {
  id: string;
  lat: number;
  lng: number;
}

export interface ScenarioIntro {
  title: string;
  subtitle: string;
  kpis: IntroKpi[];
  coveragePoints: IntroCoveragePoint[];
}

export interface Scenario {
  id: string;
  industry: string;
  approvalRole: string;
  humanTeamLabel: string;
  clock: Record<'p0' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5', string>;
  countdown: number | null;
  money: {
    atRiskLabel: string;
    atRiskValue: number;
    recoveredLabel: string;
    recoveredValue: number;
    currency: string;
  };
  nodes: ScenarioNode[];
  disruptedNodeId: string;
  rerouteNodeIds: string[];
  dialogue: Record<'p0' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5', string>;
  timing: {
    typeSpeedMs: number;
    lineDelayMs: number;
    staggerMs?: number; // delay between specialist agents mobilizing at phase 3
  };
  agents: AgentConfig[];
  resolutionBadges: string[];
  outro: {
    title: string;
    body: string;
    footer: string;
  };
  metrics: ScenarioMetrics;
  intro?: ScenarioIntro; // optional cinematic "global twin" cold-open
}
