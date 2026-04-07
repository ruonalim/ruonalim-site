/**
 * Seed the Big Ticket UX audit into Redis as a free preview.
 *
 * Usage (after deploy):
 *   curl -X POST https://ruonalim.com/api/audit/seed \
 *     -H "Content-Type: application/json" \
 *     -H "x-seed-secret: ruonalim-seed-2026" \
 *     -d @scripts/bigticket-audit-data.json
 *
 * Or run via node after building:
 *   npx tsx scripts/seed-bigticket.ts
 */

const SITE_URL = process.env.SITE_URL || 'https://ruonalim.com'
const SEED_SECRET = process.env.SEED_SECRET || 'ruonalim-seed-2026'

const auditData = {
  auditId: 'bigticket-ae-2026',
  overallScore: 46,
  headline: 'Users face confusing lottery jargon, a cluttered homepage, and forced account creation before they can buy — driving away first-time visitors who came ready to purchase.',
  totalIssuesFound: 14,
  inputType: 'screenshots',
  inputLabel: 'bigticket.ae',
  createdAt: '2026-03-27T16:00:00Z',
  topStrength: "The Winner's Club page builds strong trust by showcasing real winner photos with names, nationalities, ticket numbers, and prize amounts. This proof of real people winning real money is the single most persuasive element on the site.",
  lockedIssueCount: 11,
  paid: false,

  previewIssues: [
    {
      severity: 'critical',
      heuristic: 'User control and freedom',
      title: 'Forced account creation blocks ticket purchases',
      description: "When a first-time visitor lands on bigticket.ae excited to buy a ticket, they quickly discover there's no way to purchase without first creating a full account. The registration flow requires a mobile number, email, a complex password, and phone verification — that's at least 3 screens and 2 minutes before they can even see a payment page. For an impulse-driven product like lottery tickets, this is a conversion killer.",
      recommendation: "Add a guest checkout option that only requires an email address and phone number to complete a purchase. Collect the rest of the profile information after the purchase is confirmed. This alone could increase first-time purchase conversion by 20-30%.",
      location: 'Sign-in overlay on homepage and registration page at /register',
    },
    {
      severity: 'critical',
      heuristic: 'Help and documentation',
      title: 'No FAQ, help section, or responsible play information anywhere',
      description: "A lottery platform dealing with real money transactions has zero visible help resources. There's no FAQ page answering basic questions like 'How do draws work?' or 'What happens if I win?' There's no live chat, no help centre link, and critically, no responsible gambling information — no spend limits, no self-exclusion options, no links to problem gambling support.",
      recommendation: "Create a comprehensive FAQ/Help section accessible from the main navigation. Add a dedicated 'Responsible Play' page with self-exclusion tools and links to gambling support organisations. This isn't just good UX — it's likely a regulatory requirement.",
      location: 'Missing from the entire site — should be in main navigation',
    },
    {
      severity: 'critical',
      heuristic: 'Flexibility and efficiency of use',
      title: 'No search, filtering, or quick-purchase options anywhere',
      description: "The entire site has zero search functionality. Users can't search for past draw results, look up ticket numbers, or find specific winner stories. The Winner's Club page shows dozens of winner cards with no way to filter by anything. For returning customers who buy monthly, there's no 'Buy again' or saved preferences.",
      recommendation: "Add a site-wide search bar in the navigation. On the Winner's Club page, add filter controls for draw series, prize amount, and date range. For logged-in users, add a 'Quick Buy' feature that remembers their last selection.",
      location: 'Affects all pages — no search in navigation, no filters on Winner\'s Club',
    },
  ],

  heuristics: [
    { id: 1, name: 'Visibility of system status', score: 50, status: 'major', finding: "The countdown timer showing days until the next draw appears on multiple pages, which is good — it creates urgency. However, there's no clear indication of what actually happens when the timer hits zero. Users don't see loading or progress indicators during page transitions, and the registration stepper (steps 1-2-3) doesn't clearly differentiate between completed and upcoming steps." },
    { id: 2, name: 'Match between system and real world', score: 62, status: 'minor', finding: "The site uses insider lottery terminology like 'Series 285' without any explanation — a first-time visitor has no idea what a 'series' means. On the positive side, currency is displayed in AED which is appropriate for the UAE market, and winner photos with nationalities feel authentic and relatable." },
    { id: 3, name: 'User control and freedom', score: 38, status: 'major', finding: "There's no visible way to go back or undo steps during the purchase flow. On the homepage, a sign-in overlay appears and blocks the ticket grid content with no obvious dismiss button. Most critically, there's no guest checkout — users must create a full account before buying." },
    { id: 4, name: 'Consistency and standards', score: 48, status: 'major', finding: "Each page uses a different header colour — homepage is white, Winner's Club has red, Live Draw uses gold — making the site feel like separate websites. CTA button styles are inconsistent: some red fills, some outlined, some greyed out. The orange dashed border on auth forms clashes with everything else." },
    { id: 5, name: 'Error prevention', score: 52, status: 'major', finding: "Password requirements are shown as clear chips, which is helpful. However, there's no inline validation on form fields — users won't know they've made an error until they submit. No confirmation step is visible before completing a purchase, which is risky for lottery transactions." },
    { id: 6, name: 'Recognition over recall', score: 62, status: 'minor', finding: "Winner cards display all relevant info at a glance — name, ticket number, nationality, prize amount, date. Navigation labels are mostly clear. But 'Get to Know Us ♥' is vague — users wouldn't think to click there for FAQs or company details." },
    { id: 7, name: 'Flexibility and efficiency of use', score: 35, status: 'critical', finding: "No search functionality anywhere. No way to filter winners by date, prize, or nationality. No quick-buy or repeat purchase for returning customers. The only shortcut is 'Sign In With OTP' as an alternative to passwords." },
    { id: 8, name: 'Aesthetic and minimalist design', score: 38, status: 'major', finding: "The homepage is visually overwhelming — banners, winners, ticket grids, and overlays all compete for attention. No clear visual hierarchy guides users toward buying. The red/gold colour scheme feels busy rather than premium despite multi-million AED prizes." },
    { id: 9, name: 'Help users recognise, diagnose, and recover from errors', score: 40, status: 'major', finding: "No visible error states on forms. The 'Reset my password' link is poorly positioned — right-aligned below the password field in small text, easy to miss. No visible error recovery path if a purchase or payment fails." },
    { id: 10, name: 'Help and documentation', score: 28, status: 'critical', finding: "No FAQ section visible anywhere. No live chat, no tooltips, no information about how draws work, odds, or responsible play policies. For a regulated lottery product, this absence is both a UX failure and potentially a compliance risk." },
  ],

  criticalIssues: [
    {
      severity: 'critical',
      heuristic: 'User control and freedom',
      title: 'Forced account creation blocks ticket purchases',
      description: "When a first-time visitor lands on bigticket.ae excited to buy a ticket, they quickly discover there's no way to purchase without first creating a full account. The registration requires a mobile number, email, a complex password (uppercase, lowercase, number, special character), and phone verification — at least 3 screens and 2 minutes before seeing a payment page. For an impulse-driven product, this is a conversion killer. Every extra step loses customers.",
      recommendation: "Add a guest checkout option requiring only email and phone number. Collect profile data after purchase when the user is invested. At minimum, offer 'Buy as Guest' alongside sign-in. This alone could increase first-time conversions by 20-30% based on lottery/gaming industry benchmarks.",
      location: 'Sign-in overlay on homepage and registration page at /register',
    },
    {
      severity: 'critical',
      heuristic: 'Help and documentation',
      title: 'No FAQ, help section, or responsible play information anywhere',
      description: "A lottery platform handling real money has zero help resources. No FAQ answering 'How do draws work?', 'What happens if I win?', 'How do I collect my prize?' No live chat, no help centre. Critically, no responsible gambling information — no spend limits, no self-exclusion, no support links. First-time international visitors have no way to understand how Big Ticket works, creating uncertainty that blocks purchases.",
      recommendation: "Create a Help/FAQ section in main navigation. Cover draw mechanics, odds, prize collection, payment methods, account management. Add a 'Responsible Play' page with self-exclusion tools, spend limits, and links to gambling support. This is likely a regulatory requirement for licensed Abu Dhabi lottery operations.",
      location: 'Missing from the entire site — should be in main navigation',
    },
    {
      severity: 'critical',
      heuristic: 'Flexibility and efficiency of use',
      title: 'No search, filtering, or quick-purchase options anywhere',
      description: "Zero search functionality site-wide. Can't search past draws, ticket numbers, or winner stories. Winner's Club shows dozens of cards in infinite scroll with no filter by date, prize, nationality, or amount. Returning monthly customers have no 'Buy again' or saved preferences — everything starts from scratch every time.",
      recommendation: "Add site-wide search in navigation. Add Winner's Club filters for draw series, prize range, nationality, and date. Add 'Quick Buy' for logged-in users that remembers last ticket selection and payment method. These features reward loyal customers and reduce time from intent to purchase.",
      location: "All pages — no search in nav, no filters on Winner's Club, no quick-buy",
    },
  ],

  majorIssues: [
    {
      severity: 'major',
      heuristic: 'Aesthetic and minimalist design',
      title: 'Homepage is visually cluttered with competing elements',
      description: "The homepage tries to do everything at once — hero, countdown, winners, promos, ticket grid, sign-in overlay, stats, and footer all fight for attention. No clear visual hierarchy tells users where to look or what to do. The sign-in overlay partially blocks the ticket grid. The red/gold palette feels more carnival than premium, undermining the brand for multi-million AED prizes.",
      recommendation: "Redesign with clear hierarchy: one dominant hero with single CTA ('Buy Tickets'), then trust signals (winners), then secondary actions. Remove or make the sign-in overlay dismissible. Establish a refined colour system — keep red as accent but use more white space to convey premium positioning.",
      location: 'Homepage — hero section, ticket grid, and sign-in overlay',
    },
    {
      severity: 'major',
      heuristic: 'Consistency and standards',
      title: 'Each page looks like a different website',
      description: "Visual identity shifts dramatically: homepage is light, Winner's Club has red header, Live Draw uses gold, auth pages have orange dashed borders. CTAs alternate between red fills, white outlines, and grey states. This inconsistency feels unprofessional and erodes trust — if the visuals feel disjointed, users question whether the operation is trustworthy.",
      recommendation: "Create and enforce a design system: one header style, one palette, consistent CTA hierarchy (primary=solid, secondary=outlined, tertiary=text). Replace the orange dashed auth form border with consistent card styling. Every page should feel unmistakably 'Big Ticket'.",
      location: 'Across all pages — headers, CTAs, and form styling',
    },
    {
      severity: 'major',
      heuristic: 'Error prevention',
      title: 'No inline form validation or purchase confirmation step',
      description: "No form fields show real-time validation. Users fill out everything, submit, and only then discover issues. For a financial platform, the absence of a purchase confirmation screen is concerning — users should see a summary of tickets, cost, and payment method before committing.",
      recommendation: "Add inline validation checking each field as users type — green checkmarks for valid, clear errors for invalid. Add a confirmation screen before any payment showing ticket numbers, draw date, total price, and payment method with a 'Confirm Purchase' button.",
      location: 'Sign-in page, registration form, and purchase flow',
    },
    {
      severity: 'major',
      heuristic: 'Visibility of system status',
      title: "Registration stepper doesn't clearly show progress",
      description: "The Create Account 3-step stepper (Account Details → Verify → Personal Info) has inactive steps that look too similar to the active step. Users can't quickly tell which step they've completed. Combined with no visible back button, users feel uncertain and may abandon registration.",
      recommendation: "Redesign stepper: completed steps get green checkmarks, current step is highlighted with filled circle, future steps are distinctly dimmed. Add 'Back' link on each step and show estimated time ('Step 2 of 3 — about 30 seconds left').",
      location: 'Registration page at /register — top of the form',
    },
  ],

  minorIssues: [
    {
      severity: 'minor',
      heuristic: 'Match between system and real world',
      title: "'Series 285' terminology is confusing for new visitors",
      description: "The countdown references 'Series 285 | 3rd Apr 2026, 7:30 PM' but nowhere explains what 'series' means. It's insider language that makes new users feel like outsiders.",
      recommendation: "Add a subtitle: 'Series 285 = April 2026 Draw'. Better yet, replace 'Series' with 'Draw' in the UI. Keep 'Series' in fine print for regulatory purposes.",
      location: 'Countdown timer on homepage, Winner\'s Club, and Live Draw',
    },
    {
      severity: 'minor',
      heuristic: 'Recognition over recall',
      title: "'Get to Know Us ♥' navigation label is vague",
      description: "Could contain anything — about page, FAQ, terms, contact. Users looking for help won't instinctively click it because the label doesn't suggest useful content.",
      recommendation: "Rename to 'About & Help' or split into 'About' and 'Help' as separate items. Add 'FAQ' as its own top-level nav item given the importance of help for a financial platform.",
      location: 'Main navigation — rightmost item before account buttons',
    },
    {
      severity: 'minor',
      heuristic: 'Help users recognise, diagnose, and recover from errors',
      title: 'Password reset link is poorly positioned and easy to miss',
      description: "'Reset my password' on sign-in is right-aligned in small text below the password field. Frustrated users who can't remember their password need this to be immediately obvious.",
      recommendation: "Move to a more prominent position — below the password label or as a larger, clearly styled link below the Sign In button. Use brand blue (#2563eb) at 14px minimum for mobile tappability.",
      location: 'Sign-in page — below the password input field',
    },
    {
      severity: 'minor',
      heuristic: 'Aesthetic and minimalist design',
      title: 'Orange dashed border on auth forms feels outdated',
      description: "Sign-in and registration forms use a prominent orange/gold dashed border that looks like 2010-era web design. Clashes with the modern card-based layout elsewhere and undermines trust.",
      recommendation: "Replace with a subtle card container — clean rounded rectangle with subtle border or shadow, matching the rest of the site. This small change would significantly modernise the auth experience.",
      location: 'Sign-in at /sign-in and registration at /register',
    },
  ],

  strengths: [
    "Real winner stories with photos, names, nationalities, and exact prize amounts create powerful social proof that real people win life-changing money.",
    "The countdown timer creates genuine urgency, appearing consistently across pages so users always know when the next draw happens.",
    "Sign In With OTP offers a modern, password-free login that reduces friction for returning users, especially on mobile.",
    "The Dream Car raffle page clearly presents the prize, ticket price, and draw mechanics in a focused layout that's easier to understand than the main lottery page.",
    "Password requirement chips on registration show users exactly what's needed upfront rather than surprising them with validation errors.",
  ],

  priorityActions: [
    "Add guest checkout immediately — allow purchases with just email and phone number. Expected impact: 20-30% increase in first-time purchases.",
    "Create a Help/FAQ section and Responsible Play page — essential for trust and likely required for regulatory compliance.",
    "Unify the visual design system — one consistent header colour, CTA hierarchy, and card style. Remove the orange dashed border and homepage sign-in overlay.",
    "Add inline form validation across all inputs and a purchase confirmation screen before processing payments.",
    "Add search and filtering — site-wide search, winner filters, and quick-buy for returning customers.",
  ],
}

async function seed() {
  console.log(`Seeding Big Ticket audit to ${SITE_URL}...`)

  const res = await fetch(`${SITE_URL}/api/audit/seed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-seed-secret': SEED_SECRET,
    },
    body: JSON.stringify({ audit: auditData }),
  })

  const data = await res.json()

  if (!res.ok) {
    console.error('Failed to seed:', data)
    process.exit(1)
  }

  console.log('✓ Seeded successfully!')
  console.log(`  Audit ID: ${data.auditId}`)
  console.log(`  Preview URL: ${SITE_URL}${data.url}`)
  console.log(`  Paid: ${data.paid}`)
  console.log('')
  console.log(`Share this link with Big Ticket:`)
  console.log(`  ${SITE_URL}/audit/result/${data.auditId}`)
}

seed().catch(console.error)
