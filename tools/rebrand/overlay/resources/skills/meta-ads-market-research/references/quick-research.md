# Quick Research - sources, method, brief template

Goal: in ~5-10 minutes and ≤ 25 tool calls, find what real customers say about this business (or its
category) and turn it into a one-page brief the user can write ads or a pitch from.

## Tools (use what this session has)

- **Web search** (WebSearch, or a search tool) - finding pages, reviews, threads.
- **Page reading** (WebFetch, the web-fetch agent, or the built-in browser's get_page_text) - reading a
  site, a product page with reviews, a Reddit thread.
- **Meta Ad Library** - `ads_library_search` if the Meta Ads connector is loaded; otherwise search
  "facebook.com/ads/library <brand>" or tell the user the Ad Library link to check.
- Facebook/Instagram pages often block reading without login. Try once; if blocked, note
  "FB page hindi mabasa - i-paste mo ang 5-10 comments/reviews kung meron" and move on. Never log in.

Run independent searches in the same turn (parallel). Don't read the same site twice.

## Step A - Identify (1-3 calls)

From the input, pin down: brand name, what it sells, price range, where it sells (website, FB page,
Shopee/Lazada/TikTok Shop, physical store + city). If only a niche was given, pick 2-3 visible PH brands
in that niche as stand-ins and say so.

## Step B - Customer voice (main work, ~10-15 calls)

Priority order - stop when you have ~20-40 good quotes:

1. **Marketplace reviews** - Shopee, Lazada, TikTok Shop product pages (include 1-3 star reviews).
2. **Google Maps reviews** - for physical stores, clinics, restaurants, services.
3. **Reddit** - r/Philippines, r/phinvest, r/PHMoneySaving, r/beautytalkph, r/CasualPH, niche subs.
   Query: `<brand or product> reddit`, `<category> recommendation reddit philippines`.
4. **FB page / post comments, FB group posts** (public only).
5. **Competitor reviews** - same category, to get category pains and "why I switched" stories.
6. **Forums / blogs / YouTube comments** - only if the above is thin.

For each quote keep: exact words, source + link, star rating if any.

## Step C - Ads & competitors (3-5 calls)

- Ad Library: is the brand running ads? How many, since when, what format, what hooks/offers repeat.
- Same for 2-3 competitors. Note angles everyone uses (= saturated) and angles nobody uses (= opening).

## Step D - Write the brief

Use this exact structure. Whole thing should fit on one screen-ish page.

```markdown
# <Brand> - MMI Quick Research
Date: <YYYY-MM-DD> · Data: <N quotes from: Shopee x, Google x, Reddit x...> · Confidence: High / Medium / Low (<why>)

## 1. Snapshot
| | |
|---|---|
| Sells | |
| Price | |
| Where they sell | |
| Who actually buys (from reviews, not guesses) | |
| Running Meta ads? | Yes - <n> active since <date> / No / Hindi ma-check |

## 2. Customer Language Bank
| Category | Verbatim quote | Source | Count |
|---|---|---|---|
| Pain / problem | | | |
| Want / result | | | |
| Objection / doubt | | | |
| Buying trigger | | | |
| Complaint (sa brand o category) | | | |
| Price / value | | | |
(Strongest quote first. Group near-identical ones and count. "Wala akong nakita" if empty.)

**Words to steal:** "...", "...", "..." (phrases customers use - put these straight in ads)
**Words to avoid:** business/marketing words customers never say

## 3. Competitor ads
| Brand | Main angle / hook | Offer | Format |
|---|---|---|---|
**Saturated:** <angles everyone uses> · **Opening:** <angle nobody is using>

## 4. Top 3 insights
1. Strongest pain - "<quote>"
2. Biggest objection to answer - "<quote>"
3. Best buying trigger - "<quote>"

## 5. 3 angles
| # | Angle | Built from (quote) | Proof needed? |
|---|---|---|---|

## 6. 5 hooks (first 3 seconds / first line)
1. ...
(Use customer words. Mix: call-out, pain question, objection flip, result-first, scenario.)

## 7. Gaps
- <what's missing and where to get it - e.g. "Walang DMs - dito madalas ang objections. I-paste mo 10 inbox convos.">
```

## If this is a prospect (for pitching)

Add one short section after Snapshot:

```markdown
## Pitch hooks (para sa outreach)
- What they're doing wrong / missing (e.g. walang ads, iisang ad lang since 2024, complaints na hindi sinasagot)
- 1-2 quick wins we could offer
```

Then offer meta-ads-proposal using this brief.

## Merge mode (user pastes their own data later)

Add the new quotes to the bank with source "client data (DM / comment / review)", recount, and update
Top 3 insights / angles / hooks only if they change. Say in one line what changed.
