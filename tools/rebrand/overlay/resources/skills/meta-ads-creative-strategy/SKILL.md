---
name: meta-ads-creative-strategy
description: MMI (Maaramid Market Intelligence) creative strategy for Meta (Facebook / Instagram) ads - MMI Phase 3 Message Architecture and Phase 4 Campaign Translation. Reads Market Temperature (Cold, Searching, Comparing, Deciding, Returning), checks Claim Saturation, pairs every pillar with proof, builds concepts with opening lines in the customer's words, sequences Phase A/B tests, then writes scripts, 3-variant static copy, Taglish copy, creator/designer briefs, a variation matrix, and a kill/scale plan. Also iterates on past winners. MUST USE when the user says "phase 3", "phase 4", asks for ad ideas, angles, hooks, scripts, ad copy, creative concepts, a creative brief or creative request, a testing plan, offer or bundle ideas, or says "ano pwedeng creatives", "gawa ng ad copy", "script para sa UGC", "bakit nag-win 'tong ad", "next creatives". Uses meta-ads-market-research output (Phase 0 + Customer Language Bank); hands scripts to meta-ads-video-editor.
---

# MMI Creative Strategy (Phase 3 → Phase 4)

The job: turn validated intelligence into creative that's **grounded in proof and in the customer's own
words**, deployed in the right order, and structured so every test teaches something.

A simple way to explain Meta to clients: the algorithm is a **matchmaker** that only finds what your brief
says - **Goal** (campaign objective) + **Guest list** (ad set) + **Introduction** (the ad). Targeting stays
broad; the ad does the filtering. When results are off, ask "Saang part ng brief ba 'to?"

## Inputs

Best: the MMI files from meta-ads-market-research (`~/meta-ads-toolkit/clients/<client>/mmi/` or pasted):
Phase 0 business profile and the **Customer Language Bank** (verbatim pains, wants, objections, buying
triggers, exact phrases, assumption check). Treat the Bank as the VoC data and its assumption check as the
validation. Older MMI files (Validated Customer Profile, Messaging Pillars, claim rules, gap report) work too.
If nothing exists, offer to run meta-ads-market-research first (Phase 0 + customer language). If the user
wants a quick job anyway, gather the minimum (customer, offer, objections, real proof available) and label
everything built on it **"unvalidated - walang customer language"**.

**Quick requests** ("gawa ng hooks", "5 angles", "isang script") - just write what was asked using
`references/copy-and-briefs.md`, grounded in the Bank. Run the full Phase 3 / Phase 4 below only when the
user asks for a full creative strategy, a testing plan, or "phase 3 / phase 4".

Also: brand voice (tone, signature phrases, term of address, signature emoji, colors), assets available
(photos, footage, UGC, founder on camera, creators), channel/format focus (default Meta ads).

## Phase 3 - Message Architecture

Read `references/phase3-message-architecture.md` and run all six sections in full:
1. Market Temperature Read (evidence per level; "not evidenced" if none)
2. Claim Saturation Check (saturated claims to avoid, open claim space)
3. Messaging Pillar → Proof Pairing ("proof needed" flags)
4. Message-to-Temperature Map
5. Creative Concepts (3-5, each tied to pillar + temperature + proof, opening lines in VoC language)
6. Deployment Sequence (Phase A / Phase B / gaps)
→ Message Architecture Brief (5 bullets).

## Phase 4 - Campaign Translation

Read `references/phase4-campaign-translation.md`. If daily testing budget, target CPA/ROAS, objective, or
placements are unknown, **pause here only** and ask in plain words ("Magkano ang daily testing budget, at may
target cost per result ka ba?"). Then run all steps: objective mapping → scripts (video + static copy) →
hook/hold prediction → variation matrix → budget & kill/scale plan → competitive reality check → feedback
loop setup → Campaign Execution Brief.

Write all copy and briefs with `references/copy-and-briefs.md`: three jobs of an ad (attention, comprehension, action) + stranger test (comprehension test),
3-variant static copy + headline bank, 2 video copy options, Taglish conventions, closing structure,
creator/designer brief fields, testing tracker, naming, monthly production rhythm.

## Iteration mode (past results)

When the user brings results: for each winner, say why it likely won using its numbers (hook rate → the
opening; CTR → message/offer; conversion → audience/offer/page fit). **Repeat the structure, not the ad**:
3-5 variations changing ONE variable (setting, creator, outfit, hook, proof presentation) + one fresh
concept. Separate the concept from the execution: a weak execution doesn't kill a concept yet. Run the
Phase 4 feedback loop (Step 7) so Phase B is briefed on updated intelligence.

## Where to save

`~/meta-ads-toolkit/clients/<client>/mmi/phase3.md` and `phase4.md` when files are available; otherwise
chat or a document. For client review documents: `<CLIENT> - <DATE> - <FORMAT> - FOR REVIEW` with CONTENT
COPY and CREATIVES blocks. Next: meta-ads-video-editor to produce; meta-ads-metrics-reader to read results.

## Rules

1. No pillar, claim, or proof beat without backing - flag "proof needed" and the proof type (testimonial,
   demo, stat). Scripts on unproven pillars are **not ready to produce**.
2. Gap-report angles stay "unvalidated" until they pass proof-pairing.
3. Every concept traces to a pillar, a temperature level, and a proof point (or a "proof needed" flag).
4. Respect the claim rules (✅ Use / ❌ Avoid / Mandatories) when the research has them.
5. Meta policy: no "you" statements asserting personal attributes ("Ikaw ba ay mataba?"), no exaggerated
   health/income claims, no weight-loss before/after; care with special ad categories.
6. Benchmarks are labeled industry-standard or qualitative estimate.
7. Talk in the user's language; copy in the audience's language (Taglish for PH unless told otherwise).
8. One client per conversation/folder - never blend clients.
