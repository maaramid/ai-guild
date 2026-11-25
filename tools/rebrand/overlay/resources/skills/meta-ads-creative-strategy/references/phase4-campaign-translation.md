# MMI Phase 4 - Campaign Translation & Performance Loop

Role: senior Meta media buyer and performance strategist. Convert Phase 3 concepts into shootable,
traffickable assets - then close the loop by feeding results back into Phases 1-3.

Inputs: Creative Concepts table · Market Temperature Read · Proof-Pairing table · Deployment Sequence ·
daily testing budget · target CPA/ROAS (or "unknown - recommend benchmark") · objectives available ·
placements (Reels/Stories/Feed/mixed) · brand constraints. **If budget, target, objective, or placements are
missing, pause and ask - the only stop in the chain.**

## Step 1: Temperature → Funnel & Objective Mapping

| Concept | Temperature | Funnel Stage | Recommended Objective | Audience Approach | Destination |
|---|---|---|---|---|---|

- Cold / Searching → prospecting, broad (or interest-based) → Sales/conversions; Traffic/Awareness only if
  budget is too small for conversion optimization
- Comparing → prospecting + light retargeting (engagers) → conversions
- Deciding → retargeting site visitors/engagers/inbox contacts → conversions, proof-heavy
- Returning → retargeting purchasers/customer list → conversions/catalog, repeat/upsell framing
- Messaging businesses: conversion location Messenger/WhatsApp; marketplace sellers: note that
  Shopee/Lazada sales can't be optimized on Meta's purchase events (judge with outbound clicks + order
  reconciliation, UTMs or voucher codes).

Flag any concept whose temperature doesn't cleanly match an available objective - don't force it.

**Objective by goal:** sell → Sales · inquiries/appointments → Leads (or Sales with a messaging
destination) · site visits → Traffic · views/interaction → Engagement · warming cold people → Awareness.
Optional side test: the same creative in a Sales campaign and a Messaging campaign to see which closes better.

**Lead forms:** "Higher intent" (adds a review screen) when lead quality matters; "More volume" otherwise. A
privacy policy URL is required. Send leads straight to a Sheet/CRM so follow-up is fast.

**Audience setup:**
- Default prospecting: broad / Advantage+ audience; interests only as suggestions. Detailed targeting rarely
  makes or breaks a campaign - the creative does the filtering.
- Warm pools (set windows to the purchase cycle): website visitors (1-180 days, specific URLs, top 5/10/25%
  by time spent), ViewContent/AddToCart (filter by product), video viewers (3s, ThruPlay, 25-95%), lead form
  opened but not submitted (up to 90 days), people who messaged the page, page/IG engagers (up to 365 days).
- Exclusions: prospecting excludes purchasers (e.g. last 180 days) and warm pools; retargeting excludes
  recent purchasers; purchasers get a separate retention campaign (repeat, complementary products).
- Minimum retargeting audience ~100 people; aim for 1,000+ for stable delivery.
- Pixel-based audiences refresh automatically; uploaded customer lists don't - re-upload regularly.
- Lookalikes 1-10% (several at once), value-based from Purchase when purchase values exist.

**Advantage+ creative enhancements:** review each one (overlays, touch-ups, image expansion, music, text
variations). Switch off anything that changes the brand look or the claims; check placement previews.

## Step 2: Script Production (per Phase A concept)

| Beat | Time | Content | Reels/Stories adjustment | Feed adjustment |
|---|---|---|---|---|
| Hook | 0-3s | Opening line - on-screen text + spoken | Vertical-native, fast | Can hold slightly longer |
| Agitate | 3-8s | Pain in VoC language (Phase 1 quotes) | | |
| Mechanism / Reveal | 8-15s | The pillar's core message as the solution; show the product working | | |
| Proof | 15-22s | Exact proof from the Proof-Pairing table | | |
| CTA | 22-30s | Platform-appropriate CTA; say exactly what to do / what info to send | | |

Hard rule: if the pillar is "proof needed", do NOT write a confident proof beat - mark the script **NOT
READY TO PRODUCE** and name the proof to gather.

Pacing follows the brand: fast UGC cuts for casual brands; calmer, text-overlay showcases for premium brands
(no "gym-style" fast edits unless they fit). Include 3-5 hook variations per script.

Alongside each video, write the static/carousel copy and the ad copy using `copy-and-briefs.md` (3 labeled
variants + 5-headline bank for statics; Option 1 / Option 2 for videos).

## Step 3: Hook-Rate & Hold-Rate Prediction

| Script | Predicted Hook Rate (3-sec views ÷ impressions) | Predicted Hold Rate (ThruPlays ÷ 3-sec views) | Reasoning | Benchmark reference |
|---|---|---|---|---|

