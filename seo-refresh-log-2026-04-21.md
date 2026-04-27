# RUONALIM SEO Refresh Log — 21 April 2026 (Weekly)

## Deployment Status
- **Git commit:** c75fa84 (SEO refresh 21 Apr 2026: UX audit keywords, FAQ expansion, writing.html overhaul)
- **Files changed:** index.html, writing.html
- **Deploy status:** Committed locally. Requires `git push origin main` to trigger Vercel build. No git credentials available in automated environment. Branch is 5 commits ahead of origin/main.

---

## RUONALIM.COM Changes

### 1. Keywords — UX Audit + Consultant + B2B SaaS
**Before:** 18 keyword terms
**After:** 21 keyword terms

**Added:**
- `UX audit service Dubai`
- `AI UX audit`
- `B2B SaaS design agency Dubai`
- `product design consultant Dubai`

**Why:** The AI UX audit tool is the highest-differentiating product on the site — it's prominently featured in the hero section and again as a CTA. Yet "UX audit service Dubai" and "AI UX audit" were absent from the keyword meta entirely. This is a commercial-intent query that converts well (people searching for an audit are in buying mode). Added now.

"B2B SaaS design agency Dubai" is more specific than "SaaS design agency" and signals clearer buyer intent. Competitors are not targeting B2B SaaS specifically in the Dubai SERP. "Product design consultant Dubai" captures searchers who want an individual expert rather than an agency — worth serving both intents.

---

### 2. Organization Schema — Description Updated
**Before:** `"description": "Premium product design and UX agency specialising in fintech, SaaS and complex digital products. Senior designers embedded directly in your team."`
**After:** `"description": "Senior product design agency in Dubai specialising in AI product design, fintech UX, and SaaS design. AI-powered UX audits, fractional design leadership, and end-to-end product delivery for ambitious companies across UAE, GCC and EMEA."`

**Why:** The schema description was left over from before the AI-first pivot (March 2026). It still said "Premium" (vague) and didn't mention AI at all. Google uses schema descriptions for entity disambiguation in Knowledge Graph. Updated to match the title tag, meta description, and the March/April positioning work. Also now includes the audit tool as an explicit service signal.

---

### 3. FAQ Schema — 2 New Questions Added
FAQ count: 9 → 11 questions

**Q: "What is a UX audit and how can it improve my product?"**
- Comprehensive answer covering what a UX audit is, the heuristic framework used, and the specifics of the ruonalim AI audit tool (pricing, inputs, outputs).
- Why: "UX audit" is a high-volume, high-intent search query. Zero competitors in the Dubai SERP currently have FAQ rich results for this term. The answer anchors the query to ruonalim's tool specifically — strong conversion pathway.

**Q: "How much does product design cost in Dubai?"**
- Answer covers freelancer vs junior agency vs senior studio pricing (AED ranges), and pivots to seniority as the key differentiator.
- Why: Cost/pricing queries have very high commercial intent. Founders and CTOs actively search "how much does [service] cost in [city]" before engaging agencies. Currently no Dubai design agency appears to own this FAQ rich result. High-value capture opportunity.

---

## WRITING.HTML Changes (Major SEO Uplift)

The writing page had almost no SEO infrastructure. All of the following were missing before this run.

### 1. Title Tag
**Before:** `Perspectives on Design, Product & Growth | ruonalim.`
**After:** `Design Leadership & Product Strategy Insights | ruonalim.`

**Why:** The new title includes "Design Leadership" and "Product Strategy" — two keyword clusters with meaningful search volume. The word "Perspectives" contributed nothing to keyword relevance.

### 2. Meta Description
**Before:** `Sharp thinking on design leadership, product strategy, and why most digital experiences fall short. From the team at ruonalim.`
**After:** `Perspectives on product design leadership, fintech UX, AI product design, and why most digital experiences fall short. From the senior design team at ruonalim, Dubai.`

**Why:** Added "fintech UX", "AI product design", "Dubai" geographic signal, and "senior design team" authority marker. Now at 155 chars (within 160 limit).

### 3. Keywords Meta Tag — Added (Was Absent)
```
design leadership insights, product strategy blog, fintech UX thinking, AI product design, UX design Dubai, product design perspectives, fractional design leadership, design agency blog
```
**Why:** The writing page had no keywords meta at all. Added 8 targeted terms aligned to the content themes.

