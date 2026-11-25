# Audit checklist

## The 5 Butas - funnel leaks (tag every Issue)

| # | Butas | Typical evidence |
|---|---|---|
| 1 | **Malabong goal** (objective misalignment) | Objective/optimization ≠ the real result (Engagement/Traffic/LPV when the goal is sales or messages; boosting posts for sales) |
| 2 | **Mahinang offer** (weak offer / poor offer-market fit) | Good hook/CTR but weak conversion; price/shipping/trust objections; no clear answer to "Bakit sa'yo bibili?" |
| 3 | **Creative na dinadaanan lang** (low thumb-stop rate / weak hook / creative fatigue) | Low hook rate/CTR, few creatives, no variety, fatigue |
| 4 | **Masyadong mabilis mag-desisyon** (premature optimization / learning-phase resets) | Same-day kills/edits, learning resets, constant budget jumps, ad sets stuck learning |
| 5 | **Maling numero** (vanity metrics / attribution errors) | Success measured in likes/reach/CTR; Meta revenue taken as total; broken or duplicated tracking |

## Intake questions

- Business goal; what a result is (purchase, message, lead, booking) and what it's worth (target CPA/ROAS)
- Average order value, margin (including product cost, fees, shipping, discounts)
- Monthly ad budget; who controls it
- Offer and pricing; geography/delivery areas
- Where customers buy (website, Messenger, Shopee/Lazada/TikTok Shop, live selling, walk-in)
- Who answers inquiries, how fast, business hours
- How offline/inbox/marketplace sales are counted
- Assets and access (Business Manager partner access, pixel/dataset, catalog, page) - never passwords or codes
- Claims and permissions the client has approved; anything that must not be said
- What changed recently (creatives, budgets, promos, site, stock)

## Export columns to request

Campaign/ad set/ad name · ad ID · delivery · objective/result type · results · cost per result · amount
spent · impressions · reach · frequency · link clicks · outbound clicks · CTR (link) · CPC (link) · CPM ·
landing page views · adds to cart · checkouts initiated · purchases · purchase value / ROAS · messaging
conversations started · leads · 3-second video plays · ThruPlays · video plays at 25/50/75/95/100% ·
average watch time · quality / engagement-rate / conversion-rate rankings · bid strategy · attribution
setting · date created · last significant edit.

## Area 1a - Access & account setup
- Two-factor authentication on for everyone in the Business Portfolio; at least 2 admins.
- The client owns the assets (page, ad account, pixel/dataset, catalog); agencies have partner
  (business-to-business) access, not access through a personal profile; outside auditors get temporary access.
- Ad account time zone and currency match the store (e.g. PHP, Asia/Manila) - hard to change later.
- Payment method valid (local cards and e-wallets like GCash/Maya where supported); no billing holds.
- Business verification status; no workarounds to get extra portfolios/accounts.

## Area 1 - Tracking & data (everything depends on it)
- One pixel/dataset per domain (subdomains share it). Installed via the platform's partner integration
  (Shopify, WordPress, etc.) where possible rather than manually.
- Conversions API runs alongside the pixel, never instead of it.
- iOS opt-outs (Aggregated Event Measurement): only the highest-priority event is reported for those users,
  so upper-funnel events are under-counted - factor this into funnel reads.
- Catalog connected when there are several products (~6+), so catalog/Advantage+ catalog ads are possible.
- Pixel/dataset firing; key events present (ViewContent, AddToCart, InitiateCheckout, Purchase / Lead /
  Contact / Schedule); Purchase sends value + currency.
- Conversions API set up; deduplication working (no double-counted purchases); Event Match Quality reasonable.
- GA4 events and consistent UTMs; separate links per destination.
- Domain verified; events prioritized where relevant.
- Messenger/WhatsApp businesses: any way to tie chats to sales (tags, manual log, offline events)? If not,
  results = conversations only - flag it.
- Ads Manager vs real sales: big mismatch = Issue (butas 5).

## Area 2 - Objectives & optimization
- Objective matches the goal; optimization event is the real result once it has volume (butas 1).
- Conversion location correct (website / Messenger / form / app).
- Attribution setting consistent across campaigns being compared.
- Bid strategy: highest volume/value is the sensible default. Cost-per-result goals, ROAS goals, and bid caps
  are for experienced buyers or deliberate scaling tests - flag them on small accounts. Frequency caps and
  reach & frequency buying belong to awareness campaigns only.
