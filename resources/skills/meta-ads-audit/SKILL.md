---
name: meta-ads-audit
description: Meta Ads account audit using the "5 Butas" (funnel leak) lens. Reviews tracking, objectives, structure and budgets, audiences, creatives, delivery, the funnel after the click (website, Messenger, marketplace) and efficiency - scores it /40, writes a findings narrative (biggest leak, Meta vs real sales, gap to target) and a prioritized fix list. Includes a pre-launch checklist, post-publish delivery check and incident report template. Works from an Ads Manager export, screenshots, a connected Meta Ads tool, or checklist answers. MUST USE when the user asks to audit, review, check, or diagnose an ad account or campaign, says "i-audit", "account audit", "bakit hindi nagco-convert", "ano mali sa ads ko", "health check", "pre-launch check", "incident report", or hands over an Ads Manager export and wants to know what to fix. For reading a single report without a full audit use meta-ads-metrics-reader.
---

# Meta Ads Audit

The job: find what's costing the account money, rank it by impact, and say exactly how to fix it. Specific
("Campaign 'Sales - Nov' optimizes for Landing Page Views but the goal is purchases"), never generic
("improve your targeting").

The lens: the budget is water in a bucket - more water doesn't fix holes. Every finding maps to one of the
**5 Butas** (details in `references/audit-checklist.md`): 1 Malabong goal · 2 Mahinang offer · 3 Creative
na dinadaanan lang · 4 Masyadong mabilis mag-desisyon · 5 Maling numero.

## Where to save

`~/meta-ads-toolkit/clients/<client-slug>/audit-<date>.md` when files are available; otherwise chat or a
document. Talk in the user's language; write the report in plain English (or what they ask) a business owner
can follow.

## Step 1 - Intake and data

Ask (one message, only what's missing) - from the intake list in the checklist: the business goal and what a
result is worth (target CPA/ROAS), AOV and margin, monthly budget, where customers buy, who answers
inquiries and how fast, how offline/inbox sales are counted, recent changes. Never ask for passwords or
login codes - ask for access through Business Manager partner access, exports, or screenshots.

Data, best first:
1. **A connected Meta Ads tool** - read-only; never change budgets, status, or settings during an audit.
2. **An Ads Manager export** - Ads level, last 30 days (+ previous 30). Columns listed in the checklist.
   If you can run code: `scripts/analyze_export.py <file> --target-cpa N` (or `--target-roas N`).
3. **Screenshots** of campaign/ad set/ad levels and Events Manager.
4. **Nothing yet** - walk through the checklist as questions, a few at a time.

## Step 2 - Audit

Go through all 8 areas of `references/audit-checklist.md`. Mark each item **OK / Issue / Unknown** with
evidence. Unknown is a valid answer; guessing is not. Tag every Issue with its butas number.

## Step 3 - Score, narrative, fixes

- Score each area 0-5 (rubric in the checklist), total /40.
- Write the **findings narrative** in the order given in the checklist (biggest conversion leak → Meta vs
  real sales → high-CTR/zero-sale ads → are winners scalable → budget concentration → discount dependence →
  gap to target).
- Build the fix list: **P1 stop the bleeding** (tracking, wrong optimization, money on dead ads, delivery or
  policy problems) → **P2 structure** → **P3 growth**. Each fix: what, where (exact name), why (the number),
  butas, effort, success signal.

## Step 4 - Report

Use the report template in the checklist. Lead with a 5-line executive summary in business words and a
"which butas are leaking" line. Hand over: the summary in chat, the full report, and the 3 fixes for this
week. Suggest next: meta-ads-creative-strategy if creative is the leak; meta-ads-market-research (MMI) if
the offer or message is; meta-ads-metrics-reader for ongoing monthly reads.

## Also in this skill

- **Pre-launch checklist** - before any new campaign or promo goes live.
- **Post-publish delivery check** - re-check status and actual delivery after every launch/edit.
- **Incident report template** - when something went wrong (ad set off, wrong budget, broken link).
All three are in `references/audit-checklist.md`.

## Rules

- Judge on enough data: under ~1,000 impressions or ~2-3× target CPA spent, call it "not enough data yet".
- Account history and the user's targets first; general benchmarks last, labeled rough.
- "Observed" for what the data shows; "likely" for explanations. Separate ad factors from business factors.
- Never present Meta-attributed revenue as total revenue; marketplace results can't be judged on Meta's
  purchase events.
- Never make changes in the account. Recommend; the user decides.
- Don't promise results; say what each fix addresses and how to measure it.
