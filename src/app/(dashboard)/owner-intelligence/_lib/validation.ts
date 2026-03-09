import { z } from "zod"

export const lookupSchema = z.object({
  propertyUrl: z.string().url("Invalid URL format"),
})

export const lookupOwnersSchema = z.object({
  unitNumber: z.string().min(1, "Unit number is required"),
  buildingName: z.string().min(1, "Building name is required"),
  propertySize: z.union([z.string(), z.number()]).optional(),
  zoneNameEn: z.string().optional(),
})

const bulkUrlItem = z.object({
  url: z.string().url(),
  unitNumber: z.string().optional(),
  buildingName: z.string().optional(),
  propertySize: z.string().optional(),
  zone: z.string().optional(),
})

const bulkOwnerItem = z.object({
  url: z.string().optional(),
  unitNumber: z.string().min(1),
  buildingName: z.string().min(1),
  propertySize: z.string().optional(),
  zone: z.string().optional(),
})

export const bulkSchema = z.object({
  items: z.array(z.union([bulkUrlItem, bulkOwnerItem])).min(1, "At least one item is required").max(500, "Maximum 500 items per batch"),
  jobName: z.string().optional(),
  sourceType: z.enum(["url_list", "owners_list"]),
})

export const deleteContactsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "At least one ID is required"),
})
