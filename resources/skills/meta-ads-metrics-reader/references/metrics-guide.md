# Metrics guide

## The 5 butas (leaky-bucket diagnosis)

| # | Butas | What it looks like in the numbers | Fix direction |
|---|---|---|---|
| 1 | **Malabong goal** (objective misalignment) | Lots of likes/clicks/views, few real results; objective is Engagement/Traffic while the goal is sales or messages. Meta does exactly what you ask. | Objective and optimization event = the real result |
| 2 | **Mahinang offer** (weak offer / poor offer-market fit) | Good hook and CTR, poor conversion; objections in comments ("mahal", "may COD?"); people drop at price/shipping | Fix the offer, not the ad: answer "Bakit sa'yo bibili, hindi sa katabi mong seller?" in one sentence |
| 3 | **Creative na dinadaanan lang** (low thumb-stop rate / weak hook / creative fatigue) | Low hook rate / CTR, high CPM, fatigue | New hooks and concepts; a stronger thumb-stop first frame |
| 4 | **Masyadong mabilis mag-desisyon** (premature optimization / learning-phase resets) | Ads killed/edited within a day; ad sets stuck in learning; constant budget jumps | Enough data before deciding; fewer edits |
| 5 | **Maling numero** (vanity metrics / attribution errors) | Reporting likes, reach, or CTR as success; Meta revenue treated as total revenue | Judge on the result tied to the goal and on real sales |

Close a diagnosis with the idea: the ads aren't the enemy - the butas are.

## Targets

- Break-even CPA = average order value × profit margin.
- Break-even ROAS = 1 ÷ profit margin. Profit margin should account for product cost, payment fees,
  shipping/fulfillment, and discount/freebie cost - not just the sticker margin.
- Target = whatever the business needs to profit after fixed costs; if unknown, start at break-even and say so.

## Metric sets by objective

| Objective | Primary | Supporting | Business context to ask for |
|---|---|---|---|
| Website sales | Purchases, cost per purchase, purchase value, ROAS | CTR (link), CPC, CPM, click→LPV, LPV→ATC, ATC→purchase, AOV | Real orders, site issues, stock, promo dates |
| Messages / leads | Conversations started or leads, cost per result | CTR, CPM, reply rate, conversation/lead → sale rate | Who replies and how fast, inbox sales count, lead quality |
| Live selling | Live viewers, comments/mine orders, cost per order | Peak viewers, watch time, reach | Orders confirmed vs paid, host, stock |
| Awareness / traffic | Reach, CPM, ThruPlays, LPV, cost per LPV | Frequency, CTR | What it's feeding (retargeting pool size) |

Mark anything that can't be measured reliably as **"not tracked"** instead of estimating it.

## The chain (where it breaks)

| Step | Metric | Formula | If weak, suspect |
|---|---|---|---|
| Reach cost | CPM | spend ÷ impressions × 1000 | Narrow audience, Q4/double-date season, low ad quality |
| Stop the scroll | Hook rate (video) | 3-sec plays ÷ impressions | First frame / first line (butas 3) |
| Keep watching | Hold rate (video) | ThruPlays ÷ 3-sec plays (definitions vary - state yours) | Slow middle, hook-content mismatch |
| Get the click | CTR (link) | link clicks ÷ impressions | Unclear offer, weak CTA, wrong message for temperature |
| Land | Click → LPV | LPV ÷ link clicks | Slow page, junk clicks (Audience Network), broken link |
| Want it | LPV → ATC | ATC ÷ LPV | Price shock, page ≠ ad, weak product page (butas 2) |
| Buy it | ATC → purchase | purchases ÷ ATC | Shipping fee, payment options, trust, tracking |
| Close (messaging) | Conversation → sale | sales ÷ conversations | Reply speed, script, price objection |
| Bottom line | Cost per result / ROAS | spend ÷ results / value ÷ spend | Weakest link above |
| Saturation | Frequency | impressions ÷ reach | Small audience, ad age |

Explain funnels to clients in "X out of 100" words: "Out of 100 people who clicked, 62 saw the page, 9 added
to cart, 2 bought."

