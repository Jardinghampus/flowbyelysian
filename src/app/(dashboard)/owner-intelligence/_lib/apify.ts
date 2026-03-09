const APIFY_TOKEN = process.env.APIFY_TOKEN!
const ACTOR_PROPERTY_FINDER = "CAwW2pO7A0dwgWxzK"
const ACTOR_OWNER_FINDER = "nEsc1b9wIJ4o9pFx4"
const BASE_URL = "https://api.apify.com/v2"
const POLL_INTERVAL = 2000
const TIMEOUT = 120000
const MAX_RETRIES = 2

interface ApifyRunResponse {
  data: { id: string }
}

interface ApifyRunStatus {
  data: { status: string }
}

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
      }
    }
  }
  throw lastError
}

async function startRun(
  actorId: string,
  input: Record<string, unknown>
): Promise<string> {
  return withRetry(async () => {
    const res = await fetch(
      `${BASE_URL}/acts/${actorId}/runs?token=${APIFY_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }
    )
    if (!res.ok) throw new Error(`Apify start failed: ${res.status}`)
    const json: ApifyRunResponse = await res.json()
    return json.data.id
  })
}

async function pollRun(runId: string): Promise<"SUCCEEDED" | "FAILED" | "TIMED-OUT"> {
  const start = Date.now()
  while (Date.now() - start < TIMEOUT) {
    const res = await fetch(
      `${BASE_URL}/actor-runs/${runId}?token=${APIFY_TOKEN}`
    )
    if (!res.ok) {
      // Transient poll failure — wait and retry
      await new Promise((r) => setTimeout(r, POLL_INTERVAL))
      continue
    }
    const json: ApifyRunStatus = await res.json()
    const status = json.data.status
    if (status === "SUCCEEDED") return "SUCCEEDED"
    if (status === "FAILED" || status === "TIMED-OUT") return status as "FAILED" | "TIMED-OUT"
    await new Promise((r) => setTimeout(r, POLL_INTERVAL))
  }
  return "TIMED-OUT"
}

async function getDatasetItems(runId: string): Promise<Record<string, unknown>[]> {
  return withRetry(async () => {
    const res = await fetch(
      `${BASE_URL}/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}`
    )
    if (!res.ok) throw new Error(`Apify dataset fetch failed: ${res.status}`)
    return res.json()
  })
}

export async function runPropertyFinder(propertyUrl: string) {
  const runId = await startRun(ACTOR_PROPERTY_FINDER, {
    propertyUrls: [{ url: propertyUrl }],
    retrieveContactDetails: true,
  })

  const status = await pollRun(runId)
  if (status !== "SUCCEEDED") {
    return { runId, status, data: null }
  }

  const items = await getDatasetItems(runId)
  const item = items[0] as Record<string, string | number | undefined> | undefined
  if (!item) return { runId, status, data: null }

  return {
    runId,
    status,
    data: {
      unitNumber: item.PropertyUnitNumber as string | undefined,
      buildingName: item.BuildingNameEn as string | undefined,
      zone: item.ZoneNameEn as string | undefined,
      propertySize: item.PropertySize ? Number(item.PropertySize) : undefined,
      propertyName: item.PropertyNameEn as string | undefined,
      propertyValue: item.PropertyValue ? Number(item.PropertyValue) : undefined,
      permitNumber: item.PermitNumber as string | undefined,
      rooms: item.RoomsCount as string | undefined,
      ownerName: item.ownerName as string | undefined,
      ownerPhone: item.ownerPhone as string | undefined,
      ownerEmail: item.ownerEmail as string | undefined,
    },
  }
}

export async function runOwnerFinder(input: {
  unitNumber: string
  buildingName: string
  propertySize?: string
  zoneNameEn?: string
}) {
  const runId = await startRun(ACTOR_OWNER_FINDER, input)

  const status = await pollRun(runId)
  if (status !== "SUCCEEDED") {
    return { runId, status, data: null }
  }

  const items = await getDatasetItems(runId)
  const item = items[0] as Record<string, string | undefined> | undefined
  if (!item) return { runId, status, data: null }

  return {
    runId,
    status,
    data: {
      ownerName: item.ownerName,
      ownerPhone: item.ownerPhone,
      ownerPhone2: item.ownerPhone2,
      ownerEmail: item.ownerEmail,
      ownerDate: item.ownerDate,
      ownerArea: item.ownerArea,
    },
  }
}

export async function checkRunStatus(runId: string) {
  const res = await fetch(
    `${BASE_URL}/actor-runs/${runId}?token=${APIFY_TOKEN}`
  )
  if (!res.ok) throw new Error(`Apify status check failed: ${res.status}`)
  const json: ApifyRunStatus = await res.json()
  return json.data.status
}
