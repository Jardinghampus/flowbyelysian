/**
 * Serhant-inspired Media Desk doctrine for Hampus / Zaylo micro media house.
 * Sources: Serhant personal branding + luxury listing playbook (2020–2025).
 */

export const HAMPUS_BRAND_BIBLE = {
  identity:
    "The Dubai Land villa & townhouse guy — comps over hype, street over average.",
  superpower:
    "I turn Bayut transaction noise into a weekly desk that landlords and buyers trust.",
  audience: [
    "Landlords in AR / Mira / Mudon / Villanova / Dubai Hills / Town Square",
    "Buyers who want land villas/townhouses — not Marina apartments",
    "Expats and serious investors who want comps, not fluff",
  ],
  voice: [
    "Direct",
    "Numbers-first",
    "No fake luxury language",
    "Personal — Hampus, not the brokerage logo",
  ],
  eightSecondHook:
    "Lead with one number or one named cluster. Never lead with 'Excited to share'.",
  wiiFm: "What's in it for them — a shortlist, a street read, or a quiet sale plan.",
  consistencyRule:
    "Same navy, same face, same CTA (Market / Shortlist / Owner) on IG + LinkedIn + WA.",
}

/** Treat every listing like a luxury brand campaign (Serhant listing playbook). */
export const LISTING_AS_BRAND_PITCH = {
  title: "Sell your home like a brand — not a portal ad",
  pillars: [
    {
      name: "Emotion over photos",
      line: "Stills are expected. A 15–30s lifestyle clip (street, light, layout) is how buyers feel the home.",
    },
    {
      name: "Story over sqft",
      line: "We sell Arabella mornings / park proximity / plot geometry — not just bed count.",
    },
    {
      name: "Reach beyond local scrollers",
      line: "IG + LinkedIn + WA proof pack to expats and investors who already follow the desk.",
    },
    {
      name: "Positioning = price",
      line: "Rare opportunity framing + comps from this week's desk creates competition, not discounting.",
    },
  ],
  sellerQuestions: [
    "How will you use video (not just photos) to tell the story of my home?",
    "What reach do you have beyond local portal browsers — expats, investors, your own audience?",
    "How will your marketing elevate perception so buyers compete — instead of me competing on price?",
  ],
  ownerPitchScript: `I don't list homes as portal ads. I market them like a brand.

For your home in {community}:
1) Lifestyle clip + stills (emotion, not just rooms)
2) Comps from my weekly Dubai Land desk (not last year's average)
3) Distribution to people who already follow my Market Desk on IG/LinkedIn
4) Quiet owner strategy if you want off-market first

Ask any agent those three questions. If the answers are vague, you're leaving value on the table.

Reply "Owner" and I'll send a street-level read for your home this week.`,
}

/** Short-form video / Reel scripts — Serhant: educate + entertain + actionable. */
export const REEL_SCRIPTS = [
  {
    id: "eight-second-number",
    title: "8-second number",
    beats: [
      "0–2s: On-screen AED number (sale or rent avg)",
      "2–5s: Community name + 'this is the pulse, not the deal'",
      "5–8s: CTA — DM Market",
    ],
    captionHook: "If you only remember one number in {community} this week — make it this.",
  },
  {
    id: "listing-as-brand",
    title: "Listing as brand (owner)",
    beats: [
      "0–3s: 'Portal ads don't sell luxury. Brands do.'",
      "3–10s: Three pillars — video, story, reach",
      "10–15s: 'Ask your agent these 3 questions' → swipe/DM Owner",
    ],
    captionHook: "Before you list — ask your agent these 3 questions.",
  },
  {
    id: "whats-in-it",
    title: "WIIFM education",
    beats: [
      "0–3s: Myth ('The average is the price')",
      "3–10s: What actually moves the deal (plot, street, motivation)",
      "10–15s: CTA Shortlist",
    ],
    captionHook: "The average is context. The deal is the street.",
  },
]

/** Brand roadmap checklist — Serhant step 1 + quarterly evolve. */
export const BRAND_QUARTERLY_CHECK = [
  "Identity still true? (Dubai Land villas/TH only)",
  "Visuals consistent? (navy cards, face, Market Desk chip)",
  "CTA still one word? (Market / Shortlist / Owner)",
  "Which concept got DMs this month? Double it.",
  "Which community is under-posted? Fix schedule.",
  "Owner pitch used on cold outreach with proof PNG?",
]

export function fillCommunity(template: string, community: string) {
  return template.replace(/\{community\}/g, community)
}
