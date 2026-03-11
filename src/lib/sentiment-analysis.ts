/**
 * Sentiment Analysis Engine for Chat Conversations
 *
 * Analyzes WhatsApp / chat messages to detect:
 *   - Overall sentiment (positive / neutral / negative)
 *   - Urgency level
 *   - Buying intent signals
 *   - Risk of churn / disengagement
 *
 * Uses keyword/pattern-based scoring for real-time, zero-latency analysis.
 * Can be augmented with LLM calls for deeper analysis on flagged conversations.
 */

export interface ChatMessage {
  role: "user" | "bot"
  message: string
  timestamp: Date | string
}

export type SentimentLabel = "positive" | "neutral" | "negative"
export type UrgencyLevel = "high" | "medium" | "low"
export type IntentSignal = "strong_buy" | "exploring" | "objecting" | "disengaging" | "neutral"

export interface SentimentResult {
  sentiment: SentimentLabel
  sentimentScore: number // -1.0 to 1.0
  urgency: UrgencyLevel
  intent: IntentSignal
  riskLevel: number // 0-100 (higher = more at risk of churning)
  highlights: string[]
  messageCount: number
  avgResponseGap: number | null // minutes between user messages
}

// ── Keyword dictionaries ────────────────────────────────────────────

const POSITIVE_WORDS = [
  "love", "great", "perfect", "excellent", "amazing", "wonderful", "interested",
  "yes", "sure", "absolutely", "beautiful", "fantastic", "ideal", "exactly",
  "looking forward", "excited", "ready", "let's do it", "book", "schedule",
  "viewing", "offer", "deal", "agree", "happy", "thank", "thanks",
  // Arabic transliteration common in Dubai
  "yalla", "inshallah", "mashallah", "habibi",
  // Swedish
  "bra", "perfekt", "underbart", "tack", "absolut", "gärna",
]

const NEGATIVE_WORDS = [
  "expensive", "too much", "overpriced", "no", "not interested", "can't afford",
  "too small", "disappointed", "waste", "bad", "terrible", "awful", "ugly",
  "forget it", "never mind", "don't bother", "stop", "unsubscribe",
  "not what i wanted", "misleading", "scam", "rip off", "too far",
  "problem", "issue", "complaint", "unhappy", "frustrated", "angry",
  // Swedish
  "nej", "dyrt", "inte", "dåligt", "besviken",
]

const URGENCY_WORDS = [
  "urgent", "asap", "today", "immediately", "right now", "this week",
  "moving soon", "visa expiring", "deadline", "quickly", "fast",
  "need to move", "relocating", "arriving", "arriving soon",
]

const STRONG_BUY_SIGNALS = [
  "ready to buy", "make an offer", "send the contract", "let's close",
  "book a viewing", "schedule viewing", "i want this", "how do i pay",
  "transfer the deposit", "sign", "when can i move", "reserved",
  "mortgage approved", "pre-approved", "cash buyer", "serious buyer",
]

const DISENGAGEMENT_SIGNALS = [
  "maybe later", "not now", "i'll think about it", "not sure",
  "need more time", "still looking", "just browsing", "window shopping",
  "not ready", "too early", "next year", "no rush",
]

// ── Helper functions ────────────────────────────────────────────────

function normalise(text: string): string {
  return text.toLowerCase().trim()
}

function countMatches(text: string, dictionary: string[]): number {
  const norm = normalise(text)
  return dictionary.filter(word => norm.includes(word)).length
}

function analyseMessage(message: string): {
  positiveHits: number
  negativeHits: number
  urgencyHits: number
  buySignals: number
  disengageSignals: number
} {
  return {
    positiveHits: countMatches(message, POSITIVE_WORDS),
    negativeHits: countMatches(message, NEGATIVE_WORDS),
    urgencyHits: countMatches(message, URGENCY_WORDS),
    buySignals: countMatches(message, STRONG_BUY_SIGNALS),
    disengageSignals: countMatches(message, DISENGAGEMENT_SIGNALS),
  }
}

// ── Main analysis function ──────────────────────────────────────────