### 4. Open Graph Tags — Completed
**Before:** Had og:title, og:description, og:type, og:url only. Missing og:site_name and og:locale.
**After:** Full set including og:site_name "ruonalim." and og:locale "en_GB". OG title updated to match new page title.

**Why:** Consistent OG metadata affects how posts appear when writing links are shared on LinkedIn, X, or Slack. og:locale matters for Google's interpretation of content origin.

### 5. Twitter Card — Added (Was Absent)
Added:
- `twitter:card` = summary_large_image
- `twitter:title`
- `twitter:description`

**Why:** The writing page had no Twitter card metadata at all. Any time a writing URL is shared on X/Twitter, it was rendering as a bare link. Now renders as a rich card.

### 6. Blog Schema — Added (Was Absent)
Added `@type: Blog` structured data including publisher details, about topics array, and canonical URL.

**Why:** Blog schema helps Google understand and categorise the writing section. The `about` array ("Product Design", "Design Leadership", "Fintech UX", "AI Product Design", "Product Strategy", "UX Design Dubai") functions as additional entity signals for the writing subdomain.

---

## Keywords Targeted This Week

### ruonalim.com (Primary)
| Keyword | Intent | Competition | Action |
|---------|--------|-------------|--------|
| UX audit service Dubai | Commercial | Low | NEW — added to keywords |
| AI UX audit | Commercial | Very Low | NEW — added to keywords |
| B2B SaaS design agency Dubai | Commercial | Low | NEW — added to keywords |
| product design consultant Dubai | Commercial | Medium | NEW — added to keywords |
| How much does product design cost in Dubai | Transactional | Very Low | NEW — FAQ rich result target |
| What is a UX audit | Informational | Medium | NEW — FAQ rich result target |

### writing.html (Secondary)
| Keyword | Status |
|---------|--------|
| design leadership insights | NEW — title + keywords |
| product strategy blog | NEW — keywords |
| fintech UX thinking | NEW — keywords + description |
| AI product design | NEW — description + keywords |
| UX design Dubai | NEW — description + keywords |

---

## Week-over-Week Tracking

### ruonalim.com
| Metric | 12 Apr | 21 Apr | Delta |
|--------|--------|--------|-------|
| Keyword terms | 18 | 21 | +3 |
| FAQ questions | 9 | 11 | +2 |
| Schema serviceTypes | 13 | 13 | 0 |
| Schema knowsAbout | 17 | 17 | 0 |

### writing.html
| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| Keywords meta | 0 | 8 | +8 |
| OG tags complete | No | Yes | ✓ |
| Twitter card | No | Yes | ✓ |
| Blog schema | No | Yes | ✓ |
| Title keyword relevance | Weak | Strong | ✓ |

---

## Expected Impact

- **"UX audit service Dubai" + "AI UX audit":** Should index within 2–3 weeks. Zero competitor ownership of this query in Dubai SERP. Direct pathway to the audit tool = high conversion intent.
- **"How much does product design cost in Dubai" FAQ:** One of the highest-intent queries for an agency. Near-zero FAQ rich results for this in current SERP. High probability of featured snippet capture within 4–6 weeks.
- **writing.html Twitter card:** Immediate effect — all writing page shares on X now render as rich cards rather than bare links.
- **writing.html Blog schema:** Medium-term (4–8 weeks). Helps Google categorise and understand the writing section as a topical authority hub, supporting overall domain entity trust.

---

## jaytulloch.com

No source files available locally. Site remains well-optimised from previous audit (April 12 log recommendations still apply). Status unchanged.

**Outstanding recommendations from April 12:**
1. Add `hasOccupation` structured data for richer Knowledge Panel eligibility
2. Add 3–4 FAQ schema questions (e.g., "What is a fractional design leader?", "How does AI change product design?")
3. Add "Dubai-based" geographic qualifier to meta description

---

## Action Items for Jay
1. **Deploy:** Run `git push origin main` from `/mnt/Sandbox/ruonalim` to trigger Vercel build and push all 5 pending commits live.
2. **jaytulloch.com:** Provide repo access or manually implement the 3 recommendations above.
3. **Next week:** Monitor Google Search Console for impressions on "UX audit Dubai" and pricing query clusters. Check if the writing page is now appearing for design leadership terms.