## Three revenue views (never mix them)

1. **Meta-attributed** - purchase value and ROAS in Ads Manager.
2. **Backend revenue** - total orders in the period from the store, CRM, or inbox (source of truth for sales).
3. **Blended** - total sales ÷ Meta spend (MER).

Marketplace destinations (Shopee/Lazada/TikTok Shop): report separately using outbound clicks + order
reconciliation, UTMs, or voucher codes. Don't judge them on Meta's purchase events.

## Benchmarks - where they come from

1. **The account's own history** - last 3-6 months, excluding Q4/peak-sale spikes. This is the benchmark.
2. **The user's targets** (break-even and goal CPA/ROAS).
3. **General rough ranges** - only for new accounts with no history; always labeled rough:
   - Link CTR on cold: under ~0.7% weak; 1-2% healthy; retargeting higher.
   - Hook rate: under ~20% weak; ~25%+ generally strong for cold video.
   - Hold rate (ThruPlay ÷ 3-sec): under ~15% weak; 25%+ good for short ads.
   - Click → LPV: under ~60% suggests a slow page or junk clicks.
   - Frequency on cold prospecting: watch from ~2-3 in 7 days; rising frequency with falling CTR = fatigue.
   - CPM: compare with the account's own history only.

Windows: use the **last 7 days** to make optimization decisions and the **last 14 days** (or longer) as the
comparison baseline, so one bad day doesn't drive a decision.

## Extra KPIs worth tracking

- **Primary vs secondary KPIs** - name them per objective. Never pause on a weak secondary metric (CTR, CPM)
  when the primary KPI (cost per purchase/lead, ROAS) is on target.
- **Landing page drop-off rate** = (link clicks − landing page views) ÷ link clicks - high = slow page or junk clicks.
- **AOV − CPA** (order value left after ad cost). A quick sanity check, not true profit (doesn't include
  product cost, fees, shipping).
- **MER** = total revenue ÷ total ad spend (the blended view).
- **LTV : CAC** - for repeat-purchase businesses, judge acquisition cost against lifetime value, not one order.
- **Lead-gen backend** - lead → appointment → show-up → close. A cheap lead that never shows is not cheap.
- **Ads Manager custom metrics** - create Hook rate (3-second video plays ÷ impressions) and Hold rate
  (ThruPlays ÷ 3-second video plays) as custom columns so they show in every report.

## Enough data? (judge the ad set before the ad)

1. **Ad set / campaign first.** Wait until it has spent ~3-5× target CPA (or ~3-5× AOV) or run ~7 days.
2. **If the ad set is on target, leave the ads alone** - even if spend looks uneven. Meta distributes spend
   across ads as a team; pausing a "bad-looking" ad can hurt the set.
3. **Only if the ad set is off target**, look at ads: pause those that spent ~2-4× target CPA with poor
   results and weak leading signals (hook, CTR).
4. Ads that get almost no spend after ~14 days are a signal Meta doesn't find them resonating - treat as
   finished and replace with new concepts.
5. Think twice before pausing a top-spending prospecting ad whose CPA is only slightly above target - it
   often feeds the retargeting pool; check what happens to retargeting results first.
6. Before judging hook/CTR, ~1,000+ impressions. Before judging the bottom line, ~2-3× target CPA spent or
   ~3+ results.
7. Learning phase: still learning → usually **Gather more data**, unless it's clearly wasting money.

## Decision words

Per ad set / campaign:

| Decision | When |
|---|---|
| **Continue** | On target with enough data; leave settings alone |
| **Scale carefully** | Beating target for several days with real volume → raise budget ~20-30% every 2-3 days or duplicate into scaling |
| **Revise** | Part of the chain is strong, part is weak → change the weak part (new hook on the same body; same ad with a new offer/page) |
| **Test** | Need a new concept/angle/format because the current set is exhausted or flat |
| **Pause** | Ad set off target after enough data; pause the ads inside that spent ~2-4× target CPA with poor results AND weak leading signals |
| **Gather more data** | Not enough data or still in learning - say when to re-check and which number decides |