- Boosted posts used for sales goals? Explain the difference vs Ads Manager campaigns (objective, placements,
  testing control). (butas 1)

## Area 3 - Structure & budgets
- Budget split across too many campaigns/ad sets for the volume it can buy? (Each ad set needs enough results
  per week to exit learning; small budgets → consolidate.)
- Ad sets "Learning limited"? Edits resetting learning (budget jumps > ~20-30%, frequent tweaks)? (butas 4)
  Exiting learning takes roughly 50 optimization events per ad set per week. "Learning" means delivery isn't
  stable yet - it says nothing about whether performance is good or bad.
- Placements over-split into separate ad sets? Advantage+ placements is the default unless data shows a
  placement wasting money.
- Testing separated from scaling? Scaling reserve kept unspent until needed? Testing usually runs with ad
  set budgets (controlled spend per test); proven winners scale with campaign budget.
- Number of ad sets vs budget: at a daily budget around 1× target CPA, keep to very few ad sets; only at
  several × target CPA per day does running many ad sets make sense.
- Budget concentration: share of spend vs share of results per campaign/ad.
- Prospecting vs retargeting split - most spend should usually go to prospecting (a rough check: about
  60/40 or more toward prospecting); heavy retargeting share often means a shrinking audience pool.
- Were ads paused inside ad sets that were on target (micro-killing)? Judge the ad set first. (butas 4)

## Area 4 - Audiences
- Mostly broad with strong creative, or many tiny interest stacks?
- Overlap between ad sets competing with each other?
- Prospecting and retargeting both present (engagers, video viewers, site visitors, cart abandoners, inbox
  contacts); recent buyers excluded where relevant.
- Customer list / lookalikes used if data exists; location/age/language sensible for delivery areas.
- Breakdowns (age, gender, region, placement, platform) checked for pockets to exclude or lean into.
- Which pages/identities publish the ads; partnership (creator) ads used where useful; organic posting active
  (a dead page hurts trust).

## Area 5 - Creatives (butas 3)
- Active ads per ad set (1 is too few; 3-6 healthy).
- Count meaningfully different concepts, not ads: Meta groups near-duplicate creatives together and they
  share learnings, so small tweaks don't reach new people.
- Variety of concepts, formats, temperatures (cold vs warm messages), styles.
- Fatigue: frequency up + CTR down + CPM/CPA up.
- Hook rate (3-sec ÷ impressions) and hold rate (ThruPlays ÷ 3-sec) - first 1-3 seconds do the work.
- One main message per ad; offer and CTA clear; captions for sound-off; 9:16 and 4:5 versions.
- High-CTR, zero-sale ads (attention without closing - butas 2 or page).
- Spend concentrated on proven winners, or wasted evenly on losers?

## Area 6 - Placements & delivery
- Placements eating spend with no results (e.g. Audience Network)?
- Rejected ads, limited delivery, account quality warnings (Account Quality / Business Support Home:
  restricted assets, verification).
- Policy: prohibited content (never allowed); restricted categories (alcohol, dating, gambling, supplements,
  financial - allowed only under conditions); social issues/politics (needs authorization + disclaimer).
  Common rejections: restricted words, personal-attribute call-outs, negative self-image (scales,
  before/after), guaranteed results, sexual content. The landing page is reviewed too. Understand the
  violation before editing or requesting review. Review is usually within 24h but slower around big sale
  dates (11.11, 12.12, Black Friday). Policies change - re-check periodically.
- Post-publish: ad sets accidentally off, schedules wrong, budgets entered wrong.

## Area 7 - Funnel after the click
- Page loads fast on mobile (test with PageSpeed Insights / GTmetrix), matches the ad's promise, clear price
  and prominent CTA, lifestyle product photos, visible reviews, several payment options (card, e-wallets like
  GCash, COD), products live, stock and sizes available. Heat/scroll maps (Microsoft Clarity, Hotjar) show
  where visitors stop.
- Drop-offs: click → LPV (slow page/junk clicks), LPV → ATC (page/offer), ATC → purchase (shipping, payment
  options, trust).
- Messenger: auto-reply, response time, conversation → sale rate; where conversations stop (price, delivery
  fee, unanswered questions).
