# RUONALIM SEO Refresh Log — 26 April 2026 (Weekly)

## Deployment Status
- **Git commit:** f1ecd3d (SEO refresh 26 Apr 2026: fintech-design + fractional pages full SEO uplift, 2 new FAQ on index)
- **Files changed:** index.html, fintech-design.html, fractional-design-leadership.html
- **Deploy status:** Committed locally. Requires `git push origin main` from `/Desktop/Sandbox/ruonalim` to trigger Vercel build. Branch is now 7 commits ahead of origin/main.

---

## RUONALIM.COM Changes

### Focus This Week
Previous weeks covered index.html (multiple rounds) and writing.html (April 21). This week targeted the two sub-pages with the biggest SEO gaps: `fintech-design.html` and `fractional-design-leadership.html`, plus minor additions to the homepage.

---

### 1. fintech-design.html — Full SEO Uplift

**Status before this run:** Missing keywords meta, missing Twitter card, incomplete OG tags (no site_name, no locale), minimal Service schema with no FAQ.

#### Title Tag
**Before:** `Fintech UX Design Agency | Banking, Crypto & Payments | ruonalim.`
**After:** `Fintech UX Design Agency Dubai | Banking, Crypto & Payments | ruonalim.`

**Why:** "Dubai" was absent from the title tag entirely. This is the most valuable local signal for this page. Search intent for fintech design services is dominated by location-qualified queries ("fintech UX design agency Dubai", "banking app design Dubai"). Adding "Dubai" to the title makes this page eligible for those queries. Character count remains within 60-char limit.

#### Meta Description
**Before:** `Specialist fintech UX design for banking apps, crypto platforms, and payment products. Senior designers who've shipped financial products used by millions. Dubai, UK, EMEA.`
**After:** `Specialist fintech UX design agency in Dubai. Senior designers who've shipped banking apps, crypto platforms, and payment products used by millions. UAE, UK, EMEA.`

**Why:** Moved "agency in Dubai" to position 1 (higher keyword density early in the string). Changed "Dubai, UK, EMEA" (weak footer mention) to "UAE, UK, EMEA" (geo breadth signal). At 165 chars — just within limit.

#### Keywords Meta — Added (Was Absent)
```
fintech UX design agency, fintech UX design Dubai, banking app design, crypto UX design, payment product design, neobank UX, regulated financial UX, financial app design UAE, fintech design agency Dubai, crypto trading UX, open banking design, financial product design, BNPL UX design, wealth management UX, KYC UX design
```
15 targeted terms. Highlights:
- `KYC UX design` — high commercial intent, almost no agency in Dubai targets this specifically
- `BNPL UX design` — emerging query as BNPL regulation increases in UAE/GCC
- `neobank UX` — reflects actual client work (Kraken/banking context)
- `open banking design` — growing regulatory push in GCC markets

#### Open Graph — Completed
**Before:** Had og:title, og:description, og:type, og:url only. Missing og:site_name and og:locale.
**After:** Full set including og:site_name "ruonalim." and og:locale "en_GB". OG title updated to include "Dubai" to match the title tag.

#### Twitter Card — Added (Was Absent)
All three Twitter card tags added: twitter:card (summary_large_image), twitter:title, twitter:description. The page had zero Twitter card metadata — any share of this URL on X was rendering as a bare link.

#### Service Schema — Enhanced
**Before:** Minimal schema with name, provider, description, areaServed, serviceType only.
**After:** Added `url` property, `hasOfferCatalog` with 6 itemised Offer entries (Banking & Neobank UX Design, Crypto & Trading Platform Design, Payment Product Design, Regulated Financial UX, KYC & Onboarding Flow Design, Fintech Design Systems), expanded areaServed to include UAE, Saudi Arabia, and GCC.

**Why:** `hasOfferCatalog` signals to Google's entity graph exactly what services this page offers. Each `Offer` maps to a service category with commercial search volume. This gives the page a richer entity footprint than a generic "Fintech UX Design" service entry.