Per ad (client-friendly buckets): **Worked** · **Promising** · **Needs better closing** (good attention,
weak conversion) · **Rework** · **Can't judge on Meta alone** (marketplace/offline sales).

Fatigue (frequency up, CTR down, CPA up over 1-2 weeks) → refresh the creative before touching the audience.

## Report setup

- Save a column preset per business type (e-commerce / lead gen / messaging). Put delivery, attribution
  setting, bid strategy, budget, spend, results, and cost per result first, then the funnel columns and the
  hook/hold custom metrics.
- Only compare campaigns that use the same attribution setting.
- iOS opt-outs under-report upper-funnel events (only the top-priority event comes back for those users) -
  don't over-read small funnel-step drops.

## Quick cause map

- High costs → the ad isn't resonating with the people it reaches.
- Low CTR → the hook isn't tied to a real pain or desire.
- Works small but won't scale → the message is too shallow/narrow for a bigger audience.
- Clicks but no conversions → objections aren't answered (in the ad or on the page/inbox).
- Before blaming "an algorithm update", rule out: creative fatigue, tracking/signal problems, offer mismatch,
  audience behavior changes, seasonality.

## Common diagnoses

- High CPM, good CTR, OK CPA → fine.
- Good CTR, poor conversions → after-the-click problem (page, offer, price, checkout, reply speed, tracking).
- Low CTR, good hook rate → people watch but don't act: weak offer/CTA or payoff ≠ hook.
- Low hook rate → the first 1-3 seconds.
- Results in Ads Manager but no real sales → duplicated events, wrong event, attribution window.
- Sudden CPA jump → what changed: budget jump, season, creative age, promo ended, stock, site outage, an ad set
  accidentally off.

## Monthly client report

Flow: **RESULTS → LEARNINGS → RECOMMENDATIONS → CLIENT INPUT → NEXT MONTH**

Schedule: last 2 business days - lock the date range and data sources · days 1-2 export · days 2-3 compare
· days 3-4 draft · QA · send · log client decisions with owners.

```markdown
# <Client> - Monthly Ads Report - <Month>

| Period (time zone) | Prepared by | Objective(s) | Data sources | Important context |
|---|---|---|---|---|

## 1. Ad Results
<headline sentence in business terms>
| Metric (for this objective) | This month | Last month | Change |
|---|---|---|---|

## 2. Budget & Spend
| Planned | Actual | Difference | Mid-month changes and why |
|---|---|---|---|

## 3. What's Working
- Observed: ... · Likely why: ...

## 4. What's Not Working
- What happened → possible cause → what needs to change (ad factor or business factor)

## 5. Recommendations
| Action | Reason | Success signal | Owner / timing |
|---|---|---|---|

## 6. Client Input for Next Month
- Products to push · promos/events · business priorities · budget · stock or price changes

## Client input needed
- <decisions the client must make, with deadline>
```

Pre-send QA:
1. Date range and time zone match the sources.
2. Spend matches billing / Ads Manager.
3. Every number has a source; no averaged percentages.
4. Meta revenue not presented as total revenue.
5. "Observed" vs "likely" language used.
6. Every recommendation has an owner and a success signal.
7. Wins first, problems paired with the planned fix; no blame on the client.
8. Jargon explained or removed.

## 5-slide client presentation

1. **At a Glance** - one headline sentence + this month vs last month table.
2. **What We Ran** - Ad | Creative link | Key data | Observation | Recommended action.
3. **Where Customers Dropped Off** - the funnel in "X out of 100" words.
4. **Worked / Promising / Needs Better Closing** - three buckets only.
5. **What We'll Do Next** - max 3 actions.

## MMI feedback loop (when the account runs on MMI)

After Phase A results:
- **→ Phase 2:** did the winner attract the predicted Validated Profile or a different one? Which Phase 2
  statuses do results confirm, contradict, or nuance?
- **→ Phase 1:** new objections, language, or themes in ad comments/DMs? List exactly what to collect and tag.
- **→ Phase 3:** did a temperature level perform differently from its evidence volume? (Thin-evidence concept
  beating a strong-evidence one → revisit the Temperature Read.)
- Phase B gets briefed on the updated intelligence.
