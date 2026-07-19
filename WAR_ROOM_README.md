# Agentic War Room — Live Demo

A cinematic, keyboard-driven executive demo that shows how a swarm of AI agents runs a **digital twin** of a global supply chain: it detects a crisis overnight, works the problem in parallel, asks a human for the one decision that matters, and resolves it — all before the operations team wakes up.

The demo runs **on top of a genuinely live world**: the map underneath shows real aircraft, ships, weather, and news streaming in real time (the "Osiris" platform). The only thing simulated is the fictional supply-chain incident we work through — so the audience sees a real, moving world with a believable crisis playing out on it.

> **The one-liner for the room:** *"Everything moving on this map is real — real planes, real ships, right now. The only thing simulated is the incident we're about to resolve."*

---

## What this app does

- **Opens on a global "living twin"** — a rotating 3D globe of the real world, framed as an operation watched 24/7 by AI agents across every time zone.
- **Descends into a single company** — *Cymbal Logistics* (fictional), HQ in Bangkok — and its calm morning operations dashboard.
- **Plays a scripted crisis** — a port hub goes dark overnight; on-time delivery and revenue come under threat.
- **Shows the AI swarm reasoning** — five specialist agents "think out loud," pull data, and converge on a mitigation plan.
- **Gates the big decision behind a human** — a phone-style approval card; the AI *prepares* but only *acts* on sign-off.
- **Resolves and reassures** — a satisfying "revenue protected / crisis contained" payoff and a calm morning-after summary.

Everything in the storyline is **scripted, local, and deterministic** — no live AI inference, no network dependency for the narrative. It plays identically every time and can be reset instantly, so it's safe to present live. The live world data around it is ambient: if a feed is slow or down, the story still runs perfectly.

### Business framing (why it matters)
- **Operational reality moves faster than the P&L.** On-time delivery craters *before* revenue reacts — the agents catch the problem hours before a human would.
- **Scale no human can watch.** Parts of the business are always "asleep" in some time zone; the agents watch all of them, all the time.
- **AI prepares, humans decide.** The high-stakes action requires explicit executive authorization — pre-validated as compliant and auditable.
- **Minutes, not hours.** The entire incident is detected, analyzed, and resolved in ~9 minutes, overnight.

---

## The scenario, phase by phase (business language)

The story follows *Cymbal Logistics*, a global freight & supply-chain company headquartered in Bangkok. The presenter advances each beat with the **SPACE** bar. The dashboard's single "North Star" number changes with each phase so the audience always knows what to look at.

### Cold open — "The Living Twin" (global view)
The screen opens on a slowly rotating 3D globe of the **real world**, with live aircraft and ships in motion. A headline frames the concept: Cymbal runs a live digital twin of its **entire** global operation — *12,480 assets tracked, 5 regions online, 5 AI agents on watch, 24/7*. A coverage sweep ripples across every region and returns "all nominal."
> **The point:** *"AI watches everything, everywhere, all the time — including the time zones your people are asleep for."*