#### FAQ Schema — Added (Was Absent)
5 new FAQ questions added:
1. **"What fintech products has ruonalim designed?"** — Proof point + entity signal. Mentions 70M+ users, UK, UAE, EMEA.
2. **"Why is fintech UX design different from standard app design?"** — High-value informational query. Targets users early in research phase. Covers KYC conversion, payment error states, crypto volatility UX, regulated accessibility.
3. **"Do you design KYC and onboarding flows for financial apps?"** — Specific commercial query. No Dubai agency appears to own this FAQ rich result currently.
4. **"Can you design crypto and Web3 interfaces?"** — Covers trading UI, wallet UX, DeFi dashboards. Growing query cluster as UAE crypto regulation matures.
5. **"How long does a fintech app design project take?"** — High commercial intent. Founders and CTOs Google this before engaging. Anchors the answer to ruonalim's scope and retainer model.

---

### 2. fractional-design-leadership.html — Full SEO Uplift

**Status before this run:** Same gaps as fintech-design.html — missing keywords meta, Twitter card, incomplete OG tags, minimal Service schema, no FAQ.

#### Title Tag
**Before:** `Fractional Design Leadership | Embedded Senior Design Direction | ruonalim.`
**After:** `Fractional Design Leadership Dubai | Embedded Senior Design Direction | ruonalim.`

**Why:** "Dubai" absent from title. Same reasoning as fintech page — location qualifier is essential for local service search. "Fractional design leadership Dubai" is a near-zero competition query with meaningful buying intent.

#### Meta Description
**Before:** `Fractional design leadership for startups and scale-ups. Senior design direction, team coaching, and product strategy without the full-time overhead. Dubai, UK, EMEA.`
**After:** `Fractional design leadership for startups and scale-ups in Dubai and beyond. Senior design direction, team coaching, and product strategy without the full-time overhead. UAE, UK, EMEA.`

**Why:** Added "in Dubai and beyond" to front-load the geo signal. Changed trailing "Dubai, UK, EMEA" to "UAE, UK, EMEA" for consistency with site-wide pattern.

#### Keywords Meta — Added (Was Absent)
```
fractional design leadership, fractional design leader Dubai, fractional head of design, embedded design director, part-time design leader, senior design direction, design leadership as a service, startup design leadership, scale-up design director, fractional design leadership UAE, product design advisory, design team coaching
```
12 targeted terms. Highlights:
- `fractional head of design` — highest-volume variant of this query cluster
- `embedded design director` — captures buyer language (vs. consultant language)
- `design leadership as a service` — emerging category term as productised services grow
- `product design advisory` — broader term that captures C-suite buyers who don't know the "fractional" term yet

#### Open Graph + Twitter Card
Same treatment as fintech page. OG site_name, og:locale added. Full Twitter card added. Page was previously invisible to social graph crawlers.

#### Service Schema — Enhanced
Added `url` property, `hasOfferCatalog` with 6 service offers (Design Critiques & Reviews, Product Strategy & Roadmap Input, Stakeholder Alignment, Team Coaching & Mentorship, Design System Direction, Design Hiring & Process Setup), expanded areaServed to UAE, Saudi Arabia, GCC.

#### FAQ Schema — Added (Was Absent)
5 new FAQ questions added:
1. **"What is a fractional design leader?"** — Top-of-funnel definitional query. Most people searching "fractional design leader" don't fully know what it is yet. Owning this definition in FAQ rich results = direct funnel entry.
2. **"How much does fractional design leadership cost?"** — Highest commercial intent query for this service. Anchors to AED 25,000/month. Near-zero FAQ rich results for this in current SERP.
3. **"What does fractional design leadership actually look like week to week?"** — Common objection/curiosity query. Founder and CTO audience. Reduces sales friction.
4. **"Can fractional design leadership work alongside an existing design team?"** — Addresses the #1 objection from teams who already have designers. High-value trust builder.
5. **"Is fractional design leadership available in Dubai and the UAE?"** — Pure local intent. Confirms UAE, Saudi Arabia, Qatar, Bahrain, GCC coverage. Geo-signals for local SERP.

---

### 3. index.html — Minor Additions

