import { z } from "zod"

export const addOwnerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(/^\+?[\d\s-]{7,20}$/, "Invalid phone format"),
  area: z.string().min(1, "Area is required"),
  unit_number: z.string().optional(),
  bedrooms: z.string().optional(),
  status: z.enum(["owner", "considering", "listed", "sold", "unresponsive"]).default("owner"),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  follow_up_days: z.number().optional(),
  assigned_agent_id: z.string().optional(),
  assigned_agent_name: z.string().optional(),
  notes: z.string().optional(),
})

export type AddOwnerInput = z.infer<typeof addOwnerSchema>

export const logOutreachSchema = z.object({
  owner_id: z.string().min(1, "Owner is required"),
  type: z.enum(["call", "whatsapp", "email", "meeting", "sms"]),
  outcome: z.string().optional(),
  status_changed_to: z.enum(["owner", "considering", "listed", "sold", "unresponsive"]).optional(),
  follow_up_days: z.number().optional(),
  follow_up_date: z.string().optional(),
})

export type LogOutreachInput = z.infer<typeof logOutreachSchema>

export const updateOwnerSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  area: z.string().min(1).optional(),
  unit_number: z.string().nullable().optional(),
  bedrooms: z.string().nullable().optional(),
  status: z.enum(["owner", "considering", "listed", "sold", "unresponsive"]).optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  follow_up_at: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  assigned_agent_id: z.string().optional(),
  assigned_agent_name: z.string().nullable().optional(),
})

export type UpdateOwnerInput = z.infer<typeof updateOwnerSchema>