### Phase 0 — A normal Tuesday morning · 08:14 local
The camera flies down from the globe into Bangkok HQ. A calm executive dashboard: **revenue climbing, on-time delivery a healthy 98.7%, 14,203 promises kept today** — every region green (one, the Americas, dimmed and "quiet" because it's night there). This is the baseline: a normal, profitable, uneventful morning.
> **The point:** *"This is what a good day looks like — and what we're about to protect."*

### Phase 1 — The first tremor · 04:02 (overnight flashback)
The clock **rewinds to 4 AM the night before**, while the team slept. The AI's always-on monitoring agent picks up an early warning on SE Asia routes: on-time performance is quietly slipping (**98.7% → 96.1%**). Nothing has visibly broken, and revenue is still fine — the *operational* signal moves first.
> **The point:** *"The agents flag trouble hours before a human would notice — and before it ever touches the financials."*

### Phase 2 — The incident · 04:06
A critical SE Asia port hub (**Meridian Port Hub**) goes dark under an extreme typhoon. On-time delivery **craters to 84%**, and the hero number flips to the money at stake: **$47M in revenue and 188 customer deliveries are now exposed.** Revenue on the dashboard is still flat/green even as operations glow red — the damage is real but hasn't hit the P&L yet.
> **The point:** *"A single point of failure just put $47M and 188 customers on the line — overnight, with no one watching."*

### Phase 3 — The swarm responds · 04:09
Five specialist AI agents mobilize together, each streaming its reasoning and pulling live data:
- **Sentinel** — flags the outage and scope
- **Sourcing** — finds alternate capacity → *"3 viable suppliers · lead-time +1 day"*
- **Logistics** — models the reroute → *"Optimal reroute via 2 hubs · +6% cost"*
- **Finance** — quantifies exposure → *"Revenue exposure $47M · protect $44M"*
- **Comms** — drafts customer & internal messaging → *"84 accounts notified · brief ready"*
> **The point:** *"A coordinated team of agents works the problem in parallel — in seconds, not hours."*

### Phase 4 — Human in the loop · 04:09
The swarm converges on a recommended plan — **reroute via two alternate hubs (North Bay & Oceanic Transit), +6% freight cost, protects $44M** — but it does **not** act on its own. A phone-style **approval request** arrives for the **Chief Operations Officer**, pre-validated with three trust chips: **Within SLA · Customer-notified · Audited.** The presenter approves with **Y** (or can **Hold** with **K**).
> **The point:** *"The AI does all the diligence and prepares a safe, compliant plan — but a human makes the call. Nothing high-stakes happens without sign-off."*

### Phase 5 — Resolved before the team wakes · 04:11
On approval, the network **reroutes instantly**. The hero number flips from red to green: **$44M protected, 188 promises kept, on-time restored to 97.2%.** The whole incident — detected, analyzed, and resolved — took about **9 minutes, overnight**. A calm morning-after summary eases in for when the team logs on at 8 AM: *"No action required."*
> **The point:** *"By the time your people arrive, it's already handled — $44M protected, customers kept, and a full audit trail waiting."*

---

## The AI swarm

| Agent | Role | What it contributes |
|-------|------|---------------------|
| **Sentinel** | 24/7 Threat & Anomaly Detection | Catches the early signal and the outage |
| **Sourcing** | Supplier & Capacity Intelligence | Finds alternate suppliers/capacity |
| **Logistics** | Network & Transit Optimization | Models the optimal reroute |
| **Finance** | P&L & Exposure Quantification | Sizes the $ at risk and the $ protected |
| **Comms** | Customer & Operations Dispatch | Prepares customer + internal messaging |

The agents also appear as a live **swarm topology graph** (toggle with **G**), where they light up in a coordinated cascade and isolate a "rogue" thread as the plan locks in.

---

## Running the demo

```bash
npm install
npm run dev        # http://localhost:3000
# production:
npm run build && npm start
```

Present at **1920×1080**, browser full-screen. Do one silent full run before the audience arrives.

### Keyboard controls
| Key | Action |
|-----|--------|
| **SPACE** | Advance to the next beat (cold-open → morning → crisis → approval) |
| **Y** | Approve the plan (Phase 4 → resolution) |
| **K** | Hold (graceful pause; **Y** still works afterward) |
| **R** | Reset instantly to the calm opening — your safety net at any moment |
| **G** | Toggle the swarm topology graph |

Osiris's own map hotkeys (fullscreen, layers, markets, etc.) keep working underneath.

> **If anything ever looks off on stage:** press **R**. It returns to a pristine opening state instantly, every time.

---

## How it's built (for engineers)

- **Next.js 16 (App Router) + React 19 + MapLibre GL**, TypeScript, Tailwind, Framer Motion.
- The demo layer lives entirely under **`src/demo/`** and is additive over the base Osiris map — it does not modify the live feeds.
- **One shared brain:** `src/demo/useDemoDirector.ts` is a singleton store (via `useSyncExternalStore`) that every demo component subscribes to, so a single keypress drives all visuals in lockstep. The scripted agent "typewriter" playback runs once, globally, from the same store.
- **All content is config-driven** from `src/demo/config/scenario.supplychain.ts` (company, nodes, dialogue, per-phase metrics, agents, money, and the cold-open copy). Swap `ACTIVE_SCENARIO` in `src/demo/config/index.ts` to run a different scenario.
- **Feature flags** (`src/demo/config/index.ts`): `SHOW_SWARM_GRAPH`, `SHOW_DEBUG_OVERLAY`, `DEMO_MODE`, `USE_LIVE_DATA`.
- **Determinism & safety:** every animation/timer is cancellable; **R** resets from any phase with no leftover state; the scripted spine never depends on the network.

Key files: `src/demo/useDemoDirector.ts` (state machine), `src/demo/DemoKeyboard.tsx` (controls), `src/demo/components/` (dashboard, map incident layer, swarm panels, HUD, approval/outro cards, swarm graph, global-twin intro), `src/demo/config/` (scenario + flags). A phase-by-phase presenter script also lives in `src/demo/PRESENTER.md`.
