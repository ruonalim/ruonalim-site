# RUONALIM SEO Refresh Log — 3 May 2026 (Weekly)

**Operator:** Kai Tanaka, Head of SEO
**File edited:** `public/index.html` (the Vercel-served file via Next.js rewrite)
**Branch:** main

---

## Focus This Week

Two clean wins on the homepage: (1) closing the alt-text gap on the three Beyond the Interface podcast thumbnails (previously empty `alt=""`, costing image SEO and accessibility), and (2) expanding the FAQPage JSON-LD with three new long-tail Q&As targeting under-served queries: design systems UAE, fractional design leadership GCC, and AI product design agency Dubai vs. in-house.

The visible FAQ accordion was deliberately left untouched (per the rules), but the FAQPage structured data has been expanded — extending eligibility for rich-result snippets without disrupting page copy or layout.

---

## 1. Image alt text — Beyond the Interface podcast thumbnails

**Status before:** All three episode thumbnails had `alt=""`. Each card had a descriptive `aria-label` on the `<button>`, but the `<img>` itself was anonymous to image search engines.

**Changes:**

- **Matt D Smith episode (`4p5LzrAYN30`)**
  alt → *"Beyond the Interface podcast — Matt D Smith on Good Enough UI Is the Problem: craft, design systems and AI in product design"*

- **Darren Hood episode (`8QKgpL_UqKE`)**
  alt → *"Beyond the Interface podcast — Darren Hood on Why UX Needs Gatekeepers: protecting design discipline and senior UX standards"*

- **Ana Sofia Gonzalez episode (`TMtN8xB0aBs`)**
  alt → *"Beyond the Interface podcast — Ana Sofia Gonzalez on From UI to AI: how product designers must evolve for AI-native products"*

**Why:** Each alt now packs a distinct semantic payload (show name + guest + episode angle). Beyond accessibility compliance, this makes the homepage discoverable for podcast-adjacent queries (e.g. "design systems podcast", "AI UX podcast", "senior UX standards"). Length kept under 150 chars per Google guidance.

---

## 2. FAQPage JSON-LD — three new long-tail Q&As

The FAQPage block previously had 9 questions. Expanded to 12 by appending Q&As targeting keywords that the existing schema and page copy under-served.

### New Q1 — "Do you build design systems for UAE and GCC product teams?"
**Targets:** *design systems UAE, design systems GCC, Figma libraries Dubai, RTL Arabic design system*
Specifies token architecture (primitive/semantic/component), light/dark theming, RTL/Arabic support, and WCAG 2.1 AA — the four buying signals enterprise GCC product teams search for.

### New Q2 — "What does fractional design leadership look like across the GCC?"
**Targets:** *fractional design leadership GCC, fractional design lead Dubai, fractional design lead Riyadh, fractional CDO MENA*
Names every major GCC city explicitly (Dubai, Riyadh, Abu Dhabi, Doha) plus Saudi/Qatar/UAE — broadens geographic surface for the same engagement model.

### New Q3 — "Why hire an AI product design agency in Dubai instead of building in-house?"
**Targets:** *AI product design agency Dubai, AI product design agency vs in-house, hire AI UX designer Dubai, AI-native delivery*
Frames the value proposition against the most common alternative (full-time hire). This is high-commercial-intent — anyone running this query is comparing options for a real budget.

---

## Keywords targeted this week

Primary:
- design systems UAE
- design systems GCC
- fractional design leadership GCC
- AI product design agency Dubai
- AI-native delivery

Secondary / supporting:
- RTL Arabic design system
- Figma libraries Dubai
- WCAG 2.1 AA design system
- fractional design lead Dubai / Riyadh / Abu Dhabi / Doha
- senior UX standards
- AI UX podcast (image alt)
- design systems podcast (image alt)

---

## What was deliberately NOT changed

- Visible copy, headings, CTAs (rule)
- Visible FAQ accordion content (rule)
- Hero, stats, services, work, footer structure (rule)
- Brand format `ruonalim.` preserved
- Canonical tag `<link rel="canonical" href="https://ruonalim.com" />` already present and untouched
- All three JSON-LD blocks (Organization/ProfessionalService, FAQPage, WebSite) re-validated as parseable JSON post-edit

---

## Verification

- `grep` confirmed all three `alt=""` instances replaced with descriptive strings
- Python json.loads validation: 3/3 JSON-LD blocks parse, FAQPage now has 12 questions (was 9)
- File integrity: only `public/index.html` modified
