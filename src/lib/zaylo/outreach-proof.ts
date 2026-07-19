/** Outreach templates that attach this week's Media Desk proof. */

export type ProofPack = {
  scheduleLabel: string
  communityLabel: string
  captionSnippet: string
  postId: string
}

export function coldOwnerWithProof(ownerName: string, community: string, proof: ProofPack) {
  return `Hi ${ownerName || "there"} — I track closed deals weekly in ${community}.

This week's desk note (${proof.scheduleLabel}):
${proof.captionSnippet.slice(0, 280)}…

If you're considering a quiet sale or a rent reset, I can give you a street-level read — no pitch deck.
Reply "Owner" and I'll send the relevant comps for your home.

(Proof post: ${proof.postId})`
}

export function coldBuyerWithProof(name: string, community: string, proof: ProofPack) {
  return `Hi ${name || "there"} — I put together a private shortlist angle in ${community} based on this week's closed comps (${proof.scheduleLabel}), not portal averages.

${proof.captionSnippet.slice(0, 220)}…

If useful, I can send 3 options + why each fits. Reply "Shortlist".`
}

export function attachProofInstruction(proof: ProofPack) {
  return `Attach before sending cold outreach:
1) This week's Media Desk PNG (IG or LI)
2) Reference post id: ${proof.postId}
3) Never cold without proof — Hormozi rule`
}
