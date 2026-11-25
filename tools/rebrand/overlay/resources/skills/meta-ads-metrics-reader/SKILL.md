---
name: meta-ads-metrics-reader
description: Reads Meta (Facebook / Instagram) ads results in plain language - CPM, CTR, hook and hold rate, cost per result, ROAS, funnel drop-offs, Messenger and marketplace results - finds which "butas" is leaking, and gives each ad a decision (Continue, Scale carefully, Revise, Test, Pause, Gather more data). Writes the monthly client report, a 5-slide client presentation, and the MMI performance feedback loop. Works from an Ads Manager export, screenshots, pasted numbers, or a connected Meta Ads tool. MUST USE when the user asks what their ad numbers mean, says "basahin mo metrics ko", "okay ba 'tong results", "bakit mahal CPM / CPA", "which ad should I pause / scale", "monthly report para kay client", "weekly check", "feedback loop", pastes Ads Manager numbers or screenshots, or asks to explain a metric. For a full account health check use meta-ads-audit.
---

# Meta Ads Metrics Reader

The job: numbers in, decisions out. The user needs to know **what's working, what's leaking, why, and what to
do next** - and be able to explain it to a client in plain words.

Framing that clients understand: the ad budget is water poured into a bucket. Adding budget doesn't fix a
**butas** (funnel leak). The five common butas are in `references/metrics-guide.md` - find which one is leaking.

Talk in the user's language (Taglish is fine). Explain a metric the first time it matters, in one line, with
what it says about *this* ad.

## Step 1 - Get the numbers

Accept an export file, screenshots, pasted numbers, or a connected Meta Ads tool (read-only - never change
anything in the account). With a file and the ability to run code, run
`scripts/analyze_export.py <file> [--target-cpa N] [--target-roas N]` - it normalizes Ads Manager columns,
recomputes ratios from raw totals, and flags obvious problems.

Ask once, only if missing:
- **Objective and what a result is** (purchase, message, lead, booking, live-selling sale) and the
  **target** cost per result or ROAS. No target? Help compute it - see "Targets" in the guide.
- **Date range** (lock it, with time zone) and what changed (new creatives, budget changes, promo, holiday,
  stock issues, site problems).
- **Real sales** if they have them (orders, inbox sales, marketplace orders) - Ads Manager attribution isn't
  total revenue.

## Step 2 - Read top-down

Follow `references/metrics-guide.md`:
1. **Enough data?** If not, say so and when to look again (butas #4 is deciding too fast).
2. **Bottom line first** vs target - on the metric set for this objective.
3. **Find the leaking butas** - walk the chain: CPM → hook/CTR → click→landing → on-site steps or
   conversation → sale; and check the business side (stock, price, reply speed, site, offer).
4. **Trend** - vs the previous period. Rising frequency + falling CTR + rising CPA = fatigue.
5. **Decide per ad and ad set** with the decision words in the guide.

## Step 3 - Deliver

**Quick read (default):**
```
## Bottom line
<2-3 sentences vs target>
## What the numbers say
| Ad | Verdict | Key numbers | Observed | Likely why |
## Which butas is leaking
<the weakest link + evidence>
## Do next
| Action | Reason | Success signal | Owner / timing |
```

**Monthly client report / presentation:** use the "Monthly client report" and "5-slide presentation" sections
of the guide.

**MMI feedback loop:** when the account was built with MMI (meta-ads-market-research +
meta-ads-creative-strategy), finish with the feedback-loop block from the guide - what updates in Phase 1, 2,
and 3 before Phase B.

## Rules

- Write **observed** for what the data shows and **likely / may have** for explanations. Every problem:
  what happened → possible cause → what needs to change. Keep ad factors apart from business factors.
- Recompute ratios from totals; never average percentages across ads.
- One purchase is not a winner. Prefer steady volume at a slightly lower ROAS over a one-sale ROAS spike.
- CTR alone never keeps an ad on conversion budget.
- Separate the concept from the execution: "don't kill the angle yet" if only the execution was weak.
- Never present Meta-attributed revenue as total revenue. Marketplace (Shopee/Lazada) results can't be
  judged on Meta's purchase events.
- Account history and the user's targets beat generic benchmarks; benchmarks are labeled rough.
- Never promise results; give the next test and the number that would confirm it.
