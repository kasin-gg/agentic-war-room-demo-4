Let's bake it in. I'll give you the updated config schema with the metrics fields, then a revised Task 1 that includes both the state machine and the full supply-chain scenario content (including the new Operations Dashboard data), so your "normal morning" opening is authored from the start.
The Updated Scenario Config Schema
Here's the metrics block added to the schema. The key design principle: metrics are defined per-phase, so the dashboard transitions deterministically as the story advances (revenue climbs calmly, then OTIF drops first, then revenue-at-risk appears, then recovery).
// Added to the Scenario type

metrics: {
  hqLabel: string;              // "Bangkok HQ"
  hqTimezone: string;           // "ICT" — for the live-ticking local clock
  companyName: string;          // "Cymbal Logistics" (fictional)

  // Per-phase snapshots. The dashboard reads the snapshot for the current phase.
  phases: {
    [phase in 'p0'|'p1'|'p2'|'p3'|'p4'|'p5']: {

      // --- MONETARY: Revenue pulse ---
      revenueTotal: number;        // e.g. 8.42 (millions), gently climbs across p0
      revenueDeltaPct: number;     // e.g. +3.2 (vs yesterday)
      revenueTrend: 'up' | 'flat' | 'down';
      revenueByRegion: Array<{
        id: string;                // 'sea' | 'ea' | 'sa' | 'eu' | 'am'
        label: string;             // "SE Asia (HQ)"
        value: number;             // millions
        trend: 'up' | 'flat' | 'down';
        asleep?: boolean;          // true = time-zone quiet (dimmed) e.g. Americas at 08:14 ICT
        status?: 'healthy'|'warning'|'critical';  // region gets flagged during incident
      }>;

      // --- NON-MONETARY: Fulfillment health ---
      otif: number;                // On-Time-In-Full %, e.g. 98.7 -> drops first
      otifStatus: 'healthy' | 'warning' | 'critical';
      activeShipments: number;     // e.g. 1284
      inTransitValue: number;      // millions, e.g. 214
      avgLeadTimeDays: number;     // e.g. 4.2
      supplierHealthPct: number;   // e.g. 97

      // --- HUMAN: Promises kept (the gut-punch) ---
      promisesKept: number;        // e.g. 14203
      promisesTotal: number;       // e.g. 14391

      // --- Optional per-phase framing line for the dashboard ---
      opsHeadline?: string;        // e.g. "ALL SYSTEMS NOMINAL" / "OTIF DEGRADING" / "REROUTE ACTIVE"
    }
  }
}
How the numbers tell the story across phases
Phase
revenueTotal
revenueTrend
OTIF
otifStatus
shipmentsAtRisk / promises
opsHeadline
p0 Morning
8.42
up (climbing)
98.7
healthy
14,203 / 14,391
"ALL SYSTEMS NOMINAL"
p1 Signal
8.51
up
96.1
warning
slipping
"OTIF DEGRADING"
p2 Incident
8.55
flat
84.0
critical
"1,284 shipments at risk"
"SUPPLIER OFFLINE — SE ASIA"
p3 Swarm
8.55
flat
84.0→stabilizing
critical
"$47M revenue exposed"
"SWARM RESPONDING"
p4 Approval
8.55
flat
86.0
warning
"restore OTIF to 97%+"
"AWAITING AUTHORIZATION"
p5 Resolution
8.61
up
97.2
healthy
"$44M protected"
"REROUTE ACTIVE — RECOVERED"

The sophisticated beat is visible in the data: at p1/p2, revenue is still fine (up/flat, ~8.5) while OTIF has already cratered (98.7 → 84). The ops metric leads; the money metric lags. That's your "agents catch it before the P&L does" moment, baked right into the config.

📋 TASK 1 — Scripted State Machine + Full Supply-Chain Scenario (incl. Operations metrics)
Paste this into Antigravity after Task 0 is complete and you've confirmed the overlay mounts.
# TASK 1 — Scripted 6-phase state machine + full supply-chain scenario content

Build the deterministic brain of the war-room demo and author the complete 
supply-chain scenario content (including the Operations Dashboard metrics that open 
the demo on a "normal morning"). Everything is scripted and local — NO network, NO AI 
inference, NO live-feed dependency. This task does NOT build visual components yet 
(map incident, agent panels, dashboard UI) — only the state machine, the config 
content, keyboard wiring, and a debug overlay to verify it all works.

## PART A — Extend the Scenario config type (src/demo/config/types.ts)
Add a `metrics` block to the Scenario type exactly as follows:

metrics: {
  hqLabel: string; hqTimezone: string; companyName: string;
  phases: Record<'p0'|'p1'|'p2'|'p3'|'p4'|'p5', {
    revenueTotal: number; revenueDeltaPct: number; revenueTrend: 'up'|'flat'|'down';
    revenueByRegion: Array<{ id: string; label: string; value: number;
      trend: 'up'|'flat'|'down'; asleep?: boolean; status?: 'healthy'|'warning'|'critical' }>;
    otif: number; otifStatus: 'healthy'|'warning'|'critical';
    activeShipments: number; inTransitValue: number; avgLeadTimeDays: number;
    supplierHealthPct: number;
    promisesKept: number; promisesTotal: number;
    opsHeadline?: string;
  }>;
}

Keep all existing Scenario fields (id, industry, approvalRole, humanTeamLabel, clock, 
countdown, money, nodes, disruptedNodeId, rerouteNodeIds, dialogue, timing, agents, 
resolutionBadges, outro).

## PART B — Author the full supply-chain scenario (src/demo/config/scenario.supplychain.ts)
Fill in a complete, presentation-ready scenario. Use FICTIONAL, clearly-invented 
names (never real companies/assets). Company: "Cymbal Logistics", HQ: Bangkok.

Core narrative: at 4 AM, a fictional Tier-1 supplier / port hub in SE Asia goes dark 
(typhoon), threatening shipments and revenue. A swarm of agents responds; a human 
approves a reroute via alternate hubs; the crisis resolves before the team wakes.

Author these fields fully:
- id:'supplychain', industry:'Supply Chain', approvalRole:'Chief Operations Officer', 
  humanTeamLabel:'Operations Team'.
- clock: p0:'08:14' (the normal MORNING open, ICT), then p1:'04:02', p2:'04:06', 
  p3:'04:09', p4:'04:09', p5:'04:11' (the overnight crisis). NOTE: the demo opens on 
  a calm morning (p0=08:14), then when the presenter advances, we "flash back" to the 
  4 AM incident — the dialogue should make this transition clear.
- countdown: null (soft framing, no hard cutoff for supply chain).
- money: atRiskLabel:'47Mrevenueexposed',atRiskValue:47,recoveredLabel:'44M protected · 2-day delay avoided', recoveredValue:44, 
  currency:'USD'.
- nodes: fictional entities with coords[lon,lat]:
   * disrupted Tier-1 hub in SE Asia near a real chokepoint region (fictional name, 
     e.g. "Meridian Port Hub — Node Alpha"),
   * 2 reroute hubs (fictional, plausible SE/E Asia locations),
   * a Bangkok HQ node, and a destination DC.
   Set role appropriately (disrupted / hub / destination / hq). Set disruptedNodeId 
   and rerouteNodeIds.
- dialogue p0..p5: the presenter's spoken lines. p0 must be the calm "normal Tuesday 
  morning in Bangkok" opener that references BOTH revenue climbing AND OTIF at 98.7%. 
  p1 introduces the 4 AM flashback and the first OTIF tremor. Keep each line punchy 
  and executive-friendly.
