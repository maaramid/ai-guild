---
name: meta-ads-market-research
description: MMI (Maaramid Market Intelligence) market research for Meta (Facebook / Instagram) ads. DEFAULT = Quick Research - the user gives only a business name, link, FB page, or just a niche ("milk tea sa Cavite", "skin care PH") and Claude does the research itself from public sources (website, FB/IG page, Meta Ad Library, Shopee/Lazada/TikTok Shop/Google reviews, Reddit and forum posts, competitor ads), then returns a one-page brief - business snapshot, customer language bank with sources, competitor ads, gaps, 3 angles and 5 hooks. No form first. The user can paste DMs, comments or reviews anytime and they get merged in. Deep mode (full Phase 0 form + customer language bank + assumption check) only when asked. MUST USE when the user says "MMI", "MMI Start", "market research", "research mo 'to", "i-research", "new client", "prospect", "customer language", "sino target market", "ano sinasabi ng customers", sends a business link or name and asks who to target or what to say in ads, or sends reviews, comments or DMs about a business.
---

# MMI Market Research

**MMI - Maaramid Market Intelligence. Real voices. Real insights.**

What the business believes about its customer is a guess. What customers actually say in public
(reviews, comments, forums) is closer to the truth, and ads written in their words convert better.

**The user's time is the bottleneck.** Do the digging yourself. Don't send forms, don't ask questions
before researching. One input → one brief.

## Modes

| Mode | When | What the user gives |
|---|---|---|
| **Quick Research** (default) | Any business name / link / page / niche | One line. That's it. |
| **+ Merge** | User pastes DMs, comments, reviews, screenshots at any point | The paste. Add to the bank, mark source "client data", update the brief. |
| **Deep** | Only if user says "deep", "full MMI", "phase 0", or it's a paying client onboarding | Phase 0 form → `references/phase0-business-intelligence.md`, then `references/customer-language.md` |

If the input is too vague to search at all (e.g. just "yung client ko"), ask **one** question: name,
link, or niche. Otherwise start researching immediately.

## Quick Research flow

1. **One line to the user**: "Sige, ire-research ko si <X> - mga 5-10 mins." Then go.
2. **Research** following `references/quick-research.md` (sources, search queries, what to grab).
   Run independent searches/fetches in parallel. Hard cap: ~25 tool calls - good enough beats complete.
3. **Write the brief** using the template in `references/quick-research.md`. One page. Tables, not essays.
4. **Save** it (see below) and show it in chat.
5. **Close with one line** offering the next useful thing, e.g.
   "Gusto mo i-script ko 'yung hook #2, gawan ng proposal (meta-ads-proposal), o may DMs ka bang idadagdag?"

Then stop. No budget plans, testing matrices or campaign structures unless asked.

## When they want more creatives

Angles, hooks, scripts, ad copy beyond the brief's 3 angles / 5 hooks → `references/creatives.md`.
Deeper strategy (testing plan, kill/scale) → meta-ads-creative-strategy. Scripts ready to cut →
meta-ads-video-editor. Pitching this business as a prospect → meta-ads-proposal (reuse this brief, don't
re-research).

## Where to save

If you can write files: `~/meta-ads-toolkit/clients/<client-slug>/mmi/research.md` (Quick) or
`phase0.md` / `customer-language.md` / `creatives.md` (Deep). If the folder already has a research.md,
read it first and update instead of starting over. One business per folder - never blend.

## Core rules

1. **Never invent quotes, reviews, numbers or ads.** Every customer quote in the bank has a source
   (site + link where possible). If you couldn't find something: "Wala akong nakita - kunin sa <saan>."
2. Keep customer words **verbatim**, original language (Taglish stays Taglish). Short quotes only.
3. Label confidence honestly. Public data on small PH businesses is thin - say so, and fall back to
   **category-level** voice (same product, competitors, PH forums) clearly labeled "category, hindi mismong
   brand".
4. Don't flatter. If customers complain about the business, that goes in the brief - it's the most useful part.
5. Any hook needing proof the business may not have → mark **proof needed: <type>**.
6. Meta ad policy: no "you" lines asserting personal attributes ("Mataba ka ba?"), no exaggerated
   health/income claims, no weight-loss before/after.
7. Public pages only. Don't log in anywhere, never ask for passwords, never touch ad accounts.
8. Talk to the user in Taglish. Ad copy in the audience's language.