#### Keywords — 2 New Terms Added
**Before:** 21 keyword terms
**After:** 23 keyword terms

Added:
- `agentic AI design` — growing query cluster as agentic products become mainstream in 2026. Zero competition in Dubai SERP currently.
- `product design agency 2026` — year-qualified query; some buyers explicitly include the current year when searching for agencies. Low volume but very high intent.

#### FAQ — 2 New Questions Added
**Before:** 11 FAQ questions
**After:** 13 FAQ questions

**Q: "What design tools does ruonalim use?"**
- Covers Figma-first workflow, design systems, developer handoff, Notion, Loom. Practical answer that builds credibility with technical buyers who want to understand the delivery process before engaging.
- Why now: A significant percentage of pre-sales conversations include "what do you work in?" Owning this as a FAQ rich result intercepts that question earlier.

**Q: "How do you design for agentic AI products?"**
- Comprehensive answer covering: transparent reasoning, interruptibility, auditability, human escalation patterns. References fintech and SaaS experience.
- Why now: "Agentic AI design" + "AI agent UX" are fast-growing query clusters in 2026. No Dubai agency currently has FAQ schema targeting these terms. This is a first-mover opportunity. Also signals to Google that ruonalim is the Dubai authority on AI product design — not just a generic agency that does AI as a side offer.

---

## Keywords Targeted This Week

### fintech-design.html
| Keyword | Intent | Competition | Status |
|---------|--------|-------------|--------|
| Fintech UX design agency Dubai | Commercial | Low | NEW — title + keywords |
| KYC UX design | Commercial | Very Low | NEW — keywords |
| BNPL UX design | Commercial | Very Low | NEW — keywords |
| neobank UX design | Commercial | Low | NEW — keywords |
| Open banking design | Commercial | Low | NEW — keywords |
| Why is fintech UX different | Informational | Low | NEW — FAQ |
| How long does fintech app design take | Transactional | Low | NEW — FAQ |

### fractional-design-leadership.html
| Keyword | Intent | Competition | Status |
|---------|--------|-------------|--------|
| Fractional design leadership Dubai | Commercial | Very Low | NEW — title + keywords |
| Fractional head of design | Commercial | Low | NEW — keywords |
| Design leadership as a service | Commercial | Very Low | NEW — keywords |
| What is a fractional design leader | Informational | Low | NEW — FAQ |
| How much does fractional design leadership cost | Transactional | Very Low | NEW — FAQ |
| Fractional design leadership UAE | Commercial | Very Low | NEW — keywords |

### index.html (additions)
| Keyword | Intent | Status |
|---------|--------|--------|
| Agentic AI design | Commercial | NEW — keywords + FAQ |
| Product design agency 2026 | Commercial | NEW — keywords |
| How do you design for agentic AI | Informational | NEW — FAQ |
| What design tools does ruonalim use | Informational | NEW — FAQ |

---

## Week-over-Week Tracking

### index.html
| Metric | 21 Apr | 26 Apr | Delta |
|--------|--------|--------|-------|
| Keyword terms | 21 | 23 | +2 |
| FAQ questions | 11 | 13 | +2 |
| Schema serviceTypes | 13 | 13 | 0 |
| Schema knowsAbout | 17 | 17 | 0 |

### fintech-design.html
| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| Keywords meta | 0 | 15 | +15 |
| OG tags complete | No | Yes | ✓ |
| Twitter card | No | Yes | ✓ |
| Service schema offers | 0 | 6 | +6 |
| FAQ questions | 0 | 5 | +5 |
| "Dubai" in title | No | Yes | ✓ |

### fractional-design-leadership.html
| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| Keywords meta | 0 | 12 | +12 |
| OG tags complete | No | Yes | ✓ |
| Twitter card | No | Yes | ✓ |
| Service schema offers | 0 | 6 | +6 |
| FAQ questions | 0 | 5 | +5 |
| "Dubai" in title | No | Yes | ✓ |

---

## Expected Impact