- Lead forms: quality vs volume, follow-up speed, lead → appointment → sale.
- Marketplace: outbound clicks + order reconciliation / UTMs / voucher codes - not Meta purchase events.

## Area 8 - Efficiency & economics
- Cost per result vs target; ROAS vs break-even ROAS (1 ÷ margin, with full costs).
- Three revenue views: Meta-attributed · store/inbox sales · blended (total sales ÷ Meta spend).
- Trend: last 30 vs previous 30.
- Discount dependence: how much of the result comes only during promos (risk if promos stop).
- Gap to target: revenue needed = target ROAS × spend → shortfall.
- Is the budget large enough for the price point?
- Benchmarks used: the account's own last 3-6 months (excluding Q4/peak spikes) before any general range.
- Unit economics: AOV − CPA (rough gross per order), MER, and LTV : CAC for repeat-purchase businesses;
  lead → appointment → show-up → close for lead gen.

## Scoring (each area 0-5)
5 solid · 4 minor improvements · 3 works but leaves money on the table · 2 significant problems · 1 badly
broken · 0 missing. Total /40: 34-40 strong · 26-33 decent · 18-25 needs work · <18 rebuild before scaling.

---

## Pre-launch checklist
- [ ] Objective and optimization = the real goal
- [ ] Pixel/CAPI events firing and deduplicated; purchase values correct; GA4 events
- [ ] UTMs consistent; separate links per destination (site / Messenger / marketplace)
- [ ] Product pages live; prices correct; stock and sizes confirmed
- [ ] Promo dates, voucher codes, and voucher-stacking rules confirmed
- [ ] Naming separates destination and promo; budget and schedule entered correctly
- [ ] Creatives approved (internal + client); claims within approved list; captions on
- [ ] Inbox ready: auto-reply, FAQ answers, someone assigned during launch hours
- [ ] Ad copy and landing page checked against policy (no personal-attribute call-outs, guaranteed results,
      before/after where restricted); extra review time allowed near double-date sales

## Post-publish delivery check (after every launch or edit)
- [ ] Campaign, ad sets, and ads all **On**, and actually delivering (impressions moving within hours)
- [ ] Budgets and schedules as planned; no ad stuck "In review" or rejected
- [ ] Links open the right page; tracking events fire on a test visit
- Re-check again the next day.

## Incident report template
```markdown
# Incident Report - <Client> - <date>
## Summary
What happened, when it was noticed, impact (spend/results/time affected).
## Action Taken
What was done, by whom, when; current status.
## Preventive Measures
What changes so it doesn't happen again (checklist step, second-person check, alert).
## Commitment
What the team commits to going forward.
```

---

## Report template

```markdown
# Meta Ads Audit - <Client> - <date>
Period: <dates> · Spend reviewed: <amount> · Data: <export / screenshots / connected tool>

## Executive summary
- Overall score: <x>/40 - <one-line verdict>
- Leaking butas: <#s, one line each>
- Biggest problem:
- Biggest opportunity:
- Do this week: 1) ... 2) ... 3) ...

## Scorecard
| Area | Score | One-line finding |
|---|---|---|
| Tracking & data | /5 | |
| Objectives & optimization | /5 | |
| Structure & budgets | /5 | |
| Audiences | /5 | |
| Creatives | /5 | |
| Placements & delivery | /5 | |
| Funnel after the click | /5 | |
| Efficiency & economics | /5 | |

## Findings narrative
1. Biggest conversion leak (stage-to-stage rates)
2. Meta vs real sales (three revenue views)
3. High-CTR / zero-sale ads
4. Are the winners truly scalable? (volume, not one-sale ROAS)
5. Budget concentration (share of spend vs share of results)
6. Discount dependence and its risk
7. Gap to target (revenue needed = target ROAS × spend)

| What this period tells us | Change for next period |
|---|---|

## Findings by area
### 1. Tracking & data - <score>/5
- [Issue · butas 5] <observed> - evidence: <number/setting> - likely cause: ...
- [OK] ...
- [Unknown] ...

## Fix list
| Priority | Fix | Where | Why (evidence) | Butas | Effort | Success signal |
|---|---|---|---|---|---|---|

## Not enough data to judge
## Glossary (only terms used above)
```