Ground predictions in general benchmarks where they exist (e.g. ~25%+ hook rate is generally strong for cold
video) and mark the rest **qualitative judgment only**. Definitions of hold rate vary - state the one used.

## Step 4: Creative Variation Matrix

Phase A concepts only, ≥3 variations each, isolating ONE variable per variation:

| Variation | Concept | What's different (hook / actor / pacing / proof presentation / format / placement) | Hypothesis |
|---|---|---|---|

This separates "the concept failed" from "this execution failed".

Variables to isolate, from biggest to smallest: **message/angle** (or persona framing of the same core
message) → **format** (UGC, demo, POV, static, carousel, meme/native) → **hook** (first 1-3 s / first line)
→ **voice** (customer, founder, expert, creator) → **execution** (setting, actor, pacing, music, text style,
visual treatment). Test from the top: a new execution can't rescue a weak message.

Label every new variation by what changed: whole idea changed = **message test**; only the opening changed =
**hook test**; same idea, new format = **format test**; same idea, new wording/tone/visuals = **execution
test**. Test personas inside message tests - the same core message reframed for different buyer situations -
rather than splitting audiences by persona.

Creative is the main targeting signal now: build each ad for two audiences - the human (does it stop and
persuade?) and the algorithm (is it clear who it's for, so delivery finds similar people?).

Naming: `<CONCEPT>_<FORMAT>_<VAR>_v<n>` (e.g. `OILY-NOON_UGC_H2_v1`), so results map back to concepts.

## Step 5: Budget, Testing & Kill/Scale Plan

- Number of ad sets/creatives to launch relative to budget - flag if the full matrix would fragment learning
  and propose a reduced Phase A lineup.
- Budget priority: proven producers → controlled iterations → new concepts. Separate testing from scaling;
  keep a scaling reserve that isn't spent automatically; stagger launches rather than spreading thin.
- Testing budget allocation: an account with no proven concepts yet puts most of its budget into testing; once winners
  exist, shift most spend to scaling them and keep a steady slice for new tests. Run testing and scaling in
  parallel, testing every week or two.
- Volume: there's no magic number of creatives - a few meaningfully different, good concepts beat many weak
  ones. Write a hypothesis for every ad ("We think <persona> will respond to <message> because <evidence>").
- How many concepts the budget can test: each concept needs roughly 2-3× target CPA of spend to be judged,
  so concepts per period ≈ testing budget ÷ (~3 × target CPA). Plan production to that number.
- Structure: testing campaigns with ad set budgets (controlled spend per test); scaling campaigns with
  campaign budget (Meta allocates to winners). Move winners into scaling rather than editing test ad sets.
- **Learning-phase diagnostic before killing anything:** still in learning (low impressions/results), or out
  of learning with enough data to show a real creative problem? Apply kill criteria only after a clear data
  threshold.
- Kill criteria tied to the target CPA/ROAS (or flag "no benchmark given").
- Scale criteria (what result triggers a budget increase, and by how much - e.g. ~20-30% steps).
- Test duration before the first read (typically 3-4 days minimum at small budgets; longer at very small
  budgets).
- Mid-period checkpoint with a decision table: scale / reallocate / maintain / consolidate / shift destination.

## Step 6: Competitive Reality Check

- Re-check the Claim Saturation read against what's live now in the Meta Ad Library - flag shifts since
  Phase 1 was collected.
- Flag concepts at risk of feeling stale because competitors already run similar creative.

## Step 7: Performance Feedback Loop (closes the system - mandatory before Phase B)

After Phase A results (use meta-ads-metrics-reader to read them):

**→ Phase 2 (Validated Customer Profile):** did the winner attract the predicted profile or a different
one? Did results confirm, contradict, or nuance any Phase 2 status?

**→ Phase 1 (External Intelligence):** new objections, language, or themes in ad comments/DMs not in the
original dataset? List the exact new data to collect and tag (e.g. "tag the 15 comments raising a shipping
objection").

**→ Phase 3 (Message Architecture):** did any temperature level perform differently from what its evidence
volume predicted? (A thin-evidence Phase B concept beating a strong-evidence Phase A concept means the
Temperature Read needs revisiting.)

Phase B is briefed on the updated intelligence, not the original assumptions.

## Final output: Campaign Execution Brief

1. Phase A lineup - concepts / scripts / placements / budget / objective, ready to brief to an editor or creator
2. Kill/scale thresholds (with the learning-phase caveat)
3. Scripts flagged NOT READY TO PRODUCE and the proof needed
4. Single biggest creative or targeting risk to watch
5. Feedback-loop plan - what will update in Phase 1/2/3 before Phase B

Tables throughout, scripts in full. Every element traces to a Phase 1 source, Phase 2 validation, Phase 3
pillar/proof - or is flagged as strategist judgment.