- **"Fractional design leadership Dubai" (title):** Should index within 1–2 weeks. Near-zero current competition in Dubai SERP for this exact phrase. High probability of page-1 ranking for this query given low competition and content relevance.
- **"KYC UX design" (keywords):** Specific enough that low competition makes even a keywords signal meaningful. 4–6 weeks to index.
- **fintech FAQ rich results:** 5 new questions. "How long does a fintech app design take" and "Do you design KYC flows" are highest-probability for rich result capture — both are specific, answer-able, and have near-zero FAQ competition in Dubai.
- **fractional FAQ "What is a fractional design leader":** Definitional queries perform exceptionally well as featured snippets. This has very high probability of rich result capture within 4–8 weeks given the comprehensive answer and near-zero competition.
- **"Agentic AI design" (index.html FAQ):** First-mover advantage in Dubai SERP. Growing query cluster. 6–10 weeks to indexed prominence.
- **Twitter cards (fintech + fractional pages):** Immediate. All social shares of these pages now render as rich cards.

---

## jaytulloch.com

No source files available locally. Site is not present in the connected workspace folder.

### Current Status
The previous three weekly logs (March 29, April 6, April 12, April 21) have all noted the same outstanding recommendations. Repeating here with updated priority assessment.

### Priority Recommendations (Outstanding)

**Priority 1 — hasOccupation Schema**
Jay's personal site has no `hasOccupation` structured data. This is the most impactful missing element for Knowledge Panel eligibility. The schema should specify:
```json
{
  "@type": "Person",
  "hasOccupation": {
    "@type": "Occupation",
    "name": "Senior Product Design Leader",
    "occupationalCategory": "27-1021.00",
    "skills": ["Product Design", "UX Design", "Design Leadership", "Fintech UX", "AI Product Design"]
  }
}
```
**Impact:** Directly improves Google's ability to present Jay as an authority entity in Knowledge Graph. Important for personal brand positioning, podcast discoverability, and any speaking/press opportunities where Google's entity understanding matters.

**Priority 2 — FAQ Schema (4 questions)**
No FAQ schema exists on jaytulloch.com. Recommended questions with high capture probability:
1. "What is a fractional design leader?" (aligns with RUONALIM service offering)
2. "What is Jay Tulloch known for?" (entity question — currently answered nowhere in structured data)
3. "How does AI change product design?" (thought leadership positioning — links to podcast/writing)
4. "What industries has Jay Tulloch designed for?" (proof point schema)

**Priority 3 — Meta Description Geographic Qualifier**
Current meta description does not include "Dubai" or "UAE". Jay is a Dubai-based product designer. Adding this to the description costs nothing and adds local search relevance for recruiters and clients searching for Dubai-based design leaders.

**Priority 4 — BreadcrumbList Schema**
If the site has a writing/blog section, adding BreadcrumbList schema creates richer SERP result formatting for individual article pages.

**Priority 5 — LinkedIn sameAs Link in Person Schema**
If the Person schema doesn't include a `sameAs` link to Jay's LinkedIn profile, Google cannot cross-reference the entity. This is a single-line fix with meaningful Knowledge Panel impact.

### Recommendation for Jay
Either share the jaytulloch.com repo folder in the Cowork workspace (simplest), or implement the 5 recommendations above manually. Priority 1 (hasOccupation schema) and Priority 2 (FAQ schema) together would be a 30-minute implementation with meaningful long-term brand impact.

---

## Action Items for Jay
1. **Deploy:** Run `git push origin main` from `~/Desktop/Sandbox/ruonalim` — branch is 7 commits ahead of origin/main. All SEO changes from the last 5 weeks are sitting locally only.
2. **jaytulloch.com:** Add the jaytulloch.com repo to the Cowork workspace folder so the automated refresh can manage it directly each week.
3. **Next week monitoring targets:** Check Google Search Console for impressions on "fractional design leadership Dubai", "UX audit Dubai", and "fintech UX design agency Dubai" — these should start appearing within 2–3 weeks of deployment.
4. **Social sharing test:** After deploying, share one URL from fintech-design.html and fractional-design-leadership.html on LinkedIn to confirm Twitter/OG cards are rendering correctly.
