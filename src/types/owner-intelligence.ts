export type PortalType = "bayut" | "propertyfinder" | "dubizzle" | "manual"
export type LookupStatus = "pending" | "resolved" | "partial" | "failed"
export type BulkJobStatus = "queued" | "processing" | "complete" | "failed"
export type SourceType = "url_list" | "owners_list"

export interface OwnerContact {
  id?: string
  userId?: string
  sourceUrl?: string
  portal?: PortalType
  propertyName?: string
  buildingName?: string
  unitNumber?: string
  zone?: string
  propertySize?: number
  propertyValue?: number
  rooms?: string
  permitNumber?: string
  ownerName?: string
  ownerPhone?: string
  ownerPhone2?: string
  ownerEmail?: string
  ownerDate?: string
  lookupStatus: LookupStatus
  dedupHash?: string
  createdAt?: string
  updatedAt?: string
}

export interface BulkJob {
  id: string
  userId: string
  jobName?: string
  totalRows: number
  processedRows: number
  successRows: number
  failedRows: number
  status: BulkJobStatus
  sourceType: SourceType
  createdAt: string
  completedAt?: string
}

export interface ApifyRunResult {
  runId: string
  status: "RUNNING" | "SUCCEEDED" | "FAILED" | "TIMED-OUT"
  data?: OwnerContact
}
