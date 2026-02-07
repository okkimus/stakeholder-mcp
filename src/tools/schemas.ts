import { z } from "zod";
import { ConsultationContextSchema } from "../llm/types";
import { StakeholderFilterSchema, CreateStakeholderSchema, UpdateStakeholderSchema } from "../personas/types";

// Re-export for convenience
export { StakeholderFilterSchema, CreateStakeholderSchema, UpdateStakeholderSchema };

/**
 * Schema for list_stakeholders tool
 */
export const ListStakeholdersInputSchema = z.object({
  filter: StakeholderFilterSchema.optional(),
});

export type ListStakeholdersInput = z.infer<typeof ListStakeholdersInputSchema>;

/**
 * Schema for get_stakeholder tool
 */
export const GetStakeholderInputSchema = z.object({
  id: z.string().min(1, "Stakeholder ID is required"),
});

export type GetStakeholderInput = z.infer<typeof GetStakeholderInputSchema>;

/**
 * Schema for consult_stakeholder tool
 */
export const ConsultStakeholderInputSchema = z.object({
  id: z.string().min(1, "Stakeholder ID is required"),
  prompt: z.string().min(1, "Prompt is required"),
  context: ConsultationContextSchema.optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4096).optional(),
});

export type ConsultStakeholderInput = z.infer<typeof ConsultStakeholderInputSchema>;

/**
 * Schema for consult_group tool
 */
export const ConsultGroupInputSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one stakeholder ID is required"),
  prompt: z.string().min(1, "Prompt is required"),
  context: ConsultationContextSchema.optional(),
  mode: z.enum(["parallel", "sequential"]).default("parallel"),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4096).optional(),
});

export type ConsultGroupInput = z.infer<typeof ConsultGroupInputSchema>;

/**
 * Schema for create_stakeholder tool
 */
export const CreateStakeholderInputSchema = z.object({
  stakeholder: CreateStakeholderSchema,
});

export type CreateStakeholderToolInput = z.infer<typeof CreateStakeholderInputSchema>;

/**
 * Schema for update_stakeholder tool
 */
export const UpdateStakeholderInputSchema = z.object({
  id: z.string().min(1, "Stakeholder ID is required"),
  updates: UpdateStakeholderSchema,
});

export type UpdateStakeholderToolInput = z.infer<typeof UpdateStakeholderInputSchema>;

/**
 * Schema for delete_stakeholder tool
 */
export const DeleteStakeholderInputSchema = z.object({
  id: z.string().min(1, "Stakeholder ID is required"),
});

export type DeleteStakeholderToolInput = z.infer<typeof DeleteStakeholderInputSchema>;

/**
 * Schema for get_consultation_log tool
 */
export const GetConsultationLogInputSchema = z.object({
  stakeholderId: z.string().optional(),
  sessionId: z.string().optional(),
  since: z.string().optional().describe("ISO datetime string, e.g. 2025-01-01T00:00:00Z"),
  until: z.string().optional().describe("ISO datetime string"),
  search: z.string().optional().describe("Full-text search across prompts and responses"),
  limit: z.number().min(1).max(200).optional().describe("Max rows to return (default 50)"),
  offset: z.number().min(0).optional().describe("Offset for pagination"),
});

export type GetConsultationLogInput = z.infer<typeof GetConsultationLogInputSchema>;

/**
 * Schema for get_consultation tool (single by ID)
 */
export const GetConsultationByIdInputSchema = z.object({
  id: z.number().int().min(1).describe("Consultation log ID"),
});

export type GetConsultationByIdInput = z.infer<typeof GetConsultationByIdInputSchema>;

