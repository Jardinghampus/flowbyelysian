import OpenAI from "openai"
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions"
import { getDefaultTeamId } from "@/lib/api/team"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"

type AiGatewayInput = {
  userId?: string | null
  feature: string
  model?: string
  messages: ChatCompletionMessageParam[]
  temperature?: number
  maxTokens?: number
  entityType?: string | null
  entityId?: string | null
  metadata?: Record<string, unknown>
}

type AiGatewayResult = {
  content: string
  runId: string | null
  usage: {
    inputTokens: number
    outputTokens: number
    estimatedCostUsd: number
  }
}

const DEFAULT_MODEL = "gpt-4o-mini"

const pricingUsdPerMillion: Record<string, { input: number; output: number }> = {
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4.1-mini": { input: 0.4, output: 1.6 },
}

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

function estimateCostUsd(model: string, inputTokens: number, outputTokens: number) {
  const pricing = pricingUsdPerMillion[model]
  if (!pricing) return 0

  return Number((((inputTokens / 1_000_000) * pricing.input) + ((outputTokens / 1_000_000) * pricing.output)).toFixed(6))
}

async function recordAiRun(input: {
  userId?: string | null
  feature: string
  model: string
  entityType?: string | null
  entityId?: string | null
  status: "completed" | "failed"
  inputTokens: number
  outputTokens: number
  estimatedCostUsd: number
  inputSummary?: string | null
  outputSummary?: string | null
  error?: string | null
  metadata?: Record<string, unknown>
}) {
  try {
    const supabase = createUntypedServerClient()
    const teamId = await getDefaultTeamId(supabase)

    const { data, error } = await supabase
      .from("ai_runs")
      .insert({
        team_id: teamId,
        user_id: input.userId || null,
        feature: input.feature,
        model: input.model,
        entity_type: input.entityType || null,
        entity_id: input.entityId || null,
        status: input.status,
        input_tokens: input.inputTokens,
        output_tokens: input.outputTokens,
        estimated_cost_usd: input.estimatedCostUsd,
        input_summary: input.inputSummary || null,
        output_summary: input.outputSummary || null,
        error: input.error || null,
        metadata: input.metadata || {},
        completed_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (error) throw error

    await supabase.from("ai_cost_ledger").insert({
      team_id: teamId,
      ai_run_id: data.id,
      feature: input.feature,
      model: input.model,
      input_tokens: input.inputTokens,
      output_tokens: input.outputTokens,
      estimated_cost_usd: input.estimatedCostUsd,
    })

    return data.id as string
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.warn("AI run was not recorded", { feature: input.feature, message })
    return null
  }
}

function compactMessages(messages: ChatCompletionMessageParam[]) {
  return messages
    .map((message) => {
      const content = typeof message.content === "string" ? message.content : JSON.stringify(message.content)
      return `${message.role}: ${content}`.slice(0, 500)
    })
    .join("\n")
    .slice(0, 2000)
}

export async function runChatCompletion(input: AiGatewayInput): Promise<AiGatewayResult> {
  const model = input.model || DEFAULT_MODEL
  const openai = getOpenAIClient()

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: input.messages,
      temperature: input.temperature ?? 0.4,
      max_tokens: input.maxTokens,
    })

    const content = completion.choices[0]?.message.content || ""
    const inputTokens = completion.usage?.prompt_tokens || 0
    const outputTokens = completion.usage?.completion_tokens || 0
    const estimatedCostUsd = estimateCostUsd(model, inputTokens, outputTokens)
    const runId = await recordAiRun({
      userId: input.userId,
      feature: input.feature,
      model,
      entityType: input.entityType,
      entityId: input.entityId,
      status: "completed",
      inputTokens,
      outputTokens,
      estimatedCostUsd,
      inputSummary: compactMessages(input.messages),
      outputSummary: content.slice(0, 2000),
      metadata: input.metadata,
    })

    return { content, runId, usage: { inputTokens, outputTokens, estimatedCostUsd } }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await recordAiRun({
      userId: input.userId,
      feature: input.feature,
      model,
      entityType: input.entityType,
      entityId: input.entityId,
      status: "failed",
      inputTokens: 0,
      outputTokens: 0,
      estimatedCostUsd: 0,
      inputSummary: compactMessages(input.messages),
      error: message,
      metadata: input.metadata,
    })
    throw error
  }
}