export function analyseConversation(messages: ChatMessage[]): SentimentResult {
  const userMessages = messages.filter(m => m.role === "user")

  if (userMessages.length === 0) {
    return {
      sentiment: "neutral",
      sentimentScore: 0,
      urgency: "low",
      intent: "neutral",
      riskLevel: 0,
      highlights: [],
      messageCount: 0,
      avgResponseGap: null,
    }
  }

  // Aggregate scores across all user messages
  let totalPositive = 0
  let totalNegative = 0
  let totalUrgency = 0
  let totalBuySignals = 0
  let totalDisengage = 0

  for (const msg of userMessages) {
    const analysis = analyseMessage(msg.message)
    totalPositive += analysis.positiveHits
    totalNegative += analysis.negativeHits
    totalUrgency += analysis.urgencyHits
    totalBuySignals += analysis.buySignals
    totalDisengage += analysis.disengageSignals
  }

  // ── Sentiment score (-1 to 1) ──────────────────────────────
  const totalSignals = totalPositive + totalNegative || 1
  const rawSentiment = (totalPositive - totalNegative) / totalSignals
  const sentimentScore = Math.max(-1, Math.min(1, rawSentiment))

  const sentiment: SentimentLabel =
    sentimentScore > 0.15 ? "positive" :
    sentimentScore < -0.15 ? "negative" :
    "neutral"

  // ── Urgency ────────────────────────────────────────────────
  const urgency: UrgencyLevel =
    totalUrgency >= 2 ? "high" :
    totalUrgency >= 1 ? "medium" :
    "low"

  // ── Intent ─────────────────────────────────────────────────
  let intent: IntentSignal = "neutral"
  if (totalBuySignals >= 2) intent = "strong_buy"
  else if (totalBuySignals >= 1 && totalPositive > totalNegative) intent = "strong_buy"
  else if (totalDisengage >= 2) intent = "disengaging"
  else if (totalNegative > totalPositive && totalNegative >= 2) intent = "objecting"
  else if (totalPositive > 0 && totalBuySignals === 0) intent = "exploring"

  // ── Risk level (0-100) ─────────────────────────────────────
  let riskLevel = 20 // baseline
  if (sentiment === "negative") riskLevel += 30
  if (intent === "disengaging") riskLevel += 30
  if (intent === "objecting") riskLevel += 20
  if (totalDisengage > 0) riskLevel += totalDisengage * 10

  // Long gaps between messages increase risk
  const responseGaps = calculateResponseGaps(userMessages)
  if (responseGaps !== null && responseGaps > 60 * 24) {
    // > 1 day between messages
    riskLevel += 15
  }

  // Recent negative messages are worse
  const lastUserMsg = userMessages[userMessages.length - 1]
  const lastAnalysis = analyseMessage(lastUserMsg.message)
  if (lastAnalysis.negativeHits > 0) riskLevel += 10
  if (lastAnalysis.disengageSignals > 0) riskLevel += 15

  // Positive signals reduce risk
  if (intent === "strong_buy") riskLevel -= 30
  if (sentiment === "positive") riskLevel -= 15

  riskLevel = Math.max(0, Math.min(100, riskLevel))

  // ── Highlights ─────────────────────────────────────────────
  const highlights: string[] = []

  if (intent === "strong_buy") highlights.push("Strong buying intent detected")
  if (intent === "disengaging") highlights.push("Client showing signs of disengagement")
  if (intent === "objecting") highlights.push("Client has objections — address concerns")
  if (urgency === "high") highlights.push("High urgency — client needs fast response")
  if (sentiment === "negative" && riskLevel >= 60) highlights.push("At-risk client — immediate attention needed")
  if (sentiment === "positive" && intent !== "strong_buy") highlights.push("Positive sentiment — nurture towards decision")
  if (responseGaps !== null && responseGaps > 60 * 48) highlights.push("Communication gap detected (2+ days)")

  return {
    sentiment,
    sentimentScore: Math.round(sentimentScore * 100) / 100,
    urgency,
    intent,
    riskLevel,
    highlights,
    messageCount: userMessages.length,
    avgResponseGap: responseGaps,
  }
}

/**
 * Calculate average gap between user messages in minutes.
 */
function calculateResponseGaps(messages: ChatMessage[]): number | null {
  if (messages.length < 2) return null

  let totalGap = 0
  let gapCount = 0

  for (let i = 1; i < messages.length; i++) {
    const prev = new Date(messages[i - 1].timestamp).getTime()
    const curr = new Date(messages[i].timestamp).getTime()
    if (!isNaN(prev) && !isNaN(curr)) {
      totalGap += (curr - prev) / (1000 * 60) // minutes
      gapCount++
    }
  }

  return gapCount > 0 ? Math.round(totalGap / gapCount) : null
}

/**
 * Quick single-message sentiment check.
 * Useful for real-time tagging as messages arrive.
 */
export function quickSentiment(message: string): {
  sentiment: SentimentLabel
  score: number
  hasBuySignal: boolean
  hasRiskSignal: boolean
} {
  const analysis = analyseMessage(message)
  const total = analysis.positiveHits + analysis.negativeHits || 1
  const score = (analysis.positiveHits - analysis.negativeHits) / total

  return {
    sentiment: score > 0.15 ? "positive" : score < -0.15 ? "negative" : "neutral",
    score: Math.round(score * 100) / 100,
    hasBuySignal: analysis.buySignals > 0,
    hasRiskSignal: analysis.disengageSignals > 0 || analysis.negativeHits >= 2,
  }
}
