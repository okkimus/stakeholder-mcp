import { z } from "zod";

// Personality schema
export const PersonalitySchema = z.object({
  traits: z.array(z.string()).min(1),
  communication_style: z.string(),
});

// Base stakeholder schema for config file
export const StakeholderConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  model: z.string().optional(), // Optional preferred LLM model
  personality: PersonalitySchema,
  expertise: z.array(z.string()).min(1),
  concerns: z.array(z.string()).min(1),
  prompt_template: z.string().optional(),
});

// Full stakeholder schema (includes runtime metadata)
export const StakeholderSchema = StakeholderConfigSchema.extend({
  source: z.enum(["config", "runtime"]),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Schema for creating a new stakeholder at runtime
export const CreateStakeholderSchema = StakeholderConfigSchema.omit({ id: true }).extend({
  id: z.string().min(1).optional(), // Optional, will generate if not provided
});

// Schema for updating a stakeholder
export const UpdateStakeholderSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.string().optional(),
  model: z.string().optional(),
  personality: PersonalitySchema.partial().optional(),
  expertise: z.array(z.string()).optional(),
  concerns: z.array(z.string()).optional(),
  prompt_template: z.string().optional(),
});

// Config file schema
export const StakeholdersConfigSchema = z.object({
  stakeholders: z.array(StakeholderConfigSchema),
});

// Types derived from schemas
export type Personality = z.infer<typeof PersonalitySchema>;
export type StakeholderConfig = z.infer<typeof StakeholderConfigSchema>;
export type Stakeholder = z.infer<typeof StakeholderSchema>;
export type CreateStakeholderInput = z.infer<typeof CreateStakeholderSchema>;
export type UpdateStakeholderInput = z.infer<typeof UpdateStakeholderSchema>;
export type StakeholdersConfig = z.infer<typeof StakeholdersConfigSchema>;

// Filter options for listing stakeholders
export const StakeholderFilterSchema = z.object({
  role: z.string().optional(),
  expertise: z.string().optional(),
  source: z.enum(["config", "runtime", "all"]).optional(),
});

export type StakeholderFilter = z.infer<typeof StakeholderFilterSchema>;

// Default prompt template
export const DEFAULT_PROMPT_TEMPLATE = `You are {{name}}, a {{role}}.

Your personality traits: {{traits}}.
Your communication style: {{communication_style}}.

Your areas of expertise:
{{expertise}}

When reviewing proposals or providing feedback, you prioritize:
{{concerns}}

Respond in character, providing feedback from your unique perspective as this stakeholder.`;