- timing: typeSpeedMs ~22, lineDelayMs ~500 (tunable).
- agents: 5 agents with fictional-but-credible names, roles, accent colors, and 
  HARDCODED `script` arrays (3-6 punchy ops-console reasoning lines each) + `dataResult` 
  where relevant:
   * Sentinel Agent (24/7 monitoring — detected the signal at 04:02),
   * Sourcing Agent (finds alternate suppliers; dataResult e.g. "3 viable suppliers 
     found · lead-time +1 day"),
   * Logistics Agent (models reroutes; dataResult e.g. "Optimal reroute via 2 hubs · 
     +6% cost"),
   * Finance Agent (quantifies exposure; dataResult e.g. "Revenue exposure $47M · 
     protect 44M"),*CommsAgent(draftscustomer+internalcomms;dataResulte.g."84accountsnotified·briefready").-resolutionBadges:['WithinSLA','Customer-notified','Audited'].-outro:title:'08:00ICT—OperationsTeamOnline',bodysummarizingresolution/44M protected/OTIF restored, footer:'No action required.'
- metrics: author ALL SIX per-phase snapshots (p0..p5) following the "story arc" 
  where REVENUE stays healthy/flat early while OTIF drops FIRST, then both recover:
   * p0 (morning): revenueTotal ~8.42 up +3.2%, regions [SE Asia(HQ), East Asia, 
     South Asia, Europe(waking), Americas(asleep:true, low)] all trend up/flat & 
     healthy; otif 98.7 healthy; activeShipments ~1284; inTransitValue ~214; 
     avgLeadTimeDays 4.2; supplierHealthPct 97; promisesKept 14203/14391; 
     opsHeadline 'ALL SYSTEMS NOMINAL'.
   * p1: revenue still up (~8.51); otif drops to 96.1 (warning); opsHeadline 
     'OTIF DEGRADING'.
   * p2: revenue flat (~8.55); SE Asia region status 'critical'; otif 84.0 (critical); 
     activeShipments still ~1284 but now "at risk"; promisesKept drops meaningfully 
     (e.g. 14015/14391 -> ~188 at risk); opsHeadline 'SUPPLIER OFFLINE — SE ASIA'.
   * p3: revenue flat; otif ~84 stabilizing; opsHeadline 'SWARM RESPONDING'.
   * p4: otif ~86 (warning); opsHeadline 'AWAITING AUTHORIZATION'.
   * p5: revenue up (~8.61 +3.5%); all regions healthy; otif 97.2 (healthy); 
     promisesKept recovered (~14360/14391); opsHeadline 'REROUTE ACTIVE — RECOVERED'.
  Choose clean, believable numbers; keep region values summing sensibly to revenueTotal.

Leave scenario.banking.ts as a stub for now.

## PART C — The scripted state machine (src/demo/useDemoDirector.ts)
Build a React hook `useDemoDirector` that is the single source of truth. It reads the 
active scenario from config and exposes deterministic reactive state:
- phase: 0..5 (p0..p5)
- clock: current phase's clock string
- metrics: current phase's metrics snapshot (from config.metrics.phases[pX])
- nodes: with runtime status per phase (healthy/warning/critical/offline)
- arcs: transaction/candidate/reroute arc descriptors per phase (data only; the map 
  renders them later)
- agents: each with { active, revealedLines, revealedDataResult } (playback state)
- money: at-risk vs recovered state, per phase
- countdown: null for supply chain (support the field for banking later)
- awaitingApproval: boolean (true at phase 4)
- dialogue: current phase's presenter line

Actions:
- advance() — SPACE: p0->p1->p2->p3->p4 (stops at 4 to await approval)
- approve() — Y: p4->p5 (resolution)
- hold() — K: graceful "holding" state at p4 that never deadlocks; Y still works after
- reset() — R: back to p0, cancel ALL in-flight playback/timers, pristine state
Determinism: identical playback every run. Guard against double-advance / key-mashing 
(ignore input mid-transition or queue safely). No network calls anywhere.

## PART D — Script playback (src/demo/useScriptPlayer.ts)
A helper that, when an agent becomes active, reveals its hardcoded `script` lines with 
a typewriter effect using config.timing, and reveals its `dataResult` on a short timer 
(with a brief "querying..." delay to simulate a lookup — purely visual, no API). Must 
be fully cancellable on reset. Multiple agents can play concurrently.

## PART E — Keyboard wiring (in WarRoomDirector.tsx)
Wire SPACE/Y/K/R to the director actions. IMPORTANT: coexist cleanly with Osiris's 
existing keydown handler (which uses 'c','d','f','e','s', Escape). Do not hijack those 
keys; only claim SPACE/Y/K/R, and prevent default only for those. Ensure no conflicts 
and no double-firing.

## PART F — Debug overlay (temporary, for verification)
In WarRoomDirector.tsx, render a temporary debug panel (styled with glass-panel/hud-text) 
showing live: active scenario id, current phase + clock, opsHeadline, revenueTotal + 
trend, otif + status, promisesKept/Total, awaitingApproval, and for each agent how many 
script lines are revealed + whether its dataResult is shown. This lets me verify the 
entire scripted arc by keyboard BEFORE any real visuals exist.

## VERIFY & REPORT
- Driving only the keyboard (SPACE x4, then Y, then R), confirm the debug overlay 
  walks through all six phase snapshots correctly, that OTIF drops before revenue 
  reacts (p1/p2), that agents' scripts play with typewriter timing in phase 3, that 
  approval gates at phase 4, that Y resolves to phase 5 with revenue up + OTIF 
  recovered, and that R fully resets with no leftover timers.
- Confirm zero network calls from src/demo (grep fetch/api/ws/axios).
- Confirm Osiris's live dashboard + its own keyboard shortcuts still work underneath.

## CONSTRAINTS
- SCRIPTED, LOCAL, DETERMINISTIC. No network/AI/DB. Config-driven (all content from 
  scenario.supplychain.ts). Cancellable/resettable. TypeScript. Coexist with Osiris.

## DELIVERABLE
A fully working, keyboard-driven scripted state machine with the complete supply-chain 
scenario authored (including all six per-phase Operations metrics telling the 
"revenue-healthy-but-OTIF-dropping" story), verifiable end-to-end via the debug overlay, 
with zero network calls and Osiris intact underneath. Explain your plan before writing code.

What This Sets Up
After Task 1, you'll be able to press SPACE/Y/K/R and watch the entire story play out in the debug overlay — every number, every phase, every agent script — before building a single pixel of the real UI. That's the right way to build a demo: get the narrative engine provably correct first, then dress it up.
Your Operations Dashboard is now fully authored in config (all six phase snapshots), so when we build it visually next, it's just rendering data that already tells the story perfectly.

The Road From Here
Task
What it builds
Uses the metrics?
Task 1 ✅ (this one)
State machine + full scenario + metrics data + debug overlay
Authors them
Task 1.5 (next)
The Operations Dashboard UI — your calm "normal morning" opener
🎯 Renders them
Task 2
The fictional incident on the live map (arcs, nodes)
—
Task 3
Agent thought-stream panels
—
Task 4
Phase clock + money counter + incident banner
Money counter ties to revenue
Task 5
Approval card + outro
—
Task 6
Swarm graph + rogue loop
—
Task 7
Polish + stage-hardening + dawn transition
—


Run Task 0 first if you haven't, then Task 1. When Task 1's debug overlay correctly walks the whole arc, come back and I'll write Task 1.5 — the Operations Dashboard (the beautiful calm-morning opener that makes the whole demo start from "a normal day in an executive's life," exactly as you envisioned).

Let's build the calm-morning opener — the Operations Dashboard. This is what makes your demo start from "a normal day in an executive's life" instead of jumping straight into a crisis. Run this after Task 1's debug overlay correctly walks the whole arc.
📋 TASK 1.5 — The Operations Dashboard (the "normal morning" opener)
# TASK 1.5 — Operations Dashboard: the calm "normal morning" opener

Build the executive operations dashboard that OPENS the demo — the "normal Tuesday 
morning in Bangkok" view an executive glances at every day. It renders the per-phase 
metrics already authored in the supply-chain scenario (config.metrics.phases) and 
transitions with the story: calm and green at the open, then the OTIF/operational 
metrics degrade BEFORE revenue reacts, then everything recovers at resolution. 
Everything is scripted/local — no network, no live-feed dependency. It reads from 
useDemoDirector (current phase's metrics snapshot) and inherits Osiris's design tokens.

## GOAL & NARRATIVE ROLE
This dashboard establishes the calm baseline the crisis will shatter, and it carries 
the "operational reality moves faster than the P&L" beat: revenue looks fine early 
while OTIF drops first. It must feel like a premium, glanceable executive ops panel 
(Bloomberg-terminal-calm), NOT busy or cluttered.

## PART A — Component & placement
- Create src/demo/components/OperationsDashboard.tsx (isolated demo code).
- Render it as an overlay panel on top of the live Osiris map, styled with Osiris 
  design tokens (glass-panel, hud-text, gotham-tag variants, CSS vars like 
  --text-primary; accents: healthy #00FF80 or Osiris's cyan #00BCD4, warning #FF9500, 
  critical #FF2828). Match the existing panel aesthetic so it looks native to Osiris.
- Position it prominently for the opening (it's the hero of Phase 0) but so it does 
  NOT permanently block the live map behind it — the real world (flights/ships) should 
  still be visible/felt around it. Use a layout that reads well at 1920x1080.
- It reads the CURRENT phase's snapshot from useDemoDirector (metrics = 
  config.metrics.phases[currentPhase]). No direct config access to other phases.

## PART B — Header
- Show: companyName ("Cymbal Logistics") · "GLOBAL OPERATIONS" · hqLabel 
  ("Bangkok HQ") · a LIVE-ticking local clock in hqTimezone (ICT). The clock ticks in 
  real time on Phase 0 (reinforces "a normal live morning"). When the demo flashes 
  back to the 4 AM incident (Phase 1+), the header clock should reflect the scenario 
  clock value for that phase (from useDemoDirector.clock) rather than real time — make 
  this transition clean and intentional.
- Show the current opsHeadline as a status tag (e.g. "ALL SYSTEMS NOMINAL" green at p0, 
  "OTIF DEGRADING" amber at p1, "SUPPLIER OFFLINE — SE ASIA" red at p2, etc.), 
  color-coded by severity.

## PART C — LEFT: Revenue pulse (monetary)
- "GLOBAL REVENUE — TODAY": revenueTotal shown as X.XXMwithrevenueDeltaPct(e.g."▲+3.2%vsyesterday")andatrendindicator(up/flat/down)coloredaccordingly.-OnPhase0,animaterevenueTotalwithagentle,continuouscount-up"climbing"feel(smallincrements)toconveylivemoneycomingin—subtle,notfrantic.-RegionbreakdownfromrevenueByRegion:listeachregionwithlabel,value(X.XM), 
  and a trend arrow. 
   * Regions with asleep:true (e.g. Americas at 08:14 ICT) render DIMMED with a small 
     "�life" cue like a moon icon or "quiet" tag — this subtly signals "parts of your 
     business are asleep; humans can't watch it all." This is a deliberate thematic 
     detail for the opener.
   * Regions with status 'warning'/'critical' (during the incident) get color-coded 
     highlighting so the audience SEES which region is hit (SE Asia at p2).
- Smoothly transition values between phases (Framer Motion / animated count) so 
  revenue visibly stays healthy/flat early even as ops degrades.

## PART D — RIGHT: Fulfillment health (non-monetary) — the EARLY-WARNING hero
- "FULFILLMENT HEALTH" block showing:
   * OTIF (On-Time-In-Full) as a big, prominent % with otifStatus color 
     (healthy/warning/critical). This is the star metric — make it visually dominant 
     on the right side.
   * Active Shipments (activeShipments), In-Transit Value ($XXXm), Avg Lead Time 
     (X.X days), Supplier Health (XX% nominal), each with a small status cue.
- The OTIF number must DROP noticeably and visibly between p0->p1->p2 (98.7 -> 96.1 
  -> 84.0) while revenue stays healthy — animate the drop (count-down + color shift to 
  amber then red) so the contrast is obvious. This is the key "ops leads the P&L" 
  visual moment. Then it recovers at p5 (-> 97.2, back to green) with a satisfying 
  count-up.

## PART E — Human counter: "Promises Kept" (the gut-punch)
- A "PROMISES KEPT TODAY" line: promisesKept / promisesTotal deliveries.
- At the incident (p2), when promisesKept drops, surface the human framing prominently 
  — e.g. compute and show the at-risk gap ("188 customers at risk today") in critical 
  color. This translates the abstract OTIF % into real people. Make this appear only 
  when there IS a meaningful gap (incident phases), and clear/recover by p5.

## PART F — Phase-driven behavior & transitions
- Wire everything to useDemoDirector's current phase/metrics. On each phase advance, 
  animate the numbers/colors to the new snapshot with smooth Framer Motion transitions 
  (count animations, color tweens) — no hard jumps.
- Phase 0: calm, green, revenue gently climbing, live ICT clock ticking, "ALL SYSTEMS 
  NOMINAL". This is the resting state the demo opens on.
- Phases 1-2: OTIF drops first (amber->red), region SE Asia flags, promises-at-risk 
  appears, opsHeadline escalates — while revenue stays healthy/flat (the contrast).
- Phases 3-4: metrics hold/stabilize with escalated headlines.
- Phase 5: revenue up, OTIF recovered to green, promises restored, "REROUTE ACTIVE — 
  RECOVERED". A satisfying return-to-calm.
- On reset (R): return instantly to the Phase 0 calm snapshot, restart the live ICT 
  clock, cancel any count animations cleanly. Identical every run.

## PART G — Optional presenter cue (subtle)
- Optionally show the current phase's dialogue line (from useDemoDirector) somewhere 
  subtle as a teleprompter aid for the presenter — small, dim, non-distracting, and 
  easy to toggle off. Keep it out of the way; it's a rehearsal aid, not audience-facing 
  chrome. (If it risks clutter, make it a toggle that defaults off.)

## INTEGRATION & CLEANUP
- OperationsDashboard subscribes reactively to useDemoDirector. No scenario-specific 
  numbers hardcoded in the component — all from the current metrics snapshot. Must 
  render correctly for any scenario that provides metrics (banking later).
- Remove/hide the temporary debug overlay from Task 1 once this dashboard confirms the 
  metrics flow correctly (or keep it behind a dev flag).
- Clean up the live clock interval and any animation timers on unmount and on reset.
- Do NOT touch Osiris's live feeds or panels. Additive only.

## CONSTRAINTS (enforce)
- SCRIPTED/LOCAL: no network/AI/DB. All values from config.metrics via useDemoDirector.
- CONFIG-DRIVEN: nothing scenario-specific hardcoded; reads the current phase snapshot.
- DETERMINISTIC & RESETTABLE: identical playback every run; R returns to calm Phase 0.
- Premium, glanceable, uncluttered; legible at 1920x1080; matches Osiris styling.
- Coexists with the live Osiris dashboard visible/felt behind it.

## DELIVERABLE
A premium OperationsDashboard that opens the demo on a calm Bangkok-HQ morning — 
revenue gently climbing (with an asleep/quiet region cue), OTIF green at 98.7%, 
"ALL SYSTEMS NOMINAL", live ICT clock ticking — and that, as I drive SPACE, shows OTIF 
and promises-kept degrading BEFORE revenue reacts (the "ops leads the P&L" beat), 
escalating headlines, then a satisfying recovery at resolution (revenue up, OTIF green, 
promises restored). Pressing R returns to the calm morning. All from the scripted 
metrics, zero network, Osiris intact behind it. Explain your plan before writing code.

Why this task matters more than it looks
This is the task that gives your demo its emotional arc. Without it, you have an impressive incident-response tool. With it, you have a story: calm → threat → response → relief. The opening 30 seconds of calm competence are what make the crisis land and the resolution feel earned. Executives remember stories, not features.
A few tips as you run it
The OTIF drop is the intellectual "aha." When you rehearse, watch for the moment where OTIF is red (84%) but revenue is still green (~$8.5M). That visual contradiction is your most sophisticated selling point. If Antigravity's first pass makes them move together, push it: "make OTIF drop hard and early while revenue stays visibly healthy — the contrast is the whole point."


The "asleep region" cue is a quiet masterstroke. A dimmed "Americas — quiet" region at 8am Bangkok time plants the "your business spans time zones no human can watch" seed before you ever say it. Small detail, big thematic payoff. Make sure it's visible but subtle.


The "188 customers at risk" line will get a reaction. Percentages are abstract; people are not. When you rehearse, make sure that human number surfaces clearly at the incident peak — it's the line that makes a COO's stomach tighten.


Keep it calm and uncluttered. The temptation will be to pack it with metrics. Resist. The power of the opener is that it looks effortless — the calm before the storm. Bloomberg-terminal-calm, not mission-control-busy. If the first pass feels dense, tell Antigravity to simplify and add whitespace.


The live ICT clock ticking is doing real work. A real-time clock on Phase 0 signals "this is a live, real morning" — then flashing back to 04:02 for the incident creates the "while you slept" chill. Make sure that transition feels deliberate, not glitchy.



When Task 1.5 works, you'll have something genuinely presentable already: a calm executive dashboard that tells a complete rise-and-fall story by keyboard, over the live Osiris world. That's a real milestone — pause and rehearse the narration over it before moving on.
Come back after and I'll give you Task 2 — the fictional incident on the live map (the bold SIMULATION nodes and arcs that visually shatter the calm, over Osiris's real flights and ships).


Let's put the crisis on the map. This is where the calm shatters visually — bold, clearly-fictional incident nodes and arcs appear over Osiris's real live world (real flights, real ships), making the disruption feel like it's happening in the real world without touching any real assets.
📋 TASK 2 — The Fictional Incident on the Live Map
# TASK 2 — The scripted supply-chain incident, rendered on the live Osiris map

Render the fictional supply-chain crisis as bold, clearly-simulated nodes and animated 
arcs ON TOP of Osiris's live MapLibre map — over the real flights, ships, and world 
data that keep running underneath. The incident is scripted/local and driven entirely 
by useDemoDirector (nodes + arcs per phase). It must be visually DISTINCT from Osiris's 
real entities and clearly labeled as a simulation, so no one confuses it with real 
assets. This is the visual centerpiece — make it cinematic but disciplined.

## CORE PRINCIPLE: fictional and unmistakable
- All incident entities use FICTIONAL names from the scenario config (e.g. "Meridian 
  Port Hub — Node Alpha") — never real ports/companies/vessels.
- Incident nodes/arcs use a DIFFERENT, bolder visual language than Osiris's real 
  markers (which are small). Ours are large, glowing, animated, with clear labels.
- Include a subtle but visible "SIMULATION" / "DEMO SCENARIO" tag on the incident 
  layer so it's ethically and narratively clean — the world is real, this incident is 
  a simulation.

## PART A — Access the live map without breaking it
- From the Task 0 REUSE MAP, use whatever OsirisMap.tsx exposes (a map ref/instance, 
  or a children/overlay slot). Two acceptable approaches — pick the LEAST invasive:
   (1) If OsirisMap exposes the MapLibre instance/ref: add the incident as MapLibre 
       sources+layers (GeoJSON) that we control, layered above the base but able to 
       coexist with Osiris's own layers.
   (2) If it does not: render the incident as an absolutely-positioned SVG/canvas 
       overlay aligned to the map viewport, projecting lon/lat -> screen using the 
       map's projection (subscribe to map move/zoom to keep it aligned).
- Whichever approach: do NOT modify Osiris's existing map layers, feeds, or 
  interactions. Additive only. If it needs a small, safe hook in OsirisMap to expose 
  the instance, add it minimally and note it.
- The incident layer must gracefully handle the map being panned/zoomed by the 
  presenter (stay geographically anchored).

## PART B — Incident nodes (from config.nodes, driven by phase)
Render each scenario node at its coords[lon,lat] as a bold glowing marker whose 
appearance is driven by its runtime status from useDemoDirector:
- hq (Bangkok HQ): a distinct "home base" marker, calm cyan/blue accent, always present.
- disrupted node: healthy green in early phases; at the incident it flips to CRITICAL 
  red with an urgent pulse and a clear fictional label + a small "SIMULATION" tag.
- reroute hubs: dim/neutral until phase 3, then highlighted as candidates, then the 
  chosen hub(s) go solid green at resolution.
- destination DC: steady marker.
Labels must be legible at 1920x1080 (use the design tokens / hud-text styling). Node 
status colors: healthy #00FF80, warning #FF9500, critical #FF2828, hq/accent cyan 
#00BCD4, offline/grey desaturated.

## PART C — Arcs (the star), reactive to phase
Render animated great-circle-ish arcs between nodes, styled per phase from 
useDemoDirector.arcs:
- Phase 0-1 (calm morning / signal): healthy GREEN flow arcs between HQ, the (soon-to-
  be-disrupted) hub, and the destination — a slow, calm traveling-gradient/flow 
  animation. This is the visual "goods moving normally" that mirrors the Operations 
  Dashboard's healthy state.
- Phase 2 (incident): arcs into the disrupted node turn RED and BREAK/fray/fade 
  (severed supply line). The disrupted node pulses red. The calm is visibly shattered.
- Phase 3 (swarm): CANDIDATE reroute arcs appear as DOTTED/dashed dim-green paths from 
  the reroute hubs toward the destination (read source/target from 
  config.rerouteNodeIds + disruptedNodeId + destination) — a "proposed solutions" look.
- Phase 5 (resolution): the CHOSEN reroute becomes a SOLID bright-green arc with strong 
  flow animation; the disrupted node's arcs go grey; the network settles back to calm 
  healthy green. This is the visual payoff synced with the money counter / OTIF recovery.
- Animate arc flow smoothly (requestAnimationFrame or Framer Motion / a ticker). Target 
  60fps alongside Osiris's live layers. Keep arc count small and intentional — a few 
  meaningful arcs beat a cluttered web.

## PART D — Camera choreography (subtle, non-disorienting)
- Phase 0: leave the map roughly as-is (the presenter may have it framed on the region); 
  optionally a gentle ease to frame HQ + the network. Don't yank the camera.
- Phase 2 (incident): a gentle ease toward the disrupted node so the eye goes to the 
  crisis. Smooth, slow — no jarring jumps.
- Phase 5 (resolution): a gentle ease back out to show the full recovered network.
- Use the map's own flyTo/easeTo (MapLibre) for smoothness. Keep motion minimal and 
  cinematic; the presenter must never feel the map "fighting" them. All camera moves 
  cancellable on reset.

## PART E — Coexistence with the real world (the whole point)
- Osiris's real flights, ships, quakes, news dots keep rendering and moving underneath/
  around the incident layer. Do not hide or pause them. The juxtaposition of the real 
  live world + the bold simulated incident is the credibility payoff.
- Ensure the incident layer sits at the right z-order: above the base map and Osiris's 
  ambient data enough to be the focal point, but not covering the whole screen — the 
  real world should remain visible around it.

## PART F — Integration & reset
- The incident map layer subscribes reactively to useDemoDirector (phase, nodes, arcs). 
  On phase change it updates the sources/overlay smoothly — no full re-init.
- On reset (R): remove all incident nodes/arcs, cancel all arc animations and any 
  camera tween, return to the Phase 0 calm-flow state. No leftover layers, no orphaned 
  animation frames, no leaks. Re-running plays identically.
- Clean up MapLibre sources/layers (or the overlay) and all tickers on unmount.

## CONSTRAINTS (enforce)
- SCRIPTED/LOCAL: no network/AI/DB for the incident. All nodes/arcs/coords/labels come 
  from config via useDemoDirector.
- FICTIONAL & LABELED: invented names only; a visible "SIMULATION" tag on the incident 
  layer; visually distinct from real Osiris entities.
- ADDITIVE & NON-BREAKING: Osiris's live map, feeds, layers, and interactions remain 
  fully functional. Minimal, safe hooks only if strictly needed to access the map instance.
- DETERMINISTIC & RESETTABLE; 60fps at 1920x1080 with live layers running.
- Config-driven so it works for any scenario's nodes/arcs later.

## DELIVERABLE
Driving the demo over the LIVE Osiris map (real flights/ships still moving): Phase 0 
shows calm green flow arcs between the fictional HQ/hub/destination; Phase 2 the 
disrupted node flips red and its supply arcs break, with a gentle camera ease to the 
crisis; Phase 3 dotted candidate reroutes appear; Phase 5 a solid green reroute lights 
up and the network recovers as the camera eases back out — all clearly tagged 
SIMULATION and visually distinct from the real world around it. Pressing R cleanly 
removes the incident and returns to calm. Osiris's live dashboard remains fully intact. 
Explain your plan (including which map-access approach you chose and why) before writing 
code.

A few important tips for this one
The map-access approach is the first fork — let Antigravity investigate before coding. The prompt asks it to choose between (1) using OsirisMap's MapLibre instance directly, or (2) a projected overlay. The right answer depends on what OsirisMap.tsx actually exposes (which the Task 0 REUSE MAP told us). If OsirisMap gives you the map ref, approach (1) is cleaner and more performant. If not, (2) is safer. Make Antigravity explain its choice — don't let it guess.


The "SIMULATION" tag is doing double duty — insist on it. It's your ethical safety net (no one thinks you're showing real proprietary data) and a narrative asset ("the world is real, the incident is a simulation of a real pattern"). Some builders will skip it as "clutter." Don't let them. It's small but important.


Watch the frame budget — you now have three animated systems. The live Osiris map, the Operations Dashboard's count animations, and now the incident arcs. This is the first task where jank can appear. If it stutters, the arcs are usually the cheapest to tune (fewer arcs, simpler flow animation). Tell Antigravity 60fps is non-negotiable and to profile if needed.


Keep the arcs disciplined. The instinct is to draw a beautiful web of connections. Resist. A few meaningful arcs (HQ → disrupted hub → destination) that clearly break and reroute tell the story better than a dense mesh. Clarity beats spectacle for a C-suite — they need to follow it, not just admire it.


The camera must never fight the presenter. If you've panned the map to frame a region during your intro, an aggressive auto-flyTo will feel like the demo is wrestling you. Keep camera moves gentle, slow, and — critically — cancellable on reset. Test panning the map mid-demo to make sure the camera choreography plays nicely.


This is the "it's real" moment — rehearse the line. When the red incident appears over actual live flights and ships, that's your credibility peak. Have a line ready: "Everything moving on this map is real — real aircraft, real vessels, right now. The only thing simulated is the incident we're about to work through." That sentence, said while the real world moves behind your crisis, is worth a hundred slides.



When Task 2 works, you'll have the visual spine of the whole demo: a calm dashboard, a living real-world map, and a crisis that erupts on it and resolves. That's genuinely presentable.
Come back after and I'll give you Task 3 — the agent thought-stream panels (where the swarm becomes visible and starts "thinking out loud," repurposing Osiris's AI panels with the typewriter effect over your scripted reasoning).

Now the swarm comes alive. This is where the AI agents become visible and start "thinking out loud" — the moment that makes 100 executives believe they're watching a fleet of agents actually work the problem in real time. The typewriter effect over your scripted reasoning does the magic; the "querying..." fake-data reveal is what sells the intelligence.
📋 TASK 3 — Agent Thought-Stream Panels (the swarm reasoning)
# TASK 3 — Agent thought-stream panels: the swarm thinking out loud

Build the agent reasoning UI — the panels where each of the 5 agents streams its 
scripted reasoning via a typewriter effect, and where "data lookups" reveal hardcoded 
results with a brief fake "querying..." delay. This is what makes the swarm feel alive 
and intelligent. It reads entirely from config.agents (via useDemoDirector + 
useScriptPlayer, both built in Task 1) and reuses Osiris's AI-panel styling. No 
network, no AI inference — pure scripted playback dressed to look live.

## REUSE
Use src/components/AiAnalyst.tsx / AiOverview.tsx (from the Task 0 REUSE MAP) as the 
visual template for the agent panels — match their layout, glass-panel styling, 
hud-text/mono fonts, and console aesthetic so the swarm looks native to Osiris. Do NOT 
modify those Osiris components; create new demo components under 
src/demo/components/ that mirror their look.

## PART A — Layout
- Create src/demo/components/AgentThoughtStream.tsx (a single agent panel) and 
  src/demo/components/SwarmPanel.tsx (the container rendering one panel per 
  config.agents entry — 5 agents: Sentinel + 4 specialists).
- Arrange the 5 panels as a clean column/stack or grid overlaid on the live map, 
  positioned so they don't cover the incident nodes/arcs (Task 2) or the Operations 
  Dashboard (Task 1.5). Think "mission-control side rail." Legible at 1920x1080.
- Each panel: header (agent name + role, smaller/dimmer role, a status dot in the 
  agent's config accent color) and a scrolling console body (monospace/hud-text) that 
  auto-scrolls to the newest line as text streams.

## PART B — Agent lifecycle states (driven by useDemoDirector)
Each panel reflects its agent's state:
- DORMANT: dim/low-opacity, grey status dot. (Before the agent activates.)
- ACTIVE/THINKING: full opacity, accent glow/border, pulsing status dot in the accent 
  color, reasoning streaming via typewriter with a blinking cursor on the active line.
- DONE: text fully revealed, status dot solid green (#00FF80), a subtle "complete" 
  check/label; panel stays lit but calm.
Transitions between states via Framer Motion (smooth fade/scale, no hard pops).

## PART C — Phase-driven activation (matches the story)
- Phase 0-1 (calm morning / signal): ONLY the Sentinel Agent is ACTIVE — it streams 
  its script (the "detected the signal at 04:02 while everyone slept" reasoning). All 
  other agents DORMANT. This mirrors the Operations Dashboard's OTIF first-tremor.
- Phase 3 (the swarm): the four specialist agents activate in a STAGGERED cascade 
  (~150-300ms apart) so it feels like a coordinated mobilization, not a simultaneous 
  flash. Each streams its own script concurrently via useScriptPlayer. Multiple agents 
  typing at once is expected.
- Phase 4-5: agents settle to DONE; keep them calmly lit through resolution.
- Wire activation to useDemoDirector's per-agent { active, revealedLines, 
  revealedDataResult } state from Task 1. Use useScriptPlayer for the typewriter + 
  timing (config.timing).

## PART D — The "data result" reveal (fake query, real drama)
For agents whose config has a dataResult (Sourcing, Logistics, Finance, Comms per the 
supply-chain scenario):
- After that agent finishes streaming its script, show a brief "querying…" 
  shimmer/spinner (~800ms-1.2s, configurable) to simulate a lookup — purely visual, NO 
  API call.
- Then reveal the dataResult as a distinct highlighted "result" block inside the panel 
  — styled like a returned query (e.g. a "> RESULT:" line or a bordered chip) with the 
  value emphasized in the accent or healthy-green color, landing with a small Framer 
  Motion pop/scale so it's a moment the presenter can point at.
- Example landings the presenter will reference: Finance "Revenue exposure $47M · 
  protect 44M",Logistics"Optimalreroutevia2hubs·+6%cost",Sourcing"3viablesuppliers·lead-time+1day",Comms"84accountsnotified·briefready".##PARTE—Reasoningstylingforimpact-Makereasoningreadlikeasharpopsconsole,notachatbot:short,punchylines;monospace;blinkingcursorontheactiveline;agent-accent-coloredheaders.-Supportplain-stringscriptsrobustly.Ifyouaddanyinlineemphasis(e.g.highlightingavalueinaccentcolor),keepitoptionalandnon-breaking—plainstringsmuststillrenderfine.##PARTF—Integration&reset-SwarmPanelsubscribesreactivelytouseDemoDirector(whichagentsareactive,currentphase)anddriveseachactiveagent'stypewriterviauseScriptPlayer.-Onreset(R):instantlyclearallrevealedtext,cancelALLin-flighttypewritertimersand"querying"shimmersviauseScriptPlayer,returneverypaneltoDORMANT.Noleftovertext,noorphanedtimers,nodouble-playbackonre-run.FullR->SPACE-throughmustplayidenticallyeverytime.-Ensurethetypewriterisperformantwithupto5panelstypingconcurrently—avoidre-renderingtheentirestringeverycharacter(appendefficiently).Target60fpsat1920x1080alongsidethelivemap+incidentarcs+dashboard.-Cleanupalltimersonunmount.DonottouchOsiris'slivefeeds.##CONSTRAINTS(enforce)-SCRIPTED/LOCAL:noAPI/network/AI.Allreasoning+dataResultsfromconfig.agents.The"querying"shimmerisavisualeffectonly.-CONFIG-DRIVEN:agentnames,roles,accentcolors,scripts,dataResults,andtimingallfromconfig—nothingagent-specifichardcodedincomponents.Mustrendercorrectlyforanyscenario'sagentset(bankinglater).-DETERMINISTIC&CANCELLABLE:identicalplaybackeachrun;fullyresettablemid-stream.-ReuseOsirisAI-panelstyling;donotmodifyOsiriscomponents.-60fpswith5panelstypingconcurrently.##DELIVERABLEDrivingthedemo:inthecalm/signalphasesonlytheSentinelstreamsitsreasoning;onPhase3thefourspecialistsmobilizeinastaggeredcascade,eachtypingitsscriptedreasoningconcurrently,withdata-resultagentsshowinga"querying…"shimmerthenahighlightedresultthatpops(e.g.Finance"47M exposure · protect $44M"); agents 
settle to DONE through resolution. Pressing R cleanly resets all panels to dormant with 
no leftover state, identical on replay. Reuses Osiris's AI-panel look; live dashboard 
intact. Explain your plan before writing code.

A few tips for this one
The stagger is the difference between "boxes" and "a swarm." When Antigravity first builds Phase 3, the four agents will likely all light up at the same instant. Push for the 150–300ms cascade — that tiny offset transforms it from "four panels appeared" into "a team mobilizing." It reads as coordination and intelligence, which is the entire point. Worth insisting on.


The "querying..." shimmer is your highest-value trick — protect it. That fake spinner before a hardcoded result is what makes a CTO in the room believe the agent actually went and queried a system. It's pure theater over a static value, and it's the single most convincing "this is really thinking" moment. Make sure the result value pops when it lands (a small scale animation) so you can literally point at it: "there — the Finance Agent just confirmed the exposure: forty-seven million."


Sync this with the Operations Dashboard (Task 1.5) and the map (Task 2). By the end of this task you'll have three things reacting to Phase 3 at once. Watch them together — the agents should mobilize as the dashboard shows the crisis and as the map arcs break. If the timing feels disjointed, note it; we'll unify it properly in the Task 7 polish pass, but get it roughly aligned now.


Performance is a real risk here — five monospace panels typing at once. The naive implementation (re-rendering the full string every keystroke) can stutter, especially layered over the live map. If it's janky, tell Antigravity explicitly to optimize the typewriter (append incrementally, avoid full re-renders). 60fps is non-negotiable for a projected demo.


Re-run determinism, again. Before moving on, hit R and play through Phase 3 several times. If any panel double-plays, shows leftover text, or drifts in timing, fix it now. You'll rehearse this dozens of times and it must be identical every single run.


Keep the panels legible from the back of the room. A C-suite demo is projected; someone is 40 feet away. The reasoning text needs to be larger and higher-contrast than feels "right" on your laptop. When you test, step back from your screen — if you can't read it from across the room, bump the font size.



When Task 3 works, you'll have the full "swarm intelligence" experience: a calm dashboard that degrades, a live world map with a real crisis, and a fleet of agents visibly reasoning and pulling data to solve it. That's already a genuinely impressive demo — the remaining tasks are the emotional payoff (money counter, approval, resolution) and polish.
Come back after and I'll give you Task 4 — the HUD layer (phase clock, the hero money counter that flips red→green, and the incident banner — the quantitative anchor that ties everything together).


Now the numbers layer that ties it all together. This is where the CFO gets their anchor: the phase clock that barely moves (dramatizing agent speed), the incident banner that escalates and resolves, and — the hero of the whole demo — the money counter that flips from red to green. That flip is the single frame the room will remember.
📋 TASK 4 — The HUD Layer (Phase Clock + Money Counter + Incident Banner)
# TASK 4 — HUD layer: phase clock, the hero money counter, and the incident banner

Build the quantitative overlay that anchors the story: a phase clock, the hero money 
counter (red at-risk -> green recovered), and an escalating/resolving incident banner. 
All values come from the active scenario config via useDemoDirector; nothing 
scenario-specific hardcoded. Reuse Osiris's design tokens and the styling vocabulary 
from ScmPanel / GlobalStatusBar / LiveAlerts. Three components: PhaseClock.tsx, 
MoneyCounter.tsx, IncidentBanner.tsx — all in src/demo/components/.

NOTE ON SCOPE: the Operations Dashboard (Task 1.5) already carries revenue/OTIF. This 
task's MoneyCounter is the SEPARATE, prominent "at-risk -> protected" hero number tied 
to config.money (the $47M -> 44Mbeat)—thepunchlinenumber,distinctfromthedashboard'sliverevenuepulse.Makesuretheycomplement,notduplicate:thedashboardshowsongoingrevenue;theMoneyCountershowsthecrisisexposureandtheamountprotected.##COMPONENT1—PhaseClock.tsx-Prominenttimestamp(acornerofthescreen)showingthecurrentphase'sclockvaluefromuseDemoDirector.clock.Rememberthescenarioclockarc:p0='08:14'(calmmorning),thenp1='04:02',p2='04:06',p3='04:09',p4='04:09',p5='04:11'(theovernightflashback).-Onthep0->p1transition(morning->4AMflashback),makethetimechangefeelintentionalandslightlydramatic(aGSAP/Framerdigitrollorflip),signaling"rewindtowhathappenedovernight."Acrossp1->p5theclockbarelymoves(04:02->04:11)—thisnear-frozenclockisthepoint:theentirecrisisisresolvedin~9minuteswhilehumansslept.Reinforcethatvisually(thedigitstickonlyslightly).-Includethetimezonelabel(ICT)and,inthecrisisphases,asmall"HumanTeam:Offline—OnCall"badgeusingconfig.humanTeamLabel(e.g."OperationsTeam:Offline").Thebadgeflipsto"Online"atresolution(p5)/outro.-Monospace,high-contrast,legibleat1920x1080.##COMPONENT2—MoneyCounter.tsx(theHEROnumber)Thisisthedemo'spunchlinevisual—thenumbertheroomremembers.Drivenbyconfig.money+currentphase:-Phases0-1:notshown,orshownverysubtly(thecrisisexposureisn'tquantifiedyet).ItmustbeclearlypresentandprominentbyPhase2.-Phase2(incident):showtheAT-RISKstateinCRITICALred—config.money.atRiskLabel("47M revenue exposed") with the numeric value (atRiskValue) large and a subtle 
  urgent pulse.
- Phase 3-4: keep the at-risk number prominent (this is what's on the line while agents 
  work and the human decides).
- Phase 5 (resolution): FLIP to the RECOVERED/PROTECTED state in HEALTHY green — 
  config.money.recoveredLabel ("44Mprotected·2-daydelayavoided"),valuerecoveredValue.-THEHEROMOMENT—theflip:animateaGSAP/FramercounttransitionfromatRiskValuetorecoveredValue,acolortransitionred->green,andasatisfyingscale"pop"onlanding.Giveitroomandmakeitfeeldecisive.Thisisthesingleframethepresenterpauseson("44M — protected"). Iterate until it feels genuinely 
  satisfying, not abrupt.
- Position it top-center or another dominant spot so it's always visible from Phase 2 
  onward and reads from the back of a room.
- countdown support: config.countdown is null for supply chain, so render NO countdown 
  here. But support the field (a live-ticking urgent deadline) for the banking scenario 
  later — keep the layout clean and intentional when countdown is null.

## COMPONENT 3 — IncidentBanner.tsx
A slim, cinematic status banner (reuse LiveAlerts styling) that escalates and resolves 
with the phase — never blocking the map's key nodes/arcs, the money counter, or the 
agent panels:
- Phase 0: none, or a very subtle dim-green "ALL SYSTEMS NOMINAL".
- Phase 1 (signal): a small AMBER "EARLY SIGNAL DETECTED" notice.
- Phase 2 (incident): a prominent RED "CRITICAL INCIDENT" banner with the crisis 
  summary derived from config (the disrupted node label + supply-chain framing, e.g. 
  "MERIDIAN PORT HUB OFFLINE — SUPPLY LINE SEVERED"). Slide in via Framer Motion. Urgent 
  but not screen-blocking. Include the "SIMULATION" tag consistent with the map layer.
- Phase 3 (swarm): shift to a BLUE/agent-accent "SWARM RESPONDING" state.
- Phase 4 (approval): shift to an amber "AWAITING AUTHORIZATION" state.
- Phase 5 (resolution): flip to GREEN "INCIDENT RESOLVED" then ease out.

## INTEGRATION & RESET
- All three subscribe reactively to useDemoDirector (phase, money state, clock, node 
  statuses). No scenario-specific constants in any component.
- Coordinate visually with what already exists: the MoneyCounter's at-risk appearing at 
  Phase 2 should align with the Operations Dashboard's OTIF crash and the map's arcs 
  breaking; the MoneyCounter's green flip at Phase 5 should align with the map's green 
  reroute and the dashboard's OTIF recovery. Rough alignment now; final timing unified 
  in Task 7.
- On reset (R): PhaseClock returns to p0 (08:14) with "Offline" badge cleared 
  appropriately; MoneyCounter returns to its hidden/neutral Phase 0 state; banner 
  clears. Cancel all timers/tweens — no leaks, no double-running animations on re-run. 
  Identical on replay.
- Clean up on unmount. Do not touch Osiris's live feeds.

## CONSTRAINTS (enforce)
- SCRIPTED/LOCAL: no network/AI/DB. All values from config via useDemoDirector.
- CONFIG-DRIVEN: money labels/values, clock, humanTeamLabel, countdown all from config 
  — nothing scenario-specific hardcoded. Must work for banking later by config alone.
- Layout looks clean and intentional whether or not a countdown exists.
- DETERMINISTIC & RESETTABLE; 60fps at 1920x1080 alongside the map, dashboard, and 
  agent panels.
- Reuse Osiris design tokens / ScmPanel / GlobalStatusBar / LiveAlerts styling.

## DELIVERABLE
Driving the demo: the clock shows the calm 08:14 morning, then dramatically rewinds to 
04:02 and barely moves to 04:11 across the whole crisis (the "9-minute save while 
humans slept" point), with a "Team Offline" badge; at Phase 2 a red at-risk money 
counter ("47Mexposed")appearsalongsidearedCRITICALincidentbanner;thebannershiftsto"SWARMRESPONDING"then"AWAITINGAUTHORIZATION";atPhase5themoneycounterperformsitsheroflipred->green("44M protected") with a count + scale pop, the 
banner turns green "INCIDENT RESOLVED", and the team badge flips to Online. Pressing R 
cleanly resets everything with no leftover timers. Config-driven and Osiris intact. 
Explain your plan before writing code.

A few tips for this one
The money-counter flip is THE frame — spend real time on it. Everything else in the demo builds to this moment. When Antigravity's first pass lands, it'll probably be a functional but flat red-to-green swap. Push hard: the number should count (GSAP count from 47 to 44), the color should transition (not snap), and it should pop on landing. Then rehearse pausing on it and saying "forty-four million — protected." If that moment doesn't give you a little satisfaction when you trigger it, it won't land for the room. Iterate until it does.


The near-frozen clock is a subtle-but-powerful argument — make sure it reads. The whole crisis unfolds from 04:02 to 04:11. Nine minutes. Point at it: "The entire incident — detected, analyzed, resolved — in nine minutes. While every human on the team was asleep." If the clock changes too much or the digits are hard to read, that argument gets lost. Keep the digits large and the movement minimal and legible.


Watch for duplication with the Operations Dashboard. You now have two "money" elements: the dashboard's live revenue pulse (8.4Mclimbing)andthisherocounter(47M at-risk → $44M protected). These are conceptually different (ongoing revenue vs. crisis exposure), but if they're not visually distinct, the room gets confused. Make sure they read as clearly separate things. If it feels muddy when you test, tell Antigravity to differentiate them more (position, size, framing).


The clock rewind (08:14 → 04:02) is a storytelling device — nail the transition. This is the moment you say "now let me show you what happened at 4 AM while everyone slept." The clock visibly rewinding sells that flashback. If it just abruptly changes, the narrative beat is lost. A deliberate digit-roll backward makes the audience feel the rewind.


Keep the banner slim. The instinct is to make the "CRITICAL INCIDENT" banner big and dramatic. But a huge banner covers your beautiful map and agent panels. A slim, urgent status strip is more sophisticated and doesn't fight the other elements. Cinematic ≠ large.


You're now running four+ animated systems at once. Live map, dashboard counts, agent typewriters, and now HUD animations. This is the task where you should start being vigilant about performance. If anything stutters at Phase 3 or Phase 5 (the two heaviest moments), note it — Task 7 will do a proper optimization pass, but flag culprits as you spot them.



When Task 4 works, you have a complete emotional arc with quantitative payoff: calm morning → crisis with a number on it → agents responding → and the satisfying green flip. Honestly, at this point you could present a compelling demo. The remaining tasks make it exceptional.
Come back after and I'll give you Task 5 — the Approval Card + Outro (the human-in-the-loop "it wakes ME up" moment that reassures the room agents don't act alone, plus the morning-summary mic-drop closing frame).


Now the strategic heart of the demo. The approval card is the answer to the question every executive is silently asking — "but does the AI act on its own?" — and it answers it before they can raise it. Then the outro is your mic-drop: the calm morning-after that makes the whole "while you slept" promise land.
📋 TASK 5 — Approval Card (human-in-the-loop) + Outro (the mic-drop)
# TASK 5 — ApprovalCard.tsx (the "it wakes ME up" moment) + OutroCard.tsx (the mic-drop)

Build the two narrative payoff moments: the phone-notification-style approval card 
(Phase 4 — the human-in-the-loop beat that reassures a risk-averse room that agents 
don't act autonomously on high-stakes decisions) and the morning-summary outro (end of 
Phase 5 — the calm "your team reads about it when they wake up" closing frame). Both 
read from the active scenario config via useDemoDirector, use Framer Motion, and reuse 
Osiris design tokens. Components in src/demo/components/.

## COMPONENT 1 — ApprovalCard.tsx (Phase 4: THE WAKE-UP)

The demo's most important STRATEGIC moment — it proves the swarm PREPARES autonomously 
but ACTS only on human authorization. Must feel personal, urgent, premium: a push 
notification waking the executive at 4 AM.

### Trigger & behavior
- Appears when useDemoDirector reaches Phase 4 (awaitingApproval = true). Dim/scrim the 
  rest of the scene slightly so attention goes to the card, but keep the live map + 
  incident faintly visible behind (the crisis is still live while they decide).
- Cinematic Framer Motion entrance mimicking a phone push notification arriving: slide 
  in with a subtle settle/bounce and a soft glow — like a phone lighting up in a dark 
  room. Consider framing it inside a tasteful phone/device mockup (rounded corners, a 
  notification "app" header) to reinforce "this arrived on my phone at 4 AM." Premium, 
  not gimmicky.

### Content (all from config)
- Header addressed to config.approvalRole (e.g. "APPROVAL REQUIRED — Chief Operations 
  Officer") with the 4 AM timestamp from config.clock.p4.
- A concise recommended-action summary derived from config: what the swarm proposes 
  (reroute via the config.rerouteNodeIds hubs, around the disruptedNodeId), plus the 
  cost/impact from config.money (e.g. "Protect $44M revenue · restore OTIF to 97%+ · 
  +6% freight cost").
- Pre-approval reassurance chips from config.resolutionBadges (['Within SLA',
  'Customer-notified','Audited']) shown ON the card BEFORE approval — signaling the 
  swarm has ALREADY validated this action is safe/compliant, so the human is approving 
  a pre-vetted plan. This is the key trust message; make these chips clear.
- If config.countdown exists (banking later), show the live-ticking remaining time in 
  the card to amplify pressure. For supply chain (countdown null), omit cleanly — the 
  card must still look complete without it.

### Actions
- Two clear buttons: APPROVE (primary, healthy-green) and HOLD (secondary, muted), 
  visually mapped to the Y and K keys with hints shown on the buttons ("Approve [Y]" / 
  "Hold [K]").
- APPROVE (Y): calls director.approve() -> Phase 5. Give satisfying feedback (green 
  confirm state / checkmark animation), then ease the card out as resolution begins.
- HOLD (K): calls director.hold(). Show a graceful "Holding — swarm preparing alternate 
  plan" state that NEVER deadlocks; Y must still work afterward to proceed. Keep this 
  branch minimal and non-fragile (a clean hold state that then allows Approve) — it 
  must never leave the demo stuck on stage.
- Buttons must respond to BOTH clicks and the global Y/K keys (already wired) WITHOUT 
  double-firing.

### Reset
- On reset (R): card fully clears; any in-card countdown stops; re-running re-shows it 
  cleanly at Phase 4 with no leftover state.

## COMPONENT 2 — OutroCard.tsx (end of Phase 5: THE MIC-DROP)

The final frame — calm, resolved, quietly powerful; the emotional inverse of the 4 AM 
alarm.

### Trigger & behavior
- Appears a BEAT AFTER resolution completes in Phase 5 — let the map turn green, the 
  money counter perform its hero flip, and the Operations Dashboard recover FIRST, then 
  ease the outro in with a short Framer Motion delay so it doesn't step on the 
  resolution hero moment.
- Styled like a clean morning message/summary (email or team-message aesthetic) — the 
  "your team reads about it when they wake up" payoff. Calm, bright, premium — 
  contrasting the dark urgency of the approval card.

### Content (all from config.outro + config.money + config.resolutionBadges)
- config.outro.title (e.g. "08:00 ICT — Operations Team Online").
- config.outro.body (resolution summary: incident resolved overnight, 44Mprotected,OTIFrestored,cost,resolutiontimestamp).-Theresolvedmoneyfigure(config.money.recoveredLabel)shownprominently.-config.resolutionBadgesasfinalreassurancechips(WithinSLA/Customer-notified/Audited)—reinforcingthe"controlled+auditable"message.-config.outro.footerasthekicker("Noactionrequired.").###Behavior-Cancoexistwiththeresolved(green)mapfaintlybehindit,ortakeagentlefocusscrim—whicheverlooksmoreintentional.-Onreset(R):outroclearscompletely;returnstoPhase0witheverythingelse.##INTEGRATION&RESET(both)-BothsubscribereactivelytouseDemoDirector(awaitingApproval,phase).Noscenario-specificconstants—allfromconfig.-TheglobalY/Kkeyboardhandlersandtheon-cardbuttonsmustdrivetheSAMEdirectoractionswithnoconflicts/double-firing.-Onreset(R):bothfullyclear,allin-cardtimerscancelled,noleftoverstate;fullreplay(R->SPACE-through->Y->outro)isidenticaleveryrun.-Cleanuptimers/tweensonunmount.DonottouchOsiris'slivefeeds.##CONSTRAINTS(enforce)-SCRIPTED/LOCAL:noAPI/network.Allplantext,figures,badges,outrocontentfromconfig.-CONFIG-DRIVEN:approvalRole,plansummary,money,countdown,resolutionBadges,outroallfromtheactivescenario—nothinghardcoded.Mustrendercorrectlyforbankinglaterbyconfigalone(approvalRole"Treasurer",livecountdownincard,MAS-compliantbadges,etc.),ANDlookcleanforsupplychain(nocountdown).-ROBUSTONSTAGE:theK/holdpathmustneverleavethedemostuck;Approve(Y)mustalwayscleanlyadvancetoresolution;Ralwaysrecovers.-DETERMINISTIC&RESETTABLE;premiumandlegibleat1920x1080;reuseOsiristokens.##DELIVERABLEDrivingthedemo:atPhase4thescenedimsandacinematicphone-styleAPPROVALcardslidesinaddressedtotheCOO,showingtheswarm'spre-vettedrerouteplan+cost+"WithinSLA/Customer-notified/Audited"chips;pressingY(orclickingApprove)confirmswithsatisfyingfeedbackandadvancestoresolution;pressingKholdsgracefullywithoutbreaking(Ystillworksafter).Afterresolutionsettles(greenmap,moneyflip,OTIFrecovered),acalmmorning-summaryOutroCardeasesinwith"44M 
protected", the reassurance chips, and "No action required." Pressing R resets 
everything cleanly, identical on replay. Config-driven; Osiris intact. Explain your 
plan before writing code.

A few tips for this one
The pre-approval chips are the whole strategic point — don't let them get cut. "Within SLA / Customer-notified / Audited" shown before the executive approves is the detail that flips a skeptical CRO or COO from "can we trust AI with decisions?" to "the agents did the diligence, I just confirm." That's the entire human-in-the-loop argument compressed into three chips. If Antigravity treats them as decoration, insist: they must clearly communicate "the swarm has already validated this is safe — you're approving a pre-vetted action."


Make it feel like a phone at 4 AM, not a web modal. The push-notification framing does narrative work — it's why the presenter can say "it wakes ME up, on MY phone." If the first pass looks like a generic dialog box, push for the phone aesthetic: device framing, a notification-style slide-in with a settle, a soft glow like a screen lighting a dark room. The visual has to earn the line.


Bulletproof the K path — this is a genuine stage-safety issue. The hold/reject branch is statistically the most likely thing to break live and strand you in front of 100 people. Keep it deliberately minimal — a graceful "holding..." state that then lets you press Y. Don't build an elaborate Plan B; less to go wrong. Then test it viciously: press K then Y, K then R, K then K, Y then R, in every order. It must never deadlock.


Protect the resolution hero moment — the outro must arrive a beat LATER. Your Phase 5 has multiple payoffs firing: the map goes green, the money counter flips, OTIF recovers. Those need to land first. If the outro slides in simultaneously, it competes and dilutes the peak. The short Framer Motion delay matters — watch the full Phase 5 sequence end-to-end and tune it so it breathes: resolution lands → pause → calm outro eases in. Let the room feel the relief before you summarize it.


The outro is your last line — make the room feel something. This is where you deliver the promise: "By the time the team logs on at 8 AM, it's already handled. $44 million protected. No action required." The calm, bright morning-after aesthetic (inverse of the dark 4 AM alarm) is doing emotional work. It should feel like relief. If it looks like just another data card, it's missing the point — it's the resolution of a story, not a status readout.


Verify the no-countdown layout again. Supply chain has no in-card countdown. Make sure the approval card looks deliberately complete without it — no awkward empty slot. This is the recurring config-driven-UI trap; check it here specifically.



When Task 5 works, your demo is narratively complete — every beat from calm morning through crisis, swarm response, human decision, and the satisfying morning-after resolution. You can present it. Genuinely.
What remains:
Task 6 — the swarm topology graph + rogue loop (repurposing EntityGraphPanel) — the "you can see them collaborating" visual dimension. This is the last feature.
Task 7 — polish & stage-hardening — unifying all the timing into one cinematic sequence, graceful degradation, and the pre-flight checklist.
Come back after and I'll give you Task 6 — the swarm graph (or, if you're feeling the demo is already strong enough, we could discuss whether to skip it and go straight to polish — worth a conversation when you get there).


Now the swarm topology — the "you can see them collaborating" dimension. This repurposes Osiris's existing react-force-graph-2d (in EntityGraphPanel.tsx) to show the agents as a living network: mobilizing, communicating, and catching a rogue loop hiding inside the system.
But first — a genuine strategic question, because this is the last feature task.
Should you even build this? (read before running)
Your demo is already narratively complete after Task 5. The swarm graph is a "nice to have," not a "need to have." Here's the honest trade-off:
Build the swarm graph if...
Skip it (go straight to Task 7 polish) if...
You have time and want maximum "wow"
You're time-constrained and want it rock-solid
The screen has room for another element
The screen is already busy (dashboard + map + agent panels + HUD)
The "rogue loop caught inside the system" beat excites you
The agent panels already convey "swarm" well enough
You're comfortable managing another animated system at 60fps
Performance is already tight

My honest recommendation: Since EntityGraphPanel already exists and is wired, the cost of building it is lower than from scratch — so it's worth attempting. But build it as a toggleable element (a panel you can show/hide), so if it clutters the screen or hurts performance during rehearsal, you can simply turn it off and lose nothing. That's the safe way to get the upside without betting the demo on it.
If you're already feeling the demo is strong and busy enough, it's completely legitimate to skip this and go to Task 7. Your call — but here's the task either way, built to be safely optional.
📋 TASK 6 — Swarm Topology Graph + Rogue Loop (toggleable)
# TASK 6 — SwarmGraph: the live agent topology + the rogue loop (TOGGLEABLE)

Build the swarm topology visualization — the agents as a living node-link network that 
mobilizes, communicates, and detects/isolates a recursive rogue loop hiding in the 
system. Repurpose Osiris's existing react-force-graph-2d setup (EntityGraphPanel.tsx) 
for the look/wiring, but create a new demo component driven by useDemoDirector + 
config.agents. Everything scripted/local. CRITICAL: make this a TOGGLEABLE panel so it 
can be hidden if it clutters the screen or costs frames — the demo must be fully 
complete and coherent WITHOUT it.

## REUSE
Study src/components/EntityGraphPanel.tsx (from the Task 0 REUSE MAP) for how 
react-force-graph-2d is configured (node/link shape, colors, canvas rendering, any 
animation). Mirror that setup in a new src/demo/components/SwarmGraph.tsx. Do NOT 
modify the Osiris component.

## PART A — Toggle & placement (do this first)
- Add SwarmGraph as an OPTIONAL panel, hidden/shown via a config flag 
  (e.g. SHOW_SWARM_GRAPH in src/demo/config/index.ts, default true) AND a runtime 
  keyboard toggle (pick a key that does NOT conflict with Osiris's existing keys 
  'c','d','f','e','s',Escape or the demo's SPACE/Y/K/R — e.g. 'g' for graph). 
- Place it in a compact panel (glass-panel styling) positioned so it complements, not 
  competes with, the Operations Dashboard, agent panels, map incident, and HUD at 
  1920x1080. If space is tight, prefer a corner/side slot.
- The entire demo must remain coherent and complete with SwarmGraph OFF.

## PART B — Graph structure (deterministic, stable layout)
- One node per config.agents entry (5 agents), with the Sentinel as a CENTRAL hub node 
  and the four specialists arranged around it. 
- STRONGLY PREFER FIXED node positions (hand-placed / seeded) over a live force 
  simulation — a stable, designed layout that looks identical every run beats a physics 
  layout that settles differently each time and costs frames. (You may use 
  react-force-graph-2d with fixed fx/fy coordinates.) If you keep any force behavior, 
  seed it so it's deterministic.
- Node color = each agent's config.accent. Short labels (abbreviate; full names live on 
  the agent panels). Legible at 1920x1080.
- Compact, clean — a legible mesh, never a dense hairball.

## PART C — Phase-driven states & connections
Driven by useDemoDirector:
- Phase 0-1 (calm / signal): only the Sentinel hub node lit and gently pulsing; 
  specialists DORMANT (dim); no active links yet — a sleeping swarm.
- Phase 3 (the swarm): specialists light up in a STAGGERED cascade that MATCHES the 
  agent-panel activation rhythm from Task 3 (same ~150-300ms offsets) so the graph and 
  panels read as ONE swarm mobilizing. Links animate OUT from the hub to each 
  specialist and BETWEEN collaborating specialists, with small "message pulse" dots 
  traveling along the links to convey live inter-agent communication.
- Phase 4-5: links settle into a stable coordinated mesh; on resolution the whole graph 
  glows healthy green (calm, "mission accomplished").

## PART D — The rogue loop (the drama)
- During Phase 3, introduce a rogue element: a distinct RED node OR a red 
  self-referencing/recursive edge on one node, with a tight frantic looping animation 
  (message pulses cycling back on themselves) that reads as UNMISTAKABLY WRONG against 
  the calm blue/green coordinated swarm — faster, redder, cycling. A viewer across the 
  room should instantly see "something is wrong."
- Make the rogue element config-drivable if reasonable (e.g. an optional 
  config.rogueLoop node id or flag), with a sensible default. Keep robust across scenarios.
- On RESOLUTION (Phase 5, after approval): the rogue loop is ISOLATED — the red 
  looping node/edge goes GREY, its cycling stops (severed/quarantined), while the 
  healthy swarm turns green around it. This delivers the "isolate the rogue thread" 
  narrative beat visually.

## PART E — Motion & polish
- Message pulses: small glowing dots traveling hub<->specialist and 
  specialist<->specialist on a smooth ticker. Alive but not chaotic.
- Node states: DORMANT (dim), ACTIVE (accent glow + pulse), DONE/RESOLVED (green), 
  ROGUE (red, frantic cycling). All transitions smooth (no hard pops).
- Don't over-crowd with edges; clarity beats density for a projected C-suite demo.

## INTEGRATION, PERFORMANCE & RESET
- SwarmGraph subscribes reactively to useDemoDirector (phase, active agents, rogue 
  state). No scenario-specific constants — agents/colors/names from config.
- PERFORMANCE IS CRITICAL: this is the 5th+ animated system (live map, dashboard, agent 
  panels, HUD, now graph). Target sustained 60fps at 1920x1080 with everything running 
  at the Phase 3 peak. If it drops frames: reduce pulse density, use fixed positions, 
  render efficiently to canvas, and/or throttle. Report before/after fps at the peak. 
  If it can't hold 60fps alongside the rest, say so and recommend keeping it OFF by 
  default (the toggle makes this safe).
- On reset (R): all nodes return to DORMANT, links/pulses clear, rogue loop removed, 
  tickers/tweens cancelled. Identical on replay.
- Clean up the graph instance and all tickers on unmount. Do not touch Osiris's live feeds.

## CONSTRAINTS (enforce)
- SCRIPTED/LOCAL: no API/network. Topology, links, rogue loop all from config + phase 
  state — pure visualization.
- CONFIG-DRIVEN & TOGGLEABLE: agent nodes/names/colors from config.agents; hideable via 
  flag + key. Demo fully complete with it OFF.
- DETERMINISTIC: stable (preferably fixed) layout + identical animation each run.
- 60fps at 1920x1080 at the Phase 3 peak, or recommend default-off.
- Reuse EntityGraphPanel's react-force-graph-2d approach; don't modify Osiris components.

## DELIVERABLE
A toggleable SwarmGraph: in calm phases only the Sentinel hub pulses; at Phase 3 the 
specialists light up in a staggered cascade (synced to the agent panels) with message 
pulses flowing between agents, while a red recursive rogue loop cycles frantically; at 
resolution the rogue loop is severed to grey and the swarm settles to calm healthy 
green. Hideable via config flag + 'g' key with the demo fully coherent when off. 
Pressing R resets to a dormant hub. Report Phase-3-peak fps with the graph on vs. off. 
Explain your plan (and your layout choice — fixed vs. force) before writing code.

A few tips for this one
Insist on fixed node positions, not a live force simulation. This is the single most important decision in this task. A physics layout looks "cool" in theory but settles into a slightly different shape every run (fighting your determinism goal) and burns frames you can't spare. Hand-placed positions look more designed, are perfectly reproducible, and are far cheaper. If Antigravity pushes back toward a force sim, overrule it — for a deterministic projected demo, fixed wins decisively.


The rogue loop must read as "wrong" from across the room. Its entire job is to be alarming against the calm swarm. If Antigravity's first pass is subtle, push it hard: "make the rogue loop unmistakably abnormal — faster, redder, visibly cycling back on itself — so someone 40 feet away instantly sees something is wrong." Then the severing-to-grey at resolution becomes a genuinely satisfying payoff you can narrate: "and there — the swarm isolates the rogue thread."


Sync the cascade with the agent panels — or it looks like two disconnected widgets. The graph nodes lighting up at Phase 3 must feel like the same event as the agent panels activating (Task 3). Same stagger, same rhythm. Watch them side by side. If they fire on different timings, it breaks the illusion of one unified swarm. This synchronization is what makes the graph feel like it belongs.


Take the performance report seriously. This prompt explicitly asks for before/after fps at the Phase 3 peak, with the graph on vs. off. Read that number. If turning the graph on drops you from 60fps to 40fps at the busiest moment, that stutter will be visible on a projector and undermine everything. The toggle exists precisely so you can make an honest call: if it costs too much, present with it off. The demo is complete without it — never sacrifice smoothness for this one extra element.


Because it's toggleable, you have zero risk here. This is the beauty of building it optional. Try it, rehearse with it on, and if it clutters the screen or hurts performance, press 'g' and it's gone — with the demo fully intact. So there's no downside to attempting it. Worst case, you learned it wasn't worth it and you turn it off.



When Task 6 is done (or if you decide to skip/disable it), you've built every feature. What remains is the task that turns "an impressive set of working parts" into "a flawless, cinematic experience": Task 7 — Polish & Stage-Hardening.
Come back and I'll give you Task 7 — unifying all the timing into one choreographed sequence per phase, ensuring graceful degradation if a live feed drops, wiring Osiris's day/night cycle into your dawn transition, the aggressive stage-safety hardening (reset-from-anywhere, key-mash safety, no leaks), a full both-scenarios verification, and the presenter runbook + pre-flight checklist. That's the difference between "works on my machine" and "flawless in front of 100 executives."


The final task. This is where an impressive set of working parts becomes a flawless, cinematic experience — and where you make it impossible to break in front of 100 executives. No new features. Just unify the timing, harden everything, wire in the dawn transition, verify end-to-end, and produce your presenter runbook.
📋 TASK 7 — Polish & Stage-Hardening (NO new features)
# TASK 7 — Polish & Stage-Hardening (NO new features)

All demo components are built (Operations Dashboard, live-map incident, agent 
thought-streams, HUD/money counter, approval card, outro, swarm graph). This final task 
makes them feel like ONE cinematic experience and makes the demo bulletproof for a live 
presentation to 100 C-level executives, running on top of Osiris's live data. Do NOT 
add new features. Only unify, refine, harden, verify, and document. Work through the 
sections in order.

## PART A — Unify timing into one choreographed sequence per phase
Right now each component reacts to phase changes on its own timing. Make every phase 
transition a single directed beat. Create ONE choreography source (a phase-transition 
orchestrator in useDemoDirector or a dedicated composable) with per-transition beat 
timings defined as constants in ONE place (so I can fine-tune pacing during rehearsal).

Define a clear beat ORDER for the key transitions, e.g.:
- p0->p1 (morning -> 4AM flashback): clock rewinds dramatically -> "Human Team Offline" 
  badge appears -> OTIF gives its first tremor on the dashboard -> Sentinel agent 
  activates -> "EARLY SIGNAL" banner. Led, not simultaneous.
- ->p2 (incident): incident banner slides to CRITICAL -> disrupted map node flips red + 
  arcs break -> money counter appears red ("47Mexposed")->dashboardOTIFcrashes+"188customersatrisk"surfaces->gentlecameraeasetothecrisis.Eyeledthroughthestory.-->p3(swarm):banner->"SWARMRESPONDING"->agentpanelsmobilizeinstaggeredcascade->swarmgraphnodeslightintheSAMErhythm->candidatereroutearcsappeardotted->data-result"querying…"revealsland.-->p5(resolution):reroutearcturnssolidgreen->rogueloopseveredtogrey->mapnodessettle->moneycounterHEROflipred->green->OTIFrecoversondashboard->dawnpalettetween(PartC)->[BEAT]->outroeasesin.Themoneyflip+dawntweenaretheemotionalpeak—givethemroom;nothingstepsonthem;theoutroarrivesabeatlater.Tuneeveryoffsetsothewholethingbreathes—nothingabrupt,nothinglaggy.##PARTB—Cross-componentconsistencyaudit-Verifytheagent-panelactivationcadence(Task3)andswarm-graphnodecascade(Task6)fireontheSAMErhythm—oneswarmmobilizing,nottwowidgets.-VerifythePhase2crisisbeatsalign:moneycounterred+dashboardOTIFcrash+maparcsbreaking+bannercriticalshouldfeelsimultaneous/led,notscattered.-VerifythePhase5recoverybeatsalign:moneyflip+OTIFrecovery+greenreroute+rogue-loopsevered+dawn.-AuditvisualconsistencyacrossALLdemocomponents(dashboard,mapincident,agentpanels,HUD,approval,outro,graph):accentcolors,glows,fonts,glass-panelblur,border-radius,spacing,the"SIMULATION"tag.Fixanyoff-palettecolor,mismatchedradius/blur,orstrayfontsothewholescreenreadsasonedesignsystemconsistentwithOsiris.-Auditz-index/layeringacrossallphases:theapprovalcardisaboveeverythingatPhase4;theoutroisaboveeverythingattheend;themoneycounter,activeagenttext,andkeymapnodes/arcsareNEVERobscuredatanyphase;theliveOsirisworldremainsvisible/feltaroundthedemoelements.##PARTC—DawntransitionviaOsiris'sday/nightcycle-Osirishasaday/nightcycle(the'd'keyfromtheREUSEMAP).AtPhase5resolution,programmaticallytrigger/animateatransitionfromadim"night"feeltoabrighter"dawn"feelsotheroomFEELSthecrisislift—reusingOsiris'sexistingmechanismifsafelypossible,orascopedpalettetweenoverthedemolayeriftouchingOsiris'scycleisrisky.EnsureitresetscleanlyonRanddoesn'tleaveOsiris'sownday/nightstatestuck.##PARTD—Stage-hardening(thecriticalpart—reportresultsofeach)Makethedemoimpossibletobreaklive:1.RESETISTOTAL:pressingRfromANYphase(includingmid-typewriter,mid-count-animation,mid-approval,mid-resolution,mid-dawn)instantlyandcleanlyreturnstoapristinePhase0calmmorning—noleftovertext,noorphanedtimers/tickers,nostuckcards,nohalf-applieddawnpalette.TestRfromeveryphaseandfrommid-animationstates.Report.2.KEY-MASHSAFETY:rapidlypressingSPACE(andduringanimations,anddouble-presses)mustneverskipaphase,double-fire,orcorruptstate.Guardtransitionssotheyadvanceexactlyonecleanstepandignore/queueinputwhileatransitionismid-flight.TestaggressivemashingonSPACE/Y/K/Randthetogglekeys.Report.3.K-PATHSAFETY:pressingKatPhase4neverdeadlocks;Yalwaysworksafter;Ralwaysrecovers.TestK->Y,K->R,K->K,Y->R.Report.4.COEXISTENCEWITHOSIRISKEYS:confirmthedemo'sSPACE/Y/K/R/'g'neverconflictwithOsiris's'c','d','f','e','s',Escape,andthatbothkeysetswork.Report.5.GRACEFULLIVE-DATADEGRADATION:thescriptedspine(dashboardmetrics,incident,agents,HUD,approval,outro)mustrun100%evenifOsiris'slivefeedsareslow,error,orempty.Simulatelivefeedsfailing/returningemptyandconfirmthescriptedstoryplaysflawlessly(therealworldjustgetsquieter).Report.6.ONE-TOUCH-ASAFETY:theoptionalSCM-panelinjection(fakealertintoOsiris'srealSCMpanelattheincident)mustbepurelyadditive—ifitfails,theisolatedspineisunaffected.Confirm,orifnotyetimplemented,noteitandensurethearchitecturestayssafe.7.NOCONSOLEERRORS:thefullrunmustproducezeroconsoleerrors/unhandledrejectionsfromdemocode.Fixany.Report.8.LEAKCHECK:runR->fullsequence10+timesconsecutively;confirmnogrowingtimercount,noaccumulatinglisteners,norisingmemory,nodegradingframerateoverrepeatedruns(rehearsalsrunthismanytimes).Report.##PARTE—Performanceverification-Confirmsustained60fpsat1920x1080throughtheheaviestmoment(Phase3:livemap+dashboardanimations+5typewriterpanels+swarmgraph+rogueloop+HUDallanimating).Ifanymomentdropsframes,identifytheculpritandoptimize(swarmgraphpulsedensity,arccount,typewriterre-renderefficiencyareusualsuspects).Reportbefore/afterfps,andconfirmthedemostillholds60fpswiththeswarmgraphtoggledON;ifnot,recommenddefault-OFF.-Confirmfastloadandacalm,stablePhase0(nolayoutshift/pop-in)sothepresentercanleaveitrunningbeforestarting.##PARTF—Presenterrunbook(deliverabledoc:src/demo/PRESENTER.md)CreatePRESENTER.mdcontaining:-Howtorun(devcommand;productionbuild/runcommand).-Keyboardcontrols:SPACE(advance),Y(approve),K(hold),R(reset),'g'(toggleswarmgraph),plusanotethatOsiris'sownkeysstillwork.-Configflagsandexactlywheretosetthem:ACTIVESCENARIO,DEMOMODE,USELIVEDATA,SHOWSWARMGRAPH.-Thefull6-phaserunbook:foreachphase,(a)whatappearsonscreen,(b)thepresenter'sspokenline(fromconfig.dialogue),(c)thekeytopresstoadvance.Includetheopening"normalTuesdaymorninginBangkok"lineandtheclosing"44M protected · no action required" mic-drop.
- The KEY NARRATIVE BEATS to point at: the asleep/quiet region at Phase 0; OTIF 
  dropping BEFORE revenue reacts; the near-frozen 04:02->04:11 clock (9-minute save); 
  the "188 customers at risk" human number; the pre-approval compliance chips; the 
  money-counter hero flip.
- DAY-OF PRE-FLIGHT CHECKLIST: reliable wifi confirmed (live ambient data), disable OS 
  notifications/screensaver/auto-updates, display at 1920x1080, browser full-screen, do 
  one silent R -> full run before the audience arrives, confirm R resets cleanly, decide 
  swarm graph on/off based on the venue machine's performance.
- "IF SOMETHING GOES WRONG": press R to return to a clean calm state at any time; the 
  scripted story runs even if live data drops.

## CONSTRAINTS
- NO new features/components. Polish, unify, harden, verify, document only.
- Preserve all guarantees: scripted spine local & deterministic; config-driven; live 
  data is ambient-only and degrades gracefully; Osiris intact; runs at 1920x1080.
- Everything still switchable to the banking scenario later via ACTIVE_SCENARIO.

## DELIVERABLE
A stage-ready demo: every phase transition is one choreographed cinematic beat; the 
visual language is consistent across all demo components and with Osiris; the dawn 
transition lifts the room at resolution; it holds 60fps at 1920x1080; it survives 
R-from-anywhere, key-mashing, the K-path, Osiris-key coexistence, and live-feed failure 
with zero errors or leaks; and PRESENTER.md gives a full runbook + pre-flight checklist. 
Report the results of every check in Part D, the fps numbers in Part E, and confirm the 
choreography in Parts A-C. Explain your plan before making changes.

A few tips for this final stretch
This is where the demo becomes good. Everything until now made the pieces work. Part A — unifying the timing into led, choreographed beats — is what makes it feel like a film instead of a dashboard reacting to keypresses. Spend real time here. The difference between "five components each noticing a phase change" and "a single directed beat that leads the audience's eye through the story" is the difference between polite nods and a room that leans forward. Watch each transition end-to-end, repeatedly, and tune the offsets until they breathe.


Rehearse on the actual venue hardware, and do it early. The number one cause of live demo failure isn't code — it's the environment. A projector at 1920×1080 in a bright ballroom renders very differently from your MacBook. Fonts thin out, glows wash out, colors shift. Test on the real display days ahead. If you can't get the exact projector, at minimum lock your browser to 1920×1080 and step back 15 feet from your screen to sanity-check legibility.


The reset key is your confidence. No matter what happens on stage — a fat-fingered keypress, a question that derails your flow, a weird state — R returns you to a pristine calm morning instantly. Rehearse hitting it. Know it always works (Part D tests exactly this). That certainty is what lets you present relaxed, because nothing is unrecoverable. A presenter who knows they can always reset is a calm presenter.


Take the leak test (D8) and fps report (E) seriously — read the numbers. You'll run this demo far more in rehearsal than in the actual show. A slow leak won't show on run #1 but will cause baffling jank by run #15 — possibly mid-presentation. And if the swarm graph drops you below 60fps at the Phase 3 peak, that stutter will be visible projected. Trust the data: if the graph costs too much, present with it off. Smoothness beats one extra element every time.


Read PRESENTER.md out loud as if you're on stage. Once it's generated, actually walk through it, speaking the dialogue lines. Do they feel natural coming out of your mouth? Tweak any that don't. The best visuals still fall flat with stiff narration — and confident, well-timed narration can carry even a modest moment. The runbook is where the visual demo and your delivery finally merge.


Lean into "it's real" during the pre-flight. Since you confirmed reliable wifi and live ambient data, your single strongest line is available: gesture at the live map and say "everything moving here is real — real aircraft, real vessels, right now. Only the incident we're working through is simulated." Make sure the live feeds are actually flowing before you go on (part of your pre-flight). That authenticity is your credibility multiplier — don't waste it by presenting with dead feeds.



That's the complete arc — from cloning Osiris to a stage-ready, cinematic agentic war room that opens on a calm Bangkok morning, shatters into a 4 AM crisis over a genuinely live world, mobilizes a visible swarm of agents, gates the big decision behind a human, and resolves to a satisfying "$44M protected · no action required" before the team wakes up.
When you've run Task 7 and done a full rehearsal, if you'd like, come back and I'll help you with stage delivery — the pacing of what you say over each phase, where to pause, which numbers to point at, how to handle Q&A, and how to land that closing line so the room remembers it. The build is only half the demo; how you present it is the other half.
Go make it flawless. This is going to be genuinely impressive.


